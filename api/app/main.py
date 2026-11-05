"""Whack-a-Math API: saves learner profiles and practice results for a signed-in account.

Anonymous play never calls this. Every row belongs to the token's `sub`; there is no way to name another account.
"""
from __future__ import annotations

import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from threading import Lock

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .config import Settings
from .db import make_engine, make_sessions
from . import platform_apps
from .models import Account, DeletedLearner, Learner, Result, ResultItem
from .schemas import LearnerIn, ResultBatch, ResultIn, name_key, valid_id
from .sso_auth import SsoAuth

UNSAFE = {"POST", "PUT", "PATCH", "DELETE"}
MAX_PAGE = 100


class RateLimiter:
    """Sliding window per account, in memory (one API process). Keys are account ids, never IP addresses."""

    def __init__(self, limit: int, window: int):
        self.limit, self.window = limit, window
        self.hits: dict[str, deque[float]] = defaultdict(deque)
        self.lock = Lock()

    def check(self, key: str) -> None:
        now = time.monotonic()
        with self.lock:
            q = self.hits[key]
            while q and q[0] <= now - self.window:
                q.popleft()
            if len(q) >= self.limit:
                retry = max(1, int(self.window - (now - q[0])) + 1)
                raise HTTPException(429, "Too many saves. Try again in a moment.", headers={"Retry-After": str(retry)})
            q.append(now)


def learner_json(row: Learner, count: int | None = None) -> dict:
    out = {"id": row.id, "name": row.name, "avatar": row.avatar, "updated_at": row.updated_at}
    if count is not None:
        out["result_count"] = count
    return out


def result_json(row: Result) -> dict:
    return {
        "id": row.client_id, "seq": row.seq, "learner_id": row.learner_id, "grade": row.grade, "topics": row.topics,
        "difficulty": row.difficulty, "questions": row.questions, "correct": row.correct, "time_spent_ms": row.time_spent_ms,
        "started_at": row.started_at, "finished_at": row.finished_at,
        "items": [{"template_id": i.template_id, "correct": i.correct, "attempts": i.attempts, "time_ms": i.time_ms} for i in row.items],
    }


def create_app(settings: Settings | None = None, auth: SsoAuth | None = None) -> FastAPI:
    settings = settings or Settings.from_env()
    auth = auth or SsoAuth(settings.issuer, settings.jwks_url)
    engine = make_engine(settings.database_url)
    sessions = make_sessions(engine)
    limiter = RateLimiter(settings.write_limit, settings.write_window_seconds)
    app = FastAPI(title="Whack-a-Math API", docs_url=None if settings.production else "/docs", redoc_url=None, openapi_url=None if settings.production else "/openapi.json")
    app.state.engine, app.state.sessions, app.state.settings = engine, sessions, settings

    if settings.allowed_origins:
        app.add_middleware(CORSMiddleware, allow_origins=list(settings.allowed_origins), allow_credentials=True,
                           allow_methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["Content-Type", "X-Auth-Request"], max_age=600)

    @app.middleware("http")
    async def limit_body(request: Request, call_next):
        if request.method in UNSAFE:
            length = request.headers.get("content-length")
            if length is None and request.method != "DELETE" and request.headers.get("transfer-encoding"):
                return JSONResponse({"detail": "Content-Length required"}, status_code=411)
            if length is not None and (not length.isdigit() or int(length) > settings.max_body_bytes):
                return JSONResponse({"detail": "Request too large"}, status_code=413)
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Cache-Control", "no-store")
        return response

    def db():
        with sessions() as session:
            yield session

    def account(request: Request, session: Session = Depends(db)) -> str:
        claims, via_cookie = auth.identity(request)
        sub = claims["sub"]
        if request.method in UNSAFE:
            # A cookie is sent by the browser on any request to this host, so cookie-authenticated writes must prove they come
            # from our own page: a custom header (not sendable cross-site without CORS) and an allowed Origin.
            # A Bearer header is not ambient, so it needs neither.
            if via_cookie and (request.headers.get("X-Auth-Request") != "1" or request.headers.get("Origin", "").rstrip("/") not in settings.allowed_origins):
                raise HTTPException(403, "Request not allowed from this page")
            limiter.check(sub)
        touch(session, sub)
        return sub

    def touch(session: Session, sub: str) -> None:
        now = datetime.now(timezone.utc)
        row = session.get(Account, sub)
        if row is None:
            session.add(Account(sub=sub, first_seen=now, last_seen=now))
            try:
                session.commit()
            except IntegrityError:  # two first requests at once
                session.rollback()
        else:
            last = row.last_seen if row.last_seen.tzinfo else row.last_seen.replace(tzinfo=timezone.utc)
            if now - last > timedelta(hours=1):
                row.last_seen = now
                session.commit()

    def owned_learner(session: Session, sub: str, learner_id: str) -> Learner:
        try:
            valid_id(learner_id)
        except ValueError:
            raise HTTPException(404, "Profile not found") from None
        row = session.get(Learner, learner_id)
        if row is None or row.owner_sub != sub:  # someone else's id looks exactly like a missing one
            raise HTTPException(404, "Profile not found")
        return row

    @app.get("/api/v1/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/v1/platform-apps")
    def platform_app_list(request: Request):
        """The 9-dot launcher's list: the registry plus each app's name and icon, read here because browsers cannot read other apps' pages.
        Public. The visitor's sso_access cookie (only that) is passed to the registry so it can add an administrator-only entry; nothing is shared across visitors."""
        return platform_apps.get_apps(settings.apps_url, request.headers.get("cookie"))

    @app.get("/api/v1/me/learners")
    def list_learners(sub: str = Depends(account), session: Session = Depends(db)):
        counts = dict(session.execute(select(Result.learner_id, func.count()).where(Result.owner_sub == sub).group_by(Result.learner_id)).all())
        rows = session.scalars(select(Learner).where(Learner.owner_sub == sub).order_by(Learner.name_key)).all()
        gone = session.scalars(select(DeletedLearner.id).where(DeletedLearner.owner_sub == sub)).all()
        return {"learners": [learner_json(r, counts.get(r.id, 0)) for r in rows], "deleted": list(gone), "server_time": int(time.time() * 1000)}

    @app.put("/api/v1/learners/{learner_id}")
    def put_learner(learner_id: str, body: dict, sub: str = Depends(account), session: Session = Depends(db)):
        try:
            valid_id(learner_id)
            data = LearnerIn.model_validate(body)
        except (ValueError, ValidationError) as exc:
            raise HTTPException(422, _reason(exc)) from None
        if data.updated_at > int(time.time() * 1000) + settings.future_skew_ms:
            raise HTTPException(422, "updated_at is in the future")
        tomb = session.get(DeletedLearner, learner_id)
        if tomb is not None and tomb.owner_sub == sub:
            raise HTTPException(410, "This profile was deleted from the account")
        key = name_key(data.name)
        row = session.get(Learner, learner_id)
        if row is not None and row.owner_sub != sub:
            raise HTTPException(404, "Profile not found")
        clash = session.scalar(select(Learner).where(Learner.owner_sub == sub, Learner.name_key == key, Learner.id != learner_id))
        if clash is not None:
            # The device can adopt this id and merge its local profile of the same name into it.
            return JSONResponse({"detail": "A profile with this name already exists.", "learner": learner_json(clash)}, status_code=409)
        if row is None:
            if session.scalar(select(func.count()).select_from(Learner).where(Learner.owner_sub == sub)) >= settings.max_learners:
                raise HTTPException(409, f"An account can hold up to {settings.max_learners} profiles.")
            row = Learner(id=learner_id, owner_sub=sub, name=data.name, name_key=key, avatar=data.avatar, updated_at=data.updated_at)
            session.add(row)
            applied = True
        elif data.updated_at >= row.updated_at:  # last write wins by the device's timestamp
            row.name, row.name_key, row.avatar, row.updated_at = data.name, key, data.avatar, data.updated_at
            applied = True
        else:
            applied = False
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(409, "A profile with this name already exists.") from None
        return {**learner_json(row), "applied": applied}

    def erase_learner(session: Session, learner_id: str) -> None:
        seqs = select(Result.seq).where(Result.learner_id == learner_id)
        session.execute(delete(ResultItem).where(ResultItem.result_seq.in_(seqs)))
        session.execute(delete(Result).where(Result.learner_id == learner_id))
        session.execute(delete(Learner).where(Learner.id == learner_id))

    @app.delete("/api/v1/learners/{learner_id}", status_code=204)
    def delete_learner(learner_id: str, sub: str = Depends(account), session: Session = Depends(db)):
        tomb = session.get(DeletedLearner, learner_id) if len(learner_id) == 36 else None
        if tomb is not None and tomb.owner_sub == sub:
            return Response(status_code=204)
        row = owned_learner(session, sub, learner_id)
        erase_learner(session, row.id)
        session.add(DeletedLearner(id=row.id, owner_sub=sub))
        session.commit()
        return Response(status_code=204)

    @app.post("/api/v1/results")
    def post_results(batch: ResultBatch, sub: str = Depends(account), session: Session = Depends(db)):
        now = int(time.time() * 1000)
        stored = session.scalar(select(func.count()).select_from(Result).where(Result.owner_sub == sub))
        learners: dict[str, str] = {}  # learner id -> "ok" | "gone" | "unknown"
        outcomes = []
        for raw in batch.results:
            rid = raw.get("id") if isinstance(raw.get("id"), str) else None
            try:
                item = ResultIn.model_validate(raw)
                if item.finished_at > now + settings.future_skew_ms or item.started_at > now + settings.future_skew_ms:
                    raise ValueError("timestamps are in the future")
            except (ValueError, ValidationError) as exc:
                outcomes.append({"id": rid, "status": "rejected", "reason": _reason(exc)})
                continue
            if item.learner_id not in learners:
                tomb = session.get(DeletedLearner, item.learner_id)
                if tomb is not None and tomb.owner_sub == sub:
                    learners[item.learner_id] = "gone"
                else:
                    mine = session.get(Learner, item.learner_id)
                    learners[item.learner_id] = "ok" if mine is not None and mine.owner_sub == sub else "unknown"
            if learners[item.learner_id] != "ok":
                outcomes.append({"id": item.id, "status": "gone" if learners[item.learner_id] == "gone" else "unknown_learner"})
                continue
            existing = session.scalar(select(Result).where(Result.client_id == item.id))
            if existing is not None:  # results are immutable: the first write stays
                same = existing.owner_sub == sub and existing.learner_id == item.learner_id
                outcomes.append({"id": item.id, "status": "duplicate"} if same else {"id": item.id, "status": "rejected", "reason": "id already used"})
                continue
            if stored >= settings.max_results:
                outcomes.append({"id": item.id, "status": "rejected", "reason": "storage limit reached"})
                continue
            row = Result(client_id=item.id, learner_id=item.learner_id, owner_sub=sub, grade=item.grade, topics=item.topics,
                         difficulty=item.difficulty, questions=item.questions, correct=item.correct, time_spent_ms=item.time_spent_ms,
                         started_at=item.started_at, finished_at=item.finished_at,
                         items=[ResultItem(position=n, template_id=i.template_id, correct=i.correct, attempts=i.attempts, time_ms=i.time_ms) for n, i in enumerate(item.items)])
            try:
                with session.begin_nested():
                    session.add(row)
                outcomes.append({"id": item.id, "status": "created"})
                stored += 1
            except IntegrityError:  # the same id arrived twice at once
                outcomes.append({"id": item.id, "status": "duplicate"})
        session.commit()
        return {"results": outcomes}

    @app.get("/api/v1/learners/{learner_id}/results")
    def learner_results(learner_id: str, since: int = 0, limit: int = MAX_PAGE, sub: str = Depends(account), session: Session = Depends(db)):
        owned_learner(session, sub, learner_id)
        limit = max(1, min(limit, MAX_PAGE))
        rows = session.scalars(select(Result).where(Result.learner_id == learner_id, Result.owner_sub == sub, Result.seq > max(since, 0))
                               .order_by(Result.seq).limit(limit + 1)).all()
        more = len(rows) > limit
        rows = rows[:limit]
        return {"results": [result_json(r) for r in rows], "next": rows[-1].seq if rows else max(since, 0), "has_more": more}

    @app.get("/api/v1/export")
    def export(sub: str = Depends(account), session: Session = Depends(db)):
        out = []
        for learner in session.scalars(select(Learner).where(Learner.owner_sub == sub).order_by(Learner.name_key)):
            results = session.scalars(select(Result).where(Result.learner_id == learner.id, Result.owner_sub == sub).order_by(Result.seq)).all()
            out.append({**learner_json(learner), "results": [result_json(r) for r in results]})
        body = {"format": "whack-a-math-export-1", "exported_at": int(time.time() * 1000), "learners": out}
        return JSONResponse(body, headers={"Content-Disposition": 'attachment; filename="whack-a-math-export.json"'})

    @app.delete("/api/v1/me", status_code=204)
    def delete_account_data(sub: str = Depends(account), session: Session = Depends(db)):
        """Erase every profile, result and the account row itself. Signing in again starts an empty area."""
        ids = session.scalars(select(Learner.id).where(Learner.owner_sub == sub)).all()
        for learner_id in ids:
            erase_learner(session, learner_id)
        session.execute(delete(DeletedLearner).where(DeletedLearner.owner_sub == sub))
        session.execute(delete(Account).where(Account.sub == sub))
        session.commit()
        return Response(status_code=204)

    return app


def _reason(exc: Exception) -> str:
    """A short message that never echoes the submitted values."""
    if isinstance(exc, ValidationError):
        first = exc.errors()[0]
        return f"{'.'.join(str(p) for p in first['loc'])}: {first['msg']}"[:160]
    return str(exc)[:160]

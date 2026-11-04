import sys
import time
import uuid
from pathlib import Path
from types import SimpleNamespace

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import Settings  # noqa: E402
from app.db import Base  # noqa: E402
from app.main import create_app  # noqa: E402
from app.sso_auth import SsoAuth  # noqa: E402

ORIGIN = "https://math.example.test"
ISSUER = "https://auth.example.test"
PRIVATE = rsa.generate_private_key(public_exponent=65537, key_size=2048)
OTHER_PRIVATE = rsa.generate_private_key(public_exponent=65537, key_size=2048)


def token(sub="user-a", *, key=PRIVATE, alg="RS256", exp_in=900, aud="platform", iss=ISSUER, kind="access", **extra):
    now = int(time.time())
    claims = {"sub": sub, "iss": iss, "aud": aud, "iat": now, "exp": now + exp_in, "type": kind, **extra}
    return jwt.encode(claims, key, algorithm=alg, headers={"kid": "k1"})


def now_ms():
    return int(time.time() * 1000)


def learner_body(name="Chloe", avatar="🦊", at=None):
    return {"name": name, "avatar": avatar, "updated_at": at or now_ms()}


def result_body(learner_id, rid=None, questions=3, correct=2, **over):
    started = now_ms() - 120_000
    body = {
        "id": rid or str(uuid.uuid4()), "learner_id": learner_id, "grade": 4, "topics": ["B2"], "difficulty": "auto",
        "questions": questions, "correct": correct, "time_spent_ms": 90_000, "started_at": started, "finished_at": started + 90_000,
        "items": [{"template_id": f"g4-b2-{n}", "correct": n < correct, "attempts": 1 if n < correct else 2, "time_ms": None} for n in range(questions)],
    }
    body.update(over)
    return body


class Client:
    """A browser-like client for one account: cookie auth plus the headers our page sends."""

    def __init__(self, app, sub):
        self.http = TestClient(app, base_url=ORIGIN)
        self.sub = sub
        self.http.cookies.set("sso_access", token(sub))
        self.headers = {"Origin": ORIGIN, "X-Auth-Request": "1"}

    def get(self, path, **kw):
        return self.http.get(path, **kw)

    def put(self, path, json=None, **kw):
        return self.http.put(path, json=json, headers={**self.headers, **kw.pop("headers", {})}, **kw)

    def post(self, path, json=None, **kw):
        return self.http.post(path, json=json, headers={**self.headers, **kw.pop("headers", {})}, **kw)

    def delete(self, path, **kw):
        return self.http.delete(path, headers={**self.headers, **kw.pop("headers", {})}, **kw)

    def new_learner(self, name="Chloe"):
        learner_id = str(uuid.uuid4())
        response = self.put(f"/api/v1/learners/{learner_id}", learner_body(name))
        assert response.status_code == 200, response.text
        return learner_id


def build_app(settings):
    auth = SsoAuth(ISSUER)
    auth._keys = SimpleNamespace(get_signing_key_from_jwt=lambda _token: SimpleNamespace(key=PRIVATE.public_key()))
    application = create_app(settings, auth)
    Base.metadata.create_all(application.state.engine)
    return application


@pytest.fixture
def settings():
    return Settings(database_url="sqlite://", sso_domain="example.test", allowed_origins=(ORIGIN,), write_limit=1000)


@pytest.fixture
def app(settings):
    return build_app(settings)


@pytest.fixture
def alice(app):
    return Client(app, "user-a")


@pytest.fixture
def bob(app):
    return Client(app, "user-b")

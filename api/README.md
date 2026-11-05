# Whack-a-Math API

FastAPI + SQLAlchemy + Alembic service that stores learner profiles and finished practice results for a signed-in shared account. The app works without it. Design, data model and cutover: [`docs/shared-infra.md`](../docs/shared-infra.md).

```
app/main.py      routes, CSRF/rate-limit/auth dependency, body limit
app/sso_auth.py  verifies the sso_access cookie or Bearer token (RS256 pinned, JWKS, audience platform)
app/schemas.py   bounded request validation        app/models.py  tables        migrations/  Alembic
tests/           pytest (SQLite): auth, IDOR, idempotency, validation, rate limit, cascade, export, migrations
```

```sh
python -m venv .venv && . .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
python -m pytest tests -q
# run locally (SQLite file; SSO_JWKS_URL must point at a JWKS that signs the tokens you test with)
MATH_ALLOWED_ORIGINS=http://127.0.0.1:5173 SSO_DOMAIN=example.test SSO_JWKS_URL=http://127.0.0.1:9100/.well-known/jwks.json \
  alembic upgrade head && uvicorn app.main:create_app --factory --port 8000
```

Environment: `MATH_DATABASE_URL`, `SSO_DOMAIN` (default `hedgies.cloud`), `SSO_JWKS_URL` (optional), `MATH_ALLOWED_ORIGINS`, `MATH_ENV=production`. The front end proxies `/api` to `127.0.0.1:8000` in `npm run dev`; account features only show on `*.hedgies.cloud` unless `VITE_FORCE_SYNC=1` (with `VITE_AUTH_BASE` for a stub login service).

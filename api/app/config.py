"""Settings read from the environment (names only in .env.infra.example; values never live in git)."""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str
    sso_domain: str = "hedgies.cloud"
    jwks_url: str | None = None
    # Origins allowed to send cookie-authenticated writes (and to use CORS with credentials).
    allowed_origins: tuple[str, ...] = ()
    production: bool = False
    max_body_bytes: int = 400_000
    write_limit: int = 120  # writes per account per window
    write_window_seconds: int = 60
    max_learners: int = 20
    max_results: int = 20_000
    future_skew_ms: int = 5 * 60 * 1000
    apps_url: str = ""  # the platform's app registry; empty disables /platform-apps

    @property
    def issuer(self) -> str:
        return f"https://auth.{self.sso_domain}"

    @classmethod
    def from_env(cls) -> "Settings":
        production = os.environ.get("MATH_ENV") == "production"
        url = os.environ.get("MATH_DATABASE_URL", "")
        if not url:
            if production:
                raise RuntimeError("MATH_DATABASE_URL is required in production")
            url = "sqlite:///./math-dev.db"
        domain = os.environ.get("SSO_DOMAIN", "hedgies.cloud")
        raw = os.environ.get("MATH_ALLOWED_ORIGINS", f"https://math.{domain}")
        return cls(
            database_url=url,
            sso_domain=domain,
            jwks_url=os.environ.get("SSO_JWKS_URL") or None,
            allowed_origins=tuple(o.strip().rstrip("/") for o in raw.split(",") if o.strip()),
            production=production,
            apps_url=os.environ.get("MATH_APPS_URL", f"https://apps.{domain}/app.json"),
        )

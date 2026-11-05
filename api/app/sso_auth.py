"""Verification of the shared login (RS256, JWKS, audience `platform`). Same pattern as the platform's clients/python/sso_auth.py.

The token proves who the person is (`sub`) and nothing else; Math keeps no roles. Being signed in gives an account its own
empty data area here, and everything is scoped to `sub`.
"""
from __future__ import annotations

import jwt
from fastapi import HTTPException, Request

COOKIE = "sso_access"


class SsoAuth:
    def __init__(self, issuer: str, jwks_url: str | None = None, audience: str = "platform"):
        self.issuer = issuer
        self.audience = audience
        self._keys = jwt.PyJWKClient(jwks_url or f"{issuer}/.well-known/jwks.json", cache_keys=True, lifespan=3600, timeout=5)

    def verify(self, token: str | None) -> dict:
        try:
            key = self._keys.get_signing_key_from_jwt(token or "").key
            # The algorithm is pinned; it is never read from the token header (blocks "none" and HS256-with-public-key).
            claims = jwt.decode(token, key, algorithms=["RS256"], issuer=self.issuer, audience=self.audience,
                                options={"require": ["exp", "iat", "sub", "type"]})
        except (jwt.PyJWTError, ValueError) as exc:
            raise HTTPException(401, "Please sign in to continue") from exc
        sub = claims.get("sub")
        if claims.get("type") != "access" or not isinstance(sub, str) or not 0 < len(sub) <= 64:
            raise HTTPException(401, "Please sign in to continue")
        return claims

    def identity(self, request: Request) -> tuple[dict, bool]:
        """Return (claims, used_cookie). A Bearer header wins and is not subject to the CSRF checks."""
        header = request.headers.get("Authorization", "")
        if header.startswith("Bearer "):
            return self.verify(header[7:]), False
        return self.verify(request.cookies.get(COOKIE)), True

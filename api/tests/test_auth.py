import jwt
import pytest
from fastapi.testclient import TestClient

from conftest import ISSUER, ORIGIN, OTHER_PRIVATE, PRIVATE, learner_body, token

URL = "/api/v1/me/learners"


def anon(app):
    return TestClient(app, base_url=ORIGIN)


def test_health_needs_no_login(app):
    assert anon(app).get("/api/v1/health").json() == {"status": "ok"}


def test_missing_token_is_401(app):
    assert anon(app).get(URL).status_code == 401


@pytest.mark.parametrize("bad", [
    lambda: token(exp_in=-60),                                   # expired
    lambda: token(key=OTHER_PRIVATE),                            # signed with another key
    lambda: token(aud="other"),                                  # wrong audience
    lambda: token(iss="https://evil.example"),                   # wrong issuer
    lambda: token(kind="refresh"),                               # a refresh token is not an access token
    lambda: jwt.encode({"sub": "user-a", "iss": ISSUER, "aud": "platform", "iat": 1, "exp": 9999999999, "type": "access"}, key=None, algorithm="none"),
    lambda: jwt.encode({"sub": "user-a", "iss": ISSUER, "aud": "platform", "iat": 1, "exp": 9999999999, "type": "access"}, key="x" * 40, algorithm="HS256"),
    lambda: "not-a-token",
    lambda: token(sub="x" * 65),
])
def test_forged_or_invalid_tokens_are_401(app, bad):
    client = anon(app)
    client.cookies.set("sso_access", bad())
    assert client.get(URL).status_code == 401
    assert client.get(URL, headers={"Authorization": "Bearer " + bad()}).status_code == 401


def test_cookie_and_bearer_both_work(app):
    client = anon(app)
    client.cookies.set("sso_access", token("user-a"))
    assert client.get(URL).json()["learners"] == []
    other = anon(app)
    assert other.get(URL, headers={"Authorization": "Bearer " + token("user-b")}).status_code == 200


def test_new_identity_gets_empty_area_without_approval(app):
    assert anon(app).get(URL, headers={"Authorization": "Bearer " + token("fresh")}).json()["learners"] == []


def test_cookie_writes_need_header_and_same_origin(alice, app):
    path = "/api/v1/learners/6f1b2c3d-1111-4222-8333-444455556666"
    body = learner_body()
    assert alice.http.put(path, json=body, headers={"Origin": ORIGIN}).status_code == 403            # no X-Auth-Request
    assert alice.http.put(path, json=body, headers={"X-Auth-Request": "1"}).status_code == 403        # no Origin
    assert alice.http.put(path, json=body, headers={"X-Auth-Request": "1", "Origin": "https://evil.example"}).status_code == 403
    assert alice.http.put(path, json=body, headers={"X-Auth-Request": "1", "Origin": ORIGIN}).status_code == 200


def test_bearer_writes_do_not_need_origin(app):
    client = anon(app)
    response = client.put("/api/v1/learners/6f1b2c3d-1111-4222-8333-444455556666", json=learner_body(),
                          headers={"Authorization": "Bearer " + token("user-a")})
    assert response.status_code == 200


def test_cors_only_for_the_app_origin(app):
    client = anon(app)
    ok = client.options(URL, headers={"Origin": ORIGIN, "Access-Control-Request-Method": "GET"})
    assert ok.headers.get("access-control-allow-origin") == ORIGIN
    assert ok.headers.get("access-control-allow-credentials") == "true"
    bad = client.options(URL, headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"})
    assert "access-control-allow-origin" not in bad.headers


def test_large_bodies_are_refused(alice):
    response = alice.post("/api/v1/results", {"results": [{"pad": "x" * 500_000}]})
    assert response.status_code == 413

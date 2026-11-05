import pytest

from app import platform_apps as pa
from conftest import ORIGIN
from fastapi.testclient import TestClient

REGISTRY = "https://apps.example.test/app.json"
LIST = b'[{"id":"rabbit","url":"https://learn.example.test"},{"id":"math","url":"https://math.example.test"},{"id":"bad id","url":"https://x.test"},{"id":"plain","url":"http://insecure.test"}]'
MANIFEST = b'{"short_name":"Rabbit","icons":[{"src":"/i/192.png","sizes":"192x192"},{"src":"/i/512.png","sizes":"512x512"}]}'
PAGE = b'<html><head><link rel="manifest" href="/m.webmanifest"></head></html>'


@pytest.fixture(autouse=True)
def fake_network(monkeypatch):
    pa.reset()
    calls = []

    def fetch(url, cookie=None, timeout=6):
        calls.append((url, cookie))
        if url == REGISTRY:
            if cookie and "admin" in cookie:
                return url, b'[{"id":"admin","url":"https://admin.example.test"}]'
            if getattr(fetch, "down", False):
                raise OSError("registry down")
            return url, LIST
        if url.endswith("/m.webmanifest"):
            return url, MANIFEST
        return url, PAGE

    monkeypatch.setattr(pa, "_fetch", fetch)
    fetch.calls = calls
    return fetch


def test_names_and_icons_come_from_each_apps_manifest(fake_network):
    apps = pa.get_apps(REGISTRY)
    assert [a["id"] for a in apps] == ["rabbit", "math"]                 # invalid id and http entries are dropped
    rabbit = apps[0]
    assert rabbit["name"] == "Rabbit" and rabbit["icon"] == "https://learn.example.test/i/192.png"  # smallest icon of 128 px or more


def test_only_the_sso_cookie_reaches_the_registry_and_never_an_app(fake_network):
    pa.get_apps(REGISTRY, "theme=dark; sso_access=abc.def.ghi; other=secret")
    registry_calls = [c for c in fake_network.calls if c[0] == REGISTRY]
    assert registry_calls == [(REGISTRY, "sso_access=abc.def.ghi")]
    assert all(cookie is None for url, cookie in fake_network.calls if url != REGISTRY)
    assert pa.sso_cookie("sso_access=bad value;") is None and pa.sso_cookie(None) is None and pa.sso_cookie("sso_access=" + "a" * 5000) is None


def test_the_list_is_per_visitor_and_never_cached_across_visitors(fake_network):
    public = pa.get_apps(REGISTRY)
    admin = pa.get_apps(REGISTRY, "sso_access=admin.token.x")
    assert [a["id"] for a in admin] == ["admin"] and [a["id"] for a in public] == ["rabbit", "math"]
    assert [a["id"] for a in pa.get_apps(REGISTRY)] == ["rabbit", "math"]   # the next anonymous visitor does not get the admin entry


def test_when_the_registry_is_down_only_the_public_list_is_served(fake_network):
    pa.get_apps(REGISTRY)                       # fills the public fallback
    fake_network.down = True
    assert [a["id"] for a in pa.get_apps(REGISTRY)] == ["rabbit", "math"]
    assert pa.get_apps(REGISTRY, "sso_access=admin.token.x") != []          # a cookie request still gets its own answer
    fake_network.down = True
    pa.reset()
    assert pa.get_apps(REGISTRY) == []          # nothing cached for a visitor: empty, not someone else's list


@pytest.mark.parametrize("host", ["127.0.0.1", "10.0.0.5", "192.168.1.1", "169.254.169.254", "::1", "localhost"])
def test_private_addresses_are_refused(host):
    assert pa.host_allowed(host) is False


def test_endpoint_is_public_and_returns_the_list(app, fake_network):
    client = TestClient(app, base_url=ORIGIN)
    assert client.get("/api/v1/platform-apps").json() == []                  # no registry configured


def test_endpoint_with_a_registry(settings, fake_network):
    from dataclasses import replace
    from conftest import build_app
    client = TestClient(build_app(replace(settings, apps_url=REGISTRY)), base_url=ORIGIN)
    body = client.get("/api/v1/platform-apps", headers={"Cookie": "sso_access=abc.def; other=x"}).json()
    assert [a["id"] for a in body] == ["rabbit", "math"] and body[0]["name"] == "Rabbit"
    assert (REGISTRY, "sso_access=abc.def") in fake_network.calls

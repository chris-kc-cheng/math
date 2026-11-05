"""The app switcher's list: the platform's app.json, read live, with each app's name and icon taken from its own web manifest.

app.json holds only `[{"id": ..., "url": ...}]`. Browsers cannot read it (no CORS), so the server reads it, then reads each app's page and
manifest, and returns `[{id, url, name, icon}]`.

The registry may add entries for the visitor (an administrator-only app), so it is fetched on every request with the visitor's
`sso_access` cookie ONLY (`Cookie: sso_access=<value>`: no other cookie, no Authorization), sent only to the registry address (never to an
app's page, manifest or icon, and never across a redirect), with a 2 second timeout. A visitor without that cookie gets no Cookie header at all. No list is cached or shared between visitors. What is cached, for ten minutes, is each app's description (name and icon) per app
URL. If the registry cannot be read, the last list fetched WITHOUT a cookie (the public list) is served.

The addresses come from a file other people can edit, so every fetch is https only, refuses private and loopback addresses (also after a
redirect), and reads at most 512 KB.
"""
from __future__ import annotations

import ipaddress
import json
import re
import socket
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

TTL = 600
REGISTRY_TIMEOUT = 2
MAX_COOKIE = 4096
SSO_COOKIE = 'sso_access'
_TOKEN_VALUE = re.compile(r'^[A-Za-z0-9._~+/=-]+$')   # a JWT; anything else is not forwarded
MAX_APPS = 24
MAX_BYTES = 512_000
_ID = re.compile(r'^[a-z0-9][a-z0-9-]{0,39}$')
_descriptions: dict[str, tuple[float, dict]] = {}   # app URL -> (fetched at, {name, icon})
_public: dict = {'apps': None, 'url': None}      # last list fetched without a cookie; the only fallback
_lock = threading.Lock()


def host_allowed(host: str) -> bool:
    """True only when every address the host points to is public, so a registry entry cannot aim this server at its own network."""
    try:
        try:
            addresses = [ipaddress.ip_address(host)]
        except ValueError:
            addresses = [ipaddress.ip_address(info[4][0]) for info in socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)]
        return bool(addresses) and all(address.is_global for address in addresses)
    except (OSError, ValueError):
        return False


def _check(url: str) -> None:
    parts = urllib.parse.urlsplit(url)
    if parts.scheme != 'https' or not parts.hostname or not host_allowed(parts.hostname):
        raise ValueError(f'not a public https address: {url}')


class _Guard(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        _check(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """A request carrying the visitor's cookie must never be forwarded to another address."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(req.full_url, code, 'redirect refused for a cookie request', headers, fp)


def _fetch(url: str, cookie: str | None = None, timeout: float = 6) -> tuple[str, bytes]:
    """(final URL after redirects, up to 512 KB of the body). A cookie is sent as-is and disables redirects."""
    _check(url)
    headers = {'User-Agent': 'Math-app-switcher', 'Accept': 'application/json, text/html, */*'}
    if cookie:
        headers['Cookie'] = cookie
    request = urllib.request.Request(url, headers=headers)
    opener = urllib.request.build_opener(_NoRedirect if cookie else _Guard)
    with opener.open(request, timeout=timeout) as response:
        return response.geturl(), response.read(MAX_BYTES)


def _attributes(tag: str) -> dict[str, str]:
    pairs = re.findall(r"""([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)""", tag)
    return {name.lower(): value.strip('"\'') for name, value in pairs}


def _icon_size(icon: dict) -> int:
    sizes = [int(w) for w, _ in re.findall(r'(\d+)x(\d+)', str(icon.get('sizes', '')))]
    return min(sizes) if sizes else 0


def _pick_icon(icons: list, base: str) -> tuple[str, int] | None:
    """(https address, size) of the smallest 'any' icon of 128 px or more, else the biggest."""
    usable = [icon for icon in icons if isinstance(icon, dict) and isinstance(icon.get('src'), str)]
    plain = [icon for icon in usable if 'any' in str(icon.get('purpose', 'any')).split()] or usable
    big = sorted((icon for icon in plain if _icon_size(icon) >= 128), key=_icon_size)
    chosen = big[0] if big else max(plain, key=_icon_size, default=None)
    if not chosen:
        return None
    address = urllib.parse.urljoin(base, chosen['src'])
    return (address, _icon_size(chosen)) if address.startswith('https://') else None


def _describe(entry: dict) -> dict:
    """Name and icon from the app's own page and manifest, cached per app URL. An unreadable page (an administrator-only app answers the
    scraper with 403) still falls back to /manifest.webmanifest; whatever cannot be read falls back to the id and an initial."""
    url = entry['url']
    with _lock:
        cached = _descriptions.get(url)
    if cached and time.monotonic() - cached[0] < TTL:
        details = cached[1]
    else:
        details = _read_details(entry)
        with _lock:
            _descriptions[url] = (time.monotonic(), details)
            if len(_descriptions) > 4 * MAX_APPS:
                for stale in sorted(_descriptions, key=lambda key: _descriptions[key][0])[:MAX_APPS]:
                    _descriptions.pop(stale, None)
    return {'id': entry['id'], 'url': url, **details}


def _read_details(entry: dict) -> dict:
    name, icon, size = None, None, 0
    page_url, links = entry['url'], []
    try:
        page_url, body = _fetch(entry['url'])
        links = [_attributes(tag) for tag in re.findall(r'<link\b[^>]*>', body.decode('utf-8', 'replace'), re.I)]
    except (OSError, ValueError):
        pass
    touch = next((link['href'] for link in links if 'apple-touch-icon' in link.get('rel', '').lower() and link.get('href')), None)
    manifest = next((link['href'] for link in links if link.get('rel', '').lower() == 'manifest' and link.get('href')), 'manifest.webmanifest')
    try:
        final, raw = _fetch(urllib.parse.urljoin(page_url, manifest))
        document = json.loads(raw.decode('utf-8', 'replace'))
        name = document.get('short_name') or document.get('name')
        icon, size = _pick_icon(document.get('icons') or [], final) or (None, 0)
    except (OSError, ValueError):
        pass
    if touch and (not icon or size > 512):    # a page's small home-screen icon beats a huge manifest image
        address = urllib.parse.urljoin(page_url, touch)
        icon = address if address.startswith('https://') else None
    return {'name': str(name).strip() if name else entry['id'].replace('-', ' ').title(), 'icon': icon}


def _registry(apps_url: str, cookie: str | None = None) -> list[dict]:
    _, raw = _fetch(apps_url, cookie, REGISTRY_TIMEOUT)
    document = json.loads(raw.decode('utf-8', 'replace'))
    if not isinstance(document, list):
        raise ValueError('app.json must be a list')
    entries, seen = [], set()
    for item in document:
        if not isinstance(item, dict) or not isinstance(item.get('id'), str) or not isinstance(item.get('url'), str):
            continue
        parts = urllib.parse.urlsplit(item['url'])
        if not _ID.match(item['id']) or item['id'] in seen or parts.scheme != 'https' or not parts.netloc:
            continue
        seen.add(item['id'])
        entries.append({'id': item['id'], 'url': item['url']})
    return entries[:MAX_APPS]


def sso_cookie(header: str | None) -> str | None:
    """`sso_access=<value>` taken from a raw Cookie header, or None. Nothing else from the header is ever forwarded."""
    for part in (header or '').split(';'):
        name, _, value = part.strip().partition('=')
        if name == SSO_COOKIE and value and len(value) <= MAX_COOKIE and _TOKEN_VALUE.match(value):
            return f'{SSO_COOKIE}={value}'
    return None


def get_apps(apps_url: str, cookie: str | None = None) -> list[dict]:
    """Apps in app.json's order, for this visitor. Empty when no registry is configured. When the registry cannot be read: the last public
    list (fetched without any cookie), never a list that was built for someone else."""
    if not apps_url:
        return []
    cookie = sso_cookie(cookie)
    try:
        entries = _registry(apps_url, cookie)
        with ThreadPoolExecutor(max_workers=8) as pool:
            apps = list(pool.map(_describe, entries))
    except (OSError, ValueError):
        with _lock:
            return list(_public['apps']) if _public['apps'] is not None and _public['url'] == apps_url else []
    if cookie is None:
        with _lock:
            _public.update(apps=list(apps), url=apps_url)
    return apps


def reset() -> None:
    with _lock:
        _descriptions.clear()
        _public.update(apps=None, url=None)

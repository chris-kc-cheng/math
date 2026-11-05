# Math on the shared platform

Math is served from its own subdomain, `https://math.hedgies.cloud`, by the platform's Caddy. The shared login cookie (`sso_access`) only reaches `*.hedgies.cloud`, so GitHub Pages cannot offer accounts. Playing never needs an account: everything works offline and anonymously exactly as before. Signing in is optional and saves each learner's players and finished practice results to the account.

```
browser ── https://math.hedgies.cloud ──► shared Caddy ──► /srv/www/math/current   (static Vite build, made in CI)
                                                      └──► /api/*  → math-api:8000  (FastAPI, database `math` on the shared Postgres)
login:   https://auth.hedgies.cloud  (cookie sso_access on .hedgies.cloud; the API only verifies it, JWKS, RS256, audience `platform`)
```

## What is stored (privacy)

Per **account** (the token's `sub`, plus first/last seen): learner profiles (random UUID, display name up to 40 characters, avatar emoji) and finished practice results: grade, topic ids, difficulty, number of questions and correct, time spent, started/finished times, and per question the template id with right/wrong and number of tries. **Not stored:** typed answers, the generated numbers, free text, device identifiers, IP addresses or user agents in the app tables. Accounts never see each other's data; every query is scoped to the token's `sub`.

- **Export:** account panel → *Download my account data* (`GET /api/v1/export`, JSON).
- **Delete one learner:** account panel → *Delete…* removes the profile and all its results from the server (hard delete) and from this device. Only the profile's random id stays as a tombstone so another device cannot silently re-create it.
- **Delete everything:** *Delete everything saved on my account* (`DELETE /api/v1/me`).
- Local play stays in the browser (IndexedDB/localStorage) and is untouched by any of this.

## First production cutover (in this order)

1. **DNS (you):** add an A record `math.hedgies.cloud` → the VPS (same address as the other apps).
2. **Database (infrastructure repo):** `scripts/new-app.sh math` creates the database `math` and its role and prints the connection URL once.
3. **Server settings:** write `~/math/.env.infra` on the VPS from [`.env.infra.example`](../.env.infra.example): `DOMAIN=hedgies.cloud` and `MATH_DATABASE_URL=postgresql+psycopg://…` (from step 2). Never commit it. Make sure the deploy user can write `/srv/www/math` (`mkdir -p /srv/www/math` and `chown` to that user).
4. **Deploy once:** merge the `shared-platform` branch to `main`, or run *Test and deploy production* from the Actions tab (it needs the same `HOSTINGER_*` secrets and `production` environment as Rabbit). The workflow tests, builds, publishes `/srv/www/math/releases/<sha>` with the relative `current` symlink (newest 3 kept), uploads only `api/` and `compose.infra.yaml` to `~/math`, checks that `.env.infra` exists, runs `docker compose config --quiet` and `up -d --build --remove-orphans api`. Nothing is public yet: no route exists.
5. **Route and registry (infrastructure repo):**
   - copy [`deploy/math.caddy`](../deploy/math.caddy) to `sites/math.caddy`;
   - add `{"id": "math", "url": "https://math.hedgies.cloud"}` to `switcher/app.json` (the 9-dot launcher hides Math itself by the id `math`);
   - `docker compose exec proxy caddy reload --config /etc/caddy/Caddyfile`.
   - Check the login service allows `https://math.hedgies.cloud` as a `return_to` address and as a CORS origin (needed for Google/Microsoft login and for the password form).
6. **Smoke test:** `https://math.hedgies.cloud/api/v1/health` returns `{"status":"ok"}`; open the site, play a round anonymously, log in, choose what to save, play another round and confirm it shows *Saved to your account*; open the site on a second device and see the players.
7. **The old GitHub Pages site:** `deploy-pages.yml` is gone, so the last published Pages build stays online unchanged (it keeps working offline-only). The old build has no backup button, so run the manual workflow *Deploy moved notice to GitHub Pages* once: it builds this branch's code with a banner linking to `math.hedgies.cloud`, and that copy has *Back up or move data* (the only way to carry local players across; see below). After a transition period you may switch Pages off in the repository settings.
8. **Rollback:** the front end: `ln -sfn releases/<older> /srv/www/math/current` on the server. The API: redeploy an earlier commit with the workflow (migrations only add tables, so an older API can run against the same database), or `docker compose -f compose.infra.yaml --env-file .env.infra stop api`: the app keeps working offline without it. To remove Math from the platform, delete `sites/math.caddy` and the registry entry and reload Caddy.

## Moving from the old address

Browser storage belongs to one web address, so players and rounds saved on `chris-kc-cheng.github.io/math` are not visible on `math.hedgies.cloud`. Bring them over with a backup file:

- **Backup file (the only way, since storage is per address):** on the old address open the player menu → *Back up or move data* → *Save a backup file*. On the new address do the same dialog → *Restore from a backup file…*. Then log in: the first-login question *Save this device's players and results?* uploads the restored data to the account (or *Keep them on this device only*).

People who installed the app to the home screen (PWA, or iPhone *Add to Home Screen*) from the old address must remove it and add the new address again: the installed app is bound to its origin and manifest id.

## Sync rules in short

- The device keeps writing to IndexedDB as before. Finished rounds carry the client-generated round UUID as the result id; profiles get a UUID per account.
- Sync runs when signed in and online (after login, after a round, when coming back online, every few minutes). Pushes are idempotent: the server keeps the **first** write of a result (results are immutable) and answers `duplicate` on repeats; profile name/avatar is **last write wins** by `updated_at`.
- Existing local data is attached only if the person chooses; declining keeps it off the account, and new rounds are still saved.
- A learner deleted on one device is removed on the others from the account (their local copy is kept but no longer synced).
- Status text: *Log in to save results to your account*, *Saving to your account…*, *Saved to your account*, *Will save when you are online*, *Choose what to save to your account*.
- The API verifies the cookie or `Authorization: Bearer` token itself; cookie-authenticated writes also need `X-Auth-Request: 1` and an allowed `Origin`; writes are rate-limited per account.

## API (`/api/v1`)

| Method and path | Purpose |
| --- | --- |
| `GET /health` | liveness (no login) |
| `GET /me/learners` | the account's profiles with result counts, plus ids of deleted profiles |
| `PUT /learners/{uuid}` | create or update a profile (409 if the name exists, 410 if deleted) |
| `DELETE /learners/{uuid}` | hard-delete a profile and all its results |
| `POST /results` | batch of up to 50 results; per-item status `created`, `duplicate`, `rejected`, `unknown_learner`, `gone` |
| `GET /learners/{uuid}/results?since=<cursor>` | results after a server cursor (paged) |
| `GET /export` | everything of the account as JSON |
| `DELETE /me` | erase all of the account's data |

Development and tests: see [`api/README.md`](../api/README.md).

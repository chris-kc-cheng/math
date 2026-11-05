import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('production deploy publishes a release, keeps three, flips a relative symlink and never uploads .env files',()=>{
 const flow=read('.github/workflows/deploy-production.yml');
 assert.match(flow,/\/srv\/www\/math\/releases\/\$GITHUB_SHA/);
 assert.match(flow,/ln -sfn releases\/\$GITHUB_SHA current\.tmp && mv -Tf current\.tmp current/);
 assert.match(flow,/tail -n \+4 \| xargs -r rm -rf/);
 assert.match(flow,/--exclude '\.env\*'/);
 assert.match(flow,/test -f \.env\.infra && docker compose -f compose\.infra\.yaml --env-file \.env\.infra config --quiet && docker compose .* up -d --build --remove-orphans api/);
 for(const name of ['HOSTINGER_SSH_KEY','HOSTINGER_KNOWN_HOSTS','HOSTINGER_HOST','HOSTINGER_SSH_PORT','HOSTINGER_USER'])assert.ok(flow.includes(`secrets.${name}`),name);
 assert.ok(!/rsync[^\n]*\bsrc\b/.test(flow),'front-end sources are not uploaded');
 for(const name of ['deploy-pages.yml','deploy-pages-moved.yml'])assert.ok(!existsSync(new URL('../.github/workflows/'+name,import.meta.url)),name+' is gone');
});

test('the compose file runs only the API, on the shared networks, with neutral names',()=>{
 const compose=read('compose.infra.yaml');
 assert.match(compose,/^name: math$/m);assert.match(compose,/container_name: math-api/);
 assert.match(compose,/aliases: \[math-api\]/);assert.match(compose,/name: platform-edge/);assert.match(compose,/name: platform-data/);
 assert.ok(!/^\s{2}(web|db|proxy):/m.test(compose),'no web or database container');
 assert.match(compose,/env_file: \.env\.infra/);
 assert.ok(!existsSync(new URL('../.env.infra',import.meta.url)));
 const example=read('.env.infra.example');
 assert.match(example,/^MATH_DATABASE_URL=$/m);assert.ok(!/=\S/.test(example.replace(/^#.*$/gm,'').replace(/^\w+=$/gm,'')),'example holds names only');
});

test('the route file serves static files, proxies /api with a small body limit and sets a CSP',()=>{
 const route=read('deploy/math.caddy');
 assert.match(route,/^math\.\{\$DOMAIN\} \{/m);assert.match(route,/root \* \/srv\/www\/math\/current/);
 assert.match(route,/handle \/api\/\*[\s\S]*max_size 512KB[\s\S]*reverse_proxy math-api:8000/);
 assert.match(route,/Content-Security-Policy "[^"]*wasm-unsafe-eval[^"]*frame-ancestors 'none'/);
 assert.match(route,/application\/wasm/);assert.match(route,/immutable/);
});

test('names stay neutral: the platform domain is the only place the word appears in new infrastructure files',()=>{
 for(const path of ['compose.infra.yaml','.env.infra.example','deploy/math.caddy','.github/workflows/deploy-production.yml','api/app/main.py','api/app/sso_auth.py','api/app/config.py','src/sync/config.js','src/sync/index.js','src/ui/account.js']){
  const text=read(path).replace(/hedgies\.cloud/gi,'');
  assert.ok(!/hedgies/i.test(text),path);
 }
});

test('the app id in the shared registry is math',()=>{
 assert.match(read('vite.config.js'),/const appId='math'/);
});

test('the Practice page is pinned to the light look and the theme script honours the lock',()=>{
 assert.match(read('game.html'),/<html[^>]+data-theme-lock="light"/);
 assert.match(read('public/theme.js'),/root\.dataset\.themeLock/);
 assert.ok(!/data-theme-lock/.test(read('index.html'))&&!/data-theme-lock/.test(read('curriculum.html')));
});

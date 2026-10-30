import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('every main entry page provides the iPhone icon and PWA manifest',()=>{
 for(const page of ['index.html','game.html','curriculum.html']){
  const html=readFileSync(new URL('../'+page,import.meta.url),'utf8');
  assert.match(html,/<link[^>]+rel="apple-touch-icon"[^>]+href="%BASE_URL%icons\/mole-180\.png(?:\?[^\"]*)?"/,page);
  assert.match(html,/<link[^>]+rel="manifest"[^>]+href="%BASE_URL%manifest.webmanifest"/,page);
  assert.match(html,/apple-mobile-web-app-title" content="Whack-a-Math"/,page);
 }
 const icon=readFileSync(new URL('../public/icons/mole-180.png',import.meta.url));
 assert.equal(icon.subarray(1,4).toString(),'PNG');assert.equal(icon.readUInt32BE(16),180);assert.equal(icon.readUInt32BE(20),180);
});

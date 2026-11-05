import test from 'node:test';
import assert from 'node:assert/strict';
import {parseApps,nameFromId,isCurrentApp,pickIcon,listRequest,APP_LIST_URL} from './app-launcher.js';

test('parseApps keeps well-formed https entries and derives a name from the id',()=>{
 const apps=parseApps([{id:'parking-simulator',url:'https://example.com/p/'},{id:'x',url:'http://insecure.test/'},{id:'y'},null,{id:'named',url:'https://a.test/',name:'Pretty Name',icon:'logo.png'}]);
 assert.deepEqual(apps.map(a=>a.name),['Parking Simulator','Pretty Name']);
 assert.equal(apps[1].icon,'https://a.test/logo.png');assert.equal(apps[0].icon,null);
 assert.deepEqual(parseApps({}),[]);
});
test('nameFromId title-cases hyphenated ids',()=>assert.equal(nameFromId('hedgies-finance'),'Hedgies Finance'));
test('the current app is hidden by id alone, wherever it is served',()=>{
 assert.equal(isCurrentApp({id:'math',url:'https://math.hedgies.cloud'},'math'),true);
 assert.equal(isCurrentApp({id:'rabbit',url:'https://learn.hedgies.cloud/'},'math'),false);
 assert.equal(isCurrentApp({id:'rabbit',url:'https://learn.hedgies.cloud/'},undefined),false);
});
test('pickIcon takes the smallest PWA icon of at least 128px, resolved against the manifest, and skips monochrome ones',()=>{
 const base='https://a.test/app/manifest.webmanifest';
 assert.equal(pickIcon([{src:'i/512.png',sizes:'512x512'},{src:'i/192.png',sizes:'192x192'},{src:'i/mono.png',sizes:'128x128',purpose:'monochrome'}],base),'https://a.test/app/i/192.png');
 assert.equal(pickIcon([{src:'/s.png',sizes:'64x64'},{src:'/t.png',sizes:'32x32'}],base),'https://a.test/s.png');
 assert.equal(pickIcon([],base),null);assert.equal(pickIcon([{src:'http://a.test/x.png',sizes:'192x192'}],base),null);
});
test('the app list is requested with the visitor cookie and never cached; Math itself is still excluded',()=>{
 const [url,init]=listRequest();
 assert.equal(url,APP_LIST_URL);assert.equal(init.credentials,'include');assert.equal(init.cache,'no-store');
 const apps=parseApps([{id:'math',url:'https://math.hedgies.cloud'},{id:'admin',url:'https://admin.hedgies.cloud'},{id:'rabbit',url:'https://learn.hedgies.cloud'}]);
 assert.deepEqual(apps.filter(a=>!isCurrentApp(a,'math')).map(a=>a.id),['admin','rabbit']);
});

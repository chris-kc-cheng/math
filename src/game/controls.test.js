import test from 'node:test';
import assert from 'node:assert/strict';
import {setActionBusy} from './controls.js';

test('round actions restore the current setup without removed player-step buttons',()=>{
 const start={disabled:false},quit={disabled:false},gradePicker={disabled:false},answer={disabled:false};
 const root={querySelectorAll:()=>[start,quit,gradePicker,answer],querySelector:selector=>selector==='#game-start'?start:null};
 setActionBusy(root,true,{ready:true,countValid:true});assert.ok([start,quit,gradePicker,answer].every(c=>c.disabled));
 assert.doesNotThrow(()=>setActionBusy(root,false,{ready:true,countValid:true}));
 assert.ok([start,quit,gradePicker,answer].every(c=>!c.disabled));
 for(const settings of [{ready:false,countValid:true},{ready:true,countValid:false}]){
  setActionBusy(root,false,settings);assert.equal(start.disabled,true);assert.equal(quit.disabled,false);
 }
});

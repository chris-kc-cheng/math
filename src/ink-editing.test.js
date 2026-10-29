import {test} from 'node:test';
import assert from 'node:assert/strict';
import {strokeTouchesEraser} from './ink-editing.js';
const line={points:[{x:10,y:10},{x:90,y:10}],lineWidth:3};
test('eraser hits between sampled points and along a fast swipe',()=>{
 assert.equal(strokeTouchesEraser(line,{x:50,y:6},{x:50,y:6},5),true);
 assert.equal(strokeTouchesEraser(line,{x:50,y:-40},{x:50,y:50},5),true);
 assert.equal(strokeTouchesEraser(line,{x:0,y:40},{x:100,y:40},5),false);
});
test('eraser handles dots, empty strokes, and collinear paths',()=>{
 assert.equal(strokeTouchesEraser({points:[{x:20,y:20}]},{x:0,y:20},{x:40,y:20},5),true);
 assert.equal(strokeTouchesEraser({points:[]},{x:0,y:0},{x:0,y:0},5),false);
 assert.equal(strokeTouchesEraser(line,{x:120,y:10},{x:150,y:10},5),false);
});

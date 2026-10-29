import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as ort from 'onnxruntime-web';

test('trained encoder and decoder run together with the shipped vocabulary',async()=>{
 ort.env.wasm.numThreads=1;
 const model=name=>readFile(new URL(`../public/models/comer/${name}`,import.meta.url));
 const encoder=await ort.InferenceSession.create(await model('encoder_int8.onnx'),{executionProviders:['wasm']});
 const decoder=await ort.InferenceSession.create(await model('decoder_int8.onnx'),{executionProviders:['wasm']});
 const vocab=JSON.parse(await model('vocab.json'));
 const pixels=new ort.Tensor('float32',new Float32Array(256*128),[1,1,256,128]);
 const mask=new ort.Tensor('bool',new Uint8Array(256*128),[1,256,128]);
 const ids=new ort.Tensor('int64',BigInt64Array.of(BigInt(vocab.special_tokens.sos)),[1,1]);
 let encoded,decoded;
 try{
  encoded=await encoder.run({pixel_values:pixels,pixel_mask:mask});
  decoded=await decoder.run({...encoded,input_ids:ids});
  assert.equal(decoded.logits.dims.at(-1),vocab.vocab_size);
  assert.ok(Array.from(decoded.logits.data).every(Number.isFinite));
 }finally{
  pixels.dispose();mask.dispose();ids.dispose();
  Object.values(encoded??{}).forEach(t=>t.dispose());Object.values(decoded??{}).forEach(t=>t.dispose());
  await encoder.release();await decoder.release();
 }
});

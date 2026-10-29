import * as ort from 'onnxruntime-web';
import {InferenceEngine} from 'ink-on/core';
import wasmModuleUrl from 'onnxruntime-web/ort-wasm-simd-threaded.mjs?url';
import wasmBinaryUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';

// A dedicated worker keeps model inference away from pointer drawing and captions.
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = {mjs:wasmModuleUrl,wasm:wasmBinaryUrl};
let engine;
let vocab;
self.onmessage = async ({data}) => {
 try {
  if(data.type === 'init') {
   vocab = await fetch('/models/comer/vocab.json').then(r=>{if(!r.ok)throw Error('Vocabulary unavailable');return r.json();});
   engine = new InferenceEngine({encoderUrl:'/models/comer/encoder_int8.onnx',decoderUrl:'/models/comer/decoder_int8.onnx',beamWidth:3,maxDecodeSteps:40,executionProvider:'wasm'});
   await engine.init();
   self.postMessage({type:'ready'});
  } else if(data.type === 'recognize') {
   if(!engine) throw Error('Model is not ready');
   const result = await engine.recognize(data.input,vocab,'number');
   self.postMessage({type:'result',id:data.id,latex:result.latex,totalMs:result.totalMs});
  }
 } catch(error) {
  self.postMessage({type:'error',id:data.id,message:error.message || 'Recognition failed'});
 }
};

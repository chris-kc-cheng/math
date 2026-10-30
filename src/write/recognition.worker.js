import * as ort from 'onnxruntime-web';
import {InferenceEngine} from 'ink-on/core';
import wasmModuleUrl from 'onnxruntime-web/ort-wasm-simd-threaded.mjs?url';
import wasmBinaryUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';

// A dedicated worker keeps model inference away from pointer drawing and captions.
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = {mjs:wasmModuleUrl,wasm:wasmBinaryUrl};
let engine;
let vocab;
const modelUrl=name=>`${import.meta.env.BASE_URL}models/comer/${name}`;
const debug=(event,details={})=>self.postMessage({type:'debug',event,details});
self.onmessage = async ({data}) => {
 try {
  if(data.type === 'init') {
   const encoderUrl=modelUrl('encoder_int8.onnx'),decoderUrl=modelUrl('decoder_int8.onnx');
   const start=performance.now();debug('model.loading',{runtime:'ONNX WASM',threads:1,encoder:encoderUrl,decoder:decoderUrl});
   vocab = await fetch(modelUrl('vocab.json')).then(r=>{if(!r.ok)throw Error('Vocabulary unavailable');return r.json();});
   engine = new InferenceEngine({encoderUrl,decoderUrl,beamWidth:3,maxDecodeSteps:40,executionProvider:'wasm'});
   await engine.init();
   debug('model.ready',{durationMs:Math.round(performance.now()-start),vocabulary:vocab.vocab_size});
   self.postMessage({type:'ready'});
  } else if(data.type === 'recognize') {
   debug('inference.start',{id:data.id,height:data.input.height,width:data.input.width,mode:'number',beamWidth:3});
   if(!engine) throw Error('Model is not ready');
   const result = await engine.recognize(data.input,vocab,'number');
   debug('inference.complete',{id:data.id,encoderMs:result.encoderMs,decoderMs:result.decoderMs,totalMs:result.totalMs,tokenIds:result.tokenIds});
   self.postMessage({type:'result',id:data.id,latex:result.latex,totalMs:result.totalMs});
  }
 } catch(error) {
  debug('worker.error',{message:error.message,stack:error.stack});
  self.postMessage({type:'error',id:data.id,message:error.message || 'Recognition failed'});
 }
};

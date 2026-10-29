import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  // Use the CPU/WASM runtime consistently in both ink-on and our worker.
  resolve: {alias: [{find: /^onnxruntime-web$/, replacement: 'onnxruntime-web/wasm'}]},
  worker: {format:'es'},
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        skills: fileURLToPath(new URL('./skills.html', import.meta.url)),
        write: fileURLToPath(new URL('./write.html', import.meta.url)),
      },
    },
  },
});

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
        curriculum: fileURLToPath(new URL('./curriculum.html', import.meta.url)),
        game: fileURLToPath(new URL('./game.html', import.meta.url)),
        fractionConversion: fileURLToPath(new URL('./fraction-conversion.html', import.meta.url)),
        write: fileURLToPath(new URL('./write.html', import.meta.url)),
        longDivision: fileURLToPath(new URL('./long-division.html', import.meta.url)),
      },
    },
  },
});

import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

// public/theme.css and theme.js are not hashed by Vite, so a browser could pair a new page bundle with a stale cached copy.
// Stamping each build onto their URLs keeps the shared theme and the page code in step.
const stamp=Date.now();
const versionTheme=()=>({name:'version-theme',transformIndexHtml:html=>html.replace(/(theme.(?:css|js))"/g,`$1?v=${stamp}"`)});

export default defineConfig({
  plugins: [versionTheme()],
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

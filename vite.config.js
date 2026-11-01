import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';

// The package name is this app's id in the shared app list; the launcher uses it to hide the current app, also on localhost.
const appId=JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8')).name;

// public/theme.css and theme.js are not hashed by Vite, so a browser could pair a new page bundle with a stale cached copy.
// Stamping each build onto their URLs keeps the shared theme and the page code in step.
const stamp=Date.now();
const versionTheme=()=>({name:'version-theme',transformIndexHtml:html=>html.replace(/(theme.(?:css|js))"/g,`$1?v=${stamp}"`)});

// The app launcher reads the shared app list and each app's manifest, and most hosts send no CORS header.
// In dev only, this relay fetches an https URL for the browser (see ui/app-launcher.js). It is not part of the build.
const devFetch=()=>({name:'dev-fetch',apply:'serve',configureServer(server){server.middlewares.use('/__fetch',async(request,response)=>{
  try{
    const target=new URL(new URL(request.url,'http://localhost').searchParams.get('url')??'');
    if(target.protocol!=='https:')throw Error('https only');
    const upstream=await fetch(target,{headers:{accept:request.headers.accept??'*/*'}});
    response.statusCode=upstream.status;response.setHeader('content-type',upstream.headers.get('content-type')??'text/plain');
    response.end(Buffer.from(await upstream.arrayBuffer()));
  }catch(error){response.statusCode=502;response.end(String(error.message));}
});}});

export default defineConfig({
  plugins: [versionTheme(), devFetch()],
  // Use the CPU/WASM runtime consistently in both ink-on and our worker.
  resolve: {alias: [{find: /^onnxruntime-web$/, replacement: 'onnxruntime-web/wasm'}]},
  define: {__APP_ID__: JSON.stringify(appId)},
  worker: {format:'es'},
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        curriculum: fileURLToPath(new URL('./curriculum.html', import.meta.url)),
        game: fileURLToPath(new URL('./game.html', import.meta.url)),
        write: fileURLToPath(new URL('./write.html', import.meta.url)),
      },
    },
  },
});

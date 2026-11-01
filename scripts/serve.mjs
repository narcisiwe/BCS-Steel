import {render} from '../js/render.js';
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist'),port=Number(process.env.PORT||4173);
const qa=process.env.BCS_QA==='1';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain','.mp4':'video/mp4','.webm':'video/webm'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');
if(qa&&url.pathname==='/__qa/carousel-reduced/'){
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(await readFile('tests/carousel-reduced.html'));return;
}
if(qa&&url.pathname==='/__qa/carousel/'){
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(await readFile('tests/carousel-fixture.html'));return;
}
if(qa&&url.pathname==='/__qa/hero/'){
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(await readFile('tests/hero-fixture.html'));return;
}
if(qa&&url.pathname==='/__qa/hero-page/'){
 const clip=url.searchParams.get('clip');
 if(clip!=='missing'&&!/^blob:http:\/\/127\.0\.0\.1:\d+\/[a-f0-9-]+$/i.test(clip||'')){res.writeHead(400);res.end('Invalid QA clip');return;}
 const source=clip==='missing'?'/__qa/missing-video.webm':clip;
 const html=render('lv','/').replace(/(<div class="hero-slide[^>]*>)(<img[^>]*>)/g,'$1$2<video muted loop playsinline preload="none" data-src="'+source+'" aria-hidden="true"></video>');
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});res.end(html);return;
}let file=qa&&url.pathname==='/__qa/'?path.resolve('tests/fixture.html'):path.resolve(root,'.'+decodeURIComponent(url.pathname));if(file!==path.resolve('tests/fixture.html')&&(!file.startsWith(root+path.sep)&&file!==root))throw Error();if((await stat(file)).isDirectory())file=path.join(file,'index.html');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}${qa?' (QA fixture enabled at /__qa/)':''}`));

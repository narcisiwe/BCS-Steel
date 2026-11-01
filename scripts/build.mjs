import {mkdir,cp,writeFile,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render} from './template.mjs';
import {copy} from '../js/content.js';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve('dist');
if(output!==path.join(project,'dist'))throw new Error('Run build from the BCS-Steel project directory.');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
await mkdir('js/vendor',{recursive:true});
await cp('node_modules/gsap/dist/gsap.min.js','js/vendor/gsap.min.js');
await cp('node_modules/gsap/README.md','js/vendor/GSAP-README.md');
for(const dir of ['css','js']) await cp(dir,'dist/'+dir,{recursive:true});
await cp('public','dist',{recursive:true,filter:source=>!source.includes('originals')&&!/product-\d\.png$/.test(source)});
await writeFile('dist/css/fonts.css',(await readFile('css/fonts.css','utf8')).replaceAll('../public/media/','../media/'));
for(const lang of Object.keys(copy)){
  const dir='dist/'+(lang==='lv'?'':lang+'/'); await mkdir(dir,{recursive:true}); await writeFile(dir+'index.html',render(lang));
  const sourceDir=lang==='lv'?'':lang+'/';if(sourceDir)await mkdir(sourceDir,{recursive:true});
  await writeFile(sourceDir+'index.html',render(lang).replaceAll('./media/','./public/media/'));
}
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://bcslasercut.eu/sitemap.xml\n');
const langs=['lv','ru','en'];
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${langs.map(l=>`<url><loc>https://bcslasercut.eu/${l==='lv'?'':l+'/'}</loc>${langs.map(a=>`<xhtml:link rel="alternate" hreflang="${a}" href="https://bcslasercut.eu/${a==='lv'?'':a+'/'}"/>`).join('')}</url>`).join('')}</urlset>`);
for(const file of ['robots.txt','sitemap.xml'])await cp('dist/'+file,file);
console.log('Built dist/: LV, RU, EN, assets, sitemap and robots.txt. Local GSAP core included.');

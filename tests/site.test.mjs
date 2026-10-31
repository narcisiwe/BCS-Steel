import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {copy} from '../js/content.js';
import {render} from '../scripts/template.mjs';
import {validDrawing,MAX_DRAWING_BYTES} from '../js/validation.js';
test('drawing validation rejects dangerous extensions, empty and oversized files',()=>{
  assert.equal(validDrawing(),true);
  for(const name of ['drawing.PDF','drawing.dxf','drawing.dwg','assembly.step','assembly.stp'])assert.equal(validDrawing({name,size:1024}),true);
  for(const file of [{name:'drawing.pdf.exe',size:100},{name:'x.svg',size:100},{name:'x.pdf',size:0},{name:'x.pdf',size:MAX_DRAWING_BYTES+1}])assert.equal(validDrawing(file),false);
  assert.equal(validDrawing({name:'x.pdf',size:MAX_DRAWING_BYTES}),true);
});
for(const lang of ['lv','ru','en'])test(`${lang}: complete localized content, SEO and media`,()=>{
  const c=copy[lang],html=render(lang);
  assert.deepEqual(Object.keys(c).sort(),Object.keys(copy.lv).sort());
  for(const key of ['heroTitles','heroDescriptions','serviceNames','serviceDescriptions','imageAlt'])assert.equal(c[key].length,4,key);
  assert.equal(c.products.length,8);assert.equal(c.productDescriptions.length,8);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert.match(html,new RegExp(`<html lang="${lang}"`));
  assert.match(html,/hreflang="lv"/);assert.match(html,/hreflang="ru"/);assert.match(html,/hreflang="en"/);
  assert.match(html,/rel="canonical"/);assert.match(html,/application\/ld\+json/);
  assert.doesNotMatch(html,/virpo|turning|lathe|токар/iu);
  assert.doesNotMatch(html,/undefined|NaN/);
  assert.match(html,/bcslasercut@gmail.com/);
  for(const match of html.matchAll(/(?:src|href)="((?:\.\/|\.\.\/)[^"]+)"/g)){
    const asset=match[1].replace(/^\.\.?\//,'');
    if(asset===''||['en/','ru/'].includes(asset))continue;
    assert.ok(existsSync(path.resolve('dist',asset)),`Missing ${asset}`);
  }
});
test('published build has sitemap, robots and no removed service text',()=>{
  for(const file of ['dist/index.html','dist/en/index.html','dist/ru/index.html','dist/sitemap.xml','dist/robots.txt'])assert.ok(existsSync(file),file);
  assert.match(readFileSync('dist/sitemap.xml','utf8'),/https:\/\/bcslasercut.eu\/ru\//);
});

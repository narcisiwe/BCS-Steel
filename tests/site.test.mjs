import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {copy} from '../js/content.js';
import {render} from '../scripts/template.mjs';
import {galleries} from '../js/gallery-data.js';
import {validDrawing,validPhone,prepareInquiry,MAX_DRAWING_BYTES} from '../js/validation.js';
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
    const asset=match[1].replace(/^\.\.?\//,'').split('?')[0];
    if(asset===''||['en/','ru/'].includes(asset))continue;
    assert.ok(existsSync(path.resolve('dist',asset)),`Missing ${asset}`);
  }
});
test('phone validation accepts international formatting and rejects empty or implausible values',()=>{
  for(const number of ['+371 28014638','+44 (20) 7946-0958','00371 28014638','(212) 555.1234','00123456789012345'])assert.equal(validPhone(number),true,number);
  for(const number of ['', 'abc', '+371 call me', '123', '1234567890123456', '++37128014638'])assert.equal(validPhone(number),false,number);
});
test('all thumbnail and deferred full-resolution gallery files are shipped',()=>{
  for(const gallery of galleries)for(const item of gallery)for(const asset of [item.thumb,item.full])assert.ok(existsSync(path.resolve('dist',asset)),asset);
  for(const lang of ['lv','ru','en'])assert.ok(!render(lang).includes('media/gallery/full/'),'Full-resolution images must not load in initial HTML');
});
for(const lang of ['lv','ru','en'])test(`${lang}: requested content, accessible galleries and required contact fields`,()=>{
  const c=copy[lang],html=render(lang);
  assert.equal(c.equipmentNames[0],'HSG G3015X');assert.deepEqual(c.equipmentSpecs[0],[]);
  assert.doesNotMatch(html,/Prima Power|PLATINO|3 kW|10 mm|theme\.js|id="theme"|dark light/i);
  assert.equal((html.match(/data-gallery-track=/g)||[]).length,2);
  assert.equal((html.match(/data-gallery="/g)||[]).length,14);
  assert.match(html,/id="lightbox"/);
  for(const name of ['name','email','phone'])assert.match(html,new RegExp(`name="${name}"[^>]*required`));
  assert.doesNotMatch(html,/name="company"[^>]*required/);
  assert.match(html,/textarea name="message"[^>]*required/);
  assert.doesNotMatch(html.split('id="services"')[1].split('id="fabrication"')[0],/class="text-link" href="#contacts"/);
  assert.match(html,/class="service-image"[^>]*aria-label=/);
  assert.ok(c.galleryTitles.every(title=>html.includes(title)));
  const draft=prepareInquiry({name:'QA',company:'',email:'qa@example.com',phone:'+371 28014638',service:'3',message:'A sketch and idea'},c,'drawing.pdf');
  assert.match(draft,/^mailto:bcslasercut@gmail.com\?/);assert.ok(decodeURIComponent(draft).includes('drawing.pdf'));assert.ok(decodeURIComponent(draft).includes('+371 28014638'));
});
test('published build has sitemap, robots and no removed service text',()=>{
  for(const file of ['dist/index.html','dist/en/index.html','dist/ru/index.html','dist/sitemap.xml','dist/robots.txt'])assert.ok(existsSync(file),file);
  assert.match(readFileSync('dist/sitemap.xml','utf8'),/https:\/\/bcslasercut.eu\/ru\//);
});

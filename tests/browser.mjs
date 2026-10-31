// Run against the local server. Uses installed Playwright or PLAYWRIGHT_MODULE.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const results=[],errors=[],requests=[];
await mkdir('playwright-results',{recursive:true});
try{
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)requests.push(r.url()+' '+r.status());});
for(const lang of ['lv','ru','en']){
  await page.goto('http://127.0.0.1:4173/'+(lang==='lv'?'':lang+'/'));await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('lang'),lang);
  for(const width of [375,768,1024,1440,1920]){
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} overflow at ${width}`);
    assert.ok(await page.locator('h1').isVisible());
    for(let i=0;i<4;i++){await page.locator(`[data-goto="${i}"]`).click();assert.equal(await page.locator('.hero-slide.active').getAttribute('data-slide'),String(i));}
    for(const mode of ['light','dark']){
      if(await page.locator('html').getAttribute('data-theme')!==mode)await page.locator('#theme').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'),mode);
    }
    if(width<=1000){await page.locator('#menu').click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'true');await page.locator('#navigation a[href="#services"]').click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'false');}
    results.push(`${lang}: ${width}px — layout, four slides, themes${width<=1000?', mobile navigation':''}`);
  }
  await page.locator('#products-next').click();await page.locator('#products').focus();await page.keyboard.press('End');
  assert.ok(await page.locator('#products').evaluate(el=>el.scrollLeft>0));
  await page.keyboard.press('Home');assert.equal(await page.locator('#products').evaluate(el=>el.scrollLeft),0);
  assert.equal(await page.locator('#quote-form').evaluate(f=>f.checkValidity()),false);
  await page.locator('[name="name"]').fill('QA Example');await page.locator('[name="company"]').fill('Example Ltd');await page.locator('[name="email"]').fill('qa@example.com');await page.locator('[name="service"]').selectOption('3');await page.locator('[name="message"]').fill('Test inquiry; no delivery requested.');await page.locator('[name="consent"]').check();
  assert.equal(await page.locator('#quote-form').evaluate(f=>f.checkValidity()),true);
  await page.locator('[name="drawing"]').setInputFiles({name:'unsafe.exe',mimeType:'application/octet-stream',buffer:Buffer.from('test')});assert.equal(await page.locator('[name="drawing"]').evaluate(el=>el.checkValidity()),false);
  await page.locator('[name="drawing"]').setInputFiles({name:'drawing.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 test')});assert.equal(await page.locator('[name="drawing"]').evaluate(el=>el.checkValidity()),true);
  // Deliberately do not submit: opening a real email client is not delivery testing.
  await page.evaluate(async()=>{for(const im of document.images){im.loading='eager';}await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));});
  const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(im=>!im.naturalWidth).map(im=>im.src));assert.deepEqual(broken,[]);
  results.push(`${lang}: carousel keyboard navigation; required/email/file validation; all images load`);
}
await page.goto('http://127.0.0.1:4173/');await page.setViewportSize({width:1440,height:1000});await page.locator('#theme').click();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.locator('#theme').click();
await page.evaluate(async()=>{for(const im of document.images)im.loading='eager';await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));});await page.screenshot({path:'playwright-results/desktop.png',fullPage:true});await page.screenshot({path:'playwright-results/hero.png'});
await page.setViewportSize({width:375,height:900});await page.screenshot({path:'playwright-results/mobile.png',fullPage:true});
assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
await writeFile('playwright-results/results.json',JSON.stringify({results,errors,requests},null,2));console.log(JSON.stringify({passed:results.length,results,errors,requests},null,2));
}finally{await browser.close();}

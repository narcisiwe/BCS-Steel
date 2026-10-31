// Start with BCS_QA=1 and the dev server running. No real emails are sent.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {runChecks} from './connected-browser.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage(),errors=[],badResponses=[];
page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)badResponses.push(response.url());});
await mkdir('work/qa',{recursive:true});
try{
 await page.goto('http://127.0.0.1:4173/__qa/');
 await page.waitForFunction(()=>JSON.parse(document.querySelector('#cycles').textContent).length>=9,null,{timeout:75000});
 const cycles=JSON.parse(await page.locator('#cycles').textContent());assert.deepEqual(cycles.slice(0,9).map(item=>item.slide),[0,1,2,3,0,1,2,3,0]);
 await page.goto('http://127.0.0.1:4173/?lang=lv');
 const interactions=await runChecks({playwright:page});
 for(const width of [375,768,1024,1440,1920]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);}
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173/?lang=lv');
 await page.locator('[data-goto="0"]').click();await page.locator('#hero-pause').click();const progress=await page.locator('.hero').evaluate(el=>el.style.getPropertyValue('--slide-progress'));await page.waitForTimeout(9000);assert.equal(await page.locator('.hero').getAttribute('data-active'),'0');assert.equal(await page.locator('.hero').evaluate(el=>el.style.getPropertyValue('--slide-progress')),progress);await page.locator('#hero-pause').click();await page.waitForTimeout(8300);assert.equal(await page.locator('.hero').getAttribute('data-active'),'1');
 await page.goto('http://127.0.0.1:4173/__qa/');const frame=page.frameLocator('iframe');
 await frame.locator('[name="name"]').fill('QA Example');await frame.locator('[name="email"]').fill('qa@example.com');await frame.locator('[name="phone"]').fill('+371 28014638');await frame.locator('[name="service"]').selectOption('3');await frame.locator('[name="message"]').fill('Test inquiry. No delivery attempted.');await frame.locator('[name="consent"]').check();
 await frame.locator('[name="drawing"]').setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('test')});assert.ok(await frame.locator('#file-error').innerText());
 await frame.locator('[name="drawing"]').setInputFiles({name:'drawing.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 test')});await frame.locator('.languages a[lang="en"]').click();assert.equal(await frame.locator('#file-name').innerText(),'drawing.pdf');await frame.locator('#quote-form button[type="submit"]').click();const draft=await page.locator('#draft-uri').textContent();assert.ok(draft.startsWith('mailto:bcslasercut@gmail.com?'));assert.ok(decodeURIComponent(draft).includes('drawing.pdf'));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/?lang=lv');await page.waitForTimeout(8500);assert.equal(await page.locator('.hero').getAttribute('data-active'),'0');assert.ok(await page.locator('#hero-pause').isDisabled());await page.locator('#hero-next').click();assert.equal(await page.locator('.hero').getAttribute('data-active'),'1');
 assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);
 await writeFile('work/qa/playwright-results.json',JSON.stringify({cycles,interactions,draftPrepared:true,errors,badResponses},null,2));console.log('Browser suite passed. No email sent.');
}finally{await browser.close();}

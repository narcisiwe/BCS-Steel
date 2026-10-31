import assert from 'node:assert/strict';
export async function runChecks(tab){
 const p=tab.playwright,results=[];
 for(const lang of ['ru','en','lv','en','ru','lv']){
  await p.locator(`.languages a[lang="${lang}"]`).click();
  const state=await p.evaluate(()=>({lang:document.documentElement.lang,galleries:document.querySelectorAll('[data-gallery-track]').length,theme:document.querySelectorAll('#theme').length,phoneRequired:document.querySelector('[name="phone"]').required,companyRequired:document.querySelector('[name="company"]').required}));
  assert.equal(state.lang,lang);assert.equal(state.galleries,2);assert.equal(state.theme,0);assert.equal(state.phoneRequired,true);assert.equal(state.companyRequired,false);
  for(let i=0;i<4;i++){await p.locator(`[data-goto="${i}"]`).click();assert.equal(await p.locator('.hero').getAttribute('data-active'),String(i));}
  await p.locator('#hero-next').click();assert.equal(await p.locator('.hero').getAttribute('data-active'),'0');await p.locator('#hero-prev').click();assert.equal(await p.locator('.hero').getAttribute('data-active'),'3');
  for(let g=0;g<2;g++){
   await p.locator(`[data-gallery-next="${g}"]`).click();await p.locator(`[data-gallery-track="${g}"]`).press('End');await p.waitForTimeout(350);
   assert.ok(await p.locator(`[data-gallery-track="${g}"]`).evaluate(el=>el.scrollLeft>0));
   await p.locator(`[data-gallery-track="${g}"]`).press('Home');await p.locator(`[data-gallery="${g}"][data-image="0"]`).click();
   assert.ok(await p.locator('#lightbox').evaluate(el=>el.open));await p.locator('#lightbox-next').click();
   assert.ok(await p.locator('#lightbox-count').innerText());await p.locator('#lightbox').press('ArrowLeft');await p.locator('#lightbox').press('Escape');assert.equal(await p.locator('#lightbox').evaluate(el=>el.open),false);
  }
  for(const name of ['name','email','phone','message'])await p.locator(`[name="${name}"]`).fill('');
  await p.locator('#quote-form button[type="submit"]').click();assert.ok((await p.locator('#error-name').innerText()).length>0);assert.ok((await p.locator('#error-phone').innerText()).length>0);
  await p.locator('[name="name"]').fill('QA Example');await p.locator('[name="email"]').fill('bad-address');await p.locator('[name="phone"]').fill('abc');await p.locator('[name="service"]').selectOption('3');await p.locator('[name="message"]').fill('A local QA inquiry based on a sketch.');await p.locator('[name="consent"]').check();await p.locator('#quote-form button[type="submit"]').click();
  assert.ok((await p.locator('#error-email').innerText()).length>0);assert.ok((await p.locator('#error-phone').innerText()).length>0);
  await p.locator('[name="email"]').fill('qa@example.com');await p.locator('[name="phone"]').fill('+44 (20) 7946-0958');
  results.push(`${lang}: localized content, four manual slides, next/previous, two galleries/lightboxes/keyboard, required/email/phone validation`);
 }
 return results;
}

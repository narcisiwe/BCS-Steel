import {copy} from './content.js';
import {render} from './render.js';
import {galleries} from './gallery-data.js';
import {validDrawing,validPhone,prepareInquiry} from './validation.js';
import {createSlideshowClock} from './slideshow-clock.js';

const root=new URL('../',import.meta.url);
const sourceAssets=document.querySelector('.brand img').src.includes('/public/media/');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection;
const initialLocale=document.documentElement.lang;
const store=(key,value)=>{try{localStorage.setItem(key,value);}catch{/* Storage is optional. */}};
try{localStorage.removeItem('bcs-theme');}catch{/* No theme preferences remain. */}
let runtime;

function initialize(saved={}){
  const c=copy[document.documentElement.lang]||copy.lv;
  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  const abort=new AbortController(),observers=[];
  const listen=(target,event,fn,options={})=>target.addEventListener(event,fn,{...options,signal:abort.signal});
  const menu=$('#menu'),nav=$('#navigation'),hero=$('.hero');
  function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',c.menu);}
  listen(menu,'click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?c.close:c.menu);});
  listen(document,'keydown',event=>{if(event.key==='Escape'){if(nav.contains(document.activeElement))menu.focus();closeMenu();}});
  listen(document,'click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
  listen(matchMedia('(min-width:1001px)'),'change',event=>{if(event.matches)closeMenu();});
  nav.querySelectorAll('a').forEach(a=>listen(a,'click',closeMenu));
  const updateHeader=()=>$('.site-header').classList.toggle('scrolled',scrollY>80);
  listen(window,'scroll',updateHeader,{passive:true});updateHeader();
  const sections=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting)nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));
  },{rootMargin:'-15% 0px -65% 0px'});
  $$('main section[id]').forEach(section=>sections.observe(section));observers.push(sections);
  const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');reveals.unobserve(entry.target);}
  }),{threshold:.12});
  $$('.section-heading,.about-copy').forEach(el=>{el.classList.add('reveal');reveals.observe(el);});observers.push(reveals);

  const panels=$$('.hero-slide'),tabs=$$('[data-goto]'),pauseButton=$('#hero-pause');
  let userPaused=saved.hero?.paused||false;
  let suspended=motion.matches||document.hidden||userPaused;
  const saveData=()=>connection?.saveData||/2g/.test(connection?.effectiveType||'');
  function videos(){
    panels.forEach((panel,i)=>{
      const video=panel.querySelector('video');if(!video)return;
      if(i===Number(hero.dataset.active)&&!suspended&&!saveData()){
        if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}
        video.play().catch(()=>video.classList.remove('ready'));
      }else {video.pause();if(motion.matches||saveData())video.classList.remove('ready');}
    });
  }
  panels.forEach(panel=>{
    const video=panel.querySelector('video');if(!video)return;
    listen(video,'playing',()=>video.classList.add('ready'));
    listen(video,'error',()=>video.classList.remove('ready'));
  });
  function showSlide(index){
    hero.dataset.active=String(index);
    panels.forEach((panel,i)=>panel.classList.toggle('active',i===index));
    tabs.forEach((tab,i)=>{if(i===index)tab.setAttribute('aria-current','true');else tab.removeAttribute('aria-current');});
    $('#hero-title').replaceChildren(...c.heroTitles[index].split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));
    $('#hero-description').textContent=c.heroDescriptions[index];
    $('.hero-copy').classList.remove('changing');
    if(!motion.matches){void $('.hero-copy').offsetWidth;$('.hero-copy').classList.add('changing');}
    videos();
  }
  const clock=createSlideshowClock({count:panels.length,duration:8000,
    initialIndex:saved.hero?.index||0,initialElapsed:saved.hero?.elapsed||0,
    onChange:showSlide,
    onProgress:progress=>hero.style.setProperty('--slide-progress',String(progress)),
    onPause:paused=>{suspended=paused;hero.classList.toggle('paused',paused);videos();}
  });
  function updatePause(){
    clock.pause('user',userPaused);clock.pause('reduced-motion',motion.matches);
    pauseButton.disabled=motion.matches;
    pauseButton.setAttribute('aria-pressed',String(userPaused||motion.matches));
    pauseButton.setAttribute('aria-label',motion.matches?c.motionPaused:userPaused?c.play:c.pause);
    pauseButton.innerHTML=userPaused?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2"/></svg>';
  }
  tabs.forEach((tab,i)=>listen(tab,'click',()=>clock.go(i)));
  listen($('#hero-prev'),'click',clock.previous);listen($('#hero-next'),'click',clock.next);
  listen(pauseButton,'click',()=>{userPaused=!userPaused;updatePause();});
  listen(document,'visibilitychange',()=>clock.pause('hidden',document.hidden));
  listen(motion,'change',updatePause);if(connection)listen(connection,'change',videos);
  const heroVisibility=new IntersectionObserver(([entry])=>clock.pause('offscreen',!entry.isIntersecting),{threshold:.15});
  heroVisibility.observe(hero);observers.push(heroVisibility);
  updatePause();clock.pause('hidden',document.hidden);
  let touchX=0,touchY=0;
  listen(hero,'touchstart',event=>{touchX=event.changedTouches[0].clientX;touchY=event.changedTouches[0].clientY;},{passive:true});
  listen(hero,'touchend',event=>{const x=event.changedTouches[0].clientX-touchX,y=event.changedTouches[0].clientY-touchY;if(Math.abs(x)>60&&Math.abs(x)>Math.abs(y)*1.5)(x<0?clock.next:clock.previous)();},{passive:true});

  function wireTrack(track,previous,next){
    const scroll=direction=>track.scrollBy({left:direction*(track.firstElementChild.offsetWidth+parseFloat(getComputedStyle(track).columnGap||0)),behavior:motion.matches?'instant':'smooth'});
    const update=()=>{previous.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-3;};
    listen(previous,'click',()=>scroll(-1));listen(next,'click',()=>scroll(1));listen(track,'scroll',update,{passive:true});
    listen(track,'keydown',event=>{
      if(event.target!==track)return;
      if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();scroll(event.key==='ArrowRight'?1:-1);}
      if(['Home','End'].includes(event.key)){event.preventDefault();track.scrollTo({left:event.key==='Home'?0:track.scrollWidth,behavior:motion.matches?'instant':'smooth'});}
    });
    const resize=new ResizeObserver(update);resize.observe(track);observers.push(resize);update();
  }
  wireTrack($('#products'),$('#products-prev'),$('#products-next'));
  $$('[data-gallery-track]').forEach((track,i)=>wireTrack(track,$(`[data-gallery-prev="${i}"]`),$(`[data-gallery-next="${i}"]`)));

  const dialog=$('#lightbox'),largeImage=$('#lightbox-image');
  let galleryIndex=0,imageIndex=0,opener;
  function showImage(index){
    const gallery=galleries[galleryIndex];imageIndex=(index+gallery.length)%gallery.length;
    const item=gallery[imageIndex],alt=item.illustrative?c.products[item.altIndex]:c.galleryAlts[item.altIndex];
    largeImage.src=new URL((sourceAssets?'public/':'')+item.full,root).href;
    largeImage.alt=alt+(item.illustrative?' — '+c.illustration:'');
    $('#lightbox-caption').textContent=alt+' — '+(item.illustrative?c.illustration:c.galleryCompany);
    $('#lightbox-count').textContent=c.imageCount.replace('{current}',imageIndex+1).replace('{total}',gallery.length);
  }
  $$('[data-gallery]').forEach(button=>listen(button,'click',()=>{
    opener=button;galleryIndex=Number(button.dataset.gallery);showImage(Number(button.dataset.image));
    clock.pause('lightbox',true);dialog.showModal();document.body.classList.add('lightbox-open');
  }));
  listen($('#lightbox-close'),'click',()=>dialog.close());
  listen($('#lightbox-prev'),'click',()=>showImage(imageIndex-1));listen($('#lightbox-next'),'click',()=>showImage(imageIndex+1));
  listen(dialog,'keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showImage(imageIndex+1);}if(event.key==='ArrowLeft'){event.preventDefault();showImage(imageIndex-1);}});
  listen(dialog,'click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  listen(dialog,'close',()=>{document.body.classList.remove('lightbox-open');largeImage.removeAttribute('src');clock.pause('lightbox',false);opener?.focus({preventScroll:true});});
  let lightboxX=0;
  listen(largeImage,'touchstart',event=>{lightboxX=event.changedTouches[0].clientX;},{passive:true});
  listen(largeImage,'touchend',event=>{const x=event.changedTouches[0].clientX-lightboxX;if(Math.abs(x)>60)showImage(imageIndex+(x<0?1:-1));},{passive:true});

  const form=$('#quote-form'),file=form.elements.drawing;
  if(saved.form){for(const [name,value] of Object.entries(saved.form)){const field=form.elements[name];if(!field)continue;if(field.type==='checkbox')field.checked=value;else field.value=value;}}
  if(saved.file)file.replaceWith(saved.file);
  const drawing=form.elements.drawing;
  const fields=[...form.elements].filter(field=>field.name&&field.type!=='file');
  for(const field of fields){
    const error=document.createElement('small');error.id='error-'+field.name;error.className='field-error';error.setAttribute('aria-live','polite');field.closest('label').append(error);field.setAttribute('aria-describedby',error.id);
  }
  function validateField(field){
    let message='';field.setCustomValidity('');
    if(field.required&&(field.type==='checkbox'?!field.checked:!field.value.trim()))message=c.requiredError;
    else if(field.name==='email'&&field.validity.typeMismatch)message=c.emailError;
    else if(field.name==='phone'&&field.value&&!validPhone(field.value))message=c.phoneError;
    field.setCustomValidity(message);field.setAttribute('aria-invalid',String(Boolean(message)));
    $('#error-'+field.name).textContent=message;return !message;
  }
  function validateFile(){const ok=validDrawing(drawing.files[0]);drawing.setCustomValidity(ok?'':c.fileError);drawing.setAttribute('aria-invalid',String(!ok));$('#file-error').textContent=ok?'':c.fileError;$('#file-name').textContent=drawing.files[0]?.name||c.fileEmpty;return ok;}
  listen(drawing,'change',validateFile);validateFile();
  fields.forEach(field=>{listen(field,'blur',()=>validateField(field));listen(field,'input',()=>{field.setCustomValidity('');field.setAttribute('aria-invalid','false');$('#error-'+field.name).textContent='';});listen(field,'change',()=>validateField(field));});
  $$('[data-service]').forEach(link=>listen(link,'click',()=>{form.elements.service.value=link.dataset.service;if(link.dataset.product!==undefined)form.elements.message.value=c.products[Number(link.dataset.product)]+'\n';}));
  listen(form,'submit',event=>{
    event.preventDefault();$('#form-status').textContent='';
    const valid=fields.map(validateField).every(Boolean),fileValid=validateFile();
    if(!valid||!fileValid){const first=form.querySelector('[aria-invalid="true"]');$('#form-error').textContent=first?.validationMessage||c.requiredError;first?.focus();return;}
    $('#form-error').textContent='';
    const uri=prepareInquiry(Object.fromEntries(new FormData(form)),c,drawing.files[0]?.name);
    $('#form-status').textContent=c.draftReady;
    // Cancelable event permits integrations and QA to inspect a draft without opening a mail client.
    if(window.dispatchEvent(new CustomEvent('bcs:email-draft',{detail:{uri},cancelable:true})))location.href=uri;
  });
  if(saved.tracks)$$('#products,[data-gallery-track]').forEach((track,i)=>{track.scrollLeft=saved.tracks[i]||0;});
  return {
    snapshot(){return {hero:clock.snapshot(),form:Object.fromEntries(fields.map(field=>[field.name,field.type==='checkbox'?field.checked:field.value])),file:drawing,tracks:$$('#products,[data-gallery-track]').map(track=>track.scrollLeft)};},
    destroy(){abort.abort();observers.forEach(observer=>observer.disconnect());clock.destroy();panels.forEach(panel=>panel.querySelector('video')?.pause());if(dialog.open)dialog.close();document.body.classList.remove('lightbox-open');}
  };
}

function switchLanguage(lang,{historyMode='push',remember=true}={}){
  if(!copy[lang])lang='lv';
  if(remember)store('bcs-language',lang);
  const saved=runtime?.snapshot(),y=scrollY;
  runtime?.destroy();
  let html=render(lang,root.pathname);
  if(sourceAssets)for(const attr of ['src','href','data-src'])html=html.replaceAll(`${attr}="${root.pathname}media/`,`${attr}="${root.pathname}public/media/`);
  const next=new DOMParser().parseFromString(html,'text/html');
  document.documentElement.lang=lang;document.documentElement.removeAttribute('data-theme');
  document.title=next.title;
  document.querySelector('meta[name="description"]').content=next.querySelector('meta[name="description"]').content;
  next.querySelectorAll('meta[property],link[rel="canonical"]').forEach(node=>{
    const selector=node.tagName==='META'?`meta[property="${node.getAttribute('property')}"]`:'link[rel="canonical"]';
    document.querySelector(selector)?.replaceWith(node);
  });
  document.body.replaceChildren(...next.body.childNodes);
  // Parsed scripts are intentionally inert. This module owns one runtime lifecycle.
  document.body.querySelector('script[type="module"]')?.remove();
  if(historyMode){const url=new URL(root);url.searchParams.set('lang',lang);url.hash=location.hash;history[historyMode+'State']({lang},'',url);}
  runtime=initialize(saved);scrollTo({top:y,behavior:'instant'});
}
document.addEventListener('click',event=>{
  const link=event.target.closest('.languages a');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();switchLanguage(link.lang);document.querySelector('.languages a[aria-current]')?.focus({preventScroll:true});
});
window.addEventListener('popstate',()=>switchLanguage(new URL(location.href).searchParams.get('lang')||(location.pathname.endsWith('/ru/')?'ru':location.pathname.endsWith('/en/')?'en':'lv'),{historyMode:null,remember:false}));
let locale=new URL(location.href).searchParams.get('lang');
if(!locale&&initialLocale==='lv'){try{locale=localStorage.getItem('bcs-language');}catch{/* LV is the new-visitor default. */}}
if(locale&&copy[locale]&&locale!==initialLocale)switchLanguage(locale,{historyMode:null,remember:false});
else runtime=initialize();

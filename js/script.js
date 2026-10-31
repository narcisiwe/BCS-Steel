import {copy} from './content.js';
import {validDrawing} from './validation.js';
const c=copy[document.documentElement.lang]||copy.lv;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const safeStore=(k,v)=>{try{localStorage.setItem(k,v);}catch{/* unavailable storage is nonfatal */}};
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection;
const saveData=()=>connection?.saveData||/2g/.test(connection?.effectiveType||'');
const theme=$('#theme');
theme.setAttribute('aria-pressed',String(document.documentElement.dataset.theme==='light'));
theme.addEventListener('click',()=>{const value=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=value;theme.setAttribute('aria-pressed',String(value==='light'));safeStore('bcs-theme',value);});
// URL is authoritative: explicit locale links remain stable when shared or indexed.
$$('.languages a').forEach(a=>a.addEventListener('click',()=>safeStore('bcs-language',a.lang)));
const menu=$('#menu'),nav=$('#navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',c.menu);}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?c.close:c.menu);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();if(document.activeElement?.closest('#navigation'))menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
matchMedia('(min-width:1001px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
const header=$('.site-header');
const updateHeader=()=>header.classList.toggle('scrolled',scrollY>80);
addEventListener('scroll',updateHeader,{passive:true});updateHeader();
const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}},{rootMargin:'-15% 0px -65% 0px'});
$$('main section[id]').forEach(s=>sectionObserver.observe(s));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');revealObserver.unobserve(e.target);}}),{threshold:.12});
$$('.section-heading,.about-copy').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el);});
const hero=$('.hero'),panels=$$('.hero-slide'),tabs=$$('[data-goto]'),pause=$('#hero-pause');
let current=0,timer,paused=false,hovered=false,focused=false,visible=true;
function canAnimate(){return !paused&&!hovered&&!focused&&visible&&!document.hidden&&!motion.matches;}
function videoPlayback(){panels.forEach((panel,i)=>{const video=panel.querySelector('video');if(!video)return;if(i===current&&canAnimate()&&!saveData()){
  if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}
  video.play().catch(()=>video.classList.remove('ready'));
}else video.pause();});}
$$('.hero video').forEach(video=>{video.addEventListener('playing',()=>video.classList.add('ready'));video.addEventListener('error',()=>video.classList.remove('ready'));});
function schedule(){clearTimeout(timer);hero.classList.toggle('paused',!canAnimate());if(canAnimate())timer=setTimeout(()=>go(current+1),8000);videoPlayback();}
function go(index){current=(index+panels.length)%panels.length;panels.forEach((p,i)=>p.classList.toggle('active',i===current));tabs.forEach((tab,i)=>{if(i===current)tab.setAttribute('aria-current','true');else tab.removeAttribute('aria-current');});$('#hero-title').replaceChildren(...c.heroTitles[current].split('\n').flatMap((part,i)=>i?[document.createElement('br'),document.createTextNode(part)]:[document.createTextNode(part)]));$('#hero-description').textContent=c.heroDescriptions[current];const text=$('.hero-copy');text.classList.remove('changing');requestAnimationFrame(()=>text.classList.add('changing'));schedule();}
tabs.forEach((tab,i)=>tab.addEventListener('click',()=>go(i)));
$('#hero-prev').addEventListener('click',()=>go(current-1));$('#hero-next').addEventListener('click',()=>go(current+1));
pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?c.play:c.pause);pause.innerHTML=paused?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2"/></svg>';schedule();});
hero.addEventListener('mouseenter',()=>{hovered=true;schedule();});hero.addEventListener('mouseleave',()=>{hovered=false;schedule();});
hero.addEventListener('focusin',()=>{focused=true;schedule();});hero.addEventListener('focusout',e=>{if(!hero.contains(e.relatedTarget)){focused=false;schedule();}});
document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',schedule);connection?.addEventListener('change',schedule);
new IntersectionObserver(([e])=>{visible=e.isIntersecting;schedule();},{threshold:.15}).observe(hero);
let touchX=0,touchY=0;
hero.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
hero.addEventListener('touchend',e=>{const x=e.changedTouches[0].clientX-touchX,y=e.changedTouches[0].clientY-touchY;if(Math.abs(x)>60&&Math.abs(x)>Math.abs(y)*1.5)go(current+(x<0?1:-1));},{passive:true});schedule();
const track=$('#products');
const scrollProducts=direction=>track.scrollBy({left:direction*(track.querySelector('article').offsetWidth+22),behavior:motion.matches?'instant':'smooth'});
$('#products-prev').addEventListener('click',()=>scrollProducts(-1));$('#products-next').addEventListener('click',()=>scrollProducts(1));
function updateCarousel(){ $('#products-prev').disabled=track.scrollLeft<2;$('#products-next').disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-3; }
track.addEventListener('scroll',updateCarousel,{passive:true});new ResizeObserver(updateCarousel).observe(track);updateCarousel();
track.addEventListener('keydown',e=>{if(e.target!==track)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();scrollProducts(e.key==='ArrowRight'?1:-1);}if(e.key==='Home'||e.key==='End'){e.preventDefault();track.scrollTo({left:e.key==='Home'?0:track.scrollWidth,behavior:motion.matches?'instant':'smooth'});}});
const form=$('#quote-form'),file=form.elements.drawing;
$$('[data-service]').forEach(link=>link.addEventListener('click',()=>{form.elements.service.value=link.dataset.service;if(link.dataset.product!==undefined)form.elements.message.value=c.products[Number(link.dataset.product)]+'\n';}));
function validateFile(){const ok=validDrawing(file.files[0]);file.setCustomValidity(ok?'':c.fileError);$('#file-error').textContent=ok?'':c.fileError;return ok;}
file.addEventListener('change',validateFile);
for(const field of form.querySelectorAll('[required]')){field.addEventListener('invalid',()=>{if(field.validity.valueMissing)field.setCustomValidity(c.requiredError);else if(field.validity.typeMismatch)field.setCustomValidity(c.emailError);});field.addEventListener('input',()=>field.setCustomValidity(''));field.addEventListener('change',()=>field.setCustomValidity(''));}
form.addEventListener('submit',e=>{e.preventDefault();if(!validateFile()||!form.reportValidity())return;const data=new FormData(form);const body=[...['name','company','email','phone'].map((n,i)=>`${c.fields[i]}: ${data.get(n)||'—'}`),`${c.fields[4]}: ${c.serviceNames[Number(data.get('service'))]}`,'',data.get('message'),'',file.files[0]?`${c.fields[6]}: ${file.files[0].name} (${c.formNote})`:''].join('\n');const uri='mailto:bcslasercut@gmail.com?subject='+encodeURIComponent('BCS Steel — '+c.serviceNames[Number(data.get('service'))])+'&body='+encodeURIComponent(body);$('#form-status').textContent=c.draftReady;location.href=uri;});

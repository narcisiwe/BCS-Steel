import {createSlideshowClock,HERO_SLIDE_DURATION} from './slideshow-clock.js';

export function createHero({hero,c,motion,connection,saved={}}){
  const panels=[...hero.querySelectorAll('.hero-slide')],tabs=[...hero.querySelectorAll('[data-goto]')];
  const heading=hero.querySelector('h1'),description=hero.querySelector('#hero-description'),actions=hero.querySelector('.hero-actions');
  const pauseButton=hero.querySelector('#hero-pause'),abort=new AbortController();
  const listen=(target,event,fn,options={})=>target.addEventListener(event,fn,{...options,signal:abort.signal});
  const compact=matchMedia('(max-width:700px)');
  const fills=tabs.map(tab=>tab.querySelector('.slide-progress-fill'));
  let clock,destroyed=false,generation=0,initialPosterPending=false,userPaused=saved.paused||false;
  let state={index:saved.index||0,suspended:true};
  const prepared=new Map();
  const saveData=()=>connection?.saveData||/2g/.test(connection?.effectiveType||'');
  const clamp=value=>Math.min(1,Math.max(0,value));
  const ease=value=>1-Math.pow(1-clamp(value),4);
  function reserveContentSpace(){
    if(destroyed)return;
    // Measure only on initialization/font/viewport changes, never during animation.
    // Reserve the largest localized copy block so automatic changes do not move it.
    for(const [element,values,isHeading] of [[heading,c.heroTitles,true],[description,c.heroDescriptions,false]]){
      const probe=element.cloneNode(false);probe.removeAttribute('id');
      Object.assign(probe.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:element.clientWidth+'px',minHeight:'0',height:'auto',transform:'none',animation:'none'});
      element.parentElement.append(probe);let height=0;
      for(const value of values){
        if(isHeading)probe.replaceChildren(...value.split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));
        else probe.textContent=value;
        height=Math.max(height,probe.getBoundingClientRect().height);
      }
      probe.remove();element.style.minHeight=Math.ceil(height)+'px';
    }
  }
  function prepare(index){
    if(prepared.has(index))return prepared.get(index);
    const image=panels[index].querySelector('img');image.loading='eager';
    const promise=image.decode().then(()=>true).catch(async()=>{
      // A known first poster is preferable to a blank panel if another image fails.
      const fallback=panels[0].querySelector('img').src;
      if(image.src!==fallback){image.src=fallback;return image.decode().then(()=>true).catch(()=>false);}
      return false;
    });
    prepared.set(index,promise);return promise;
  }
  function playback(){
    panels.forEach((panel,index)=>{
      const video=panel.querySelector('video');if(!video)return;
      if(index===state.index&&!state.suspended&&!saveData()&&!motion.matches){
        video.muted=true;video.playsInline=true;
        if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}
        if(video.paused)video.play().catch(()=>video.classList.remove('ready'));
      }else {video.pause();if(saveData()||motion.matches)video.classList.remove('ready');}
    });
  }
  panels.forEach((panel,index)=>{
    const video=panel.querySelector('video');if(!video)return;
    listen(video,'playing',()=>{if(index===state.index&&!state.suspended)video.classList.add('ready');else video.pause();});
    for(const event of ['error','waiting','stalled'])listen(video,event,()=>video.classList.remove('ready'));
  });
  function transformImage(index,progress){
    const image=panels[index].querySelector('img');
    if(motion.matches){image.style.transform='none';return;}
    const direction=index%2?-1:1;
    const zoom=compact.matches ? .045 : .09;
    const distance=compact.matches ? .45 : .9;
    const x=direction*distance*(progress*1.8-.6),y=-direction*distance*(progress*1.2-.4);
    image.style.transform=`translate3d(${x}%,${y}%,0) scale(${1.03+zoom*progress})`;
  }
  function contentMotion(element,time,delay,duration,distance){
    const progress=motion.matches?1:ease((time-delay)/duration);
    element.style.opacity=String(progress);
    element.style.transform=motion.matches?'none':`translate3d(0,${distance*(1-progress)}px,0)`;
  }
  function draw(next){
    const wasSuspended=state.suspended;state=next;
    hero.dataset.active=String(state.index);
    hero.dataset.transition=state.transition.active?'crossfade':'idle';
    hero.classList.toggle('paused',state.suspended);
    hero.style.setProperty('--slide-progress',String(state.progress));
    const overlap=state.transition.active?clamp(state.transition.elapsed/state.transition.duration):1;
    panels.forEach((panel,index)=>{
      const incoming=index===state.index,outgoing=index===state.transition.from;
      // Keep an opaque outgoing base under the incoming layer throughout the dissolve.
      panel.style.opacity=incoming?String(overlap):outgoing?'1':'0';
      panel.style.zIndex=incoming?'2':outgoing?'1':'0';
      panel.style.willChange=incoming||outgoing?'opacity':'auto';
      if(incoming)transformImage(index,state.progress);
      else if(outgoing)transformImage(index,state.transition.fromProgress);
    });
    fills.forEach((fill,index)=>{fill.style.transform=`scaleX(${index===state.index?state.progress:0})`;});
    const introTime=state.introSettled?1000:state.elapsed;
    contentMotion(heading,introTime,0,700,24);
    contentMotion(description,introTime,150,650,18);
    contentMotion(actions,introTime,250,650,12);
    if(wasSuspended!==state.suspended)playback();
  }
  function show(index,next){
    state=next;const token=++generation;
    panels.forEach((panel,i)=>panel.classList.toggle('active',i===index));
    tabs.forEach((tab,i)=>{if(i===index)tab.setAttribute('aria-current','true');else tab.removeAttribute('aria-current');});
    heading.replaceChildren(...c.heroTitles[index].split('\n').flatMap((line,i)=>i?[document.createElement('br'),document.createTextNode(line)]:[document.createTextNode(line)]));
    description.textContent=c.heroDescriptions[index];
    const image=panels[index].querySelector('img'),pending=!image.complete||!image.naturalWidth;
    if(clock)clock.pause('poster',pending);else initialPosterPending=pending;
    prepare(index).then(()=>{if(!destroyed&&token===generation)clock.pause('poster',false);});
    prepare((index+1)%panels.length);
    playback();
  }
  clock=createSlideshowClock({count:panels.length,duration:HERO_SLIDE_DURATION,autoStart:false,
    initialIndex:saved.index||0,initialElapsed:saved.elapsed||0,initialTransition:saved.transition,initialIntroSettled:saved.introSettled,
    onChange:show,onFrame:draw,
    onProgress:(progress,next)=>{const fill=fills[next.index];if(fill)fill.style.transform=`scaleX(${progress})`;}
  });
  reserveContentSpace();
  const resize=new ResizeObserver(()=>{reserveContentSpace();draw(clock.snapshot());});resize.observe(hero);
  document.fonts?.ready.then(reserveContentSpace);
  function updatePause(){
    clock.pause('user',userPaused);clock.pause('reduced-motion',motion.matches);
    pauseButton.disabled=motion.matches;
    pauseButton.setAttribute('aria-pressed',String(userPaused||motion.matches));
    pauseButton.setAttribute('aria-label',motion.matches?c.motionPaused:userPaused?c.play:c.pause);
    pauseButton.innerHTML=userPaused?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2"/></svg>';
  }
  tabs.forEach((tab,index)=>listen(tab,'click',()=>clock.go(index)));
  listen(hero.querySelector('#hero-prev'),'click',clock.previous);listen(hero.querySelector('#hero-next'),'click',clock.next);
  listen(pauseButton,'click',()=>{userPaused=!userPaused;updatePause();});
  listen(document,'visibilitychange',()=>clock.pause('hidden',document.hidden));
  listen(motion,'change',updatePause);if(connection)listen(connection,'change',playback);
  const visibility=new IntersectionObserver(([entry])=>clock.pause('offscreen',!entry.isIntersecting),{threshold:.15});visibility.observe(hero);
  let touchX=0,touchY=0;
  listen(hero,'touchstart',event=>{touchX=event.changedTouches[0].clientX;touchY=event.changedTouches[0].clientY;},{passive:true});
  listen(hero,'touchend',event=>{const x=event.changedTouches[0].clientX-touchX,y=event.changedTouches[0].clientY-touchY;if(Math.abs(x)>60&&Math.abs(x)>Math.abs(y)*1.5)(x<0?clock.next:clock.previous)();},{passive:true});
  clock.pause('poster',initialPosterPending);updatePause();clock.pause('hidden',document.hidden);clock.start();
  return {pause:clock.pause,snapshot:clock.snapshot,destroy(){destroyed=true;abort.abort();visibility.disconnect();resize.disconnect();clock.destroy();panels.forEach(panel=>panel.querySelector('video')?.pause());}};
}

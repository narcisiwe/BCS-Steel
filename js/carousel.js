// GSAP core is copied locally by the build: no CDN or paid plugins.
export function createCarousel({track,previous,next,pauseButton,motion,saved={},seconds=50,gsap=window.gsap}){
  if(!gsap)return {snapshot:()=>saved,pause(){},destroy(){}}; // Scrollable, clickable HTML fallback.
  const cards=[...track.children],abort=new AbortController();
  const listen=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:abort.signal});
  const state={phase:saved.phase||0};
  const blockers=new Set();
  let width=0,compact=false,timer=null,manual=null,drag=null,blockedClick=false;
  let focused=false,visible=false,userPaused=!!saved.userPaused,deadline=saved.deadline||0;
  const period=Math.max(10,Number(seconds)||50);
  track.classList.add('orbit-track');
  function draw(){
    cards.forEach((card,i)=>{
      const angle=(state.phase+i/cards.length)*Math.PI*2,front=Math.cos(angle);
      const x=Math.sin(angle)*width*(compact?.68:.47),z=front*(compact?65:150);
      card.style.transform=`translate3d(${x}px,${(1-front)*(compact?-12:-26)}px,${z}px) rotateY(${-Math.sin(angle)*(compact?12:30)}deg)`;
      card.style.setProperty('--orbit-shade',String((1-front)*.22));
      card.style.zIndex=String(Math.round((front+1)*100));
    });
    track.dataset.phase=String(state.phase);track.dataset.running=String(!auto.paused());
  }
  const driver={turn:0};let lastTurn=0;
  const auto=gsap.to(driver,{turn:1,duration:period,repeat:-1,ease:'none',paused:true,onUpdate:()=>{
    let delta=driver.turn-lastTurn;if(delta<0)delta+=1;
    state.phase=(state.phase+delta)%1;lastTurn=driver.turn;draw();
  }});
  function clear(){if(timer!==null)clearTimeout(timer);timer=null;}
  function sync(){
    clear();
    const wait=Math.max(0,deadline-Date.now());
    const stopped=userPaused||motion.matches||document.hidden||!visible||focused||drag||manual||wait>0||blockers.size;
    auto.paused(!!stopped);track.dataset.running=String(!stopped);
    pauseButton.setAttribute('aria-pressed',String(userPaused||motion.matches));
    pauseButton.disabled=motion.matches;
    pauseButton.setAttribute('aria-label',userPaused?pauseButton.dataset.play:pauseButton.dataset.pause);
    if(wait>0&&!drag&&!focused)timer=setTimeout(sync,wait);
  }
  function interact(){deadline=Date.now()+10000;sync();}
  function step(direction){
    interact();manual?.kill();
    if(motion.matches){state.phase+=direction/cards.length;draw();sync();return;}
    manual=gsap.to(state,{phase:state.phase+direction/cards.length,duration:.55,ease:'power2.out',onUpdate:draw,onComplete:()=>{manual=null;sync();}});
  }
  function resize(){width=track.clientWidth;compact=width<650;draw();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(track);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(track);
  listen(track,'pointerenter',interact);
  listen(track,'pointermove',event=>{
    if(!drag){if(event.pointerType==='mouse')interact();return;}
    const delta=event.clientX-drag.x;
    if(Math.abs(delta)>7){drag.moved=true;track.setPointerCapture(event.pointerId);}
    state.phase=drag.phase+delta/Math.max(width,300)*.35;draw();
  });
  listen(track,'pointerdown',event=>{
    if(event.button!==0)return;manual?.kill();manual=null;blockedClick=false;
    drag={x:event.clientX,phase:state.phase,moved:false};interact();
  });
  function release(event){if(!drag)return;blockedClick=drag.moved;drag=null;if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);interact();}
  listen(window,'pointerup',release);listen(window,'pointercancel',release);
  listen(track,'click',event=>{if(blockedClick){event.preventDefault();event.stopImmediatePropagation();blockedClick=false;}interact();},{capture:true});
  listen(track,'focusin',event=>{
    focused=true;interact();const index=cards.indexOf(event.target.closest('.gallery-item'));
    if(index>=0&&event.target.matches(':focus-visible')){manual?.kill();manual=null;state.phase=Math.round(state.phase+index/cards.length)-index/cards.length;draw();}
  });
  listen(track,'focusout',event=>{focused=track.contains(event.relatedTarget);interact();});
  listen(track,'keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}});
  listen(previous,'click',()=>step(-1));listen(next,'click',()=>step(1));
  listen(pauseButton,'click',()=>{userPaused=!userPaused;sync();});
  listen(document,'visibilitychange',()=>{manual?.paused(document.hidden);sync();});listen(motion,'change',()=>{manual?.kill();manual=null;sync();draw();});
  resize();sync();
  return {snapshot:()=>({phase:state.phase,userPaused,deadline}),pause(reason,value){if(value)blockers.add(reason);else blockers.delete(reason);sync();},destroy(){clear();abort.abort();observer.disconnect();resizeObserver.disconnect();manual?.kill();auto.kill();}};
}

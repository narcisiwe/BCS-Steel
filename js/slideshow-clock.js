export const HERO_SLIDE_DURATION=7000;
export const HERO_TRANSITION_DURATION=1100;

/** A single RAF timeline owns slide dwell, progress, motion and overlap state. */
export function createSlideshowClock({count,duration=HERO_SLIDE_DURATION,transitionDuration=HERO_TRANSITION_DURATION,onChange=()=>{},onProgress=()=>{},onFrame=()=>{},onPause=()=>{},now=()=>performance.now(),requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame,initialIndex=0,initialElapsed=0,initialTransition=null,initialIntroSettled=false,autoStart=true}){
  let index=initialIndex,elapsed=initialElapsed,last=now(),frame=null,destroyed=false;
  let transition=initialTransition?{...initialTransition}:{from:null,fromProgress:0,elapsed:transitionDuration};
  let introSettled=initialIntroSettled;
  const reasons=new Set();
  const reducedOnly=()=>reasons.size===1&&reasons.has('reduced-motion');
  const transitionLength=()=>reasons.has('reduced-motion')?200:transitionDuration;
  const canRun=()=>!reasons.size||(reducedOnly()&&transition.from!==null);
  function snapshot(){return {index,elapsed,duration,progress:Math.min(1,elapsed/duration),paused:reasons.has('user'),suspended:reasons.size>0,introSettled,transition:{...transition,duration:transitionLength(),active:transition.from!==null}};}
  function emit(){const state=snapshot();onProgress(state.progress,state);onFrame(state);}
  function activate(next,carry=0){
    const previous=snapshot();
    const dominant=previous.transition.active&&previous.transition.elapsed<previous.transition.duration/2?previous.transition.from:index;
    const dominantProgress=dominant===index?Math.min(1,elapsed/duration):previous.transition.fromProgress;
    index=(next%count+count)%count;elapsed=carry;
    introSettled=false;
    transition={from:dominant===index?null:dominant,fromProgress:dominantProgress,elapsed:carry};
    onChange(index,snapshot());
  }
  function advance(time){
    const delta=Math.max(0,time-last);last=time;
    if(!reasons.size){
      elapsed+=delta;if(transition.from!==null)transition.elapsed+=delta;
      if(elapsed>=duration){
        // Expose the old slide's exact endpoint before activating/resetting the next.
        onProgress(1,{...snapshot(),progress:1});
        const steps=Math.floor(elapsed/duration),carry=elapsed%duration;
        activate(index+steps,carry);
      }
    }else if(reducedOnly()&&transition.from!==null)transition.elapsed+=delta;
    if(transition.elapsed>=transitionLength())transition.from=null;
    emit();
  }
  function queue(){if(!destroyed&&canRun()&&frame===null)frame=requestFrame(tick);}
  function tick(time){frame=null;if(destroyed||!canRun())return;advance(time);queue();}
  function start(){if(destroyed)return;last=now();queue();}
  function go(next){if(destroyed)return;last=now();activate(next);if(reasons.has('user')){if(!reasons.has('poster'))transition.from=null;introSettled=true;}emit();queue();}
  function pause(reason,value){
    if(destroyed)return;
    if(reasons.has(reason)===value)return;
    advance(now());
    if(value)reasons.add(reason);else reasons.delete(reason);
    if(!reasons.has('poster')&&reasons.has('user')&&introSettled)transition.from=null;
    last=now();
    if(!canRun()&&frame!==null){cancelFrame(frame);frame=null;}
    onPause(reasons.size>0);emit();queue();
  }
  onChange(index,snapshot());emit();if(autoStart)start();
  return {start,go,next:()=>go(index+1),previous:()=>go(index-1),pause,snapshot,destroy(){destroyed=true;if(frame!==null)cancelFrame(frame);frame=null;}};
}

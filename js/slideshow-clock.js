/** One clock drives both slide changes and progress. No CSS animation timer. */
export function createSlideshowClock({count,duration=8000,onChange=()=>{},onProgress=()=>{},onPause=()=>{},now=()=>performance.now(),requestFrame=requestAnimationFrame,cancelFrame=cancelAnimationFrame,initialIndex=0,initialElapsed=0}) {
  let index=initialIndex,elapsed=initialElapsed,last=now(),frame=null,destroyed=false;
  const reasons=new Set();
  function emit(){onProgress(Math.min(1,elapsed/duration));}
  function advance(time){
    const delta=Math.max(0,time-last);last=time;elapsed+=delta;
    if(elapsed>=duration){const steps=Math.floor(elapsed/duration);index=(index+steps)%count;elapsed%=duration;onChange(index);}
    emit();
  }
  function tick(time){frame=null;if(destroyed||reasons.size)return;advance(time);frame=requestFrame(tick);}
  function start(){if(!destroyed&&!reasons.size&&frame===null){last=now();frame=requestFrame(tick);}}
  function go(next){index=(next%count+count)%count;elapsed=0;last=now();onChange(index);emit();start();}
  function pause(reason,value){
    const wasPaused=reasons.size>0;
    if(value)reasons.add(reason);else reasons.delete(reason);
    const isPaused=reasons.size>0;
    if(!wasPaused&&isPaused){advance(now());if(frame!==null)cancelFrame(frame);frame=null;}
    if(wasPaused&&!isPaused)start();
    onPause(isPaused);
  }
  onChange(index);emit();start();
  return {go,next:()=>go(index+1),previous:()=>go(index-1),pause,snapshot:()=>({index,elapsed,paused:reasons.has('user')}),destroy(){destroyed=true;if(frame!==null)cancelFrame(frame);frame=null;}};
}

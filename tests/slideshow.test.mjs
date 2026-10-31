import test from 'node:test';
import assert from 'node:assert/strict';
import {createSlideshowClock,HERO_SLIDE_DURATION} from '../js/slideshow-clock.js';
function setup(options={}){
  let time=0,next=0;const frames=new Map(),changes=[],progress=[],states=[];
  const clock=createSlideshowClock({count:4,now:()=>time,requestFrame:fn=>{const id=++next;frames.set(id,fn);return id;},cancelFrame:id=>frames.delete(id),onChange:i=>changes.push(i),onProgress:p=>progress.push(p),onFrame:s=>states.push(s),...options});
  function advance(ms){time+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));}
  return {clock,advance,changes,progress,states,frames};
}
test('seven-second clock publishes endpoints and two complete slide cycles',()=>{
  const {clock,advance,changes,progress}=setup();assert.equal(HERO_SLIDE_DURATION,7000);assert.equal(progress[0],0);
  for(let i=0;i<8;i++){advance(3500);assert.equal(progress.at(-1),.5);advance(3500);assert.equal(progress.at(-1),0);}
  assert.deepEqual(changes,[0,1,2,3,0,1,2,3,0]);assert.equal(progress.filter(p=>p===1).length,8);clock.destroy();
});
test('pause freezes elapsed, overlap and progress; resume uses only the remaining duration',()=>{
  const {clock,advance,progress,frames}=setup();clock.go(1);advance(400);clock.pause('user',true);const saved=clock.snapshot();advance(20000);assert.deepEqual(clock.snapshot(),saved);assert.equal(frames.size,0);
  clock.pause('user',false);for(let i=0;i<20;i++)clock.pause('hidden',false);assert.equal(frames.size,1);advance(6599);assert.equal(clock.snapshot().index,1);advance(1);assert.equal(clock.snapshot().index,2);
  advance(2000);clock.go(3);assert.equal(progress.at(-1),0);advance(7000);assert.equal(clock.snapshot().index,0);clock.destroy();
});
test('reduced motion holds autoplay but allows a short manual crossfade',()=>{
  const {clock,advance,frames}=setup();clock.pause('reduced-motion',true);advance(20000);assert.equal(clock.snapshot().index,0);clock.go(2);assert.equal(clock.snapshot().elapsed,0);advance(100);assert.equal(clock.snapshot().transition.active,true);assert.equal(clock.snapshot().transition.duration,200);advance(100);assert.equal(clock.snapshot().transition.active,false);assert.equal(clock.snapshot().progress,0);assert.equal(frames.size,0);clock.destroy();
});
test('locale restoration preserves elapsed and transition position without another timer',()=>{
  const first=setup();first.clock.go(1);first.advance(450);const saved=first.clock.snapshot();first.clock.destroy();
  const restored=setup({initialIndex:saved.index,initialElapsed:saved.elapsed,initialTransition:saved.transition});
  assert.equal(restored.clock.snapshot().index,1);assert.equal(restored.clock.snapshot().elapsed,450);assert.equal(restored.clock.snapshot().transition.elapsed,450);assert.equal(restored.frames.size,1);
  restored.clock.pause('hidden',true);const before=restored.clock.snapshot();restored.advance(10000);assert.deepEqual(restored.clock.snapshot(),before);restored.clock.pause('hidden',false);restored.advance(6550);assert.equal(restored.clock.snapshot().index,2);restored.clock.destroy();
});
test('destroy makes stale callbacks inert and repeated pause changes never duplicate RAFs',()=>{
  const {clock,advance,changes,frames}=setup();for(let i=0;i<20;i++){clock.pause('poster',true);clock.pause('poster',false);}assert.equal(frames.size,1);clock.destroy();const before=changes.length;clock.next();clock.pause('user',true);advance(7000);assert.equal(changes.length,before);assert.equal(frames.size,0);
});
test('manual navigation while paused reveals the requested slide without restarting autoplay',()=>{
  const {clock,frames}=setup();clock.pause('user',true);clock.next();const state=clock.snapshot();assert.equal(state.index,1);assert.equal(state.progress,0);assert.equal(state.introSettled,true);assert.equal(state.transition.active,false);assert.equal(frames.size,0);clock.destroy();
});
test('a paused manual change retains the outgoing background until its poster is ready',()=>{
  const {clock}=setup();clock.pause('user',true);clock.pause('poster',true);clock.next();assert.equal(clock.snapshot().transition.from,0);clock.pause('poster',false);assert.equal(clock.snapshot().transition.from,null);assert.equal(clock.snapshot().index,1);assert.equal(clock.snapshot().progress,0);clock.destroy();
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createSlideshowClock} from '../js/slideshow-clock.js';
function setup(){
  let time=0,next=0;const frames=new Map(),changes=[],progress=[];
  const clock=createSlideshowClock({count:4,duration:8000,now:()=>time,requestFrame:fn=>{const id=++next;frames.set(id,fn);return id;},cancelFrame:id=>frames.delete(id),onChange:i=>changes.push(i),onProgress:p=>progress.push(p)});
  function advance(ms){time+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));}
  return {clock,advance,changes,progress,frames};
}
test('two complete cycles change actual slide indexes and progress at each boundary',()=>{
  const {clock,advance,changes,progress}=setup();
  for(let i=0;i<8;i++){advance(4000);assert.equal(progress.at(-1),.5);advance(4000);assert.equal(progress.at(-1),0);}
  assert.deepEqual(changes,[0,1,2,3,0,1,2,3,0]);clock.destroy();
});
test('pause preserves remaining time, manual navigation resets progress and one loop survives repeated state events',()=>{
  const {clock,advance,progress,frames}=setup();advance(3000);clock.pause('user',true);advance(20000);assert.equal(clock.snapshot().index,0);assert.equal(clock.snapshot().elapsed,3000);assert.equal(frames.size,0);
  clock.pause('user',false);for(let i=0;i<20;i++)clock.pause('hidden',false);assert.equal(frames.size,1);advance(4999);assert.equal(clock.snapshot().index,0);advance(1);assert.equal(clock.snapshot().index,1);
  advance(2000);clock.go(3);assert.equal(progress.at(-1),0);advance(8000);assert.equal(clock.snapshot().index,0);
  clock.pause('reduced-motion',true);advance(20000);assert.equal(clock.snapshot().index,0);clock.go(2);assert.equal(clock.snapshot().index,2);assert.equal(frames.size,0);clock.destroy();
});

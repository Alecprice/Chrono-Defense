import { useEffect } from 'react';
import { stoneAgeMaps } from '../data/worlds/stoneAge/maps.js';
import { getStoneAgeLayout } from '../data/worlds/stoneAge/layouts.js';
import { retroMaps } from '../data/worlds/retro/maps.js';
import { getRetroLayout } from '../data/worlds/retro/layouts.js';
import { futureMaps } from '../data/worlds/future/maps.js';
import { getFutureLayout } from '../data/worlds/future/layouts.js';
import { spaceMaps } from '../data/worlds/space/maps.js';
import { getSpaceLayout } from '../data/worlds/space/layouts.js';
import { riftMaps } from '../data/worlds/timeRift/maps.js';
import { getRiftLayout } from '../data/worlds/timeRift/layouts.js';

const CONFIGS = [
  { id:'stone-age', root:'.game-frame.battle-screen', board:'.board', cell:'.cell', enemy:'.enemy', maps:stoneAgeMaps, layout:getStoneAgeLayout },
  { id:'retro', root:'.retro-battle', board:'.retro-board', cell:'.retro-cell', enemy:'.retro-enemy', maps:retroMaps, layout:getRetroLayout },
  { id:'future', root:'.future-battle', board:'.future-board', cell:'.future-cell', enemy:'.future-enemy', maps:futureMaps, layout:getFutureLayout },
  { id:'space', root:'.space-battle', board:'.space-board', cell:'.space-cell', enemy:'.space-enemy', maps:spaceMaps, layout:getSpaceLayout },
  { id:'time-rift', root:'.rift-battle', board:'.rift-board', cell:'.rift-cell', enemy:'.rift-enemy', maps:riftMaps, layout:getRiftLayout },
];

function abstractCenter(cell){const col=cell%12,row=Math.floor(cell/12);return{x:(col+.5)*100,y:(row+.5)*100}}
function mapNumber(config,root){
  const text=root.textContent??'';
  if(config.id==='stone-age'){const match=text.match(/Map\s+(\d+)/i);return Math.max(1,Number(match?.[1])||1)}
  const index=config.maps.findIndex(map=>text.includes(map.name));
  return index>=0?index+1:1;
}
function captureEnginePosition(enemy){
  const left=enemy.style.left,top=enemy.style.top;
  if(left?.endsWith('%')&&top?.endsWith('%')){
    const l=parseFloat(left),t=parseFloat(top);
    if(Number.isFinite(l)&&Number.isFinite(t)){enemy.dataset.chronoEngineX=String(l*12);enemy.dataset.chronoEngineY=String(t*5)}
  }
}
function nearestSegment(path,x,y){
  let best={index:0,t:0,d:Infinity};
  for(let i=0;i<path.length-1;i+=1){
    const a=abstractCenter(path[i]),b=abstractCenter(path[i+1]),dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy||1;
    const t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/len2));
    const px=a.x+dx*t,py=a.y+dy*t,d=(x-px)*(x-px)+(y-py)*(y-py);
    if(d<best.d)best={index:i,t,d};
  }
  return best;
}
function correctWorld(config){
  const roots=[...document.querySelectorAll(config.root)];
  for(const root of roots){
    if(config.id==='stone-age'&&!root.querySelector('.brand b')?.textContent?.includes('STONE AGE'))continue;
    const board=root.querySelector(config.board);if(!board)continue;
    const n=mapNumber(config,root),path=config.layout(n)?.path??[];if(path.length<2)continue;
    const cells=[...board.querySelectorAll(config.cell)];if(cells.length<60)continue;
    const boardRect=board.getBoundingClientRect();
    root.querySelectorAll(config.enemy).forEach(enemy=>{
      captureEnginePosition(enemy);
      const x=Number(enemy.dataset.chronoEngineX),y=Number(enemy.dataset.chronoEngineY);if(!Number.isFinite(x)||!Number.isFinite(y))return;
      const hit=nearestSegment(path,x,y),a=cells[path[hit.index]]?.getBoundingClientRect(),b=cells[path[hit.index+1]]?.getBoundingClientRect();if(!a||!b)return;
      const ax=a.left-boardRect.left+a.width/2,ay=a.top-boardRect.top+a.height/2,bx=b.left-boardRect.left+b.width/2,by=b.top-boardRect.top+b.height/2;
      const px=ax+(bx-ax)*hit.t,py=ay+(by-ay)*hit.t;
      enemy.classList.add('chrono-route-locked');
      enemy.style.left=`${px}px`;enemy.style.top=`${py}px`;
      enemy.dataset.chronoRouteSegment=String(hit.index);
    });
  }
}

export function DeterministicEnemyRouteBridge(){
  useEffect(()=>{
    const style=document.createElement('style');style.dataset.chronoRouteLock='true';style.textContent='.chrono-route-locked{transition:left 55ms linear,top 55ms linear,filter .12s ease,opacity .12s ease!important}.chrono-reduced-motion .chrono-route-locked,.effects-low .chrono-route-locked{transition:none!important}';document.head.appendChild(style);
    let raf=0;
    const run=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>CONFIGS.forEach(correctWorld))};
    const observer=new MutationObserver(records=>{for(const record of records){if(record.type==='attributes'&&record.target instanceof Element&&record.target.matches?.('.enemy,.retro-enemy,.future-enemy,.space-enemy,.rift-enemy'))captureEnginePosition(record.target)}run()});
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});
    const timer=window.setInterval(run,45);run();
    return()=>{cancelAnimationFrame(raf);window.clearInterval(timer);observer.disconnect();style.remove()};
  },[]);
  return null;
}

import{useEffect}from'react';
import{getStoneAgeLayout,cellCenter}from'../data/worlds/stoneAge/layouts.js';

function mapNumberFromBattle(battle){const text=battle?.querySelector('.brand span')?.textContent??'';const match=text.match(/Map\s+(\d+)/i);return Math.max(1,Math.min(25,Number(match?.[1])||1));}
function arrow(a,b){const d=b-a;if(d===1)return'→';if(d===-1)return'←';if(d===12)return'↓';if(d===-12)return'↑';return'•';}
function swallow(event){event.preventDefault();event.stopPropagation();}

export function StoneAgeRouteGuard(){
 useEffect(()=>{
  let raf=0;
  const cleanups=new Map();
  const enhance=()=>{
   cancelAnimationFrame(raf);
   raf=requestAnimationFrame(()=>{
    const battle=[...document.querySelectorAll('.game-frame.battle-screen')].find(node=>node.querySelector('.brand b')?.textContent?.includes('STONE AGE'));
    if(!battle)return;
    const board=battle.querySelector('.board');if(!board)return;
    const mapNumber=mapNumberFromBattle(battle),layout=getStoneAgeLayout(mapNumber),path=layout.path??[];
    const pathSet=new Set(path);
    board.querySelectorAll('.cell[data-cell]').forEach(cell=>{
      const n=Number(cell.dataset.cell),index=path.indexOf(n),isPath=pathSet.has(n);
      cell.classList.toggle('chrono-route-tile',isPath);
      cell.classList.toggle('chrono-route-start',index===0);
      cell.classList.toggle('chrono-route-end',index===path.length-1);
      if(isPath){
        cell.dataset.routeArrow=index<path.length-1?arrow(n,path[index+1]):'🏕';
        cell.setAttribute('aria-label',index===0?'Enemy spawn path':index===path.length-1?'Village route endpoint':`Enemy path ${index+1}`);
        cell.setAttribute('aria-disabled','true');
        cell.tabIndex=-1;
      }else{
        delete cell.dataset.routeArrow;
        cell.removeAttribute('aria-disabled');
      }
    });
    const village=board.querySelector('.village');
    if(village&&path.length){
      const end=cellCenter(path.at(-1));
      village.style.left=`${end.x/12}%`;village.style.top=`${end.y/5}%`;village.style.right='auto';village.style.bottom='auto';village.style.transform='translate(-50%,-50%)';
      village.dataset.chronoRouteEndpoint='true';village.setAttribute('role','img');village.setAttribute('aria-label','Village — enemies attack here');
      village.style.pointerEvents='auto';
      if(!cleanups.has(village)){
        const handler=event=>swallow(event);
        village.addEventListener('pointerdown',handler,true);village.addEventListener('pointerup',handler,true);village.addEventListener('click',handler,true);
        cleanups.set(village,()=>{village.removeEventListener('pointerdown',handler,true);village.removeEventListener('pointerup',handler,true);village.removeEventListener('click',handler,true)});
      }
    }
    let spawn=board.querySelector('.chrono-spawn-gate');
    if(!spawn){spawn=document.createElement('div');spawn.className='chrono-spawn-gate';spawn.setAttribute('aria-hidden','true');board.appendChild(spawn)}
    if(path.length){const start=cellCenter(path[0]);spawn.style.left=`${start.x/12}%`;spawn.style.top=`${start.y/5}%`;}
   });
  };
  const observer=new MutationObserver(enhance);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});enhance();
  return()=>{cancelAnimationFrame(raf);observer.disconnect();cleanups.forEach(fn=>fn());cleanups.clear()};
 },[]);
 return null;
}

import{useEffect}from'react';

const configs=[
  {build:'.retro-tower-grid button',cell:'.retro-cell'},
  {build:'.future-towers button',cell:'.future-cell'},
  {build:'.space-towers button',cell:'.space-cell'},
  {build:'.rift-towers button',cell:'.rift-cell'}
];
function configFor(target){return configs.find(config=>target.closest?.(config.build));}
function makeGhost(button,x,y){const ghost=document.createElement('div');ghost.className='universal-drag-ghost';const icon=button.querySelector(':scope > span')?.textContent??'✦';const name=button.querySelector('b')?.textContent??'Defense';ghost.innerHTML=`<span>${icon}</span><b>${name}</b>`;ghost.style.left=`${x}px`;ghost.style.top=`${y}px`;document.body.appendChild(ghost);return ghost;}
function clearHover(){document.querySelector('.chrono-drop-valid,.chrono-drop-invalid')?.classList.remove('chrono-drop-valid','chrono-drop-invalid')}
function hoverTarget(config,x,y){clearHover();const cell=document.elementFromPoint(x,y)?.closest?.(config.cell);if(!cell)return null;const blocked=cell.classList.contains('path')||cell.classList.contains('occupied');cell.classList.add(blocked?'chrono-drop-invalid':'chrono-drop-valid');return cell}
export function DragPlacementBridge(){
 useEffect(()=>{
  let drag=null;
  const down=event=>{
    const config=configFor(event.target);if(!config)return;
    const button=event.target.closest(config.build);if(!button||button.disabled)return;if(event.pointerType==='mouse'&&event.button!==0)return;
    drag={pointerId:event.pointerId,button,config,startX:event.clientX,startY:event.clientY,ghost:null,moved:false};
  };
  const move=event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    if(!drag.moved&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>8){drag.moved=true;drag.ghost=makeGhost(drag.button,event.clientX,event.clientY);document.body.classList.add('chrono-dragging')}
    if(drag.ghost){drag.ghost.style.left=`${event.clientX}px`;drag.ghost.style.top=`${event.clientY}px`;hoverTarget(drag.config,event.clientX,event.clientY)}
  };
  const finish=event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;const current=drag;drag=null;current.ghost?.remove();document.body.classList.remove('chrono-dragging');clearHover();if(!current.moved)return;
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.(current.config.cell);if(!target||target.classList.contains('path')||target.classList.contains('occupied'))return;
    current.button.click();
    requestAnimationFrame(()=>{if(document.contains(target))target.click()});
  };
  const cancel=event=>{if(!drag||event.pointerId!==drag.pointerId)return;drag.ghost?.remove();drag=null;document.body.classList.remove('chrono-dragging');clearHover()};
  document.addEventListener('pointerdown',down,{passive:true});window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerup',finish,{passive:true});window.addEventListener('pointercancel',cancel,{passive:true});
  return()=>{drag?.ghost?.remove();document.body.classList.remove('chrono-dragging');clearHover();document.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',cancel)};
 },[]);
 return null;
}

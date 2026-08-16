import{useEffect}from'react';

const ENEMY='.enemy,.retro-enemy,.future-enemy,.space-enemy,.rift-enemy';
const OCCUPIED='.cell.occupied,.retro-cell.occupied,.future-cell.occupied,.space-cell.occupied,.rift-cell.occupied';
function pct(el){const raw=el?.style?.width||'';const n=parseFloat(raw);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):null}
function center(rect){return{x:rect.left+rect.width/2,y:rect.top+rect.height/2}}
function theme(enemy){if(enemy.classList.contains('retro-enemy'))return'retro';if(enemy.classList.contains('future-enemy'))return'future';if(enemy.classList.contains('space-enemy'))return'space';if(enemy.classList.contains('rift-enemy'))return'rift';return'stone'}
function nearestTower(enemyRect){const target=center(enemyRect),nodes=[...document.querySelectorAll(OCCUPIED)];let best=null,bestD=Infinity;for(const node of nodes){const r=node.getBoundingClientRect();if(!r.width||!r.height)continue;const c=center(r),d=Math.hypot(c.x-target.x,c.y-target.y);if(d<bestD){bestD=d;best={node,point:c}}}return best}
function removeLater(node,ms){setTimeout(()=>node.remove(),ms)}
function floatDamage(rect,amount,boss=false,t='stone'){const node=document.createElement('div');node.className=`chrono-damage-float ${t} ${boss?'boss':''}`;node.textContent=`−${Math.max(1,Math.round(amount))}%`;node.style.left=`${rect.left+rect.width/2}px`;node.style.top=`${rect.top+Math.max(4,rect.height*.18)}px`;document.body.appendChild(node);removeLater(node,620)}
function tracer(from,to,boss=false,t='stone'){if(document.documentElement.classList.contains('effects-low')||document.documentElement.classList.contains('chrono-reduced-motion'))return;const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI;const line=document.createElement('div');line.className=`chrono-tracer ${t} ${boss?'boss':''}`;line.style.left=`${from.x}px`;line.style.top=`${from.y}px`;line.style.width=`${len}px`;line.style.transform=`rotate(${angle}deg)`;document.body.appendChild(line);removeLater(line,170)}
function impact(enemy,boss=false,t='stone'){enemy.classList.remove('chrono-hit');enemy.dataset.chronoHitTheme=t;void enemy.offsetWidth;enemy.classList.add('chrono-hit');setTimeout(()=>{enemy.classList.remove('chrono-hit');delete enemy.dataset.chronoHitTheme},160);if(boss)document.body.classList.add(`chrono-boss-impact-${t}`);setTimeout(()=>document.body.classList.remove(`chrono-boss-impact-${t}`),120)}
function defeatBurst(rect,boss=false,t='stone'){if(document.documentElement.classList.contains('effects-low'))return;const node=document.createElement('div');node.className=`chrono-defeat-burst ${t} ${boss?'boss':''}`;node.style.left=`${rect.left+rect.width/2}px`;node.style.top=`${rect.top+rect.height/2}px`;node.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i>';document.body.appendChild(node);removeLater(node,boss?700:430)}

export function CombatJuiceBridge(){
 useEffect(()=>{
  const previous=new WeakMap(),lastRect=new WeakMap(),lastHealth=new WeakMap(),lastTheme=new WeakMap();
  const remember=(enemy,bar)=>{const value=pct(bar);if(value!=null){previous.set(bar,value);lastHealth.set(enemy,value)}lastRect.set(enemy,enemy.getBoundingClientRect());lastTheme.set(enemy,theme(enemy))};
  const seed=()=>document.querySelectorAll(`${ENEMY} i b`).forEach(bar=>{const enemy=bar.closest(ENEMY);if(enemy)remember(enemy,bar)});seed();
  const observer=new MutationObserver(records=>{
   for(const record of records){
    if(record.type==='attributes'&&record.target.matches?.(`${ENEMY} i b`)){
      const bar=record.target,enemy=bar.closest(ENEMY);if(!enemy)continue;const next=pct(bar),old=previous.get(bar);if(next==null)continue;previous.set(bar,next);lastHealth.set(enemy,next);const rect=enemy.getBoundingClientRect(),t=theme(enemy);lastRect.set(enemy,rect);lastTheme.set(enemy,t);if(old==null||next>=old-.2)continue;const amount=old-next,boss=enemy.classList.contains('boss'),source=nearestTower(rect),to=center(rect);if(source)tracer(source.point,to,boss,t);floatDamage(rect,amount,boss,t);impact(enemy,boss,t);
    }
    if(record.type==='childList'){
      record.addedNodes.forEach(node=>{if(!(node instanceof Element))return;const enemies=node.matches?.(ENEMY)?[node]:[...node.querySelectorAll?.(ENEMY)??[]];enemies.forEach(enemy=>{const bar=enemy.querySelector('i b');if(bar)remember(enemy,bar);else{lastRect.set(enemy,enemy.getBoundingClientRect());lastTheme.set(enemy,theme(enemy))}})});
      record.removedNodes.forEach(node=>{if(!(node instanceof Element))return;const enemies=node.matches?.(ENEMY)?[node]:[...node.querySelectorAll?.(ENEMY)??[]];enemies.forEach(enemy=>{const rect=lastRect.get(enemy),health=lastHealth.get(enemy),t=lastTheme.get(enemy)??'stone';if(rect?.width&&health!=null&&health<=1.2)defeatBurst(rect,enemy.classList.contains('boss'),t)})});
    }
   }
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});
  return()=>{observer.disconnect();document.querySelectorAll('.chrono-tracer,.chrono-damage-float,.chrono-defeat-burst').forEach(n=>n.remove());['stone','retro','future','space','rift'].forEach(t=>document.body.classList.remove(`chrono-boss-impact-${t}`))};
 },[]);
 return null;
}

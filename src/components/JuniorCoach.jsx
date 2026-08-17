import React,{useEffect,useMemo,useState}from'react';
import{loadSave}from'../core/save.js';

const SELECTORS={
 battle:'.battle-screen,.retro-battle,.future-battle,.space-battle,.rift-battle',
 tower:'.tower-card:not(:disabled),.retro-tower-grid button:not(:disabled),.future-towers button:not(:disabled),.space-towers button:not(:disabled),.rift-towers button:not(:disabled)',
 selected:'.tower-card.selected,.retro-tower-grid button.selected,.future-towers button.selected,.space-towers button.selected,.rift-towers button.selected',
 occupied:'.cell.occupied,.retro-cell.occupied,.future-cell.occupied,.space-cell.occupied,.rift-cell.occupied',
 enemy:'.enemy,.retro-enemy,.future-enemy,.space-enemy,.rift-enemy',
 wave:'.wave-button,.retro-wave-button,.future-wave-button,.space-wave-button,.rift-wave-button',
 build:'.cell:not(.path):not(.occupied),.retro-cell:not(.path):not(.occupied),.future-cell:not(.path):not(.occupied),.space-cell:not(.path):not(.occupied),.rift-cell:not(.path):not(.occupied)'
};

function isJunior(save){return save?.settings?.juniorMode!==false}
function textForState(){
 const battle=document.querySelector(SELECTORS.battle);
 if(!battle)return{icon:'🧭',title:'Choose your adventure',body:'Pick an unlocked map, then tap Enter Battle.',kind:'campaign'};
 const enemies=document.querySelectorAll(SELECTORS.enemy).length;
 const placed=document.querySelectorAll(SELECTORS.occupied).length;
 const selected=document.querySelector(SELECTORS.selected);
 const wave=document.querySelector(SELECTORS.wave);
 const waveActive=Boolean(wave?.disabled)&&/active|wave/i.test(wave?.textContent||'');
 if(enemies>0||waveActive)return{icon:'👀',title:'Watch the road!',body:'Your towers attack by themselves. Watch the enemies follow the arrows to your base.',kind:'watch'};
 if(!selected&&placed===0)return{icon:'☝️',title:'Step 1: Pick a tower',body:'Tap a tower card on the side. The glowing card is the one you picked.',kind:'pick'};
 if(selected&&placed===0)return{icon:'🎯',title:'Step 2: Place it',body:'Tap a green square beside the road. Do not place towers on the road.',kind:'place'};
 if(placed>0&&!wave?.disabled)return{icon:'🌊',title:'Step 3: Start the wave',body:'Nice! Tap Start Wave when you are ready. You can build more towers first if you want.',kind:'start'};
 return{icon:'⭐',title:'Great job!',body:'Between waves, build another tower or tap one you placed to upgrade it.',kind:'between'};
}

function clearHints(){document.querySelectorAll('.junior-recommended,.junior-good-build').forEach(el=>el.classList.remove('junior-recommended','junior-good-build'))}
function addHints(kind){
 clearHints();
 if(kind==='pick')document.querySelector(SELECTORS.tower)?.classList.add('junior-recommended');
 if(kind==='place'){
  const path=[...document.querySelectorAll('.cell.path,.retro-cell.path,.future-cell.path,.space-cell.path,.rift-cell.path')];
  const cells=[...document.querySelectorAll(SELECTORS.build)];
  const score=cell=>{const r=cell.getBoundingClientRect();return path.reduce((best,p)=>{const q=p.getBoundingClientRect(),dx=(r.left+r.width/2)-(q.left+q.width/2),dy=(r.top+r.height/2)-(q.top+q.height/2);return Math.min(best,Math.hypot(dx,dy))},Infinity)};
  cells.sort((a,b)=>score(a)-score(b)).slice(0,5).forEach(el=>el.classList.add('junior-good-build'));
 }
}

export function JuniorCoach(){
 const[enabled,setEnabled]=useState(()=>isJunior(loadSave()));
 const[tip,setTip]=useState(()=>({icon:'🧭',title:'Choose your adventure',body:'Pick an unlocked map, then tap Enter Battle.',kind:'campaign'}));
 const[hidden,setHidden]=useState(false);
 useEffect(()=>{
  const refreshSave=event=>{const save=event.detail?.save??loadSave();setEnabled(isJunior(save));if(isJunior(save))setHidden(false)};
  window.addEventListener('chrono:save',refreshSave);
  return()=>window.removeEventListener('chrono:save',refreshSave);
 },[]);
 useEffect(()=>{
  if(!enabled){clearHints();return undefined}
  const update=()=>{const next=textForState();setTip(old=>old.kind===next.kind&&old.title===next.title?old:next);addHints(next.kind)};
  update();const timer=window.setInterval(update,450);return()=>{window.clearInterval(timer);clearHints()}
 },[enabled]);
 const visible=enabled&&!hidden;
 const label=useMemo(()=>tip.kind==='campaign'?'HELPER':'COACH',[tip.kind]);
 if(!visible)return null;
 return <aside className={`junior-coach junior-${tip.kind}`} aria-live="polite"><button className="junior-close" onClick={()=>setHidden(true)} aria-label="Hide helper">×</button><span className="junior-face">{tip.icon}</span><div><small>{label}</small><b>{tip.title}</b><p>{tip.body}</p></div></aside>;
}

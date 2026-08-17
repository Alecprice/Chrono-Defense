import React,{useEffect,useMemo,useState}from'react';
import{loadSave}from'../core/save.js';

const S={battle:'.battle-screen,.retro-battle,.future-battle,.space-battle,.rift-battle',tower:'.tower-card:not(:disabled),.retro-tower-grid button:not(:disabled),.future-towers button:not(:disabled),.space-towers button:not(:disabled),.rift-towers button:not(:disabled)',selected:'.tower-card.selected,.retro-tower-grid button.selected,.future-towers button.selected,.space-towers button.selected,.rift-towers button.selected',occupied:'.cell.occupied,.retro-cell.occupied,.future-cell.occupied,.space-cell.occupied,.rift-cell.occupied',enemy:'.enemy,.retro-enemy,.future-enemy,.space-enemy,.rift-enemy',wave:'.wave-button,.retro-wave-button,.future-wave-button,.space-wave-button,.rift-wave-button',build:'.cell:not(.path):not(.occupied),.retro-cell:not(.path):not(.occupied),.future-cell:not(.path):not(.occupied),.space-cell:not(.path):not(.occupied),.rift-cell:not(.path):not(.occupied)',upgrade:'button[class*="upgrade"],.upgrade-button',base:'.village,.base,.retro-base,.future-base,.space-base,.rift-base'};
const junior=s=>s?.settings?.juniorMode!==false;
function state(){
 if(!document.querySelector(S.battle))return{icon:'🗺️',title:'Pick a map',body:'Choose an unlocked map. Start with the glowing or newest one!',kind:'campaign'};
 const enemies=document.querySelectorAll(S.enemy).length,placed=document.querySelectorAll(S.occupied).length,selected=document.querySelector(S.selected),wave=document.querySelector(S.wave),upgrade=document.querySelector(S.upgrade);
 if(enemies>0)return{icon:'👀',title:'Here they come!',body:'Your towers shoot by themselves. Follow the enemies along the road to your base.',kind:'watch'};
 if(!selected&&placed===0)return{icon:'☝️',title:'1. Pick a tower',body:'Tap a glowing tower card. You only need one to get started.',kind:'pick'};
 if(selected&&placed===0)return{icon:'🎯',title:'2. Put it by the road',body:'Tap one of the glowing green spots. Towers cannot go on the road.',kind:'place'};
 if(placed>0&&wave&&!wave.disabled)return{icon:'▶️',title:'3. Ready? Go!',body:'Tap Start Wave. Your towers will do the fighting!',kind:'start'};
 if(upgrade&&!upgrade.disabled)return{icon:'⬆️',title:'Make a tower stronger',body:'Tap a tower you built, then tap Upgrade when you have enough resources.',kind:'upgrade'};
 return{icon:'⭐',title:'You are doing great!',body:'Build near the road, upgrade your favorites, and keep enemies away from your base.',kind:'between'};
}
function clear(){document.querySelectorAll('.junior-recommended,.junior-good-build,.junior-go-button').forEach(e=>e.classList.remove('junior-recommended','junior-good-build','junior-go-button'))}
function hints(kind){clear();if(kind==='pick')document.querySelector(S.tower)?.classList.add('junior-recommended');if(kind==='start')document.querySelector(S.wave)?.classList.add('junior-go-button');if(kind==='upgrade')document.querySelector(S.upgrade)?.classList.add('junior-recommended');if(kind==='place'){const path=[...document.querySelectorAll('.cell.path,.retro-cell.path,.future-cell.path,.space-cell.path,.rift-cell.path')],cells=[...document.querySelectorAll(S.build)];const score=c=>{const r=c.getBoundingClientRect();return path.reduce((best,p)=>{const q=p.getBoundingClientRect(),dx=r.left+r.width/2-q.left-q.width/2,dy=r.top+r.height/2-q.top-q.height/2;return Math.min(best,Math.hypot(dx,dy))},Infinity)};cells.sort((a,b)=>score(a)-score(b)).slice(0,4).forEach(e=>e.classList.add('junior-good-build'))}}
export function JuniorCoach(){
 const[enabled,setEnabled]=useState(()=>junior(loadSave())),[tip,setTip]=useState(state),[hidden,setHidden]=useState(false);
 useEffect(()=>{const f=e=>{const s=e.detail?.save??loadSave();setEnabled(junior(s));if(junior(s))setHidden(false)};window.addEventListener('chrono:save',f);return()=>window.removeEventListener('chrono:save',f)},[]);
 useEffect(()=>{if(!enabled){clear();return}const f=()=>{const n=state();setTip(o=>o.kind===n.kind?o:n);hints(n.kind)};f();const id=setInterval(f,500);return()=>{clearInterval(id);clear()}},[enabled]);
 const label=useMemo(()=>tip.kind==='campaign'?'MAP HELPER':'GAME COACH',[tip.kind]);
 const canSpeak=typeof window!=='undefined'&&'speechSynthesis'in window;
 const speak=()=>{if(!canSpeak)return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(`${tip.title}. ${tip.body}`);utterance.rate=.92;utterance.pitch=1.05;window.speechSynthesis.speak(utterance)};
 if(!enabled)return null;
 if(hidden)return <button className="junior-help-bubble" onClick={()=>setHidden(false)} aria-label="Show game coach">? <span>Help</span></button>;
 return <aside className={`junior-coach junior-${tip.kind}`} aria-live="polite"><button className="junior-close" onClick={()=>setHidden(true)} aria-label="Hide game coach">×</button><span className="junior-face">{tip.icon}</span><div><small>{label}</small><b>{tip.title}</b><p>{tip.body}</p>{canSpeak&&<button className="junior-speak" onClick={speak}>🔊 Read this</button>}</div></aside>;
}

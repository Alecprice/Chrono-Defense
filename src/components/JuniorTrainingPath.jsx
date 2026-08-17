import React,{useEffect,useMemo,useState}from'react';
import{loadSave}from'../core/save.js';

const LESSONS={
  1:{icon:'🪨',title:'Training 1: Build & Defend',idea:'Learn the basic loop.',tower:'Rock Thrower',steps:['Pick a tower','Build beside the road','Start a wave'],tip:'Put your first tower near a bend so it can shoot enemies for longer.'},
  2:{icon:'🪵',title:'Training 2: Gather Resources',idea:'Learn how camps help between waves.',tower:'Rock Thrower + Camp',steps:['Build a defense','Build a resource camp','Clear a wave'],tip:'Camps do not fight. Build defenses first, then add a camp when the road is safe.'},
  3:{icon:'⬆️',title:'Training 3: Upgrade',idea:'Make fewer towers stronger.',tower:'Spear Hunter',steps:['Build 2 towers','Upgrade one tower','Keep the village safe'],tip:'A well-placed upgraded tower can be better than several weak towers.'},
  4:{icon:'🧠',title:'Training 4: Mix Tower Jobs',idea:'Use different tower roles together.',tower:'Fire Keeper',steps:['Use 2 tower families','Upgrade a favorite','Prepare before each wave'],tip:'Fast towers handle swarms. Strong towers help against tougher enemies.'},
  5:{icon:'👑',title:'Training 5: First Boss',idea:'Prepare for the Alpha Sabertooth.',tower:'Strong Hit + Support',steps:['Build near road bends','Upgrade before the boss','Defeat the boss'],tip:'Bosses have lots of health. Upgrade your best-positioned towers before starting the final wave.'},
};

function juniorEnabled(){return loadSave()?.settings?.juniorMode!==false}
function mapNumber(){const text=document.querySelector('.battle-screen .brand span')?.textContent??'';const match=text.match(/Map\s+(\d+)/i);return Number(match?.[1]??0)}
function occupied(){return [...document.querySelectorAll('.battle-screen .cell.occupied')]}
function towerNames(){return occupied().map(cell=>cell.querySelector('.placed-icon')?.getAttribute('title')??'').filter(Boolean)}
function currentWave(){const text=document.querySelector('.battle-screen .resource-strip')?.textContent??'';const m=text.match(/🌊\s*(\d+)/);return Number(m?.[1]??1)}
function hasUpgrade(){return occupied().some(cell=>/L[2-9]|\s[A-B]$/.test(cell.querySelector('.placed-icon small')?.textContent??''))}
function enemiesVisible(){return document.querySelectorAll('.battle-screen .enemy').length>0}
function progressFor(map){
 const names=towerNames(),count=occupied().length,wave=currentWave(),upgraded=hasUpgrade(),families=new Set(names).size;
 if(map===1)return [count>0,count>0&&(wave>1||enemiesVisible()),wave>1];
 if(map===2){const camp=names.some(n=>/camp|quarry|gather|food/i.test(n));return [count>0,camp,wave>1]}
 if(map===3)return [count>=2,upgraded,true];
 if(map===4)return [families>=2,upgraded,wave>1];
 if(map===5)return [count>=3,upgraded,wave>1];
 return [false,false,false];
}

export function JuniorTrainingPath(){
 const[enabled,setEnabled]=useState(()=>juniorEnabled());
 const[map,setMap]=useState(()=>mapNumber());
 const[progress,setProgress]=useState(()=>progressFor(mapNumber()));
 const[open,setOpen]=useState(true);
 useEffect(()=>{const onSave=()=>setEnabled(juniorEnabled());window.addEventListener('chrono:save',onSave);return()=>window.removeEventListener('chrono:save',onSave)},[]);
 useEffect(()=>{if(!enabled)return;const tick=()=>{const n=mapNumber();setMap(n);if(n>=1&&n<=5)setProgress(progressFor(n))};tick();const id=setInterval(tick,550);return()=>clearInterval(id)},[enabled]);
 const lesson=LESSONS[map];
 const done=useMemo(()=>progress.filter(Boolean).length,[progress]);
 if(!enabled||!lesson||!document.querySelector('.battle-screen'))return null;
 if(!open)return <button className="junior-training-tab" onClick={()=>setOpen(true)}>🎯 Training {map}</button>;
 return <aside className="junior-training" aria-live="polite">
   <div className="junior-training-head"><span>{lesson.icon}</span><div><small>STONE AGE TRAINING</small><b>{lesson.title}</b></div><button onClick={()=>setOpen(false)} aria-label="Hide training mission">×</button></div>
   <p>{lesson.idea}</p>
   <div className="junior-training-tower">💡 Try: <b>{lesson.tower}</b></div>
   <div className="junior-training-steps">{lesson.steps.map((step,index)=><span key={step} className={progress[index]?'done':''}>{progress[index]?'✓':'○'} {step}</span>)}</div>
   <div className="junior-training-progress"><i style={{width:`${done/lesson.steps.length*100}%`}}/><small>{done}/{lesson.steps.length} goals</small></div>
   <div className="junior-training-tip">🧭 {lesson.tip}</div>
 </aside>;
}

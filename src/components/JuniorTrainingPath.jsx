import React,{useEffect,useMemo,useRef,useState}from'react';
import{loadSave}from'../core/save.js';

const LESSONS={
  1:{stage:'TRAINING',icon:'🪨',title:'Training 1: Build & Defend',idea:'Learn the basic loop.',tower:'Rock Thrower',steps:['Pick a tower','Build beside the road','Start a wave'],tip:'Put your first tower near a bend so it can shoot enemies for longer.'},
  2:{stage:'TRAINING',icon:'🪵',title:'Training 2: Gather Resources',idea:'Learn how camps help between waves.',tower:'Rock Thrower + Camp',steps:['Build a defense','Build a resource camp','Clear a wave'],tip:'Camps do not fight. Build defenses first, then add a camp when the road is safe.'},
  3:{stage:'TRAINING',icon:'⬆️',title:'Training 3: Upgrade',idea:'Make fewer towers stronger.',tower:'Spear Hunter',steps:['Build 2 towers','Upgrade one tower','Keep the village safe'],tip:'A well-placed upgraded tower can be better than several weak towers.'},
  4:{stage:'TRAINING',icon:'🧠',title:'Training 4: Mix Tower Jobs',idea:'Use different tower roles together.',tower:'Fire Keeper',steps:['Use 2 tower families','Upgrade a favorite','Prepare before each wave'],tip:'Fast towers handle swarms. Strong towers help against tougher enemies.'},
  5:{stage:'TRAINING',icon:'👑',title:'Training 5: First Boss',idea:'Prepare for the Alpha Sabertooth.',tower:'Strong Hit + Support',steps:['Build near road bends','Upgrade before the boss','Defeat the boss'],tip:'Bosses have lots of health. Upgrade your best-positioned towers before starting the final wave.'},
  6:{stage:'APPRENTICE',icon:'🤝',title:'Apprentice 1: Adapt Your Defense',idea:'Mix tower jobs and learn that changing a weak setup is okay.',tower:'3 tower families',steps:['Use 3 tower families','Sell or undo one weak choice','Upgrade a keeper'],tip:'Try a fast tower, a strong hitter, and a slowing or support tower. If one is badly placed, rebuild it instead of being stuck with the mistake.',reward:'Varied defenses prepare you for tougher jungle enemies.'},
  7:{stage:'APPRENTICE',icon:'🧭',title:'Apprentice 2: Plan Before You Build',idea:'Win without selling by thinking ahead.',tower:'4 well-spaced defenses',steps:['Build 4 defenses','Upgrade 2 towers','Clear 2 waves without selling'],tip:'Map 7 rewards you for not selling. Look at the whole road first, then commit to strong positions.',reward:'This matches the map bonus: complete the battle without selling a tower.'},
  8:{stage:'APPRENTICE',icon:'🕳️',title:'Apprentice 3: Cave Ambush',idea:'React when the map itself creates danger.',tower:'Watchtower + slowing tower',steps:['Build near the cave route','Use the map action','Survive 2 waves'],tip:'Keep some resources ready. Cave ambushes can change the danger quickly, so do not spend everything at once.',reward:'Clearing Map 8 unlocks the Watchtower.'},
  9:{stage:'APPRENTICE',icon:'🏕️',title:'Apprentice 4: Resource Mastery',idea:'Run an economy without forgetting defense.',tower:'Wood Camp + Stone Quarry + Hunter Camp',steps:['Build all 3 camp types','Upgrade a defense','Clear 2 waves'],tip:'Build fighting towers first. Add camps when your defense is stable, then use the extra resources to upgrade.',reward:'A balanced economy gives you more choices in long battles.'},
  10:{stage:'APPRENTICE',icon:'🦖',title:'Apprentice 5: Raptor Queen',idea:'Use everything you learned against a boss and its pack.',tower:'4 tower families + upgrades',steps:['Use 4 tower families','Upgrade 2 towers','Defeat the Raptor Queen'],tip:'The Queen brings extra enemies. Spread damage across the route and keep strong towers covering the final bends.',reward:'Victory unlocks the Beast Tamer and completes your Jungle apprenticeship.'},
  11:{stage:'RANGER',icon:'❄️',title:'Ranger 1: Protect the Village',idea:'Frozen enemies are tougher. Win without letting your defense fall apart.',tower:'Slow + strong damage',steps:['Build 3 combat towers','Upgrade 2 towers','Keep Village HP at 75+'],tip:'The frozen road can change enemy speed. Cover more than one bend so a fast burst cannot slip through.',reward:'Ranger missions give hints, but you choose the strategy.'},
  12:{stage:'RANGER',icon:'🧊',title:'Ranger 2: Stop the Rush',idea:'Defeat enemies before they reach the dangerous final bend.',tower:'Fast attacks + splash damage',steps:['Build 4 combat towers','Reach 75 defeats','Keep the village standing'],tip:'Put fast or group-damage towers earlier on the road. The goal is to defeat enemies before they pile up near home.',reward:'75 defeats completes this map’s special hunting challenge.'},
  13:{stage:'RANGER',icon:'🌊',title:'Ranger 3: Do More With Less',idea:'Build an efficient defense instead of filling every square.',tower:'8 combat towers or fewer',steps:['Stay at 8 combat towers or fewer','Upgrade 3 towers','Clear 3 waves'],tip:'Upgrade towers that cover long stretches of road. Strong placement matters more than filling the board.',reward:'The map bonus rewards a compact defense.'},
  14:{stage:'RANGER',icon:'🦣',title:'Ranger 4: Mammoth Hunt',idea:'Prepare specifically for very tough Mammoth-class enemies.',tower:'Strong Hit + slowing support',steps:['Use 3 tower families','Upgrade 3 towers','Finish the Mammoth hunt'],tip:'Mammoths are slow but tough. Slowing support buys extra shooting time while your strongest towers wear them down.',reward:'Clear this hunt to reach the Frozen Age boss.'},
  15:{stage:'RANGER',icon:'👑',title:'Ranger 5: The Great Mammoth',idea:'Beat the Frozen Age boss with a defense you planned yourself.',tower:'Your best 4-family team',steps:['Use 4 tower families','Upgrade 4 towers','Defeat the Great Mammoth'],tip:'Do not spend everything early. Build a solid route, then save enough to strengthen your best towers before the boss wave.',reward:'Victory proves you can handle the Frozen Age without step-by-step coaching.'},
};

function juniorEnabled(){return loadSave()?.settings?.juniorMode!==false}
function mapNumber(){const text=document.querySelector('.battle-screen .brand span')?.textContent??'';const match=text.match(/Map\s+(\d+)/i);return Number(match?.[1]??0)}
function occupied(){return [...document.querySelectorAll('.battle-screen .cell.occupied')]}
function towerNames(){return occupied().map(cell=>cell.querySelector('.placed-icon')?.getAttribute('title')??'').filter(Boolean)}
function currentWave(){const text=document.querySelector('.battle-screen .resource-strip')?.textContent??'';const m=text.match(/🌊\s*(\d+)/);return Number(m?.[1]??1)}
function villageHp(){const text=document.querySelector('.battle-screen .resource-strip')?.textContent??'';const m=text.match(/🏕️\s*(\d+)/);return Number(m?.[1]??100)}
function killCount(){const text=document.querySelector('.battle-screen .resource-strip')?.textContent??'';const m=text.match(/💀\s*(\d+)/);return Number(m?.[1]??0)}
function upgradedCount(){return occupied().filter(cell=>/L[2-9]|\s[A-B]$/.test(cell.querySelector('.placed-icon small')?.textContent??'')).length}
function hasUpgrade(){return upgradedCount()>0}
function enemiesVisible(){return document.querySelectorAll('.battle-screen .enemy').length>0}
function wonBattle(){return /Village Defended|Victory!/i.test(document.querySelector('.result-card')?.textContent??'')}
function campKinds(names){const kinds=new Set();names.forEach(name=>{if(/wood camp/i.test(name))kinds.add('wood');if(/stone quarry|quarry/i.test(name))kinds.add('stone');if(/hunter camp/i.test(name))kinds.add('food')});return kinds}
function combatNames(names){return names.filter(name=>!/wood camp|stone quarry|quarry|hunter camp/i.test(name))}
function nearSpecialRoute(){
 const special=document.querySelector('.battle-screen [class*="env-cave"],.battle-screen .environment-mark');
 if(!special)return occupied().length>=3;
 const sr=special.getBoundingClientRect();
 return occupied().some(cell=>{const r=cell.getBoundingClientRect();return Math.hypot(r.left+r.width/2-sr.left-sr.width/2,r.top+r.height/2-sr.top-sr.height/2)<190});
}
function progressFor(map,actions={}){
 const names=towerNames(),combat=combatNames(names),count=occupied().length,combatCount=combat.length,wave=currentWave(),hp=villageHp(),kills=killCount(),upgraded=hasUpgrade(),families=new Set(combat).size;
 if(map===1)return [count>0,count>0&&(wave>1||enemiesVisible()),wave>1];
 if(map===2){const camp=names.some(n=>/camp|quarry/i.test(n));return [count>0,camp,wave>1]}
 if(map===3)return [count>=2,upgraded,true];
 if(map===4)return [families>=2,upgraded,wave>1];
 if(map===5)return [count>=3,upgraded,wonBattle()||wave>1];
 if(map===6)return [families>=3,Boolean(actions.sold||actions.undo),upgraded];
 if(map===7)return [combatCount>=4,upgradedCount()>=2,wave>=3&&!actions.sold];
 if(map===8)return [nearSpecialRoute(),Boolean(actions.environment),wave>=3];
 if(map===9)return [campKinds(names).size>=3,upgraded,wave>=3];
 if(map===10)return [families>=4,upgradedCount()>=2,wonBattle()];
 if(map===11)return [combatCount>=3,upgradedCount()>=2,hp>=75];
 if(map===12)return [combatCount>=4,kills>=75,hp>0];
 if(map===13)return [combatCount>0&&combatCount<=8,upgradedCount()>=3,wave>=4];
 if(map===14)return [families>=3,upgradedCount()>=3,wonBattle()];
 if(map===15)return [families>=4,upgradedCount()>=4,wonBattle()];
 return [false,false,false];
}

function stageName(stage){if(stage==='APPRENTICE')return'Apprentice';if(stage==='RANGER')return'Ranger';return'Training'}

export function JuniorTrainingPath(){
 const[enabled,setEnabled]=useState(()=>juniorEnabled());
 const[map,setMap]=useState(()=>mapNumber());
 const actionsRef=useRef({map:mapNumber(),sold:false,undo:false,environment:false});
 const[progress,setProgress]=useState(()=>progressFor(mapNumber(),actionsRef.current));
 const[open,setOpen]=useState(()=>mapNumber()<=5);
 useEffect(()=>{const onSave=()=>setEnabled(juniorEnabled());window.addEventListener('chrono:save',onSave);return()=>window.removeEventListener('chrono:save',onSave)},[]);
 useEffect(()=>{
   const click=event=>{
     const n=mapNumber();if(n<6||n>15)return;
     if(actionsRef.current.map!==n)actionsRef.current={map:n,sold:false,undo:false,environment:false};
     const button=event.target.closest?.('button');if(!button)return;
     const text=button.textContent??'';
     if(/sell|remove/i.test(text))actionsRef.current.sold=true;
     if(button.closest('.chrono-undo-toast')&&/undo/i.test(text))actionsRef.current.undo=true;
     if(button.closest('.environment-action-bar'))actionsRef.current.environment=true;
   };
   document.addEventListener('click',click,true);return()=>document.removeEventListener('click',click,true);
 },[]);
 useEffect(()=>{if(!enabled)return;let prior=map;const tick=()=>{const n=mapNumber();if(n!==prior){prior=n;actionsRef.current={map:n,sold:false,undo:false,environment:false};setOpen(n<=5)}setMap(n);if(n>=1&&n<=15)setProgress(progressFor(n,actionsRef.current))};tick();const id=setInterval(tick,550);return()=>clearInterval(id)},[enabled]);
 const lesson=LESSONS[map];
 const done=useMemo(()=>progress.filter(Boolean).length,[progress]);
 if(!enabled||!lesson||!document.querySelector('.battle-screen'))return null;
 const stage=stageName(lesson.stage);
 if(!open)return <button className={`junior-training-tab ${lesson.stage.toLowerCase()}`} onClick={()=>setOpen(true)}>🎯 {stage} {map}</button>;
 return <aside className={`junior-training ${lesson.stage.toLowerCase()}`} aria-live="polite">
   <div className="junior-training-head"><span>{lesson.icon}</span><div><small>STONE AGE {lesson.stage}</small><b>{lesson.title}</b></div><button onClick={()=>setOpen(false)} aria-label="Hide training mission">×</button></div>
   <p>{lesson.idea}</p>
   <div className="junior-training-tower">💡 Try: <b>{lesson.tower}</b></div>
   <div className="junior-training-steps">{lesson.steps.map((step,index)=><span key={step} className={progress[index]?'done':''}>{progress[index]?'✓':'○'} {step}</span>)}</div>
   <div className="junior-training-progress"><i style={{width:`${done/lesson.steps.length*100}%`}}/><small>{done}/{lesson.steps.length} goals</small></div>
   <div className="junior-training-tip">🧭 {lesson.tip}</div>
   {lesson.reward&&<div className="junior-training-reward">🏆 {lesson.reward}</div>}
 </aside>;
}

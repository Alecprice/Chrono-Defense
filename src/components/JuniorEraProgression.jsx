import React,{useEffect,useMemo,useState}from'react';
import{loadSave}from'../core/save.js';
import{retroMaps}from'../data/worlds/retro/maps.js';
import{futureMaps}from'../data/worlds/future/maps.js';
import{spaceMaps}from'../data/worlds/space/maps.js';
import{riftMaps}from'../data/worlds/timeRift/maps.js';

const WORLDS={
 retro:{label:'RETRO',icon:'🕹️',maps:retroMaps,tiers:['ROOKIE','PLAYER','ACE','CHAMPION','GAME MASTER'],themes:['Learn the arcade rules','Build combos and control crowds','Handle glitches and armor','Master speed and elite waves','Beat the final cabinet'],tries:['Pixel Blaster','Freeze Ray + splash','Laser Grid + control','Boss damage + support','Your best arcade team']},
 future:{label:'FUTURE',icon:'🤖',maps:futureMaps,tiers:['CADET','OPERATOR','ENGINEER','COMMANDER','ARCHITECT'],themes:['Learn Credits and Power','Detect and disrupt new threats','Balance the power grid','Build a resilient network','Master the Singularity'],tries:['Pulse Turret + Power Node','Detector + EMP control','Reactor + focused damage','Armor breaking + support','Your strongest stable grid']},
 space:{label:'SPACE',icon:'🚀',maps:spaceMaps,tiers:['CADET','PILOT','NAVIGATOR','CAPTAIN','ADMIRAL'],themes:['Learn Matter, shields and anomalies','Control strange alien fleets','Cover long deep-space routes','Protect a colony under pressure','Defend the last sky'],tries:['Ion Cannon on an anomaly','Gravity Well + damage','Long range + detection','Shield support + heavy damage','Your best fleet defense']},
 'time-rift':{label:'TIME RIFT',icon:'🌀',maps:riftMaps,tiers:['RIFT SCOUT','RIFT KEEPER','PARADOX HERO'],themes:['Learn to mix eras','Adapt to changing timelines','Save the timeline'],tries:['Use 2 eras together','Use 3 eras and upgrade','Build the team you trust most']}
};
function enabled(){return loadSave()?.settings?.juniorMode!==false}
function detect(){
 const roots=[['retro','.retro-battle'],['future','.future-battle'],['space','.space-battle'],['time-rift','.rift-battle']];
 for(const[world,selector]of roots){const root=document.querySelector(selector);if(!root)continue;const text=root.querySelector('header')?.textContent??'';const data=WORLDS[world];const map=data.maps.find(m=>text.includes(m.name));if(map)return{world,map,root};}
 return null;
}
function occupied(root){return root.querySelectorAll('[class*="cell"].occupied').length}
function upgrades(root){return [...root.querySelectorAll('[class*="cell"].occupied small')].filter(n=>/L[2-9]|★/.test(n.textContent??'')).length}
function wave(root){const text=root.querySelector('header')?.textContent??'';const m=text.match(/🌊\s*(\d+)/);return Number(m?.[1]??1)}
function healthSafe(world,root){const text=root.querySelector('header')?.textContent??'';if(world==='retro')return !/❤️\s*0/.test(text);if(world==='future'){const m=text.match(/💙\s*(\d+)/);return Number(m?.[1]??200)>=150}if(world==='space'){const m=text.match(/(?:💚|❤️|🏠)\s*(\d+)/);return m?Number(m[1])>=75:true}if(world==='time-rift'){const m=text.match(/🧭\s*(\d+)/);return Number(m?.[1]??1000)>=700}return true}
function victory(root){return /CLEAR!|GRID STABLE|SYSTEM SAVED|Fracture sealed|TIMELINE IS STABLE/i.test(root.textContent??'')}
function tierIndex(world,n){if(world==='time-rift')return n<=4?0:n<=8?1:2;return Math.min(4,Math.floor((n-1)/5))}
function goals(world,map,root){const n=map.number,count=occupied(root),ups=upgrades(root),w=wave(root),safe=healthSafe(world,root),won=victory(root);const boss=map.boss;
 if(world==='time-rift'){if(n<=4)return[count>=2,w>=2,safe];if(n<=8)return[count>=3,ups>=1,w>=3];return[count>=4,ups>=2,boss?won:safe]}
 const tier=tierIndex(world,n);if(tier===0)return[count>=2,ups>=1,boss?won:w>=2];if(tier===1)return[count>=3,ups>=1,w>=3];if(tier===2)return[count>=4,ups>=2,safe];if(tier===3)return[count>=4,ups>=2,boss?won:w>=4];return[count>=4,ups>=2,boss?won:safe]}
function goalText(world,map){const boss=map.boss;if(world==='time-rift')return map.number<=4?['Build 2 defenses','Clear a fracture wave','Keep stability safe']:map.number<=8?['Build 3 defenses','Upgrade a tower','Reach Wave 3']:['Build a full team','Upgrade 2 towers',boss?'Seal the final battle':'Keep stability above 70%'];const tier=tierIndex(world,map.number);if(tier===0)return['Build 2 defenses','Upgrade one',boss?'Beat the boss':'Clear a wave'];if(tier===1)return['Build 3 defenses','Upgrade one','Reach Wave 3'];if(tier===2)return['Build 4 defenses','Upgrade 2','Protect your base'];if(tier===3)return['Build a full defense','Upgrade 2',boss?'Beat the boss':'Reach Wave 4'];return['Choose your own team','Upgrade 2',boss?'Win the era finale':'Finish strong'];}
function tip(world,map){const mechanic=map.mechanic??'';if(world==='retro')return map.number<=5?'Keep the combo simple: cover bends, then upgrade.':mechanic;if(world==='future')return map.number<=5?'Watch the Power number before you deploy. A strong grid beats too many towers.':mechanic;if(world==='space')return map.number<=5?'Protect the colony first. Anomaly cells make good tower spots.':mechanic;return map.number<=4?'Mix familiar towers from different eras. You already know how they work.':mechanic;}
export function JuniorEraProgression(){const[on,setOn]=useState(()=>enabled()),[state,setState]=useState(()=>detect()),[progress,setProgress]=useState([false,false,false]),[open,setOpen]=useState(false);
 useEffect(()=>{const save=()=>setOn(enabled());window.addEventListener('chrono:save',save);return()=>window.removeEventListener('chrono:save',save)},[]);
 useEffect(()=>{if(!on)return;let key='';const id=setInterval(()=>{const next=detect();setState(next);if(!next)return;const nextKey=`${next.world}-${next.map.number}`;if(nextKey!==key){key=nextKey;setOpen(next.map.number<=2)}setProgress(goals(next.world,next.map,next.root))},600);return()=>clearInterval(id)},[on]);
 const done=useMemo(()=>progress.filter(Boolean).length,[progress]);if(!on||!state)return null;const data=WORLDS[state.world],idx=tierIndex(state.world,state.map.number),tier=data.tiers[idx],texts=goalText(state.world,state.map);
 if(!open)return <button className={`junior-era-tab era-${state.world}`} onClick={()=>setOpen(true)}>🎯 {tier}</button>;
 return <aside className={`junior-era-path era-${state.world}`}><div className="junior-era-head"><span>{data.icon}</span><div><small>{data.label} • {tier}</small><b>{state.map.number}. {state.map.name}</b></div><button onClick={()=>setOpen(false)}>×</button></div><p>{data.themes[idx]}</p><div className="junior-era-try">💡 Try: <b>{data.tries[idx]}</b></div><div className="junior-era-goals">{texts.map((text,i)=><span className={progress[i]?'done':''} key={text}>{progress[i]?'✓':'○'} {text}</span>)}</div><div className="junior-era-meter"><i style={{width:`${done/3*100}%`}}/><small>{done}/3 goals</small></div><div className="junior-era-tip">🧭 {tip(state.world,state.map)}</div>{state.map.boss&&<div className="junior-era-boss">👑 Boss map: upgrade your best-positioned towers before the last wave.</div>}</aside>;
}

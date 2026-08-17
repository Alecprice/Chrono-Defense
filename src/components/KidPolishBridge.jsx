import React,{useEffect,useMemo,useState}from'react';
import{loadSave}from'../core/save.js';
import{stoneAgeMaps}from'../data/worlds/stoneAge/maps.js';
import{retroMaps}from'../data/worlds/retro/maps.js';
import{futureMaps}from'../data/worlds/future/maps.js';
import{spaceMaps}from'../data/worlds/space/maps.js';
import{riftMaps}from'../data/worlds/timeRift/maps.js';

const MAPS={'stone-age':stoneAgeMaps,retro:retroMaps,future:futureMaps,space:spaceMaps,'time-rift':riftMaps};
const ROOTS={'stone-age':'.battle-screen',retro:'.retro-battle',future:'.future-battle',space:'.space-battle','time-rift':'.rift-battle'};
const LOSS_RE=/GAME OVER|CORE OFFLINE|COLONY LOST|TIMELINE COLLAPSE|Village Lost|Defeat/i;
const WIN_RE=/Village Defended|CLEAR!|GRID STABLE|SYSTEM SAVED|Fracture sealed|TIMELINE IS STABLE|Victory!/i;
const MATCHUPS={
 'stone-age':[['🐜 Swarms','Fast or splash towers'],['🛡️ Tough enemies','Strong single hits'],['👑 Bosses','Upgraded towers near long bends']],
 retro:[['⚡ Fast pixels','Freeze/control towers'],['👻 Phasing/glitches','Coverage from several angles'],['👑 Bosses','Boss damage plus a support tower']],
 future:[['🛡️ Shields/armor','Railgun or heavy damage'],['👻 Cloaked threats','Detection coverage'],['⚡ EMP/hackers','Spread towers and protect Power']],
 space:[['🚀 Fast fleets','Gravity/control'],['👻 Stealth fleets','Detection coverage'],['🛡️ Heavy ships','Antimatter/heavy damage']],
 'time-rift':[['🌀 Mixed threats','Use several eras'],['⚡ Fast/phase units','Control plus wide coverage'],['👑 Chronophage','3+ eras and upgraded heavy damage']]
};
function junior(){return loadSave()?.settings?.juniorMode!==false}
function readEnabled(){return loadSave()?.settings?.readAloud!==false}
function adaptive(){return loadSave()?.settings?.adaptiveHelp!==false}
function detectBattle(){for(const[world,selector]of Object.entries(ROOTS)){const root=document.querySelector(selector);if(!root)continue;const text=root.querySelector('header')?.textContent??root.textContent??'';const map=(MAPS[world]??[]).find(m=>text.includes(m.name));if(map)return{world,map,root}}return null}
function speak(text){if(!readEnabled()||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.92;u.pitch=1.02;window.speechSynthesis.speak(u)}
function lossKey(world,map){return`chrono-junior-losses:${world}:${map}`}
function getLosses(world,map){try{return Number(localStorage.getItem(lossKey(world,map))||0)}catch{return 0}}
function setLosses(world,map,value){try{localStorage.setItem(lossKey(world,map),String(value))}catch{}}
function firstRun(){try{return localStorage.getItem('chrono-welcome-seen')!=='1'}catch{return false}}
function markWelcome(){try{localStorage.setItem('chrono-welcome-seen','1')}catch{}}
export function KidPolishBridge(){const[on,setOn]=useState(()=>junior()),[battle,setBattle]=useState(()=>detectBattle()),[bossPrep,setBossPrep]=useState(null),[help,setHelp]=useState(false),[adaptiveCard,setAdaptiveCard]=useState(null),[welcome,setWelcome]=useState(()=>firstRun());
 useEffect(()=>{const refresh=()=>setOn(junior());window.addEventListener('chrono:save',refresh);return()=>window.removeEventListener('chrono:save',refresh)},[]);
 useEffect(()=>{if(!on)return;let last='',lostSeen=false,wonSeen=false;const tick=()=>{const current=detectBattle();setBattle(current);if(!current){last='';lostSeen=false;wonSeen=false;return}const key=`${current.world}-${current.map.number}`;if(key!==last){last=key;lostSeen=false;wonSeen=false;if(current.map.boss)setBossPrep({world:current.world,map:current.map});else setBossPrep(null);setAdaptiveCard(null)}const text=current.root.textContent??'';if(LOSS_RE.test(text)&&!lostSeen){lostSeen=true;const losses=getLosses(current.world,current.map.number)+1;setLosses(current.world,current.map.number,losses);if(adaptive()&&losses>=2)setAdaptiveCard({world:current.world,map:current.map,losses})}if(WIN_RE.test(text)&&!wonSeen){wonSeen=true;setLosses(current.world,current.map.number,0);setAdaptiveCard(null)}};tick();const id=setInterval(tick,700);return()=>clearInterval(id)},[on]);
 const matchups=useMemo(()=>battle?MATCHUPS[battle.world]??[]:[],[battle?.world]);if(!on)return null;
 return <>
  {welcome&&<div className="kid-welcome"><section><div className="kid-welcome-icon">⏳</div><small>CHRONO DEFENSE</small><h1>Ready to defend time?</h1><p>Build towers beside the road, stop enemies before they reach your base, and unlock four different eras.</p><div><span>👆 Tap to build</span><span>⬆️ Upgrade favorites</span><span>🧭 Follow the Coach</span></div><button onClick={()=>{markWelcome();setWelcome(false)}}>Let’s Play!</button></section></div>}
  {bossPrep&&<div className="boss-prep-card"><button className="boss-prep-close" onClick={()=>setBossPrep(null)}>×</button><small>👑 BOSS MAP</small><h3>{bossPrep.map.name}</h3><p>{bossPrep.map.mechanic||'A powerful enemy is waiting at the end of this map.'}</p><div><span>1️⃣ Build around long road sections.</span><span>2️⃣ Upgrade your best towers before the last wave.</span><span>3️⃣ Keep some resources for a last-second fix.</span></div><button onClick={()=>speak(`Boss map. ${bossPrep.map.name}. Build around long road sections. Upgrade your best towers before the last wave. Keep some resources ready for a last second fix.`)}>🔊 Read This</button></div>}
  {battle&&<button className="kid-help-button" onClick={()=>setHelp(v=>!v)} aria-expanded={help}>? Help</button>}
  {battle&&help&&<aside className="kid-help-drawer"><header><div><small>{battle.map.name}</small><b>What works against what?</b></div><button onClick={()=>setHelp(false)}>×</button></header>{matchups.map(([enemy,tower])=><div className="kid-matchup" key={enemy}><b>{enemy}</b><span>→</span><em>{tower}</em></div>)}<p>💡 {battle.map.mechanic}</p><button onClick={()=>speak(`${battle.map.name}. ${battle.map.mechanic}. ${matchups.map(x=>`${x[0]}: ${x[1]}`).join('. ')}`)}>🔊 Read Help</button></aside>}
  {adaptiveCard&&<div className="adaptive-help-card"><small>💛 COACH HELP</small><h3>This map is tricky — that’s okay.</h3><p>You’ve tried this map {adaptiveCard.losses} times. Try one change instead of rebuilding everything.</p><div><span>⭐ Put your strongest tower where it sees the road longest.</span><span>⬆️ Upgrade 2 good towers before adding lots of weak ones.</span><span>🪙 Keep a little money/resources between waves.</span></div><button onClick={()=>{setHelp(true);setAdaptiveCard(null)}}>Show Me What Works</button><button className="quiet" onClick={()=>setAdaptiveCard(null)}>I Want to Try Again</button></div>}
 </>;
}

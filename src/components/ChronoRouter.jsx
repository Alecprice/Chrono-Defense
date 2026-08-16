import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{StoneAgeExperience}from'./StoneAgeExperience.jsx';
import{RetroExperience}from'./RetroExperience.jsx';
import{FutureExperience}from'./FutureExperience.jsx';
import{SpaceExperience}from'./SpaceExperience.jsx';
import{TimeRiftExperience}from'./TimeRiftExperience.jsx';
import{EraSwitcher}from'./EraSwitcher.jsx';
import{CombatJuiceBridge}from'./CombatJuiceBridge.jsx';

function worldFromHash(){const value=(globalThis.location?.hash||'').replace('#','');return['stone-age','retro','future','space','time-rift'].includes(value)?value:'stone-age';}
export function ChronoRouter(){
 const[world,setWorld]=useState(worldFromHash);
 useEffect(()=>{const change=()=>setWorld(worldFromHash());window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 const switchWorld=next=>{const save=loadSave();if(next==='retro'&&!save.worlds.retro?.unlocked)return;if(next==='future'&&!save.worlds.future?.unlocked)return;if(next==='space'&&!save.worlds.space?.unlocked)return;if(next==='time-rift'&&!save.worlds['time-rift']?.unlocked)return;save.activeWorld=next;persistSave(save);if(globalThis.location)globalThis.location.hash=next;setWorld(next)};
 let content=<StoneAgeExperience onSwitchWorld={switchWorld}/>;
 if(world==='retro')content=<RetroExperience onSwitchWorld={switchWorld}/>;
 if(world==='future')content=<FutureExperience onSwitchWorld={switchWorld}/>;
 if(world==='space')content=<SpaceExperience onSwitchWorld={switchWorld}/>;
 if(world==='time-rift')content=<TimeRiftExperience onSwitchWorld={switchWorld}/>;
 return <>{content}<CombatJuiceBridge/><EraSwitcher active={world} onSwitch={switchWorld}/></>;
}

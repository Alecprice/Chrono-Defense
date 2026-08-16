import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{StoneAgeExperience}from'./StoneAgeExperience.jsx';
import{RetroExperience}from'./RetroExperience.jsx';
import{FutureExperience}from'./FutureExperience.jsx';
import{SpaceExperience}from'./SpaceExperience.jsx';
import{TimeRiftExperience}from'./TimeRiftExperience.jsx';

function worldFromHash(){const value=(globalThis.location?.hash||'').replace('#','');return['stone-age','retro','future','space','time-rift'].includes(value)?value:'stone-age';}
export function ChronoRouter(){
 const[world,setWorld]=useState(worldFromHash);
 useEffect(()=>{const change=()=>setWorld(worldFromHash());window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 const switchWorld=next=>{const save=loadSave();if(next==='retro'&&!save.worlds.retro?.unlocked)return;if(next==='future'&&!save.worlds.future?.unlocked)return;if(next==='space'&&!save.worlds.space?.unlocked)return;if(next==='time-rift'&&!save.worlds['time-rift']?.unlocked)return;save.activeWorld=next;persistSave(save);if(globalThis.location)globalThis.location.hash=next;setWorld(next)};
 if(world==='time-rift')return <TimeRiftExperience onSwitchWorld={switchWorld}/>;
 if(world==='space')return <SpaceExperience onSwitchWorld={switchWorld}/>;
 if(world==='future')return <FutureExperience onSwitchWorld={switchWorld}/>;
 if(world==='retro')return <RetroExperience onSwitchWorld={switchWorld}/>;
 return <StoneAgeExperience onSwitchWorld={switchWorld}/>;
}

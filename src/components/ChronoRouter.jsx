import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{StoneAgeExperience}from'./StoneAgeExperience.jsx';
import{RetroExperience}from'./RetroExperience.jsx';

function worldFromHash(){const value=(globalThis.location?.hash||'').replace('#','');return value==='retro'?'retro':'stone-age';}
export function ChronoRouter(){
 const[world,setWorld]=useState(worldFromHash);
 useEffect(()=>{const change=()=>setWorld(worldFromHash());window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 const switchWorld=next=>{const save=loadSave();if(next==='retro'&&!save.worlds.retro?.unlocked)return;save.activeWorld=next;persistSave(save);if(globalThis.location)globalThis.location.hash=next;setWorld(next)};
 return world==='retro'?<RetroExperience onSwitchWorld={switchWorld}/>:<StoneAgeExperience onSwitchWorld={switchWorld}/>;
}

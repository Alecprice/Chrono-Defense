import React,{useEffect,useMemo,useState}from'react';
import{loadSave}from'../core/save.js';

const STORAGE='chrono-defense-enemy-book-v1';
const ROOTS={
 'stone-age':['.battle-screen','.wave-preview span,.battle-preview span,.enemy-preview span'],
 retro:['.retro-battle','.retro-preview span'],
 future:['.future-battle','.future-preview span'],
 space:['.space-battle','.space-preview span'],
 'time-rift':['.rift-battle','.rift-preview span']
};
const LABELS={'stone-age':'Stone Age',retro:'Retro',future:'Future',space:'Space','time-rift':'Time Rift'};
function enabled(){return loadSave()?.settings?.juniorMode!==false}
function loadBook(){try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return{}}}
function saveBook(book){try{localStorage.setItem(STORAGE,JSON.stringify(book))}catch{}}
function currentWorld(){for(const[world,[root]]of Object.entries(ROOTS))if(document.querySelector(root))return world;return null}
function namesFromText(text=''){return text.split(/•|\n/).map(x=>x.trim()).map(x=>x.replace(/\s*[×x]\s*\d+.*$/i,'').trim()).filter(x=>x&&x.length>1&&x.length<45&&!/wave|ready|bonus|grid|shield|power|matter/i.test(x))}
function advice(name=''){const n=name.toLowerCase();if(/boss|king|queen|overlord|colossus|leviathan|chronophage|tyrant|ancient/.test(n))return['👑 Boss','Strong upgraded towers + support'];if(/cloak|ghost|phase|shadow|stealth/.test(n))return['👻 Sneaky','Detection or wide coverage'];if(/armor|armored|tank|heavy|mammoth|cruiser|rock/.test(n))return['🛡️ Tough','Heavy single-target damage'];if(/fast|runner|raptor|comet|scout|drone/.test(n))return['⚡ Fast','Slow/control + fast firing towers'];if(/split|swarm|pack|hive|carrier/.test(n))return['🐜 Group','Splash or multi-target towers'];if(/emp|virus|hack|glitch/.test(n))return['⚠️ Disruptor','Spread defenses and keep backups'];return['🎯 Enemy','Balanced damage near long road coverage']}
export function EnemyEncounterBook(){const[on,setOn]=useState(()=>enabled()),[book,setBook]=useState(()=>loadBook()),[open,setOpen]=useState(false),[world,setWorld]=useState(()=>currentWorld());
 useEffect(()=>{const refresh=()=>setOn(enabled());window.addEventListener('chrono:save',refresh);return()=>window.removeEventListener('chrono:save',refresh)},[]);
 useEffect(()=>{if(!on)return;const id=setInterval(()=>{const active=currentWorld();setWorld(active);if(!active)return;const[,previewSel]=ROOTS[active],root=document.querySelector(ROOTS[active][0]);const preview=root?.querySelector(previewSel);const found=namesFromText(preview?.textContent??'');if(!found.length)return;setBook(prev=>{const existing=new Set(prev[active]??[]);let changed=false;found.forEach(name=>{if(!existing.has(name)){existing.add(name);changed=true}});if(!changed)return prev;const next={...prev,[active]:[...existing].slice(0,80)};saveBook(next);return next})},900);return()=>clearInterval(id)},[on]);
 const entries=useMemo(()=>world?(book[world]??[]):[],[book,world]);if(!on||!world)return null;return <>{!open&&<button className="enemy-book-launch" onClick={()=>setOpen(true)}>📖 Enemies <small>{entries.length}</small></button>}{open&&<aside className="enemy-book"><header><div><small>{LABELS[world]} ENCOUNTERS</small><b>Enemy Book</b></div><button onClick={()=>setOpen(false)}>×</button></header><p>Enemies appear here after you see them in a wave preview.</p><div className="enemy-book-list">{entries.length?entries.map(name=>{const[type,tip]=advice(name);return <article key={name}><div><b>{name}</b><small>{type}</small></div><span>Best idea: {tip}</span></article>}):<div className="enemy-book-empty">Play a wave to discover your first enemy.</div>}</div><footer><span>💡 You never need to memorize this. Open the book whenever you want a reminder.</span></footer></aside>}</>}

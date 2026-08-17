import React,{useEffect,useMemo,useState}from'react';
import{loadSave}from'../core/save.js';
import{stoneAgeTowers}from'../data/worlds/stoneAge/towers.js';
import{retroTowers}from'../data/worlds/retro/towers.js';
import{futureTowers}from'../data/worlds/future/towers.js';
import{spaceTowers}from'../data/worlds/space/towers.js';
import{riftTowers}from'../data/worlds/timeRift/towers.js';

const TOWERS={'stone-age':stoneAgeTowers,retro:retroTowers,future:futureTowers,space:spaceTowers,'time-rift':riftTowers};
const META={'stone-age':['🪨','Stone Age'],retro:['🕹️','Retro'],future:['🤖','Future'],space:['🚀','Space'],'time-rift':['🌀','Time Rift']};
const PATH=new Set([4,5,6,7,15,23,31,30,29,28,36,44,52,53,54,55]);
function world(){const h=(location.hash||'').replace('#','');return TOWERS[h]?h:'stone-age'}
function junior(){return loadSave()?.settings?.juniorMode!==false}
function costText(t){if(typeof t.cost==='number')return String(t.cost);return Object.entries(t.cost??{}).map(([k,v])=>`${v} ${k}`).join(' • ')}
export function JuniorSandbox(){const[enabled,setEnabled]=useState(()=>junior()),[open,setOpen]=useState(false),[era,setEra]=useState(()=>world()),[selected,setSelected]=useState(null),[placed,setPlaced]=useState({});
 useEffect(()=>{const refresh=()=>{setEnabled(junior());setEra(world())};window.addEventListener('hashchange',refresh);window.addEventListener('chrono:save',refresh);return()=>{window.removeEventListener('hashchange',refresh);window.removeEventListener('chrono:save',refresh)}},[]);
 useEffect(()=>{setSelected(TOWERS[era]?.[0]?.id??null);setPlaced({})},[era]);
 const towers=TOWERS[era]??[],chosen=useMemo(()=>towers.find(t=>t.id===selected),[towers,selected]);if(!enabled)return null;
 const place=i=>{if(PATH.has(i)||!chosen)return;setPlaced(prev=>{const existing=prev[i];if(existing){const level=Math.min(3,(existing.level??1)+1);return{...prev,[i]:{...existing,level}}}return{...prev,[i]:{id:chosen.id,level:1}}})};
 return <>{!open&&<button className="sandbox-launch" onClick={()=>setOpen(true)}>🧪 Practice</button>}{open&&<div className="sandbox-overlay"><section className="sandbox-card"><header><div><small>NO LOSS • UNLIMITED RESOURCES</small><h2>🧪 Practice Lab</h2><p>Try any tower. Tap a placed tower again to level it up. Nothing here changes campaign progress.</p></div><button onClick={()=>setOpen(false)}>×</button></header><div className="sandbox-era-tabs">{Object.entries(META).map(([id,[icon,name]])=><button key={id} className={era===id?'active':''} onClick={()=>setEra(id)}>{icon} {name}</button>)}</div><div className="sandbox-body"><div className="sandbox-board">{Array.from({length:60},(_,i)=>{const p=placed[i],base=p?towers.find(t=>t.id===p.id):null;return <button key={i} disabled={PATH.has(i)} className={`${PATH.has(i)?'path':''} ${p?'occupied':''}`} onClick={()=>place(i)}>{PATH.has(i)?<span className="sandbox-arrow">➜</span>:base?<><span>{base.icon}</span><small>{p.level>1?`L${p.level}`:''}</small></>:''}</button>})}<span className="sandbox-start">START</span><span className="sandbox-home">🏠</span></div><aside className="sandbox-shop"><div className="sandbox-selected">{chosen&&<><span>{chosen.icon}</span><div><b>{chosen.name}</b><small>{chosen.role??chosen.era??'Defense'}</small></div><em>∞</em></>}</div><div className="sandbox-towers">{towers.map(t=><button key={t.id} className={selected===t.id?'selected':''} onClick={()=>setSelected(t.id)}><span>{t.icon}</span><div><b>{t.name}</b><small>{t.role??t.era??'Defense'}</small></div></button>)}</div><div className="sandbox-info"><b>What does this tower do?</b><span>Damage: {chosen?.damage??'Support'}</span><span>Range: {chosen?.range??'—'}</span><span>Speed: {chosen?.fireRate?`${chosen.fireRate}s`:'Support'}</span><span>Normal cost: {chosen?costText(chosen):'—'}</span></div><button className="sandbox-clear" onClick={()=>setPlaced({})}>↻ Clear Practice Map</button></aside></div><footer><span>💡 Practice idea: place the same tower near a corner and on a straight road. Which spot would let it attack longer?</span><button onClick={()=>setOpen(false)}>Back to Game</button></footer></section></div>}</>;
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STARTING_RESOURCES, addResources, canAfford, spend } from '../core/economy.js';
import { chooseTarget, damageVillage, distance, effectiveDamage, towerStats, upgradeCost } from '../core/combat.js';
import { loadSave, persistSave } from '../core/save.js';
import { mapTotems, masteryReward } from '../core/progression.js';
import { unlockedTowerIds } from '../core/unlocks.js';
import { stoneAgeTowers } from '../data/worlds/stoneAge/towers.js';
import { stoneAgeMaps } from '../data/worlds/stoneAge/maps.js';
import { resourceStructures } from '../data/worlds/stoneAge/resourceStructures.js';
import { buildWave, WAVES_PER_MAP } from '../data/worlds/stoneAge/waves.js';
import { cellCenter, getStoneAgeLayout } from '../data/worlds/stoneAge/layouts.js';

const CELLS = Array.from({ length: 60 }, (_, i) => i);
const TARGET_MODES = ['first','strong','closest','last'];
const MAX_VILLAGE_HP = 250;

function resourceIcon(key){ return key==='wood'?'🪵':key==='stone'?'🪨':'🍖'; }
function fmtCost(cost={}){ return Object.entries(cost).map(([k,v])=>`${resourceIcon(k)}${v}`).join(' '); }
function pointAlongPath(path, travel){
  if(!path.length) return {x:0,y:0,progress:0};
  const points=path.map(cellCenter);
  let total=0;
  const lengths=[];
  for(let i=0;i<points.length-1;i++){ const len=distance(points[i],points[i+1]); lengths.push(len); total+=len; }
  if(total<=0) return {...points[0],progress:0};
  let left=Math.max(0,travel);
  for(let i=0;i<lengths.length;i++){
    if(left<=lengths[i]){
      const t=left/lengths[i];
      return { x:points[i].x+(points[i+1].x-points[i].x)*t, y:points[i].y+(points[i+1].y-points[i].y)*t, progress:Math.min(1,travel/total), total };
    }
    left-=lengths[i];
  }
  return {...points.at(-1),progress:1,total};
}
function pathLength(path){
  let total=0; for(let i=0;i<path.length-1;i++) total+=distance(cellCenter(path[i]),cellCenter(path[i+1])); return total;
}

export function StoneAgeGame() {
  const [save,setSave]=useState(()=>loadSave());
  const stoneSave=save.worlds['stone-age'];
  const [mapNumber,setMapNumber]=useState(()=>Math.min(stoneSave.highestMap||1,25));
  const [resources,setResourcesState]=useState({...STARTING_RESOURCES});
  const [villageHp,setVillageHpState]=useState(MAX_VILLAGE_HP);
  const [wave,setWave]=useState(1);
  const [selected,setSelected]=useState('rock-thrower');
  const [placed,setPlacedState]=useState({});
  const [selectedPlaced,setSelectedPlaced]=useState(null);
  const [enemies,setEnemiesState]=useState([]);
  const [running,setRunningState]=useState(false);
  const [paused,setPaused]=useState(false);
  const [speed,setSpeed]=useState(1);
  const [status,setStatus]=useState('ready');
  const [kills,setKills]=useState(0);
  const [message,setMessage]=useState('Build your defenses, then start the first wave.');
  const [drag,setDrag]=useState(null);

  const resourcesRef=useRef(resources); const villageRef=useRef(villageHp); const placedRef=useRef(placed);
  const enemiesRef=useRef(enemies); const runningRef=useRef(running); const pausedRef=useRef(paused);
  const queueRef=useRef([]); const cooldownRef=useRef({}); const waveRef=useRef(wave); const killsRef=useRef(0);
  const orientationBlockedRef=useRef(false); const placeBuildableRef=useRef(null);
  const currentMap=stoneAgeMaps[mapNumber-1];
  const layout=useMemo(()=>getStoneAgeLayout(mapNumber),[mapNumber]);
  const pathSet=useMemo(()=>new Set(layout.path),[layout]);
  const pathTotal=useMemo(()=>pathLength(layout.path),[layout]);
  const unlocked=useMemo(()=>unlockedTowerIds({ completedMap:stoneSave.completedMap, totems:stoneSave.totems }),[stoneSave.completedMap,stoneSave.totems]);
  const allBuildables=useMemo(()=>[...stoneAgeTowers,...resourceStructures],[ ]);

  const syncResources=(next)=>{resourcesRef.current=next; setResourcesState(next);};
  const syncVillage=(next)=>{villageRef.current=next; setVillageHpState(next);};
  const syncPlaced=(next)=>{placedRef.current=next; setPlacedState(next);};
  const syncEnemies=(next)=>{enemiesRef.current=next; setEnemiesState(next);};
  const syncRunning=(next)=>{runningRef.current=next; setRunningState(next);};

  useEffect(()=>{pausedRef.current=paused},[paused]);
  useEffect(()=>{
    const onOrientation=(event)=>{ orientationBlockedRef.current=!!event.detail?.blocked; if(event.detail?.blocked){ pausedRef.current=true; setDrag(null); } else { pausedRef.current=paused; } };
    window.addEventListener('chrono:orientation-block',onOrientation);
    return()=>window.removeEventListener('chrono:orientation-block',onOrientation);
  },[paused]);
  useEffect(()=>{waveRef.current=wave},[wave]);
  useEffect(()=>persistSave(save),[save]);

  const resetBattle=(nextMap=mapNumber)=>{
    setMapNumber(nextMap); syncResources({...STARTING_RESOURCES}); syncVillage(MAX_VILLAGE_HP);
    setWave(1); waveRef.current=1; setSelected('rock-thrower'); syncPlaced({}); setSelectedPlaced(null);
    syncEnemies([]); queueRef.current=[]; cooldownRef.current={}; syncRunning(false); setPaused(false); setStatus('ready');
    killsRef.current=0; setKills(0); setMessage('Build your defenses, then start the first wave.');
  };

  const resourceNodeType=(cell)=>Object.entries(layout.resourceNodes).find(([,cells])=>cells.includes(cell))?.[0] ?? null;

  const placeBuildable=(cell, buildId=selected)=>{
    if(runningRef.current || pathSet.has(cell)) return;
    if(placedRef.current[cell]) { setSelectedPlaced(cell); return; }
    const buildable=allBuildables.find(x=>x.id===buildId); if(!buildable) return;
    const isTower=stoneAgeTowers.some(t=>t.id===buildable.id);
    if(isTower && !unlocked.has(buildable.id)) return;
    const nodeType=resourceNodeType(cell);
    if(!isTower){
      const required=buildable.id==='wood-camp'?'wood':buildable.id==='quarry'?'stone':'food';
      if(nodeType!==required){setMessage(`${buildable.name} must be built on a ${required} resource node.`);return;}
    }
    if(!canAfford(resourcesRef.current,buildable.cost)){setMessage(`Not enough resources for ${buildable.name}.`);return;}
    syncResources(spend(resourcesRef.current,buildable.cost));
    syncPlaced({...placedRef.current,[cell]:{ id:buildable.id, level:1, branch:null, targeting:'first', invested:{...buildable.cost} }});
    setSelectedPlaced(cell); setMessage(`${buildable.name} built.`);
  };

  const completeMap=()=>{
    syncRunning(false); setStatus('won');
    const specialComplete=Object.values(placedRef.current).filter(p=>stoneAgeTowers.some(t=>t.id===p.id)).length<=6;
    const earned=mapTotems({won:true,villageHp:villageRef.current,specialComplete});
    const bossDefeated=currentMap.boss;
    const mastery=masteryReward({kills:killsRef.current,mapNumber,bossDefeated});
    setSave(prev=>{
      const old=prev.worlds['stone-age'];
      const priorBest=old.best?.[currentMap.id]?.totems ?? 0;
      const added=Math.max(0,earned-priorBest);
      const completed=Math.max(old.completedMap,mapNumber);
      const highest=Math.min(25,Math.max(old.highestMap,mapNumber<25?mapNumber+1:25));
      const next={...prev,worlds:{...prev.worlds,'stone-age':{...old,completedMap:completed,highestMap:highest,totems:Math.min(75,old.totems+added),mastery:Math.min(100,old.mastery+mastery),best:{...(old.best||{}),[currentMap.id]:{totems:Math.max(priorBest,earned),villageHp:villageRef.current,kills:killsRef.current}}}}};
      if(mapNumber===25) next.worlds.retro={...next.worlds.retro,unlocked:true};
      return next;
    });
    setMessage(`Victory! ${earned}/3 Totems earned on ${currentMap.name}.`);
  };

  const failMap=()=>{syncRunning(false); queueRef.current=[]; setStatus('lost'); setMessage('The village has fallen. Rebuild and try again.');};

  const finishWave=()=>{
    const gain={wood:0,stone:0,food:0};
    Object.values(placedRef.current).forEach(p=>{
      const s=resourceStructures.find(x=>x.id===p.id); if(s) Object.entries(s.yield).forEach(([k,v])=>gain[k]+=v);
    });
    if(Object.values(gain).some(Boolean)) syncResources(addResources(resourcesRef.current,gain));
    syncRunning(false);
    if(waveRef.current>=WAVES_PER_MAP){ completeMap(); return; }
    const next=waveRef.current+1; waveRef.current=next; setWave(next); setStatus('between');
    setMessage(`Wave cleared.${Object.values(gain).some(Boolean)?` Camps gathered ${fmtCost(gain)}.`:''}`);
  };

  const startWave=()=>{
    if(runningRef.current || status==='won' || status==='lost') return;
    const units=buildWave({mapNumber,waveNumber:waveRef.current});
    queueRef.current=units.map((unit,i)=>({...unit,uid:`${Date.now()}-${i}`,delay:i*650,travel:0,x:cellCenter(layout.path[0]).x,y:cellCenter(layout.path[0]).y,progress:0,dead:false,escaped:false}));
    syncRunning(true); setStatus('running'); setMessage(currentMap.boss && waveRef.current===10 ? '⚠️ BOSS WAVE' : `Wave ${waveRef.current} incoming!`);
  };

  useEffect(()=>{
    const timer=setInterval(()=>{
      if(!runningRef.current || pausedRef.current) return;
      const dt=.05*speed;
      const spawned=[]; const waiting=[];
      queueRef.current.forEach(e=>{ const d=e.delay-dt*1000; if(d<=0) spawned.push({...e,delay:0}); else waiting.push({...e,delay:d}); });
      queueRef.current=waiting;
      let active=[...enemiesRef.current.map(e=>({...e})),...spawned];

      active.forEach(e=>{
        let mult=1;
        for(const [cell,p] of Object.entries(placedRef.current)){
          if(p.id!=='tar-pit') continue;
          const origin=cellCenter(Number(cell)); const pos=pointAlongPath(layout.path,e.travel);
          const stats=towerStats(stoneAgeTowers.find(t=>t.id===p.id),p.level,p.branch);
          if(distance(origin,pos)<=stats.range) mult=Math.min(mult,p.branch==='A'?.42:.62);
        }
        e.travel += e.speed*mult*dt;
        const pos=pointAlongPath(layout.path,e.travel); e.x=pos.x;e.y=pos.y;e.progress=pos.progress;
      });

      for(const [cell,p] of Object.entries(placedRef.current)){
        const base=stoneAgeTowers.find(t=>t.id===p.id); if(!base || base.damage<=0) continue;
        const key=String(cell); cooldownRef.current[key]=(cooldownRef.current[key]??0)-dt; if(cooldownRef.current[key]>0) continue;
        const stats=towerStats(base,p.level,p.branch); const origin=cellCenter(Number(cell));
        const target=chooseTarget(active,origin,stats.range,p.targeting||'first'); if(!target) continue;
        let dmg=effectiveDamage(stats.damage,target);
        if(base.id==='watchtower' && target.boss) dmg=Math.round(dmg*1.35);
        const impacted=(base.id==='boulder-launcher'||base.id==='fire-slinger') ? active.filter(e=>!e.dead&&distance(e,target)<=85) : [target];
        impacted.forEach(e=>{e.hp-=dmg;if(e.hp<=0)e.dead=true;});
        cooldownRef.current[key]=stats.fireRate||1;
      }

      const gains={wood:0,stone:0,food:0}; let killed=0; let hp=villageRef.current;
      const survivors=[];
      active.forEach(e=>{
        if(e.dead || e.hp<=0){killed++;Object.entries(e.reward||{}).forEach(([k,v])=>gains[k]=(gains[k]||0)+v);return;}
        if(e.travel>=pathTotal){e.escaped=true;hp=damageVillage(hp,e);return;}
        survivors.push(e);
      });
      if(killed){killsRef.current+=killed;setKills(killsRef.current);syncResources(addResources(resourcesRef.current,gains));}
      if(hp!==villageRef.current) syncVillage(hp);
      syncEnemies(survivors);
      if(hp<=0){failMap();return;}
      if(queueRef.current.length===0 && survivors.length===0) finishWave();
    },50);
    return()=>clearInterval(timer);
  },[layout,pathTotal,speed,mapNumber,currentMap.id]);

  placeBuildableRef.current=placeBuildable;
  const beginDrag=(event,id,disabled=false)=>{
    if(disabled||runningRef.current||orientationBlockedRef.current)return;
    if(event.pointerType==='mouse'&&event.button!==0)return;
    setSelected(id);
    setDrag({id,x:event.clientX,y:event.clientY,pointerId:event.pointerId});
  };
  useEffect(()=>{
    if(!drag)return;
    const move=(event)=>{ if(event.pointerId!==drag.pointerId)return; setDrag(d=>d?{...d,x:event.clientX,y:event.clientY}:d); };
    const end=(event)=>{
      if(event.pointerId!==drag.pointerId)return;
      const target=document.elementFromPoint(event.clientX,event.clientY)?.closest?.('[data-cell]');
      const cell=target?.dataset?.cell;
      if(cell!=null) placeBuildableRef.current?.(Number(cell),drag.id);
      setDrag(null);
    };
    const cancel=(event)=>{if(event.pointerId===drag.pointerId)setDrag(null)};
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerup',end,{passive:true});
    window.addEventListener('pointercancel',cancel,{passive:true});
    return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',cancel)};
  },[drag?.id,drag?.pointerId]);

  const selectedPlacedData=selectedPlaced!=null?placed[selectedPlaced]:null;
  const selectedBase=selectedPlacedData?allBuildables.find(x=>x.id===selectedPlacedData.id):null;

  const upgradeSelected=()=>{
    if(selectedPlaced==null||!selectedPlacedData||!selectedBase||!stoneAgeTowers.some(t=>t.id===selectedBase.id))return;
    if(selectedPlacedData.level>=3){setMessage('Choose an evolution branch instead.');return;}
    const cost=upgradeCost(selectedBase.cost,selectedPlacedData.level+1); if(!canAfford(resourcesRef.current,cost)){setMessage('Not enough resources to upgrade.');return;}
    syncResources(spend(resourcesRef.current,cost));
    syncPlaced({...placedRef.current,[selectedPlaced]:{...selectedPlacedData,level:selectedPlacedData.level+1,invested:addResources(selectedPlacedData.invested,cost)}});
  };
  const evolveSelected=(branch)=>{
    if(!selectedPlacedData||selectedPlacedData.level<3||selectedPlacedData.branch||!selectedBase)return;
    const cost=upgradeCost(selectedBase.cost,4); if(!canAfford(resourcesRef.current,cost)){setMessage('Not enough resources to evolve.');return;}
    syncResources(spend(resourcesRef.current,cost));
    syncPlaced({...placedRef.current,[selectedPlaced]:{...selectedPlacedData,branch,invested:addResources(selectedPlacedData.invested,cost)}});
    setMessage(`${selectedBase.name} evolved into ${branch==='A'?selectedBase.branchA:selectedBase.branchB}.`);
  };
  const sellSelected=()=>{
    if(selectedPlaced==null||!selectedPlacedData)return; const refund=Object.fromEntries(Object.entries(selectedPlacedData.invested||{}).map(([k,v])=>[k,Math.round(v*.65)]));
    syncResources(addResources(resourcesRef.current,refund)); const next={...placedRef.current};delete next[selectedPlaced];syncPlaced(next);setSelectedPlaced(null);setMessage(`Sold for ${fmtCost(refund)}.`);
  };
  const cycleTargeting=()=>{
    if(!selectedPlacedData||!stoneAgeTowers.some(t=>t.id===selectedPlacedData.id))return;
    const idx=TARGET_MODES.indexOf(selectedPlacedData.targeting||'first');const targeting=TARGET_MODES[(idx+1)%TARGET_MODES.length];
    syncPlaced({...placedRef.current,[selectedPlaced]:{...selectedPlacedData,targeting}});
  };

  return <section className="game-frame">
    <header className="top-hud">
      <div className="brand"><b>CHRONO DEFENSE</b><span>Stone Age • {currentMap.region}</span></div>
      <div className="resource-strip"><span>🪵 {resources.wood}</span><span>🪨 {resources.stone}</span><span>🍖 {resources.food}</span><span className={villageHp<80?'danger':''}>🏕️ {villageHp}/{MAX_VILLAGE_HP}</span><span>🌊 {wave}/{WAVES_PER_MAP}</span><span>💀 {kills}</span></div>
      <div className="battle-actions">
        <button onClick={()=>setPaused(p=>!p)} disabled={!running}>{paused?'▶':'⏸'}</button>
        <button onClick={()=>setSpeed(s=>s===1?2:s===2?3:1)}>{speed}×</button>
        <button className="wave-button" onClick={startWave} disabled={running||status==='won'||status==='lost'}>{running?'Wave Active':wave===1?'Start Wave':`Start Wave ${wave}`}</button>
      </div>
    </header>

    <div className="game-body">
      <div className="board-wrap">
        <div className="map-title"><div><b>{currentMap.icon} Map {mapNumber}: {currentMap.name}</b><small>{currentMap.mechanic}</small></div><div className="map-nav"><button disabled={mapNumber<=1||running} onClick={()=>resetBattle(mapNumber-1)}>‹</button><span>🗿 {stoneSave.totems}/75 • Mastery {stoneSave.mastery}/100</span><button disabled={mapNumber>=Math.min(stoneSave.highestMap,25)||running} onClick={()=>resetBattle(mapNumber+1)}>›</button></div></div>
        <div className="battle-message">{message}</div>
        <div className="board" aria-label="Stone Age battlefield">
          {CELLS.map(cell=>{
            const p=placed[cell]; const item=p?allBuildables.find(t=>t.id===p.id):null; const node=resourceNodeType(cell);
            return <button key={cell} aria-label={`cell ${cell}`} data-cell={cell} className={`cell ${pathSet.has(cell)?'path':''} ${item?'occupied':''} ${selectedPlaced===cell?'selected-cell':''} ${node?'resource-node':''}`} onClick={()=>placeBuildable(cell)}>
              {item ? <span className="placed-icon" title={item.name}>{item.icon}<small>{p.level>1?`L${p.level}`:''}{p.branch?` ${p.branch}`:''}</small></span> : pathSet.has(cell) ? <span className="path-mark">•</span> : node ? <span className="node-mark">{resourceIcon(node)}</span> : null}
            </button>
          })}
          {enemies.map(e=><div key={e.uid} className={`enemy ${e.boss?'boss':''}`} style={{left:`${e.x/12}%`,top:`${e.y/5}%`}} title={`${e.name} ${Math.max(0,Math.ceil(e.hp))}/${e.maxHp}`}><span>{e.boss?'👑':e.tier>14?'🦖':e.tier>8?'🐘':'🐾'}</span><i><b style={{width:`${Math.max(0,e.hp/e.maxHp*100)}%`}}/></i></div>)}
          <div className="village">🏕️<small>Village</small></div>
          {selectedPlacedData&&stoneAgeTowers.some(t=>t.id===selectedPlacedData.id)&&(()=>{const s=towerStats(stoneAgeTowers.find(t=>t.id===selectedPlacedData.id),selectedPlacedData.level,selectedPlacedData.branch);const c=cellCenter(Number(selectedPlaced));return <div className="range-ring" style={{left:`${c.x/12}%`,top:`${c.y/5}%`,width:`${s.range/6}%`,aspectRatio:'1'}}/>})()}
        </div>
        <div className="objective-strip"><span>🗿 Complete map</span><span>🗿 Village ≥75%</span><span>🗿 Use ≤6 combat towers</span>{currentMap.boss&&<strong>👑 Boss map</strong>}</div>
      </div>

      <aside className="tower-panel">
        <div className="panel-heading"><div><b>Stone Age Build Menu</b><small>Tap an item, then a build tile</small></div><span>Map {stoneSave.highestMap}/25</span></div>
        <div className="tower-grid">
          {stoneAgeTowers.map(t=>{const locked=!unlocked.has(t.id);const affordable=canAfford(resources,t.cost);return <button key={t.id} className={`tower-card ${selected===t.id?'selected':''}`} disabled={locked} onPointerDown={e=>beginDrag(e,t.id,locked)} onClick={()=>setSelected(t.id)}><span className="tower-icon">{t.icon}</span><span className="tower-copy"><b>{t.name}</b><small>{locked?'🔒 Locked':t.role}</small></span><span className={`cost ${!affordable?'poor':''}`}>{fmtCost(t.cost)}</span></button>})}
        </div>
        <div className="economy-heading">Resource Camps</div>
        <div className="economy-grid">{resourceStructures.map(s=><button key={s.id} className={`economy-card ${selected===s.id?'selected':''}`} onPointerDown={e=>beginDrag(e,s.id,false)} onClick={()=>setSelected(s.id)}><span>{s.icon}</span><b>{s.name}</b><small>{fmtCost(s.cost)}</small></button>)}</div>

        {selectedPlacedData&&selectedBase ? <div className="selected-info placed-info">
          <div className="selected-title"><b>{selectedBase.icon} {selectedBase.name}</b><button onClick={()=>setSelectedPlaced(null)}>×</button></div>
          {stoneAgeTowers.some(t=>t.id===selectedBase.id)?<>
            <span>Level {selectedPlacedData.level}{selectedPlacedData.branch?` • ${selectedPlacedData.branch==='A'?selectedBase.branchA:selectedBase.branchB}`:''}</span>
            <small>{(()=>{const s=towerStats(selectedBase,selectedPlacedData.level,selectedPlacedData.branch);return `DMG ${s.damage} • RNG ${s.range} • ${s.fireRate}s`})()}</small>
            <div className="tower-actions"><button onClick={upgradeSelected} disabled={selectedPlacedData.level>=3}>Upgrade</button><button onClick={cycleTargeting}>Target: {selectedPlacedData.targeting}</button><button className="sell" onClick={sellSelected}>Sell</button></div>
            {selectedPlacedData.level>=3&&!selectedPlacedData.branch&&<div className="branch-actions"><button onClick={()=>evolveSelected('A')}>{selectedBase.branchA}</button><button onClick={()=>evolveSelected('B')}>{selectedBase.branchB}</button></div>}
          </>:<><span>{selectedBase.description}</span><small>Produces {fmtCost(selectedBase.yield)} after every cleared wave.</small><button className="sell-resource" onClick={sellSelected}>Remove / Sell</button></>}
        </div> : <div className="selected-info">{(()=>{const t=allBuildables.find(x=>x.id===selected);return <><b>{t.icon} {t.name}</b><span>{t.role} {t.damage!=null?`• DMG ${t.damage} • RNG ${t.range}`:''}</span><small>{t.branchA?`Branches: ${t.branchA} / ${t.branchB}`:t.description}</small></>})()}</div>}
      </aside>
    </div>

    {drag&&<div className="drag-ghost" style={{left:drag.x,top:drag.y}}>{allBuildables.find(x=>x.id===drag.id)?.icon}<small>{allBuildables.find(x=>x.id===drag.id)?.name}</small></div>}
    {(status==='won'||status==='lost')&&<div className="result-overlay"><div className="result-card"><div className="result-icon">{status==='won'?'🗿':'💀'}</div><h2>{status==='won'?'Village Defended!':'Village Lost'}</h2><p>{message}</p><div><button onClick={()=>resetBattle(mapNumber)}>Replay</button>{status==='won'&&mapNumber<25&&<button onClick={()=>resetBattle(mapNumber+1)}>Next Map →</button>}</div></div></div>}
  </section>
}

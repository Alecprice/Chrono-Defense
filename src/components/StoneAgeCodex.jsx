import React, { useMemo, useState } from 'react';
import { stoneAgeTowers } from '../data/worlds/stoneAge/towers.js';
import { stoneAgeEnemies } from '../data/worlds/stoneAge/enemies.js';
import { stoneAgeBosses } from '../data/worlds/stoneAge/bosses.js';
import { unlockedTowerIds } from '../core/unlocks.js';

const tabs=[['towers','🛖 Towers'],['enemies','🐾 Enemies'],['bosses','👑 Bosses']];

function traitLabels(enemy){
  const labels=[];
  if(enemy.flying)labels.push('Flying');
  if((enemy.armor??0)>=.35)labels.push('Armored');
  if(enemy.regenPercent)labels.push('Regeneration');
  if(enemy.ability==='heal')labels.push('Healer');
  if(enemy.packHaste||enemy.auraSpeed)labels.push('Pack Leader');
  if(enemy.slowResistance)labels.push('Slow Resistant');
  if(enemy.fireResistance)labels.push('Fire Resistant');
  if(enemy.berserkAt)labels.push('Berserk');
  return labels;
}

export function StoneAgeCodex({stoneSave,onClose}){
  const [tab,setTab]=useState('towers');
  const unlocked=useMemo(()=>unlockedTowerIds({completedMap:stoneSave.completedMap,totems:stoneSave.totems}),[stoneSave.completedMap,stoneSave.totems]);
  return <div className="codex-overlay" onClick={onClose}>
    <div className="codex" onClick={event=>event.stopPropagation()}>
      <header className="codex-head"><div><small>STONE AGE FIELD GUIDE</small><h2>Tribal Knowledge</h2></div><button onClick={onClose}>×</button></header>
      <nav className="codex-tabs">{tabs.map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</nav>
      <div className="codex-body">
        {tab==='towers'&&<div className="codex-grid towers">{stoneAgeTowers.map(tower=>{
          const isUnlocked=unlocked.has(tower.id);
          return <article key={tower.id} className={`codex-entry ${isUnlocked?'':'locked'}`}>
            <div className="codex-icon">{isUnlocked?tower.icon:'🔒'}</div>
            <div className="codex-copy"><small>{tower.role}</small><h3>{isUnlocked?tower.name:'Unknown Defense'}</h3>{isUnlocked&&<><p>DMG {tower.damage} • RNG {tower.range} • {tower.fireRate}s</p><div className="branch-guide"><span><b>↙ {tower.branchA}</b><small>{tower.branchADescription}</small></span><span><b>↘ {tower.branchB}</b><small>{tower.branchBDescription}</small></span></div></>}</div>
          </article>
        })}</div>}
        {tab==='enemies'&&<div className="codex-grid enemies">{stoneAgeEnemies.map(enemy=>{
          const traits=traitLabels(enemy);
          return <article key={enemy.id} className="codex-entry compact"><div className="codex-icon">{enemy.flying?'🦅':enemy.id.includes('mammoth')?'🐘':enemy.id.includes('raptor')||enemy.id.includes('dinosaur')||enemy.id.includes('trex')?'🦖':'🐾'}</div><div className="codex-copy"><small>Tier {enemy.tier}</small><h3>{enemy.name}</h3><p>HP {enemy.hp} • Speed {enemy.speed} • Armor {Math.round((enemy.armor??0)*100)}% • Village DMG {enemy.villageDamage}</p><div className="trait-chips">{traits.length?traits.map(trait=><span key={trait}>{trait}</span>):<span>Basic</span>}</div></div></article>
        })}</div>}
        {tab==='bosses'&&<div className="codex-grid bosses">{stoneAgeBosses.map(boss=><article key={boss.id} className="codex-entry boss-entry"><div className="codex-icon">👑</div><div className="codex-copy"><small>Map {boss.map} Boss</small><h3>{boss.name}</h3><p>HP {boss.hp.toLocaleString()} • Speed {boss.speed} • Armor {Math.round((boss.armor??0)*100)}%</p><strong>{boss.mechanic}</strong></div></article>)}</div>}
      </div>
    </div>
  </div>
}

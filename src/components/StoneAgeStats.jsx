import React, { useMemo } from 'react';
import { stoneAgeTowers } from '../data/worlds/stoneAge/towers.js';
import { stoneAgeModes } from '../data/worlds/stoneAge/modes.js';
import { milestoneProgress } from '../data/worlds/stoneAge/milestones.js';

function number(value=0){return Number(value||0).toLocaleString()}

export function StoneAgeStats({stoneSave,onClose}){
  const stats=stoneSave.stats??{};
  const milestones=useMemo(()=>milestoneProgress(stoneSave),[stoneSave]);
  const towerRows=useMemo(()=>stoneAgeTowers.map(tower=>({tower,kills:stats.towerKills?.[tower.id]??0})).sort((a,b)=>b.kills-a.kills),[stats.towerKills]);
  const modeRows=useMemo(()=>stoneAgeModes.filter(mode=>mode.id!=='normal').map(mode=>({mode,wins:stats.modeWins?.[mode.name]??0})),[stats.modeWins]);
  const totalModeWins=modeRows.reduce((sum,row)=>sum+row.wins,0);
  const totalStructures=stats.structuresBuilt??0;
  const favorite=towerRows[0]?.kills>0?towerRows[0]:null;

  return <div className="profile-overlay" onClick={onClose}>
    <section className="profile-panel" onClick={event=>event.stopPropagation()}>
      <header className="profile-head"><div><small>STONE AGE TRIBAL RECORD</small><h2>Chronicle Statistics</h2></div><button onClick={onClose}>×</button></header>
      <div className="profile-summary">
        <div><b>🗺️ {stoneSave.completedMap??0}/25</b><small>Campaign Maps</small></div>
        <div><b>🗿 {stoneSave.totems??0}/75</b><small>Totems</small></div>
        <div><b>🔥 {stoneSave.mastery??0}/100</b><small>Mastery</small></div>
        <div><b>🏆 {(stoneSave.achievements??[]).length}/100</b><small>Achievements</small></div>
        <div><b>⚔️ {number(stats.kills)}</b><small>Enemies Defeated</small></div>
        <div><b>🌊 {number(stats.wavesCleared)}</b><small>Waves Cleared</small></div>
        <div><b>👑 {number(stats.bossesDefeated)}</b><small>Bosses Defeated</small></div>
        <div><b>✨ {number(stats.flawlessMaps)}</b><small>Flawless Wins</small></div>
      </div>

      <div className="profile-grid">
        <article className="profile-card"><div className="profile-card-head"><b>🛖 Tower Record</b><span>{favorite?`${favorite.tower.icon} ${favorite.tower.name}`:'No favorite yet'}</span></div><div className="tower-record-list">{towerRows.map(({tower,kills})=><div key={tower.id}><span>{tower.icon} {tower.name}</span><b>{number(kills)}</b></div>)}</div></article>
        <article className="profile-card"><div className="profile-card-head"><b>🎯 Challenge Modes</b><span>{number(totalModeWins)} total wins</span></div><div className="mode-record-list">{modeRows.map(({mode,wins})=><div key={mode.id}><span>{mode.icon} {mode.name}</span><b>{number(wins)}</b></div>)}</div></article>
        <article className="profile-card"><div className="profile-card-head"><b>🪵 Village Economy</b></div><div className="record-big"><b>{number(stats.resourcesCollected)}</b><span>resources collected</span></div><div className="record-big"><b>{number(totalStructures)}</b><span>structures built</span></div><div className="record-big"><b>{number(stats.upgrades)}</b><span>upgrades purchased</span></div></article>
        <article className="profile-card"><div className="profile-card-head"><b>🏅 Milestones</b><span>{milestones.unlocked.length}/{milestones.total}</span></div><div className="milestone-list">{milestones.unlocked.slice(-5).reverse().map(item=><div key={item.id}><span>{item.icon}</span><div><b>{item.label}</b><small>{item.description}</small></div></div>)}{milestones.next&&<div className="next-milestone"><span>🔒</span><div><b>Next: {milestones.next.label}</b><small>{milestones.next.description}</small></div></div>}</div></article>
      </div>
    </section>
  </div>
}

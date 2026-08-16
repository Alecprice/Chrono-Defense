import React, { useMemo } from 'react';
import { stoneAgeMaps } from '../data/worlds/stoneAge/maps.js';
import { stoneAgeModes } from '../data/worlds/stoneAge/modes.js';
import { stoneAgeTowers } from '../data/worlds/stoneAge/towers.js';
import { getStoneAgeLayout } from '../data/worlds/stoneAge/layouts.js';
import { getStoneAgeEnvironment } from '../data/worlds/stoneAge/environment.js';
import { nextTowerUnlock } from '../core/unlocks.js';
import { milestoneProgress } from '../data/worlds/stoneAge/milestones.js';
import { StoneAgeVillage } from './StoneAgeVillage.jsx';
import { DailyChallengeCard } from './DailyChallengeCard.jsx';

const regions=['Green Valley','Wild Jungle','Frozen Age','Burning Lands','Lost World'];

export function StoneAgeCampaign({ save, selectedMap, setSelectedMap, selectedMode, setSelectedMode, onStart, onAchievements, onCodex, onSettings, onStats, onSaveTools, onDaily }) {
  const stone=save.worlds['stone-age'];
  const map=stoneAgeMaps[selectedMap-1];
  const mode=stoneAgeModes.find(item=>item.id===selectedMode)??stoneAgeModes[0];
  const environment=useMemo(()=>getStoneAgeEnvironment(map,getStoneAgeLayout(selectedMap)),[map,selectedMap]);
  const unlockedModeIds=useMemo(()=>new Set(stoneAgeModes.filter(item=>item.unlock(stone)).map(item=>item.id)),[stone]);
  const nextUnlock=useMemo(()=>nextTowerUnlock({completedMap:stone.completedMap,totems:stone.totems}),[stone.completedMap,stone.totems]);
  const milestones=useMemo(()=>milestoneProgress(stone),[stone]);
  const nextTower=nextUnlock?stoneAgeTowers.find(tower=>tower.id===nextUnlock.id):null;
  const completed=Math.max(0,stone.completedMap??0);
  const progress=Math.round(completed/25*100);

  return <section className="campaign-screen">
    <header className="campaign-header">
      <div className="campaign-brand"><span className="era-mark">🪨</span><div><small>CHRONO DEFENSE</small><h1>STONE AGE</h1><p>Defend the first village. Survive the beginning of time.</p></div></div>
      <div className="campaign-stats">
        <span><b>🗿 {stone.totems}/75</b><small>Totems</small></span>
        <span><b>🔥 {stone.mastery}/100</b><small>Mastery</small></span>
        <span><b>🏆 {(stone.achievements??[]).length}/100</b><small>Achievements</small></span>
        <button onClick={onStats}>Tribal Record</button>
        <button onClick={onCodex}>Field Guide</button>
        <button onClick={onAchievements}>Achievements</button>
        <button onClick={onSaveTools}>Save</button>
        <button onClick={onSettings}>⚙</button>
      </div>
    </header>

    <div className="era-road" aria-label="Chrono Defense eras">
      <div className="era active"><b>🪨 Stone Age</b><small>{progress}% complete</small></div>
      <div className={`era ${save.worlds.retro?.unlocked?'available':'locked'}`}><b>🕹️ Retro</b><small>{save.worlds.retro?.unlocked?'Unlocked':'Locked'}</small></div>
      <div className="era locked"><b>🤖 Future</b><small>Locked</small></div>
      <div className="era locked"><b>🚀 Space</b><small>Locked</small></div>
      <div className="era locked secret"><b>🌀 ???</b><small>Unknown</small></div>
    </div>

    <main className="campaign-main">
      <div className="map-panel">
        <DailyChallengeCard stoneSave={stone} onLaunch={onDaily}/>
        <div className="section-title"><div><b>Stone Age Campaign</b><small>25 maps • 5 regions • 5 bosses</small></div><span>{completed}/25 cleared</span></div>
        <div className="region-strip">{regions.map((region,index)=><span key={region} className={map.region===region?'active':''}>{index===0?'🌿':index===1?'🌴':index===2?'❄️':index===3?'🌋':'🦖'} {region}</span>)}</div>
        <div className="map-grid">{stoneAgeMaps.map(item=>{
          const locked=item.number>(stone.highestMap??1);
          const best=stone.best?.[item.id]?.totems??0;
          return <button key={item.id} disabled={locked} className={`map-card ${selectedMap===item.number?'selected':''} ${item.boss?'boss-map':''}`} onClick={()=>setSelectedMap(item.number)}>
            <span className="map-number">{locked?'🔒':item.number}</span>
            <b>{item.icon} {item.name}</b>
            <small>{item.mechanic}</small>
            <em>{item.boss?'👑 Boss ':''}{best?`🗿`.repeat(best):'○○○'}</em>
          </button>
        })}</div>
      </div>

      <aside className="campaign-side">
        <StoneAgeVillage completedMap={completed}/>

        <div className="milestone-strip"><div><small>CHRONICLE MILESTONES</small><b>{milestones.unlocked.length}/{milestones.total}</b></div><span>{milestones.next?`${milestones.next.icon} Next: ${milestones.next.label}`:'🏆 All Stone Age milestones complete'}</span></div>

        {nextTower&&<div className="next-unlock-card"><span>{nextTower.icon}</span><div><small>NEXT TOWER UNLOCK</small><b>{nextTower.name}</b><p>{nextUnlock.label}</p></div></div>}

        <div className="selected-map-card">
          <div className="selected-map-art">{map.icon}{map.boss?'👑':''}</div>
          <div><small>MAP {map.number} • {map.region}</small><h2>{map.name}</h2><p>{map.mechanic}</p></div>
          <div className="environment-preview">
            <div><b>{environment.icon} {environment.name}</b><small>{environment.summary}</small></div>
            <div className="hazard-chips">{environment.hazards.map(hazard=><span key={hazard}>{hazard}</span>)}</div>
          </div>
          <div className="bonus-challenge">⚔️ <b>Bonus challenge:</b> {map.bonusObjective}</div>
          <div className="totem-objectives">{map.totems.map((objective,index)=><span key={objective}>🗿 <b>{index+1}</b> {objective}</span>)}</div>
        </div>

        <div className="mode-panel">
          <div className="section-title"><div><b>Game Mode</b><small>Challenge rules change the battle</small></div></div>
          <div className="mode-grid">{stoneAgeModes.map(item=>{
            const unlocked=unlockedModeIds.has(item.id);
            return <button key={item.id} disabled={!unlocked} className={`mode-card ${selectedMode===item.id?'selected':''}`} onClick={()=>setSelectedMode(item.id)}>
              <span>{unlocked?item.icon:'🔒'}</span><div><b>{item.name}</b><small>{unlocked?item.description:'Keep progressing to unlock.'}</small></div>
            </button>
          })}</div>
        </div>

        <div className="launch-card">
          <div><b>{mode.icon} {mode.name}</b><small>{mode.waves} waves • {map.boss?'Boss encounter':'Standard map'} • {environment.name}</small></div>
          <button className="launch-button" onClick={onStart}>Enter Battle →</button>
        </div>
      </aside>
    </main>
  </section>
}

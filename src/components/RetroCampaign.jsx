import React from 'react';
import { retroMaps } from '../data/worlds/retro/maps.js';

const zones=['Starter Arcade','Neon District','System Core','Championship','Final Cabinet'];

export function RetroCampaign({save,selectedMap,setSelectedMap,onStart,onBack}){
 const retro=save.worlds.retro;const map=retroMaps[selectedMap-1];const complete=retro.completedMap??0;
 return <section className="retro-campaign">
  <header className="retro-header">
   <div><small>CHRONO DEFENSE • ERA II</small><h1>🕹️ RETRO TOWER DEFENSE</h1><p>Insert coin. Protect the cabinet. Chase the high score.</p></div>
   <div className="retro-counters"><span>📼 {retro.cartridges??0}/75</span><span>🏆 {retro.highScore??0}</span><span>🔥 x{retro.bestCombo??1}</span><button onClick={onBack}>← Stone Age</button></div>
  </header>
  <div className="retro-zone-strip">{zones.map(zone=><span key={zone} className={map.zone===zone?'active':''}>{zone}</span>)}</div>
  <main className="retro-campaign-body">
   <div className="retro-map-grid">{retroMaps.map(item=>{const locked=item.number>(retro.highestMap??1);const best=retro.best?.[item.id];return <button key={item.id} disabled={locked} className={`retro-map-card ${selectedMap===item.number?'selected':''} ${item.boss?'boss':''}`} onClick={()=>setSelectedMap(item.number)}><strong>{locked?'🔒':String(item.number).padStart(2,'0')}</strong><b>{item.icon} {item.name}</b><small>{item.mechanic}</small><em>{item.boss?'👑 ':''}{best?.cartridges?'📼'.repeat(best.cartridges):'○○○'}</em></button>})}</div>
   <aside className="retro-side">
    <div className="retro-progress"><small>ARCADE PROGRESS</small><b>{complete}/25 cabinets cleared</b><div><i style={{width:`${Math.round(complete/25*100)}%`}}/></div></div>
    <div className="retro-selected"><div className="retro-art">{map.icon}{map.boss?'👑':''}</div><small>MAP {map.number} • {map.zone}</small><h2>{map.name}</h2><p>{map.mechanic}</p><div className="retro-objectives">{map.cartridges.map((goal,index)=><span key={goal}>📼 {index+1}. {goal}</span>)}</div><div className="retro-bonus">⭐ Bonus: {map.bonusObjective}</div></div>
    <div className="retro-rules"><b>ARCADE RULES</b><span>🪙 Coins buy defenses.</span><span>❤️ Three lives, each with 100 HP.</span><span>🔥 Fast kills raise your combo multiplier.</span><span>💥 Taking base damage breaks your combo.</span></div>
    <button className="retro-launch" onClick={onStart}>INSERT COIN • START →</button>
   </aside>
  </main>
 </section>;
}

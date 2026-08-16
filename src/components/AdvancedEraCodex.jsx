import React,{useState}from'react';
import{AssetSprite}from'./AssetSprite.jsx';

export function AdvancedEraCodex({worldId,title,subtitle,towers,enemies,bosses,onClose}){
 const[tab,setTab]=useState('towers');
 return <div className="advanced-codex-overlay" onClick={onClose}><div className={`advanced-codex ${worldId}`} onClick={e=>e.stopPropagation()}>
  <header><div><small>{subtitle}</small><h2>{title}</h2></div><button onClick={onClose}>×</button></header>
  <nav><button className={tab==='towers'?'active':''} onClick={()=>setTab('towers')}>Towers</button><button className={tab==='enemies'?'active':''} onClick={()=>setTab('enemies')}>Enemies</button><button className={tab==='bosses'?'active':''} onClick={()=>setTab('bosses')}>Bosses</button></nav>
  <main>
   {tab==='towers'&&<div className="advanced-codex-grid">{towers.map(t=><article key={t.id}><div className="advanced-codex-icon"><AssetSprite world={worldId} kind="towers" id={t.id} fallback={t.icon} alt={t.name}/></div><div><small>{t.role}</small><h3>{t.name}</h3><p>DMG {t.damage} • RNG {t.range} • {t.fireRate}s {t.power!=null?`• ${t.power<0?'+':'-'}${Math.abs(t.power)}⚡`:''}{t.energy!=null?` • ${t.energy} Energy`:''}</p>{t.branchA&&<div className="advanced-branches"><span><b>↙ {t.branchA}</b><em>{t.branchADescription}</em></span><span><b>↘ {t.branchB}</b><em>{t.branchBDescription}</em></span></div>}</div></article>)}</div>}
   {tab==='enemies'&&<div className="advanced-codex-grid">{enemies.map(e=>{const traits=[];if(e.cloaked||e.stealth)traits.push('Stealth');if(e.hacker)traits.push('Hacker');if(e.emp)traits.push('EMP');if(e.healer)traits.push('Repair');if(e.shield||e.shieldHp)traits.push('Shielded');if(e.phase)traits.push('Phase');if(e.regen)traits.push('Regeneration');if(e.spawns)traits.push('Carrier');if(e.gravityResist)traits.push('Gravity Resistant');return <article key={e.id}><div className="advanced-codex-icon"><AssetSprite world={worldId} kind="enemies" id={e.id} fallback={e.icon} alt={e.name}/></div><div><small>Tier {e.tier}</small><h3>{e.name}</h3><p>HP {e.hp} • Speed {e.speed} • Armor {Math.round((e.armor??0)*100)}%</p><div className="advanced-traits">{traits.length?traits.map(x=><span key={x}>{x}</span>):<span>Standard</span>}</div></div></article>})}</div>}
   {tab==='bosses'&&<div className="advanced-codex-grid bosses">{bosses.map(b=><article key={b.id}><div className="advanced-codex-icon"><AssetSprite world={worldId} kind="bosses" id={b.id} fallback={b.icon} alt={b.name}/></div><div><small>Map {b.map} Boss</small><h3>{b.name}</h3><p>HP {b.hp.toLocaleString()} • Speed {b.speed} • Armor {Math.round((b.armor??0)*100)}%</p><strong>{b.mechanic}</strong></div></article>)}</div>}
  </main>
 </div></div>
}

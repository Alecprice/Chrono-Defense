import React,{useMemo,useState}from'react';

const WORLD_INFO={
  'stone-age':{icon:'🪨',name:'Stone Age',accent:'stone'},
  retro:{icon:'🕹️',name:'Retro',accent:'retro'},
  future:{icon:'🤖',name:'Future',accent:'future'},
  space:{icon:'🚀',name:'Space',accent:'space'},
  'time-rift':{icon:'🌀',name:'Time Rift',accent:'rift'},
};

function statRows(worldId,checkpoint={}){
  if(worldId==='stone-age')return[{icon:'🏕️',label:'Village',value:`${checkpoint.villageHp??250}/250 HP`}];
  if(worldId==='retro')return[
    {icon:'❤️',label:'Arcade Base',value:`${checkpoint.baseHp??100}/100 HP`},
    {icon:'🧡',label:'Lives',value:String(checkpoint.lives??3)},
  ];
  if(worldId==='future')return[
    {icon:'💙',label:'Core',value:`${checkpoint.core??200}/200`},
    {icon:'🛡️',label:'Shield',value:String(checkpoint.shield??250)},
  ];
  if(worldId==='space')return[
    {icon:'🏙️',label:'Colony',value:`${checkpoint.colony??100}/100`},
    {icon:'🛡️',label:'Shield',value:String(checkpoint.shield??500)},
  ];
  return[{icon:'🧭',label:'Stability',value:`${checkpoint.stability??1000}/1000`}];
}

function savedAgo(savedAt){
  const ms=Date.now()-(Number(savedAt)||Date.now());
  const mins=Math.max(0,Math.floor(ms/60000));
  if(mins<1)return'just now';
  if(mins===1)return'1 minute ago';
  if(mins<60)return`${mins} minutes ago`;
  const hours=Math.floor(mins/60);
  return hours===1?'1 hour ago':`${hours} hours ago`;
}

export function ResumeBattlePrompt({worldId,checkpoint,onContinue,onFresh,onCampaign}){
  const[confirmFresh,setConfirmFresh]=useState(false);
  const info=WORLD_INFO[worldId]??WORLD_INFO['stone-age'];
  const stats=useMemo(()=>statRows(worldId,checkpoint),[worldId,checkpoint]);
  const wave=checkpoint?.wave??1;
  const mapNumber=checkpoint?.mapNumber??1;
  return <section className={`resume-battle-screen resume-${info.accent}`} aria-labelledby="resume-battle-title">
    <div className="resume-battle-card">
      <div className="resume-save-badge">💾 SAFE!</div>
      <div className="resume-era-icon" aria-hidden="true">{info.icon}</div>
      <small>{info.name.toUpperCase()} • MAP {mapNumber}</small>
      <h1 id="resume-battle-title">We saved your game!</h1>
      <p>Your battle is right where you left it. Nothing was lost.</p>
      <div className="resume-battle-details">
        <div className="resume-wave"><span>🌊</span><div><small>CURRENT WAVE</small><b>{wave}</b></div></div>
        {stats.map(item=><div className="resume-stat" key={item.label}><span>{item.icon}</span><div><small>{item.label}</small><b>{item.value}</b></div></div>)}
      </div>
      <small className="resume-saved-time">Last saved {savedAgo(checkpoint?.savedAt)}</small>
      {!confirmFresh?<div className="resume-actions">
        <button className="resume-continue" onClick={onContinue}>▶ Continue Battle</button>
        <button className="resume-fresh" onClick={()=>setConfirmFresh(true)}>↻ Start Fresh</button>
        {onCampaign&&<button className="resume-campaign" onClick={onCampaign}>⌂ Back to Map</button>}
      </div>:<div className="resume-confirm" role="alert">
        <b>Start this map over?</b>
        <p>This will erase only this unfinished battle. Your unlocked maps and rewards stay safe.</p>
        <div><button onClick={()=>setConfirmFresh(false)}>No, keep it</button><button className="resume-confirm-fresh" onClick={onFresh}>Yes, start over</button></div>
      </div>}
      <div className="resume-tip">💡 Restored battles open paused. Tap ▶ when you are ready.</div>
    </div>
  </section>;
}

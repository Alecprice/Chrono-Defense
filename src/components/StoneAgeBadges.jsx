import React from 'react';

const badges=[
  {id:'valley',icon:'🌿',name:'Valley Guardian',requirement:5},
  {id:'jungle',icon:'🌴',name:'Jungle Survivor',requirement:10},
  {id:'frozen',icon:'❄️',name:'Frozen Conqueror',requirement:15},
  {id:'burning',icon:'🌋',name:'Volcano Victor',requirement:20},
  {id:'lost',icon:'🦖',name:'Lost World Legend',requirement:25},
];

export function StoneAgeBadges({completedMap=0}){
  return <div className="region-badges"><div className="region-badges-head"><small>REGION TROPHIES</small><b>{badges.filter(item=>completedMap>=item.requirement).length}/{badges.length}</b></div><div className="region-badge-grid">{badges.map(item=>{const unlocked=completedMap>=item.requirement;return <div key={item.id} className={unlocked?'unlocked':'locked'} title={unlocked?item.name:`Clear map ${item.requirement} to unlock`}><span>{unlocked?item.icon:'🔒'}</span><small>{unlocked?item.name:`Map ${item.requirement}`}</small></div>})}</div></div>
}

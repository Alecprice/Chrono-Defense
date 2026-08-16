import React from 'react';

const STAGES = [
  { min:0, name:'First Camp', icon:'🔥', scene:['⛺','🔥','⛺'], description:'A few families gather around the first fire.' },
  { min:5, name:'Young Village', icon:'🛖', scene:['🛖','🔥','🛖','🌾'], description:'Permanent huts and food stores begin to appear.' },
  { min:10, name:'Growing Tribe', icon:'🏕️', scene:['🛖','🛖','🪵','🗼','🌾'], description:'The tribe expands with storage, hunters and lookout posts.' },
  { min:15, name:'Fortified Village', icon:'🛡️', scene:['🪵','🗼','🛖','🛖','🗼','🪵'], description:'Palisades and watch posts guard a thriving settlement.' },
  { min:20, name:'Great Stone Age Settlement', icon:'🗿', scene:['🗿','🗼','🏕️','🛖','🛖','🗼','🗿'], description:'The village has become the heart of an ancient civilization.' },
  { min:25, name:'Cradle of Civilization', icon:'👑', scene:['🗿','🗼','🏛️','🔥','🏛️','🗼','🗿'], description:'Stone Age mastered. The path toward a new era is open.' },
];

export function villageStage(completedMap=0){
  return [...STAGES].reverse().find(stage=>completedMap>=stage.min)??STAGES[0];
}

export function StoneAgeVillage({completedMap=0}){
  const stage=villageStage(completedMap);
  const next=STAGES.find(item=>item.min>completedMap);
  const progress=next?Math.max(0,Math.min(100,Math.round((completedMap-stage.min)/(next.min-stage.min)*100))):100;
  return <section className="village-hub">
    <div className="village-hub-copy"><small>YOUR SETTLEMENT</small><h3>{stage.icon} {stage.name}</h3><p>{stage.description}</p></div>
    <div className="village-scene" aria-label={stage.name}>{stage.scene.map((item,index)=><span key={`${item}-${index}`}>{item}</span>)}</div>
    <div className="village-progress"><i><b style={{width:`${progress}%`}}/></i><small>{next?`${next.min-completedMap} map${next.min-completedMap===1?'':'s'} until ${next.name}`:'Stone Age settlement complete'}</small></div>
  </section>
}

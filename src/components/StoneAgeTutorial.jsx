import React, { useState } from 'react';

const STEPS=[
  {icon:'🏕️',title:'Protect the Village',body:'Enemies that reach the end damage Village Health. Keep the village above zero to survive.'},
  {icon:'🪵',title:'Manage Three Resources',body:'Wood, Stone, and Food replace normal money. Different towers and upgrades require different combinations.'},
  {icon:'🪨',title:'Build Defenses',body:'Tap a tower and then a build tile, or drag a tower directly onto the battlefield on touch and desktop.'},
  {icon:'🌊',title:'Control the Waves',body:'Check the next-wave preview before starting. Between waves you can build, upgrade, evolve, or sell.'},
  {icon:'↙️',title:'Evolve Your Towers',body:'At Level 3 each combat tower chooses one of two evolutions. The branches change how the tower fights, not just its stats.'},
  {icon:'🌋',title:'Use the Terrain',body:'Rivers, caves, ice, lava, cliffs, and jungle brush change battles. Each region also gives you an environment action.'},
];

export function StoneAgeTutorial({onComplete}){
  const [step,setStep]=useState(0);
  const current=STEPS[step];
  const last=step===STEPS.length-1;
  return <div className="tutorial-overlay">
    <div className="tutorial-card">
      <div className="tutorial-progress">{STEPS.map((_,index)=><span key={index} className={index<=step?'active':''}/>)}</div>
      <div className="tutorial-icon">{current.icon}</div>
      <small>STONE AGE BASICS • {step+1}/{STEPS.length}</small>
      <h2>{current.title}</h2>
      <p>{current.body}</p>
      <div className="tutorial-actions">
        <button className="tutorial-skip" onClick={onComplete}>Skip</button>
        <div>{step>0&&<button onClick={()=>setStep(value=>value-1)}>Back</button>}<button className="tutorial-next" onClick={()=>last?onComplete():setStep(value=>value+1)}>{last?'Start Defending →':'Next →'}</button></div>
      </div>
    </div>
  </div>
}

import React, { useState } from 'react';

const STEPS=[
  {icon:'🏕️',title:'Keep the Village Safe',body:'Bad guys follow the road toward your village. Stop them before they reach the end.'},
  {icon:'🪨',title:'Pick a Tower',body:'Tap a tower card. Then tap a green square beside the road to build it.'},
  {icon:'🌊',title:'Start the Wave',body:'When you are ready, tap Start Wave. Your towers attack all by themselves.'},
  {icon:'⬆️',title:'Make Towers Stronger',body:'Tap a tower you already built to upgrade it. Stronger towers beat tougher enemies.'},
  {icon:'⭐',title:'Follow the Helper',body:'Junior Mode will show you what to tap next. You can turn the helper off later in Settings.'},
];

export function StoneAgeTutorial({onComplete}){
  const [step,setStep]=useState(0);
  const current=STEPS[step];
  const last=step===STEPS.length-1;
  return <div className="tutorial-overlay">
    <div className="tutorial-card">
      <div className="tutorial-progress">{STEPS.map((_,index)=><span key={index} className={index<=step?'active':''}/>)}</div>
      <div className="tutorial-icon">{current.icon}</div>
      <small>HOW TO PLAY • {step+1}/{STEPS.length}</small>
      <h2>{current.title}</h2>
      <p>{current.body}</p>
      <div className="tutorial-actions">
        <button className="tutorial-skip" onClick={onComplete}>I know how</button>
        <div>{step>0&&<button onClick={()=>setStep(value=>value-1)}>Back</button>}<button className="tutorial-next" onClick={()=>last?onComplete():setStep(value=>value+1)}>{last?'Let’s Play! →':'Next →'}</button></div>
      </div>
    </div>
  </div>
}

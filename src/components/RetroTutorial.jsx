import React,{useState}from'react';
const steps=[
 ['🪙','Coins','Defeat enemies to earn Coins. Faster clears and higher combos multiply your payouts.'],
 ['❤️','Three Lives','Your cabinet has three lives. Each life has 100 HP. When a life breaks, HP resets for the next one.'],
 ['🔥','Combo Meter','Every quick kill raises Combo. Combo x2, x3, x4 and x5 multiply score and Coin rewards. A leak breaks the combo.'],
 ['👾','Arcade Enemies','Ghosts phase, Coin Thieves steal money, Viruses disrupt defenses, and Glitches move unpredictably.'],
 ['⭐','Bonus Pads','Some maps include glowing bonus build pads. Use them for high-value defensive positions.'],
 ['📼','Cartridges','Each map awards up to three Cartridges for clearing the stage and completing arcade challenges.']
];
export function RetroTutorial({onComplete}){const[index,setIndex]=useState(0);const [icon,title,copy]=steps[index];return <div className="retro-tutorial"><div><small>WELCOME TO ERA II • {index+1}/{steps.length}</small><span>{icon}</span><h2>{title}</h2><p>{copy}</p><div className="tutorial-dots">{steps.map((_,i)=><i key={i} className={i===index?'active':''}/>)}</div><footer><button onClick={onComplete}>Skip</button><button onClick={()=>index===steps.length-1?onComplete():setIndex(i=>i+1)}>{index===steps.length-1?'INSERT COIN':'Next →'}</button></footer></div></div>}

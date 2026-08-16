const KEY='chrono-defense-era-challenge-v1';
const definitions={
 retro:[
  {id:'normal',icon:'🕹️',name:'Normal',description:'Standard arcade rules.',hp:1,speed:1,reward:1,count:1},
  {id:'turbo',icon:'💨',name:'Turbo',description:'Enemies move 28% faster but pay more coins.',hp:1,speed:1.28,reward:1.3,count:1},
  {id:'hardcore',icon:'💀',name:'Hardcore',description:'Stronger enemies and reduced rewards.',hp:1.5,speed:1.08,reward:.86,count:1.08},
  {id:'swarm',icon:'👾',name:'Pixel Swarm',description:'Many more enemies with lower individual health.',hp:.72,speed:1.06,reward:.82,count:1.55},
  {id:'jackpot',icon:'🪙',name:'Jackpot',description:'Elite enemies carry much larger payouts.',hp:1.35,speed:1.08,reward:2,count:1},
  {id:'nightmare',icon:'🌑',name:'Nightmare',description:'Maximum arcade pressure.',hp:2,speed:1.25,reward:1.2,count:1.3}
 ],
 future:[
  {id:'normal',icon:'🤖',name:'Normal',description:'Standard grid-defense rules.',hp:1,speed:1,reward:1,count:1},
  {id:'blackout',icon:'⚡',name:'Blackout',description:'More EMP and disruption enemies.',hp:1.12,speed:1.05,reward:1.2,count:1.05,forceEmp:true},
  {id:'stealth',icon:'🥷',name:'Ghost Network',description:'Cloaking appears throughout the wave.',hp:1.08,speed:1.12,reward:1.25,count:1,forceCloak:true},
  {id:'overclock',icon:'🔥',name:'Overclock',description:'Fast machine assault with higher rewards.',hp:.95,speed:1.3,reward:1.45,count:1.12},
  {id:'fortress',icon:'🛡️',name:'Iron Protocol',description:'Heavy armor and shields dominate.',hp:1.6,speed:.9,reward:1.35,count:.9,armor:.12,shield:.18},
  {id:'singularity',icon:'🌀',name:'Singularity',description:'Endgame AI pressure and mixed disruptions.',hp:2.05,speed:1.2,reward:1.35,count:1.25,forceEmp:true,forceCloak:true}
 ],
 space:[
  {id:'normal',icon:'🚀',name:'Normal',description:'Standard orbital defense rules.',hp:1,speed:1,reward:1,count:1},
  {id:'meteor',icon:'☄️',name:'Meteor Storm',description:'Fast armored threats crowd the orbit.',hp:1.15,speed:1.25,reward:1.3,count:1.2,armor:.08},
  {id:'dark',icon:'🌑',name:'Dark Space',description:'Stealth ships become common.',hp:1.1,speed:1.08,reward:1.3,count:1.05,forceStealth:true},
  {id:'hive',icon:'🐝',name:'Hive Rush',description:'Carrier-heavy waves flood the route.',hp:.92,speed:1.08,reward:1.15,count:1.45,forceCarrier:true},
  {id:'dread',icon:'🚢',name:'Dread Fleet',description:'Slow, extremely durable warships.',hp:1.85,speed:.88,reward:1.5,count:.85,armor:.14,shield:.15},
  {id:'void',icon:'🌌',name:'Void Nightmare',description:'Stealth, regeneration and control resistance collide.',hp:2.1,speed:1.18,reward:1.45,count:1.22,forceStealth:true,forceRegen:true,gravityResist:true}
 ]
};
export function eraChallenges(world){return definitions[world]??[];}
export function setEraChallenge(world,id){try{sessionStorage.setItem(KEY,JSON.stringify({world,id}))}catch{globalThis.__chronoEraChallenge={world,id}}}
export function getEraChallenge(world){let saved=globalThis.__chronoEraChallenge;try{saved=JSON.parse(sessionStorage.getItem(KEY)||'null')??saved}catch{}const list=eraChallenges(world),id=saved?.world===world?saved.id:'normal';return list.find(item=>item.id===id)??list[0]??{id:'normal',hp:1,speed:1,reward:1,count:1};}
export function applyChallengeToUnits(world,units=[]){const rule=getEraChallenge(world),count=Math.max(1,Math.round(units.length*(rule.count??1))),source=units.length?units:[];const expanded=Array.from({length:count},(_,i)=>({...source[i%source.length]}));return expanded.map((unit,index)=>{const next={...unit};next.hp=Math.max(1,Math.round((next.hp??1)*(rule.hp??1)));next.maxHp=Math.max(next.hp,Math.round((next.maxHp??next.hp)*(rule.hp??1)));next.speed=(next.speed??1)*(rule.speed??1);next.armor=Math.min(.92,(next.armor??0)+(rule.armor??0));if('coinReward'in next)next.coinReward=Math.max(1,Math.round(next.coinReward*(rule.reward??1)));if('creditReward'in next)next.creditReward=Math.max(1,Math.round(next.creditReward*(rule.reward??1)));if('matterReward'in next)next.matterReward=Math.max(1,Math.round(next.matterReward*(rule.reward??1)));if(rule.shield)next.shieldHp=Math.round((next.shieldHp??0)+next.maxHp*rule.shield);if(rule.forceEmp&&index%5===0)next.emp=true;if(rule.forceCloak&&index%4===0)next.cloaked=true;if(rule.forceStealth&&index%4===0)next.stealth=true;if(rule.forceCarrier&&index%5===0)next.spawns=true;if(rule.forceRegen&&index%4===0)next.regen=true;if(rule.gravityResist&&index%4===0)next.gravityResist=true;return next});}

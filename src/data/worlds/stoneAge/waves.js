import { stoneAgeEnemies } from './enemies.js';
import { stoneAgeBosses } from './bosses.js';

const byId = Object.fromEntries(stoneAgeEnemies.map(enemy=>[enemy.id,enemy]));

const REGION_POOLS = [
  ['boar','wolf','rival-scout','giant-beetle','raptor','dire-wolf','sabertooth'],
  ['raptor','alpha-raptor','giant-snake','enemy-shaman','tribal-raider','pterodactyl','sabertooth'],
  ['mammoth','war-mammoth','dire-wolf','armored-tribesman','triceratops','ankylosaurus','pterodactyl'],
  ['raptor','alpha-raptor','trex-juvenile','elder-dinosaur','triceratops','ankylosaurus','titan-beast'],
  stoneAgeEnemies.map(enemy=>enemy.id),
];

function rewardFor(enemy, mode={}){
  const tier=enemy.tier??1;const rewardScale=mode.reward??1;
  return {
    food:Math.max(1,Math.round((1+tier*.42)*rewardScale)),
    wood:Math.round((tier%4===0?2:0)*rewardScale),
    stone:Math.round((tier%6===0?2:0)*rewardScale),
  };
}

function scaleEnemy(base,{mapNumber,waveNumber,mode={}}){
  const scale=(1+(mapNumber-1)*.055+(waveNumber-1)*.08)*(mode.hp??1);
  const maxHp=Math.round(base.hp*scale);
  return {
    ...base,
    hp:maxHp,
    maxHp,
    speed:base.speed*(1+Math.min(.25,(waveNumber-1)*.015))*(mode.speed??1),
    reward:rewardFor(base,mode),
  };
}

function regionalUnits(mapNumber,waveNumber,count,mode){
  const region=Math.min(4,Math.floor((mapNumber-1)/5));
  const pool=REGION_POOLS[region].map(id=>byId[id]).filter(Boolean);
  const units=[];
  for(let i=0;i<count;i++){
    const base=pool[(i*3+waveNumber+mapNumber)%pool.length];
    units.push(scaleEnemy(base,{mapNumber,waveNumber,mode}));
  }
  return units;
}

function tribalUnits(mapNumber,waveNumber,count,mode){
  const pool=stoneAgeEnemies.filter(enemy=>enemy.tags?.includes('tribe'));
  return Array.from({length:count},(_,i)=>scaleEnemy(pool[(i+waveNumber)%pool.length],{mapNumber,waveNumber,mode}));
}

function bossRushUnits(mapNumber,waveNumber,mode){
  const boss=stoneAgeBosses[Math.min(stoneAgeBosses.length-1,Math.floor((waveNumber-1)/2))];
  const supportCount=4+waveNumber;
  const support=regionalUnits(mapNumber,waveNumber,supportCount,mode);
  if(waveNumber%2===0||waveNumber===1){
    const scaled=scaleEnemy({...boss,tier:20},{mapNumber,waveNumber,mode});
    support.push({...scaled,boss:true,reward:{wood:55,stone:55,food:55}});
  }
  return support;
}

export function buildWave({mapNumber=1,waveNumber=1,mode={}}){
  const count=5+waveNumber*2+Math.floor(mapNumber/4)+Math.floor((mode.extraEnemies??0)*waveNumber);
  let units;
  if(mode.id==='boss-rush') units=bossRushUnits(mapNumber,waveNumber,mode);
  else if(mode.id==='tribal-warfare') units=tribalUnits(mapNumber,waveNumber,count,mode);
  else units=regionalUnits(mapNumber,waveNumber,count,mode);

  const region=Math.min(4,Math.floor((mapNumber-1)/5));

  // Jungle and Lost World caves create ambush packs on every third wave.
  if((region===1||region===4)&&mapNumber%2===0&&waveNumber%3===0){
    const ambushBase=byId[region===1?'raptor':'alpha-raptor'];
    const ambushCount=2+Math.floor(mapNumber/10);
    for(let i=0;i<ambushCount;i++) units.splice(Math.min(units.length,2+i),0,scaleEnemy(ambushBase,{mapNumber,waveNumber,mode}));
  }

  // Frozen maps favor heavy armored creatures in later waves.
  if(region===2&&waveNumber>=6){
    const heavy=byId[waveNumber>=9?'war-mammoth':'mammoth'];
    units.push(scaleEnemy(heavy,{mapNumber,waveNumber,mode}));
  }

  // Burning Lands introduce more dinosaurs and fire-resistant elites.
  if(region===3&&waveNumber>=5){
    const elite=byId[waveNumber>=9?'elder-dinosaur':'trex-juvenile'];
    units.push(scaleEnemy(elite,{mapNumber,waveNumber,mode}));
  }

  if(mode.id!=='boss-rush'&&waveNumber===10&&mapNumber%5===0){
    const boss=stoneAgeBosses.find(item=>item.map===mapNumber);
    if(boss){const scaled=scaleEnemy({...boss,tier:20},{mapNumber,waveNumber,mode});units.push({...scaled,boss:true,reward:{wood:80,stone:80,food:80}})}
  }
  return units;
}

export function summarizeWave(units=[]){
  const groups=new Map();
  units.forEach(unit=>{const key=unit.boss?`👑 ${unit.name}`:unit.name;groups.set(key,(groups.get(key)??0)+1)});
  return [...groups.entries()].map(([name,count])=>({name,count}));
}

export const WAVES_PER_MAP=10;

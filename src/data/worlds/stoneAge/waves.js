import { stoneAgeEnemies } from './enemies.js';
import { stoneAgeBosses } from './bosses.js';

function rewardFor(enemy, rewardScale=1){
  const tier = enemy.tier ?? 1;
  const scaled=value=>Math.max(value?1:0,Math.round(value*rewardScale));
  return {
    food: scaled(Math.max(1, Math.round(1 + tier * .42))),
    wood: scaled(tier % 4 === 0 ? 2 : 0),
    stone: scaled(tier % 6 === 0 ? 2 : 0)
  };
}

function modePool(mode){
  if(!mode?.tribesOnly) return stoneAgeEnemies;
  const ids=new Set(['rival-scout','armored-tribesman','enemy-shaman','tribal-raider']);
  return stoneAgeEnemies.filter(enemy=>ids.has(enemy.id));
}

function scaleUnit(base,{mapNumber,waveNumber,mode}){
  const baseScale = 1 + (mapNumber-1)*.055 + (waveNumber-1)*.08;
  const hpScale=baseScale*(mode?.hp??1);
  const rewardScale=mode?.rewards??1;
  return {
    ...base,
    hp: Math.round(base.hp * hpScale),
    maxHp: Math.round(base.hp * hpScale),
    speed: base.speed * (1 + Math.min(.35,(waveNumber-1)*.015)) * (mode?.speed??1),
    reward: rewardFor(base,rewardScale),
    abilityClock: base.abilityEvery??0
  };
}

function bossForRush(waveNumber){
  return stoneAgeBosses[Math.min(stoneAgeBosses.length-1,Math.max(0,waveNumber-1))];
}

export function buildWave({ mapNumber=1, waveNumber=1, mode={ id:'normal' } }){
  const pool=modePool(mode);
  const mapTier = Math.ceil(mapNumber / 3);
  const maxTier = Math.min(pool.length, Math.max(2, mapTier + Math.ceil(waveNumber * .7)));
  const minTier = Math.max(1, maxTier - Math.min(4,pool.length-1));
  const count = Math.max(3,5 + waveNumber * 2 + Math.floor(mapNumber / 4));
  const units = [];
  for(let i=0;i<count;i++){
    const span = Math.max(1,maxTier - minTier + 1);
    const tierIndex = minTier - 1 + ((i * 3 + waveNumber + mapNumber) % span);
    const base = pool[Math.min(pool.length-1,tierIndex)] ?? pool[0];
    units.push(scaleUnit(base,{mapNumber,waveNumber,mode}));
  }

  let boss=null;
  if(mode?.bossRush){
    boss=bossForRush(waveNumber);
  } else if(waveNumber === 10 && mapNumber % 5 === 0){
    boss=stoneAgeBosses.find(b=>b.map===mapNumber);
  }
  if(boss){
    const bossHpScale=(mode?.hp??1)*(1+(mapNumber-1)*.025+(waveNumber-1)*.06);
    units.push({
      ...boss,
      hp:Math.round(boss.hp*bossHpScale),
      maxHp:Math.round(boss.hp*bossHpScale),
      speed:boss.speed*(mode?.speed??1),
      tier:20,
      reward:{ wood:Math.round(80*(mode?.rewards??1)), stone:Math.round(80*(mode?.rewards??1)), food:Math.round(80*(mode?.rewards??1)) },
      boss:true,
      abilityClock:boss.abilityEvery??0
    });
  }
  return units;
}

export function summarizeWave(units=[]){
  const counts=new Map();
  units.forEach(unit=>counts.set(unit.name,(counts.get(unit.name)??0)+1));
  return [...counts.entries()].map(([name,count])=>({name,count}));
}

export const WAVES_PER_MAP = 10;

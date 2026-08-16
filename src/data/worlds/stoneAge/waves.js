import { stoneAgeEnemies } from './enemies.js';
import { stoneAgeBosses } from './bosses.js';

function rewardFor(enemy){
  const tier = enemy.tier ?? 1;
  return {
    food: Math.max(1, Math.round(1 + tier * .42)),
    wood: tier % 4 === 0 ? 2 : 0,
    stone: tier % 6 === 0 ? 2 : 0
  };
}

export function buildWave({ mapNumber=1, waveNumber=1 }){
  const mapTier = Math.ceil(mapNumber / 3);
  const maxTier = Math.min(stoneAgeEnemies.length, Math.max(2, mapTier + Math.ceil(waveNumber * .7)));
  const minTier = Math.max(1, maxTier - 4);
  const count = 5 + waveNumber * 2 + Math.floor(mapNumber / 4);
  const units = [];
  for(let i=0;i<count;i++){
    const span = maxTier - minTier + 1;
    const tier = minTier + ((i * 3 + waveNumber + mapNumber) % span);
    const base = stoneAgeEnemies[tier-1];
    const scale = 1 + (mapNumber-1)*.055 + (waveNumber-1)*.08;
    units.push({
      ...base,
      hp: Math.round(base.hp * scale),
      maxHp: Math.round(base.hp * scale),
      speed: base.speed * (1 + Math.min(.25,(waveNumber-1)*.015)),
      reward: rewardFor(base)
    });
  }

  if(waveNumber === 10 && mapNumber % 5 === 0){
    const boss = stoneAgeBosses.find(b=>b.map===mapNumber);
    if(boss){
      units.push({ ...boss, maxHp:boss.hp, tier:20, reward:{ wood:80, stone:80, food:80 }, boss:true });
    }
  }
  return units;
}

export const WAVES_PER_MAP = 10;

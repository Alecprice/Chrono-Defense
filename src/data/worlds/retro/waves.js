import { retroEnemies } from './enemies.js';
import { retroBosses } from './bosses.js';
import { applyRetroMapModifiers } from './mapModifiers.js';

const byId=Object.fromEntries(retroEnemies.map(enemy=>[enemy.id,enemy]));
const pools=[
 ['bit','speedster','block','ghost','splitter'],
 ['ghost','coin-thief','glitch','virus','shield-byte','turbo-ghost'],
 ['splitter','packet-swarm','firewall','memory-leak','lag-beast','shield-byte'],
 ['virus','corruptor','hyper-block','arcade-tank','packet-swarm','game-breaker'],
 retroEnemies.map(enemy=>enemy.id)
];
function reward(enemy){return Math.max(5,Math.round(4+(enemy.tier??1)*1.75));}
function scale(base,mapNumber,waveNumber){const factor=1+(mapNumber-1)*.05+(waveNumber-1)*.075;const hp=Math.round(base.hp*factor);return{...base,hp,maxHp:hp,speed:base.speed*(1+Math.min(.24,(waveNumber-1)*.016)),coinReward:reward(base)};}
export function buildRetroWave({mapNumber=1,waveNumber=1}){
 const zone=Math.min(4,Math.floor((mapNumber-1)/5));const pool=pools[zone].map(id=>byId[id]).filter(Boolean);const count=6+waveNumber*2+Math.floor(mapNumber/5);const units=[];
 for(let i=0;i<count;i++)units.push(scale(pool[(i*3+waveNumber+mapNumber)%pool.length],mapNumber,waveNumber));
 if(zone>=1&&waveNumber%3===0)units.push(scale(byId['coin-thief'],mapNumber,waveNumber));
 if(zone>=2&&waveNumber>=7)units.push(scale(byId['firewall'],mapNumber,waveNumber));
 if(zone>=3&&waveNumber>=8)units.push(scale(byId['game-breaker'],mapNumber,waveNumber));
 if(mapNumber===19&&waveNumber>=5&&waveNumber<10)units.push(scale(byId['arcade-tank']??pool[0],mapNumber,waveNumber));
 if(waveNumber===10&&mapNumber%5===0){const boss=retroBosses.find(item=>item.map===mapNumber);if(boss){const scaledHp=Math.round(boss.hp*(1+(mapNumber-1)*.035));units.push({...boss,hp:scaledHp,maxHp:scaledHp,boss:true,coinReward:350+mapNumber*12});}}
 return applyRetroMapModifiers(units,mapNumber,waveNumber);
}
export function summarizeRetroWave(units=[]){const map=new Map();units.forEach(unit=>{const key=unit.boss?`👑 ${unit.name}`:unit.name;map.set(key,(map.get(key)??0)+1)});return[...map.entries()].map(([name,count])=>({name,count}));}
export const RETRO_WAVES=10;

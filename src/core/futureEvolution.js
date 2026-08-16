export function futureTowerStats(base,placed={level:1,branch:null}){
 const level=placed.level??1,branch=placed.branch;let damage=Math.round(base.damage*(1+(level-1)*.4)),range=Math.round(base.range*(1+(level-1)*.07)),fireRate=Math.max(.28,base.fireRate*(1-(level-1)*.08)),armorPierce=0,targets=1,splash=0,crit=.04,slow=0,dot=0;
 if(branch==='A'){
  if(base.id==='pulse-turret'){fireRate*=.58;targets=2}
  if(base.id==='plasma-cannon'){damage=Math.round(damage*1.6);splash=135}
  if(base.id==='railgun'){damage=Math.round(damage*1.45);armorPierce=.45;targets=4}
  if(base.id==='drone-bay'){targets=5;fireRate*=.82}
  if(base.id==='emp-node'){range=Math.round(range*1.35);slow=.16;targets=8}
  if(base.id==='nanobot-swarm'){dot=damage*.55;damage=Math.round(damage*.8)}
  if(base.id==='quantum-cannon'){damage=Math.round(damage*1.25);crit=.36}
  if(base.id==='ai-defense-core'){damage=Math.round(damage*1.28);crit=.16}
  if(base.id==='detector-array')range=Math.round(range*1.75)
 }
 if(branch==='B'){
  if(base.id==='pulse-turret'){damage=Math.round(damage*1.28);armorPierce=.3;targets=2}
  if(base.id==='plasma-cannon'){fireRate*=.55;splash=80}
  if(base.id==='railgun'){fireRate*=.58;armorPierce=.18;targets=2}
  if(base.id==='drone-bay'){damage=Math.round(damage*1.35);splash=85;targets=3}
  if(base.id==='emp-node'){slow=.3;damage=Math.round(damage*.7)}
  if(base.id==='nanobot-swarm'){dot=damage*.28;targets=3}
  if(base.id==='quantum-cannon'){targets=2;crit=.14}
  if(base.id==='ai-defense-core'){range=Math.round(range*1.2);targets=3}
  if(base.id==='detector-array'){damage=Math.round(damage*1.5);armorPierce=.2}
 }
 return{damage,range,fireRate,armorPierce,targets,splash,crit,slow,dot};
}
export function futurePowerContribution(base,placed={}){let value=base.power;if(placed.branch==='A'&&base.id==='power-relay')value=-34;if(placed.branch==='B'&&base.id==='power-relay')value=-25;if(placed.branch==='A'&&base.id==='fusion-reactor')value=-88;if(placed.branch==='B'&&base.id==='fusion-reactor')value=-68;return value;}
export function futureShieldRecharge(placed={},towers=[]){let amount=25,maxBonus=0;Object.values(placed).forEach(p=>{const base=towers.find(t=>t.id===p.id);if(base?.id!=='shield-relay')return;amount+=15;if(p.branch==='A')maxBonus+=90;if(p.branch==='B')amount+=38});return{amount,maxBonus};}
export function futureEvolutionCost(base){return Math.round(base.cost*1.3)}
export function applyFutureDamage(enemy,raw,stats,sourceId){const effectiveArmor=Math.max(0,(enemy.armor??0)-(stats.armorPierce??0));let damage=Math.max(1,Math.round(raw*(1-Math.min(.82,effectiveArmor))));if(Math.random()<(stats.crit??0))damage=Math.round(damage*2);let value=damage;if(enemy.shieldHp>0){const absorbed=Math.min(enemy.shieldHp,value);enemy.shieldHp-=absorbed;value-=absorbed}enemy.hp-=value;if(stats.slow)enemy.speed=Math.max(16,enemy.speed*(1-stats.slow));if(stats.dot)enemy.nanoDot=Math.max(enemy.nanoDot??0,stats.dot);enemy.lastHitTower=sourceId;if(enemy.hp<=0)enemy.dead=true;return damage;}

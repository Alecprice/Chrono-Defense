export function spaceTowerStats(base,placed={level:1,branch:null}){const level=placed.level??1,branch=placed.branch;let damage=Math.round(base.damage*(1+(level-1)*.4)),range=Math.round(base.range*(1+(level-1)*.07)),fireRate=Math.max(.3,base.fireRate*(1-(level-1)*.08)),armorPierce=0,targets=1,splash=0,crit=.03,slow=0,rewind=0,burn=0;
 if(branch==='A'){
  if(base.id==='ion-cannon'){damage=Math.round(damage*1.28);armorPierce=.3;targets=2}
  if(base.id==='orbital-laser'){damage=Math.round(damage*1.4);crit=.16}
  if(base.id==='fighter-hangar'){targets=5;fireRate*=.78}
  if(base.id==='gravity-well'){range=Math.round(range*1.25);slow=.42}
  if(base.id==='tractor-beam'){rewind=42;damage=Math.round(damage*1.15)}
  if(base.id==='antimatter-cannon'){damage=Math.round(damage*1.55);armorPierce=.5}
  if(base.id==='satellite-array')range=Math.round(range*1.8)
  if(base.id==='defense-platform'){damage=Math.round(damage*1.5);armorPierce=.25;splash=110}
  if(base.id==='wormhole-generator')rewind=100
  if(base.id==='plasma-ring'){burn=damage*.5;splash=145}
  if(base.id==='planet-killer'){damage=Math.round(damage*1.7);crit=.18}
 }
 if(branch==='B'){
  if(base.id==='ion-cannon'){fireRate*=.55;targets=2}
  if(base.id==='orbital-laser'){targets=3;fireRate*=.78}
  if(base.id==='fighter-hangar'){damage=Math.round(damage*1.45);splash=95;targets=3}
  if(base.id==='gravity-well'){range=Math.round(range*1.12);slow=.3;targets=6}
  if(base.id==='tractor-beam'){slow=.55;rewind=12}
  if(base.id==='antimatter-cannon'){damage=Math.round(damage*1.25);splash=145}
  if(base.id==='satellite-array')range=Math.round(range*1.25)
  if(base.id==='defense-platform'){fireRate*=.55;targets=4}
  if(base.id==='wormhole-generator'){rewind=45;targets=5}
  if(base.id==='plasma-ring'){damage=Math.round(damage*1.35);splash=170;fireRate*=1.25}
  if(base.id==='planet-killer'){armorPierce=.55;targets=5}
 }
 return{damage,range,fireRate,armorPierce,targets,splash,crit,slow,rewind,burn};}
export function spaceEvolutionCost(base){return Math.round(base.cost*1.3)}
export function spaceShieldSupport(placed={},towers=[]){let recharge=70,maxBonus=0;Object.values(placed).forEach(p=>{const base=towers.find(t=>t.id===p.id);if(base?.id!=='colony-shield')return;recharge+=35;if(p.branch==='A')maxBonus+=180;if(p.branch==='B')recharge+=95});return{recharge,maxBonus}}
export function applySpaceDamage(enemy,raw,stats,sourceId){const effectiveArmor=Math.max(0,(enemy.armor??0)-(stats.armorPierce??0));let damage=Math.max(1,Math.round(raw*(1-Math.min(.85,effectiveArmor))));if(Math.random()<(stats.crit??0))damage=Math.round(damage*2);let value=damage;if(enemy.shieldHp>0){const absorbed=Math.min(enemy.shieldHp,value);enemy.shieldHp-=absorbed;value-=absorbed}enemy.hp-=value;if(stats.slow&&!enemy.gravityResist)enemy.speed=Math.max(12,enemy.speed*(1-stats.slow));if(stats.rewind&&!enemy.gravityResist)enemy.travel=Math.max(0,enemy.travel-stats.rewind);if(stats.burn)enemy.plasmaBurn=Math.max(enemy.plasmaBurn??0,stats.burn);enemy.lastHitTower=sourceId;if(enemy.hp<=0)enemy.dead=true;return damage;}

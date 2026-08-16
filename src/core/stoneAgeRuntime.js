import { effectiveDamage, distance } from './combat.js';

export function nearby(enemies,target,count=3,radius=150){
  return enemies.filter(enemy=>!enemy.dead&&enemy.uid!==target.uid&&distance(enemy,target)<=radius)
    .sort((a,b)=>distance(a,target)-distance(b,target)).slice(0,Math.max(0,count-1));
}

function uniqueTargets(targets){return [...new Map(targets.filter(Boolean).map(enemy=>[enemy.uid,enemy])).values()]}

export function applyStoneAgeAttack({base,item,stats,target,enemies}){
  const armor=Math.max(0,(target.armor??0)-(target.armorDebuff??0));
  let damage=effectiveDamage(stats.damage,{...target,armor});
  let targets=[target];
  let villageHeal=0;

  if(base.id==='rock-thrower'&&item.branch==='A'){
    target.armorDebuff=Math.max(target.armorDebuff??0,.18);target.armorBreakTime=3.5;target.stunTime=Math.max(target.stunTime??0,.25);
  }
  if(base.id==='rock-thrower'&&item.branch==='B')targets=[target,...nearby(enemies,target,3,180)];

  if(base.id==='spear-hunter'&&item.branch==='A'){
    targets=[target,...enemies.filter(enemy=>!enemy.dead&&enemy.uid!==target.uid&&Math.abs((enemy.progress??0)-(target.progress??0))<.08).slice(0,2)];
  }
  if(base.id==='spear-hunter'&&item.branch==='B'){targets=[target,...nearby(enemies,target,3,130)];damage=Math.round(damage*.72)}

  if(base.id==='fire-keeper'&&item.branch==='A')targets=[target,...nearby(enemies,target,5,115)];
  if(base.id==='fire-keeper'&&item.branch==='B'){damage=Math.round(stats.damage*.88);villageHeal=1}

  if(base.id==='boulder-launcher'){
    targets=[target,...nearby(enemies,target,item.branch==='B'?3:6,item.branch==='B'?75:110)];
    if(item.branch==='A')targets.forEach(enemy=>enemy.stunTime=Math.max(enemy.stunTime??0,.7));
  }

  if(base.id==='trapper'&&item.branch==='A')damage=Math.round(damage*1.35);
  if(base.id==='trapper'&&item.branch==='B')target.environmentSlow=Math.max(target.environmentSlow??0,2.8);

  if(base.id==='beast-tamer'&&item.branch==='A'){targets=[target,...nearby(enemies,target,4,150)];damage=Math.round(damage*.72)}
  if(base.id==='beast-tamer'&&item.branch==='B'){damage=Math.round(damage*1.65);target.environmentSlow=Math.max(target.environmentSlow??0,.8)}

  if(base.id==='shaman'&&item.branch==='A'){targets=[target,...nearby(enemies,target,3,125)];damage=Math.round(damage*.85)}

  if(base.id==='watchtower'&&item.branch==='A')damage=Math.round(stats.damage*1.12);
  if(base.id==='watchtower'&&item.branch==='B'){targets=[target,...nearby(enemies,target,4,210)];damage=Math.round(damage*.70)}

  if(base.id==='mammoth-rider'&&item.branch==='A')targets=[target,...nearby(enemies,target,6,120)];
  if(base.id==='mammoth-rider'&&item.branch==='B'){damage=Math.round(damage*1.25);target.stunTime=Math.max(target.stunTime??0,1.15)}

  if(base.id==='tribal-warrior'&&item.branch==='A'&&target.boss)damage=Math.round(damage*1.75);

  if(base.id==='fire-slinger'&&item.branch==='A'){targets=[target,...nearby(enemies,target,7,135)];damage=Math.round(damage*1.20)}
  if(base.id==='fire-slinger'&&item.branch==='B'){
    targets=[target,...enemies.filter(enemy=>!enemy.dead&&enemy.uid!==target.uid).sort(()=>Math.random()-.5).slice(0,4)];
    damage=Math.round(damage*.78);
  }

  const hits=uniqueTargets(targets);
  hits.forEach(enemy=>{
    enemy.hp-=damage;
    enemy.lastHitTower=base.id;
    if(base.id==='fire-keeper'||base.id==='fire-slinger'){
      const burnScale=base.id==='fire-slinger' ? .5 : .35;
      enemy.burnDps=Math.max(enemy.burnDps??0,stats.damage*burnScale);
      enemy.burnTime=Math.max(enemy.burnTime??0,base.id==='fire-slinger'?3.5:2.5);
    }
    if(enemy.hp<=0)enemy.dead=true;
  });
  return {hits,damage,villageHeal};
}

export function shieldWallMultiplier(placed={}){
  const count=Object.values(placed).filter(item=>item.id==='tribal-warrior'&&item.branch==='B').length;
  return Math.max(.6,1-count*.10);
}

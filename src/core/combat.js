export function damageVillage(currentHp, enemy) {
  return Math.max(0, currentHp - (enemy.villageDamage ?? 5));
}

export function effectiveDamage(baseDamage, enemy) {
  const armor = Math.max(0, Math.min(0.85, enemy.armor ?? 0));
  return Math.max(1, Math.round(baseDamage * (1 - armor)));
}

export function distance(a,b){
  return Math.hypot((a.x??0)-(b.x??0),(a.y??0)-(b.y??0));
}

export function chooseTarget(enemies, origin, range, mode='first'){
  const candidates = enemies.filter(e=>!e.dead && !e.escaped && distance(origin,e) <= range);
  if(!candidates.length) return null;
  if(mode==='strong') return candidates.sort((a,b)=>b.hp-a.hp)[0];
  if(mode==='weak') return candidates.sort((a,b)=>a.hp-b.hp)[0];
  if(mode==='closest') return candidates.sort((a,b)=>distance(origin,a)-distance(origin,b))[0];
  if(mode==='last') return candidates.sort((a,b)=>a.progress-b.progress)[0];
  return candidates.sort((a,b)=>b.progress-a.progress)[0];
}

export function towerStats(base, level=1, branch=null){
  const lv = Math.max(1, level);
  let damage = base.damage * (1 + (lv-1)*.38);
  let range = base.range * (1 + (lv-1)*.08);
  let fireRate = base.fireRate ? Math.max(.35, base.fireRate * (1 - (lv-1)*.08)) : 0;
  if(branch==='A'){ damage*=1.55; range*=1.08; }
  if(branch==='B'){ damage*=1.12; fireRate*=.62; }
  return { damage:Math.round(damage), range:Math.round(range), fireRate:Number(fireRate.toFixed(2)) };
}

export function upgradeCost(baseCost, nextLevel){
  const multiplier = nextLevel===2 ? .75 : nextLevel===3 ? 1.05 : 1.5;
  return Object.fromEntries(Object.entries(baseCost).map(([k,v])=>[k,Math.max(1,Math.round(v*multiplier))]));
}

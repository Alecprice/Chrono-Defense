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

const BRANCH_MODIFIERS = {
  'rock-thrower': {
    A:{damage:1.75,range:1.10,fireRate:1.08},
    B:{damage:1.03,range:1.00,fireRate:.48},
  },
  'spear-hunter': {
    A:{damage:1.48,range:1.18,fireRate:.92},
    B:{damage:1.08,range:1.00,fireRate:.45},
  },
  'fire-keeper': {
    A:{damage:1.62,range:1.12,fireRate:.86},
    B:{damage:1.20,range:1.30,fireRate:.78},
  },
  'boulder-launcher': {
    A:{damage:1.85,range:1.08,fireRate:1.18},
    B:{damage:1.15,range:1.00,fireRate:.58},
  },
  'tar-pit': {
    A:{damage:1,range:1.30,fireRate:1},
    B:{damage:1,range:1.12,fireRate:1},
  },
  'trapper': {
    A:{damage:1.80,range:1.00,fireRate:.92},
    B:{damage:1.15,range:1.30,fireRate:.62},
  },
  'beast-tamer': {
    A:{damage:1.38,range:1.15,fireRate:.62},
    B:{damage:1.95,range:1.06,fireRate:1.08},
  },
  'shaman': {
    A:{damage:1.28,range:1.35,fireRate:.78},
    B:{damage:.92,range:1.42,fireRate:.82},
  },
  'watchtower': {
    A:{damage:1.70,range:1.32,fireRate:1.08},
    B:{damage:1.18,range:1.05,fireRate:.52},
  },
  'mammoth-rider': {
    A:{damage:1.72,range:1.06,fireRate:1.05},
    B:{damage:1.30,range:1.18,fireRate:.58},
  },
  'tribal-warrior': {
    A:{damage:1.82,range:1.08,fireRate:.72},
    B:{damage:1.12,range:1.36,fireRate:.78},
  },
  'fire-slinger': {
    A:{damage:2.05,range:1.12,fireRate:1.15},
    B:{damage:1.18,range:1.22,fireRate:.52},
  },
};

export function towerStats(base, level=1, branch=null){
  const lv = Math.max(1, level);
  let damage = base.damage * (1 + (lv-1)*.38);
  let range = base.range * (1 + (lv-1)*.08);
  let fireRate = base.fireRate ? Math.max(.35, base.fireRate * (1 - (lv-1)*.08)) : 0;
  if(branch){
    const modifier=BRANCH_MODIFIERS[base.id]?.[branch] ?? (branch==='A'?{damage:1.55,range:1.08,fireRate:1}:{damage:1.12,range:1,fireRate:.62});
    damage*=modifier.damage??1;
    range*=modifier.range??1;
    fireRate*=modifier.fireRate??1;
  }
  return { damage:Math.round(damage), range:Math.round(range), fireRate:Number(fireRate.toFixed(2)) };
}

export function upgradeCost(baseCost, nextLevel){
  const multiplier = nextLevel===2 ? .75 : nextLevel===3 ? 1.05 : 1.5;
  return Object.fromEntries(Object.entries(baseCost).map(([k,v])=>[k,Math.max(1,Math.round(v*multiplier))]));
}

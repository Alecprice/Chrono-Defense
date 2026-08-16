const REGION_ENVIRONMENTS = {
  'Green Valley': {
    icon: '🌿',
    name: 'Living Valley',
    summary: 'Rivers and fertile ground shape the safest early battlefields.',
    hazards: ['River crossings slow ground enemies', 'Cliff perches improve long-range towers'],
    action: { id:'bridge', icon:'🪵', name:'Raise Bridge', description:'Slow every ground enemy briefly at the river crossing.', cooldown:24 },
  },
  'Wild Jungle': {
    icon: '🌴',
    name: 'Deep Jungle',
    summary: 'Dense jungle routes hide cave ambushes and thick brush.',
    hazards: ['Caves can add ambush enemies', 'Brush reduces some tower range'],
    action: { id:'seal-cave', icon:'🪨', name:'Seal Cave', description:'Prevent the next cave ambush and damage enemies near the cave.', cooldown:28 },
  },
  'Frozen Age': {
    icon: '❄️',
    name: 'Frozen Age',
    summary: 'Ice lanes create dangerous bursts of enemy speed.',
    hazards: ['Ice increases enemy movement speed', 'High ground remains valuable'],
    action: { id:'break-ice', icon:'🧊', name:'Break Ice', description:'Crack the ice and heavily slow enemies currently crossing it.', cooldown:26 },
  },
  'Burning Lands': {
    icon: '🌋',
    name: 'Burning Lands',
    summary: 'Lava and volcanic vents turn every path into a hazard.',
    hazards: ['Lava burns non-resistant enemies', 'Volcanic maps favor fire-resistant enemies'],
    action: { id:'vent-eruption', icon:'🌋', name:'Open Vent', description:'Trigger a controlled eruption that burns enemies on the path.', cooldown:30 },
  },
  'Lost World': {
    icon: '🦖',
    name: 'Lost World',
    summary: 'Ancient terrain combines hazards from every earlier region.',
    hazards: ['Mixed ice, lava, caves and cliffs', 'Elite enemy waves appear more often'],
    action: { id:'boulder-roll', icon:'🪨', name:'Roll Boulder', description:'Release an ancient boulder that crushes the leading enemy pack.', cooldown:32 },
  },
};

function pickPathCells(path, startRatio, count = 2) {
  if (!path?.length) return [];
  const start = Math.min(path.length - 1, Math.max(0, Math.floor(path.length * startRatio)));
  return path.slice(start, start + count);
}

export function getStoneAgeEnvironment(map, layout) {
  const base = REGION_ENVIRONMENTS[map.region] ?? REGION_ENVIRONMENTS['Green Valley'];
  const number = map.number ?? 1;
  const iceCells = map.region === 'Frozen Age' || map.region === 'Lost World'
    ? pickPathCells(layout.path, .30 + (number % 3) * .08, 3)
    : [];
  const lavaCells = map.region === 'Burning Lands' || map.region === 'Lost World'
    ? pickPathCells(layout.path, .52, 3)
    : [];
  const riverCells = map.region === 'Green Valley'
    ? pickPathCells(layout.path, .38, 2)
    : [];
  const caveCell = (map.region === 'Wild Jungle' || map.region === 'Lost World') && number % 2 === 0
    ? layout.path[Math.min(layout.path.length - 1, Math.floor(layout.path.length * .28))]
    : null;
  const cliffCells = [4, 16, 28, 40, 52].filter(cell => !layout.path.includes(cell));
  const brushCells = map.region === 'Wild Jungle'
    ? [2, 14, 26, 38, 50].filter(cell => !layout.path.includes(cell))
    : [];

  return {
    ...base,
    iceCells,
    lavaCells,
    riverCells,
    caveCell,
    cliffCells,
    brushCells,
    caveAmbush: caveCell != null ? Math.max(1, Math.floor(number / 5)) : 0,
  };
}

export function environmentCellKind(cell, environment) {
  if (environment.iceCells.includes(cell)) return 'ice';
  if (environment.lavaCells.includes(cell)) return 'lava';
  if (environment.riverCells.includes(cell)) return 'river';
  if (environment.cliffCells.includes(cell)) return 'cliff';
  if (environment.brushCells.includes(cell)) return 'brush';
  if (environment.caveCell === cell) return 'cave';
  return null;
}

export function environmentIcon(kind) {
  return ({ ice:'🧊', lava:'🔥', river:'🌊', cliff:'⛰️', brush:'🌿', cave:'🕳️' })[kind] ?? '';
}

export function enemyEnvironmentMultiplier(enemy, cell, environment) {
  if (environment.iceCells.includes(cell) && !enemy.flying) return 1.22;
  if (environment.riverCells.includes(cell) && !enemy.flying) return .80;
  return 1;
}

export function enemyEnvironmentDamage(enemy, cell, environment) {
  if (!environment.lavaCells.includes(cell) || enemy.flying) return 0;
  return Math.max(0, 14 * (1 - (enemy.fireResistance ?? 0)));
}

export function towerEnvironmentRangeMultiplier(cell, environment) {
  if (environment.cliffCells.includes(cell)) return 1.22;
  if (environment.brushCells.includes(cell)) return .88;
  return 1;
}

export function actionEffect(actionId, enemies = [], environment) {
  const living = enemies.filter(enemy => !enemy.dead && !enemy.escaped);
  if (!living.length) return { enemies:living, message:'No enemies are in range of the environment action.' };
  const next=living.map(enemy=>({...enemy}));
  if(actionId==='bridge'){
    next.forEach(enemy=>{if(!enemy.flying)enemy.environmentSlow=Math.max(enemy.environmentSlow??0,3.5)});
    return {enemies:next,message:'🪵 The bridge rises — ground enemies are slowed!'};
  }
  if(actionId==='seal-cave'){
    const caveIndex=Math.max(0,environment.caveCell==null?0:environment.caveCell);
    next.forEach(enemy=>{if(Math.abs((enemy.currentCell??0)-caveIndex)<=8)enemy.hp-=Math.max(25,enemy.maxHp*.08)});
    return {enemies:next,message:'🪨 The cave mouth collapses onto the ambush route!',sealCave:true};
  }
  if(actionId==='break-ice'){
    next.forEach(enemy=>{if(environment.iceCells.includes(enemy.currentCell))enemy.environmentSlow=Math.max(enemy.environmentSlow??0,5)});
    return {enemies:next,message:'🧊 Cracked ice traps enemies in the frozen lane!'};
  }
  if(actionId==='vent-eruption'){
    next.forEach(enemy=>{if(!enemy.flying){enemy.burnDps=Math.max(enemy.burnDps??0,34);enemy.burnTime=Math.max(enemy.burnTime??0,4)}});
    return {enemies:next,message:'🌋 A controlled eruption scorches the path!'};
  }
  if(actionId==='boulder-roll'){
    next.sort((a,b)=>(b.progress??0)-(a.progress??0)).slice(0,6).forEach(enemy=>{enemy.hp-=Math.max(90,enemy.maxHp*.18);enemy.stunTime=Math.max(enemy.stunTime??0,1.4)});
    return {enemies:next,message:'🪨 The ancient boulder crushes the leading pack!'};
  }
  return {enemies:next,message:'The environment shifts.'};
}

const REGION_ENVIRONMENTS = {
  'Green Valley': {
    icon: '🌿',
    name: 'Living Valley',
    summary: 'Rivers and fertile ground shape the safest early battlefields.',
    hazards: ['River crossings slow ground enemies', 'Cliff perches improve long-range towers'],
  },
  'Wild Jungle': {
    icon: '🌴',
    name: 'Deep Jungle',
    summary: 'Dense jungle routes hide cave ambushes and thick brush.',
    hazards: ['Caves can add ambush enemies', 'Brush reduces some tower range'],
  },
  'Frozen Age': {
    icon: '❄️',
    name: 'Frozen Age',
    summary: 'Ice lanes create dangerous bursts of enemy speed.',
    hazards: ['Ice increases enemy movement speed', 'High ground remains valuable'],
  },
  'Burning Lands': {
    icon: '🌋',
    name: 'Burning Lands',
    summary: 'Lava and volcanic vents turn every path into a hazard.',
    hazards: ['Lava burns non-resistant enemies', 'Volcanic maps favor fire-resistant enemies'],
  },
  'Lost World': {
    icon: '🦖',
    name: 'Lost World',
    summary: 'Ancient terrain combines hazards from every earlier region.',
    hazards: ['Mixed ice, lava, caves and cliffs', 'Elite enemy waves appear more often'],
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

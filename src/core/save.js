export const SAVE_KEY = 'chrono-defense-save-v1';

const sharedStats = {
  kills: 0,
  wavesCleared: 0,
  mapsCompleted: 0,
  bossesDefeated: 0,
  flawlessMaps: 0,
  structuresBuilt: 0,
  upgrades: 0,
  resourcesCollected: 0,
  towerKills: {},
  modeWins: {}
};

const stoneAgeDefaults = {
  highestMap: 1,
  completedMap: 0,
  totems: 0,
  mastery: 0,
  tutorialComplete: false,
  best: {},
  achievements: [],
  stats: { ...sharedStats }
};

const retroDefaults = {
  unlocked: false,
  highestMap: 1,
  completedMap: 0,
  cartridges: 0,
  mastery: 0,
  tutorialComplete: false,
  highScore: 0,
  bestCombo: 1,
  best: {},
  achievements: [],
  stats: { ...sharedStats }
};

export function defaultSave() {
  return {
    version: 1,
    activeWorld: 'stone-age',
    worlds: {
      'stone-age': structuredCloneSafe(stoneAgeDefaults),
      retro: structuredCloneSafe(retroDefaults),
      future: { unlocked: false },
      space: { unlocked: false },
      'time-rift': { unlocked: false }
    },
    settings: {
      reducedMotion: false,
      haptics: true,
      effects: 'high',
      largeUI: false,
      highContrast: false,
      sound: true,
      music: true
    }
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeStats(value={}) {
  return {
    ...sharedStats,
    ...value,
    towerKills: { ...(value?.towerKills ?? {}) },
    modeWins: { ...(value?.modeWins ?? {}) }
  };
}

export function normalizeSave(parsed) {
  const base=defaultSave();
  const oldStone=parsed?.worlds?.['stone-age'] ?? {};
  const oldRetro=parsed?.worlds?.retro ?? {};
  const completedMap=Math.max(0,Math.min(25,Number(oldStone.completedMap)||0));
  const highestMap=Math.max(1,Math.min(25,Math.max(completedMap||1,Number(oldStone.highestMap)||1)));
  const retroCompleted=Math.max(0,Math.min(25,Number(oldRetro.completedMap)||0));
  const retroHighest=Math.max(1,Math.min(25,Math.max(retroCompleted||1,Number(oldRetro.highestMap)||1)));
  const retroUnlocked=Boolean(oldRetro.unlocked||completedMap>=25);
  return {
    ...base,
    ...parsed,
    version:1,
    activeWorld:['stone-age','retro','future','space','time-rift'].includes(parsed?.activeWorld)?parsed.activeWorld:'stone-age',
    worlds: {
      ...base.worlds,
      ...(parsed?.worlds ?? {}),
      'stone-age': {
        ...stoneAgeDefaults,
        ...oldStone,
        completedMap,
        highestMap,
        totems:Math.max(0,Math.min(75,Number(oldStone.totems)||0)),
        mastery:Math.max(0,Math.min(100,Number(oldStone.mastery)||0)),
        best: { ...(oldStone.best ?? {}) },
        achievements: Array.isArray(oldStone.achievements) ? oldStone.achievements : [],
        stats: normalizeStats(oldStone.stats)
      },
      retro: {
        ...retroDefaults,
        ...oldRetro,
        unlocked:retroUnlocked,
        completedMap:retroCompleted,
        highestMap:retroHighest,
        cartridges:Math.max(0,Math.min(75,Number(oldRetro.cartridges)||0)),
        mastery:Math.max(0,Math.min(100,Number(oldRetro.mastery)||0)),
        highScore:Math.max(0,Number(oldRetro.highScore)||0),
        bestCombo:Math.max(1,Number(oldRetro.bestCombo)||1),
        best: { ...(oldRetro.best ?? {}) },
        achievements: Array.isArray(oldRetro.achievements) ? oldRetro.achievements : [],
        stats: normalizeStats(oldRetro.stats)
      }
    },
    settings: { ...base.settings, ...(parsed?.settings ?? {}) }
  };
}

export function parseSaveText(text='') {
  const parsed=JSON.parse(text);
  if(parsed?.version!==1||!parsed?.worlds?.['stone-age']) throw new Error('This is not a compatible Chrono Defense save.');
  return normalizeSave(parsed);
}

export function serializeSave(save) {
  return JSON.stringify(normalizeSave(save),null,2);
}

export function loadSave(storage = globalThis.localStorage) {
  if (!storage) return defaultSave();
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    return parseSaveText(raw);
  } catch {
    return defaultSave();
  }
}

export function persistSave(save, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(normalizeSave(save)));
}

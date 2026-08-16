export const SAVE_KEY = 'chrono-defense-save-v1';

const stoneAgeDefaults = {
  highestMap: 1,
  completedMap: 0,
  totems: 0,
  mastery: 0,
  tutorialComplete: false,
  best: {},
  achievements: [],
  stats: {
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
  }
};

export function defaultSave() {
  return {
    version: 1,
    activeWorld: 'stone-age',
    worlds: {
      'stone-age': structuredCloneSafe(stoneAgeDefaults),
      retro: { unlocked: false },
      future: { unlocked: false },
      space: { unlocked: false },
      'time-rift': { unlocked: false }
    },
    settings: {
      reducedMotion: false,
      haptics: true,
      effects: 'high',
      largeUI: false,
      highContrast: false
    }
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeSave(parsed) {
  const base=defaultSave();
  const oldStone=parsed?.worlds?.['stone-age'] ?? {};
  const completedMap=Math.max(0,Math.min(25,Number(oldStone.completedMap)||0));
  const highestMap=Math.max(1,Math.min(25,Math.max(completedMap||1,Number(oldStone.highestMap)||1)));
  return {
    ...base,
    ...parsed,
    version:1,
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
        stats: {
          ...stoneAgeDefaults.stats,
          ...(oldStone.stats ?? {}),
          towerKills: { ...(oldStone.stats?.towerKills ?? {}) },
          modeWins: { ...(oldStone.stats?.modeWins ?? {}) }
        }
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

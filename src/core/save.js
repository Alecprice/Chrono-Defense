export const SAVE_KEY = 'chrono-defense-save-v1';

const stoneAgeDefaults = {
  highestMap: 1,
  completedMap: 0,
  totems: 0,
  mastery: 0,
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
    settings: { reducedMotion: false, haptics: true, effects: 'high' }
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSave(parsed) {
  const base=defaultSave();
  const oldStone=parsed?.worlds?.['stone-age'] ?? {};
  return {
    ...base,
    ...parsed,
    worlds: {
      ...base.worlds,
      ...(parsed?.worlds ?? {}),
      'stone-age': {
        ...stoneAgeDefaults,
        ...oldStone,
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

export function loadSave(storage = globalThis.localStorage) {
  if (!storage) return defaultSave();
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return defaultSave();
    return normalizeSave(parsed);
  } catch {
    return defaultSave();
  }
}

export function persistSave(save, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(save));
}

export const SAVE_KEY = 'chrono-defense-save-v1';

export function defaultSave() {
  return {
    version: 1,
    activeWorld: 'stone-age',
    worlds: {
      'stone-age': { highestMap: 1, completedMap: 0, totems: 0, mastery: 0, best: {} },
      retro: { unlocked: false },
      future: { unlocked: false },
      space: { unlocked: false },
      'time-rift': { unlocked: false }
    },
    settings: { reducedMotion: false, haptics: true, effects: 'high' }
  };
}

export function loadSave(storage = globalThis.localStorage) {
  if (!storage) return defaultSave();
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1) return defaultSave();
    return { ...defaultSave(), ...parsed };
  } catch {
    return defaultSave();
  }
}

export function persistSave(save, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(save));
}

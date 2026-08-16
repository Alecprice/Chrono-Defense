export const ASSET_ROOT = '/assets';

const customAssets = {
  'stone-age': {
    towers: {},
    enemies: {},
    bosses: {},
    projectiles: {},
    effects: {},
    environment: {},
    ui: {},
  },
};

export function assetPath(world, kind, id) {
  return customAssets?.[world]?.[kind]?.[id] ?? null;
}

export function registerAsset(world, kind, id, path) {
  customAssets[world] ??= {};
  customAssets[world][kind] ??= {};
  customAssets[world][kind][id] = path;
}

export function spriteSpec({ world='stone-age', kind, id, fallback, alt='' }) {
  return {
    src: assetPath(world, kind, id),
    fallback,
    alt,
  };
}

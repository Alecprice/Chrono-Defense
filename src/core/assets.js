export const ASSET_ROOT = '/assets';

function emptyPack(){return{towers:{},structures:{},enemies:{},bosses:{},projectiles:{},effects:{},environment:{},ui:{},maps:{}};}
const customAssets={
  'stone-age':emptyPack(),
  retro:emptyPack(),
  future:emptyPack(),
  space:emptyPack(),
  'time-rift':emptyPack()
};

export function conventionalAssetPath(world,kind,id,extension='webp'){return `${ASSET_ROOT}/${world}/${kind}/${id}.${extension}`;}
export function assetPath(world,kind,id){return customAssets?.[world]?.[kind]?.[id]??conventionalAssetPath(world,kind,id);}
export function registerAsset(world,kind,id,path){customAssets[world]??=emptyPack();customAssets[world][kind]??={};customAssets[world][kind][id]=path;}
export function registerAssetPack(world,pack={}){customAssets[world]??=emptyPack();Object.entries(pack).forEach(([kind,entries])=>{customAssets[world][kind]={...(customAssets[world][kind]??{}),...(entries??{})};});return customAssets[world];}
export function spriteSpec({world='stone-age',kind,id,fallback,alt=''}){return{src:assetPath(world,kind,id),fallback,alt};}
export function assetManifest(){return customAssets;}

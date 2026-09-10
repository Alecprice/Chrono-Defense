export const ASSET_ROOT = '/assets';

function emptyPack(){return{towers:{},structures:{},enemies:{},bosses:{},projectiles:{},effects:{},environment:{},ui:{},maps:{}};}
function record(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}
function safeKey(value){return typeof value==='string'&&value.trim().length>0&&!['__proto__','prototype','constructor'].includes(value);}
const customAssets={
  'stone-age':emptyPack(),
  retro:emptyPack(),
  future:emptyPack(),
  space:emptyPack(),
  'time-rift':emptyPack()
};

export function conventionalAssetPath(world,kind,id,extension='webp'){return `${ASSET_ROOT}/${world}/${kind}/${id}.${extension}`;}
export function assetPath(world,kind,id){return customAssets?.[world]?.[kind]?.[id]??conventionalAssetPath(world,kind,id);}
export function registerAsset(world,kind,id,path){
  if(!safeKey(world)||!safeKey(kind)||!safeKey(id))return false;
  customAssets[world]??=emptyPack();
  if(!record(customAssets[world][kind]))customAssets[world][kind]={};
  customAssets[world][kind][id]=path;
  return true;
}
export function registerAssetPack(world,pack={}){
  if(!safeKey(world))return null;
  const entries=record(pack);
  if(!entries)return customAssets[world]??null;
  customAssets[world]??=emptyPack();
  Object.entries(entries).forEach(([kind,assets])=>{
    const validAssets=record(assets);
    if(!safeKey(kind)||!validAssets)return;
    const current=record(customAssets[world][kind])??{};
    customAssets[world][kind]={...current,...validAssets};
  });
  return customAssets[world];
}
export function spriteSpec({world='stone-age',kind,id,fallback,alt=''}){return{src:assetPath(world,kind,id),fallback,alt};}
export function assetManifest(){return customAssets;}

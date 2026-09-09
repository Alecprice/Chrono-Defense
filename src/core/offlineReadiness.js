export const OFFLINE_CACHE_VERSION='chrono-defense-shell-v31';
export const OFFLINE_READY_SENTINEL='/__chrono-offline-ready-v31';
export const OFFLINE_READY_KEY='chrono-defense-offline-ready-cache';

export function storedOfflineReady(storage=globalThis.localStorage){
  try{return storage?.getItem(OFFLINE_READY_KEY)===OFFLINE_CACHE_VERSION}catch{return false}
}

export function clearStoredOfflineReady(storage=globalThis.localStorage){
  try{storage?.removeItem(OFFLINE_READY_KEY)}catch{}
}

export function offlineReadinessReconcile({storedReady=false,cacheReady=false}={}){
  return {
    ready:Boolean(cacheReady),
    staleMarker:Boolean(storedReady&&!cacheReady),
    needsPrecache:!cacheReady,
  };
}

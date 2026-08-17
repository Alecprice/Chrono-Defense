import React, { useEffect, useRef, useState } from 'react';

const OFFLINE_CACHE_VERSION='chrono-defense-shell-v31';
const OFFLINE_READY_SENTINEL='/__chrono-offline-ready-v31';
const OFFLINE_READY_KEY='chrono-defense-offline-ready-cache';
function storedOfflineReady(){try{return localStorage.getItem(OFFLINE_READY_KEY)===OFFLINE_CACHE_VERSION}catch{return false}}

export function AppStatus(){
  const [online,setOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine);
  const [installEvent,setInstallEvent]=useState(null);
  const [installed,setInstalled]=useState(()=>typeof window!=='undefined'&&window.matchMedia?.('(display-mode: standalone)').matches);
  const [updateRegistration,setUpdateRegistration]=useState(null);
  const [offlineReady,setOfflineReady]=useState(storedOfflineReady);
  const [offlineLoading,setOfflineLoading]=useState(()=>!storedOfflineReady());
  const [offlineProgress,setOfflineProgress]=useState(0);
  const [saved,setSaved]=useState(true);
  const saveTimer=useRef(null);

  useEffect(()=>{
    let disposed=false,cacheTimer=0,statusTimer=0;
    const markReady=cache=>{if(disposed)return;setOfflineLoading(false);setOfflineProgress(100);setOfflineReady(true);try{localStorage.setItem(OFFLINE_READY_KEY,cache??OFFLINE_CACHE_VERSION)}catch{}};
    const markNotReady=()=>{if(disposed||storedOfflineReady())return;setOfflineReady(false);setOfflineLoading(false)};
    const onOnline=()=>setOnline(true),onOffline=()=>setOnline(false);
    const onPrompt=event=>{event.preventDefault();setInstallEvent(event)};
    const onInstalled=()=>{setInstalled(true);setInstallEvent(null)};
    const onUpdate=event=>setUpdateRegistration(event.detail?.registration??null);
    const onPreloadStart=()=>{if(!storedOfflineReady()){setOfflineLoading(true);setOfflineReady(false);setOfflineProgress(0)}};
    const onOfflineProgress=event=>{const done=Number(event.detail?.done??0),total=Number(event.detail?.total??0);if(!storedOfflineReady()){setOfflineLoading(true);setOfflineReady(false)}if(total>0)setOfflineProgress(Math.max(0,Math.min(100,Math.round(done/total*100))))};
    const onOfflineReady=event=>markReady(event.detail?.cache);
    const onOfflineUnavailable=()=>setOfflineLoading(false);
    const onSaved=()=>{setSaved(false);if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>setSaved(true),450)};
    const onWorkerMessage=event=>{if(event.data?.type==='CHRONO_OFFLINE_READY')markReady(event.data?.cache);if(event.data?.type==='CHRONO_OFFLINE_NOT_READY')markNotReady()};
    const activeWorker=async()=>{try{const registration=await navigator.serviceWorker.ready;return registration.active??navigator.serviceWorker.controller}catch{return navigator.serviceWorker.controller}};
    const verifyCache=async()=>{if(disposed)return;try{if('caches'in window){const cache=await caches.open(OFFLINE_CACHE_VERSION);const ready=await cache.match(new URL(OFFLINE_READY_SENTINEL,location.origin).href);if(ready){markReady(OFFLINE_CACHE_VERSION);return}}}catch{}if(!disposed)cacheTimer=window.setTimeout(verifyCache,500)};
    const probeWorker=async()=>{if(disposed||storedOfflineReady())return;const worker=await activeWorker();worker?.postMessage('GET_OFFLINE_STATUS');if(!disposed&&!storedOfflineReady())statusTimer=window.setTimeout(probeWorker,700)};

    window.addEventListener('online',onOnline);window.addEventListener('offline',onOffline);window.addEventListener('beforeinstallprompt',onPrompt);window.addEventListener('appinstalled',onInstalled);window.addEventListener('chrono:sw-update',onUpdate);window.addEventListener('chrono:offline-preload-start',onPreloadStart);window.addEventListener('chrono:offline-progress',onOfflineProgress);window.addEventListener('chrono:offline-ready',onOfflineReady);window.addEventListener('chrono:offline-preload-unavailable',onOfflineUnavailable);window.addEventListener('chrono:save',onSaved);window.addEventListener('chrono:checkpoint-saved',onSaved);
    navigator.serviceWorker?.addEventListener('message',onWorkerMessage);
    verifyCache();probeWorker();
    if(!storedOfflineReady()&&'serviceWorker'in navigator){navigator.serviceWorker.ready.then(registration=>{(registration.active??navigator.serviceWorker.controller)?.postMessage('PRECACHE_ALL')}).catch(()=>{})}
    return()=>{disposed=true;if(cacheTimer)window.clearTimeout(cacheTimer);if(statusTimer)window.clearTimeout(statusTimer);if(saveTimer.current)clearTimeout(saveTimer.current);window.removeEventListener('online',onOnline);window.removeEventListener('offline',onOffline);window.removeEventListener('beforeinstallprompt',onPrompt);window.removeEventListener('appinstalled',onInstalled);window.removeEventListener('chrono:sw-update',onUpdate);window.removeEventListener('chrono:offline-preload-start',onPreloadStart);window.removeEventListener('chrono:offline-progress',onOfflineProgress);window.removeEventListener('chrono:offline-ready',onOfflineReady);window.removeEventListener('chrono:offline-preload-unavailable',onOfflineUnavailable);window.removeEventListener('chrono:save',onSaved);window.removeEventListener('chrono:checkpoint-saved',onSaved);navigator.serviceWorker?.removeEventListener('message',onWorkerMessage)};
  },[]);

  const install=async()=>{if(!installEvent)return;await installEvent.prompt();const choice=await installEvent.userChoice;if(choice?.outcome==='accepted')setInstallEvent(null)};
  const downloadOffline=async()=>{if(!online||!('serviceWorker'in navigator))return;setOfflineLoading(true);setOfflineProgress(0);setOfflineReady(false);try{localStorage.removeItem(OFFLINE_READY_KEY)}catch{}window.dispatchEvent(new CustomEvent('chrono:offline-preload-start'));try{const registration=await navigator.serviceWorker.ready;(registration.active??navigator.serviceWorker.controller)?.postMessage('PRECACHE_ALL')}catch{setOfflineLoading(false)}};
  const applyUpdate=()=>{const worker=updateRegistration?.waiting;if(!worker)return;let reloaded=false;navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(reloaded)return;reloaded=true;location.reload()},{once:true});worker.postMessage('SKIP_WAITING')};

  return <div className="app-status" aria-live="polite">
    <span className={`save-pill ${saved?'ready':'working'}`}>{saved?'💾 Saved ✓':'💾 Saving…'}</span>
    {offlineReady?<span className="offline-ready-pill">📦 Offline Ready ✓</span>:offlineLoading?<span className="offline-loading-pill">📦 Downloading {offlineProgress}%</span>:online?<button className="offline-download-pill" onClick={downloadOffline}>⬇ Download Offline</button>:null}
    {!online&&<span className="offline-pill">📴 Offline Mode</span>}
    {updateRegistration?.waiting&&<button className="update-pill" onClick={applyUpdate}>↻ Update Ready</button>}
    {installEvent&&!installed&&<button onClick={install}>＋ Install Game</button>}
    {installed&&<span className="installed-pill">✓ App Mode</span>}
  </div>;
}

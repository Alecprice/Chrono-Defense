import React, { useEffect, useRef, useState } from 'react';

const OFFLINE_CACHE_VERSION='chrono-defense-shell-v18';
const OFFLINE_READY_KEY='chrono-defense-offline-ready-cache';
function storedOfflineReady(){try{return localStorage.getItem(OFFLINE_READY_KEY)===OFFLINE_CACHE_VERSION}catch{return false}}

export function AppStatus(){
  const [online,setOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine);
  const [installEvent,setInstallEvent]=useState(null);
  const [installed,setInstalled]=useState(()=>typeof window!=='undefined'&&window.matchMedia?.('(display-mode: standalone)').matches);
  const [updateRegistration,setUpdateRegistration]=useState(null);
  const [offlineReady,setOfflineReady]=useState(storedOfflineReady);
  const [offlineLoading,setOfflineLoading]=useState(()=>!storedOfflineReady());
  const [saved,setSaved]=useState(true);
  const saveTimer=useRef(null);

  useEffect(()=>{
    const onOnline=()=>setOnline(true);
    const onOffline=()=>setOnline(false);
    const onPrompt=event=>{event.preventDefault();setInstallEvent(event)};
    const onInstalled=()=>{setInstalled(true);setInstallEvent(null)};
    const onUpdate=event=>setUpdateRegistration(event.detail?.registration??null);
    const onPreloadStart=()=>{if(!storedOfflineReady()){setOfflineLoading(true);setOfflineReady(false)}};
    const onOfflineReady=event=>{setOfflineLoading(false);setOfflineReady(true);try{localStorage.setItem(OFFLINE_READY_KEY,event.detail?.cache??OFFLINE_CACHE_VERSION)}catch{}};
    const onOfflineUnavailable=()=>setOfflineLoading(false);
    const onSaved=()=>{setSaved(false);if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>setSaved(true),450)};
    window.addEventListener('online',onOnline);
    window.addEventListener('offline',onOffline);
    window.addEventListener('beforeinstallprompt',onPrompt);
    window.addEventListener('appinstalled',onInstalled);
    window.addEventListener('chrono:sw-update',onUpdate);
    window.addEventListener('chrono:offline-preload-start',onPreloadStart);
    window.addEventListener('chrono:offline-ready',onOfflineReady);
    window.addEventListener('chrono:offline-preload-unavailable',onOfflineUnavailable);
    window.addEventListener('chrono:save',onSaved);
    window.addEventListener('chrono:checkpoint-saved',onSaved);
    return()=>{
      if(saveTimer.current)clearTimeout(saveTimer.current);
      window.removeEventListener('online',onOnline);
      window.removeEventListener('offline',onOffline);
      window.removeEventListener('beforeinstallprompt',onPrompt);
      window.removeEventListener('appinstalled',onInstalled);
      window.removeEventListener('chrono:sw-update',onUpdate);
      window.removeEventListener('chrono:offline-preload-start',onPreloadStart);
      window.removeEventListener('chrono:offline-ready',onOfflineReady);
      window.removeEventListener('chrono:offline-preload-unavailable',onOfflineUnavailable);
      window.removeEventListener('chrono:save',onSaved);
      window.removeEventListener('chrono:checkpoint-saved',onSaved);
    };
  },[]);

  const install=async()=>{
    if(!installEvent)return;
    await installEvent.prompt();
    const choice=await installEvent.userChoice;
    if(choice?.outcome==='accepted')setInstallEvent(null);
  };
  const applyUpdate=()=>{
    const worker=updateRegistration?.waiting;if(!worker)return;
    let reloaded=false;
    navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(reloaded)return;reloaded=true;location.reload()},{once:true});
    worker.postMessage('SKIP_WAITING');
  };

  return <div className="app-status" aria-live="polite">
    <span className={`save-pill ${saved?'ready':'working'}`}>{saved?'💾 Saved ✓':'💾 Saving…'}</span>
    {offlineReady?<span className="offline-ready-pill">📦 Offline Ready ✓</span>:offlineLoading?<span className="offline-loading-pill">📦 Preparing Offline…</span>:online?<span className="offline-warning-pill">⚠ Online Only</span>:null}
    {!online&&<span className="offline-pill">📴 Offline Mode</span>}
    {updateRegistration?.waiting&&<button className="update-pill" onClick={applyUpdate}>↻ Update Ready</button>}
    {installEvent&&!installed&&<button onClick={install}>＋ Install Game</button>}
    {installed&&<span className="installed-pill">✓ App Mode</span>}
  </div>;
}

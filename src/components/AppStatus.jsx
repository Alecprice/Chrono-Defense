import React, { useEffect, useState } from 'react';

export function AppStatus(){
  const [online,setOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine);
  const [installEvent,setInstallEvent]=useState(null);
  const [installed,setInstalled]=useState(()=>typeof window!=='undefined'&&window.matchMedia?.('(display-mode: standalone)').matches);
  const [updateRegistration,setUpdateRegistration]=useState(null);

  useEffect(()=>{
    const onOnline=()=>setOnline(true);
    const onOffline=()=>setOnline(false);
    const onPrompt=event=>{event.preventDefault();setInstallEvent(event)};
    const onInstalled=()=>{setInstalled(true);setInstallEvent(null)};
    const onUpdate=event=>setUpdateRegistration(event.detail?.registration??null);
    window.addEventListener('online',onOnline);
    window.addEventListener('offline',onOffline);
    window.addEventListener('beforeinstallprompt',onPrompt);
    window.addEventListener('appinstalled',onInstalled);
    window.addEventListener('chrono:sw-update',onUpdate);
    return()=>{
      window.removeEventListener('online',onOnline);
      window.removeEventListener('offline',onOffline);
      window.removeEventListener('beforeinstallprompt',onPrompt);
      window.removeEventListener('appinstalled',onInstalled);
      window.removeEventListener('chrono:sw-update',onUpdate);
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
    {!online&&<span className="offline-pill">📴 Offline Mode</span>}
    {updateRegistration?.waiting&&<button className="update-pill" onClick={applyUpdate}>↻ Update Ready</button>}
    {installEvent&&!installed&&<button onClick={install}>＋ Install Game</button>}
    {installed&&<span className="installed-pill">✓ App Mode</span>}
  </div>;
}

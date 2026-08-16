import React, { useEffect, useState } from 'react';

export function AppStatus(){
  const [online,setOnline]=useState(()=>typeof navigator==='undefined'?true:navigator.onLine);
  const [installEvent,setInstallEvent]=useState(null);
  const [installed,setInstalled]=useState(()=>typeof window!=='undefined'&&window.matchMedia?.('(display-mode: standalone)').matches);

  useEffect(()=>{
    const onOnline=()=>setOnline(true);
    const onOffline=()=>setOnline(false);
    const onPrompt=event=>{event.preventDefault();setInstallEvent(event)};
    const onInstalled=()=>{setInstalled(true);setInstallEvent(null)};
    window.addEventListener('online',onOnline);
    window.addEventListener('offline',onOffline);
    window.addEventListener('beforeinstallprompt',onPrompt);
    window.addEventListener('appinstalled',onInstalled);
    return()=>{
      window.removeEventListener('online',onOnline);
      window.removeEventListener('offline',onOffline);
      window.removeEventListener('beforeinstallprompt',onPrompt);
      window.removeEventListener('appinstalled',onInstalled);
    };
  },[]);

  const install=async()=>{
    if(!installEvent)return;
    await installEvent.prompt();
    const choice=await installEvent.userChoice;
    if(choice?.outcome==='accepted')setInstallEvent(null);
  };

  return <div className="app-status" aria-live="polite">
    {!online&&<span className="offline-pill">📴 Offline Mode</span>}
    {installEvent&&!installed&&<button onClick={install}>＋ Install Game</button>}
    {installed&&<span className="installed-pill">✓ App Mode</span>}
  </div>;
}

import React,{useEffect,useRef,useState}from'react';
import{loadSave}from'../core/save.js';

function reminderMinutes(){const value=Number(loadSave()?.settings?.breakReminder??30);return Number.isFinite(value)?Math.max(0,value):30}
export function SessionBreakBridge(){const[minutes,setMinutes]=useState(()=>reminderMinutes()),[show,setShow]=useState(false),[played,setPlayed]=useState(0);const last=useRef(Date.now());
 useEffect(()=>{const refresh=()=>setMinutes(reminderMinutes());window.addEventListener('chrono:save',refresh);return()=>window.removeEventListener('chrono:save',refresh)},[]);
 useEffect(()=>{const id=setInterval(()=>{const now=Date.now(),delta=Math.min(2,Math.max(0,(now-last.current)/1000));last.current=now;if(document.hidden||show||minutes<=0)return;setPlayed(value=>{const next=value+delta;if(next>=minutes*60){setShow(true);window.__chronoSessionBlocked=true;return 0}return next})},1000);return()=>clearInterval(id)},[minutes,show]);
 useEffect(()=>()=>{window.__chronoSessionBlocked=false},[]);
 if(!show)return null;const resume=()=>{window.__chronoSessionBlocked=false;last.current=Date.now();setShow(false);setPlayed(0)};return <div className="session-break-overlay" role="dialog" aria-modal="true" aria-labelledby="chrono-break-title"><section><div className="session-break-icon">🌱</div><small>PLAY BREAK</small><h2 id="chrono-break-title">Great defending!</h2><p>You’ve been playing for a while. The game is paused and your progress is safe.</p><div><span>💧 Grab a drink</span><span>🧍 Stand and stretch</span><span>👀 Look far away for a minute</span></div><button onClick={resume}>I’m Ready to Keep Playing</button><small className="session-break-parent">A parent can change or turn off break reminders in Game Settings.</small></section></div>}

import { useEffect, useRef, useState } from 'react';
import { BATTLE_CHECKPOINT_KEY } from '../core/battleCheckpoint.js';

const BATTLE_ROOTS = '.game-frame.battle-screen,.retro-battle,.future-battle,.space-battle,.rift-battle';
const UNDO_KEY = 'chrono-defense-last-action-undo-v1';
const UNDO_MS = 6500;
const TAP_GUARD_MS = 420;

function storage(){try{return globalThis.localStorage??null}catch{return null}}
function session(){try{return globalThis.sessionStorage??null}catch{return null}}
function checkpoint(){try{return storage()?.getItem(BATTLE_CHECKPOINT_KEY)??null}catch{return null}}
function actionLabel(target){
  const text=(target?.textContent??'').trim();
  if(/sell|remove/i.test(text))return 'Tower sold';
  if(/upgrade|level up|power up/i.test(text))return 'Tower upgraded';
  if(/evolve|branch/i.test(text))return 'Tower evolved';
  if(target?.matches?.('[data-cell],.stone-cell,.retro-cell,.future-cell,.space-cell,.rift-cell,.cell'))return 'Tower placed';
  return 'Action changed';
}
function battleRoot(node){return node?.closest?.(BATTLE_ROOTS)??null}
function fingerprint(root){
  if(!root)return '';
  const occupied=root.querySelectorAll('.occupied,[data-occupied="true"]').length;
  const selected=root.querySelectorAll('.selected,.active,.selected-cell').length;
  return `${occupied}|${selected}|${(root.textContent??'').replace(/\s+/g,' ').slice(0,3000)}`;
}
function isActionTarget(target){
  if(!target)return false;
  if(target.closest?.('.chrono-undo-toast'))return false;
  if(target.matches?.('[data-cell],.stone-cell,.retro-cell,.future-cell,.space-cell,.rift-cell,.cell'))return true;
  const button=target.closest?.('button');
  if(!button)return false;
  return /sell|remove|upgrade|evolve|branch|build|place/i.test(button.textContent??'');
}
function expensiveTarget(target){
  return target?.closest?.('.chrono-too-expensive,.cost.poor,.no-power')??null;
}

export function KidSafeActionBridge(){
  const [undo,setUndo]=useState(null);
  const [notice,setNotice]=useState(null);
  const lastTap=useRef({key:'',time:0});
  const timerRef=useRef(null);
  const noticeTimerRef=useRef(null);

  useEffect(()=>{
    const clearTimer=()=>{if(timerRef.current)clearTimeout(timerRef.current);timerRef.current=null};
    const clearNotice=()=>{if(noticeTimerRef.current)clearTimeout(noticeTimerRef.current);noticeTimerRef.current=null};
    const showNotice=(text)=>{clearNotice();setNotice(text);noticeTimerRef.current=setTimeout(()=>setNotice(null),1900)};
    const onPointerDown=(event)=>{
      const costly=expensiveTarget(event.target);
      if(costly){
        const text=costly.title||'You need more resources for that.';
        showNotice(`💡 ${text}`);
        costly.classList.remove('chrono-kid-shake');
        void costly.offsetWidth;
        costly.classList.add('chrono-kid-shake');
        setTimeout(()=>costly.classList.remove('chrono-kid-shake'),450);
      }
    };
    const onClickCapture=(event)=>{
      const target=event.target;
      if(!isActionTarget(target))return;
      const root=battleRoot(target);
      if(!root)return;
      const button=target.closest?.('button');
      const key=`${root.className}|${button?.textContent??target.getAttribute?.('data-cell')??target.className}`;
      const now=Date.now();
      if(lastTap.current.key===key&&now-lastTap.current.time<TAP_GUARD_MS){
        event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
        showNotice('👍 Got it — one tap is enough!');
        return;
      }
      lastTap.current={key,time:now};
      const before=checkpoint();
      if(!before)return;
      const beforePrint=fingerprint(root);
      const label=actionLabel(button??target);
      setTimeout(()=>{
        const afterRoot=document.querySelector(BATTLE_ROOTS);
        const afterPrint=fingerprint(afterRoot);
        if(beforePrint===afterPrint)return;
        const record={checkpoint:before,label,createdAt:Date.now()};
        try{session()?.setItem(UNDO_KEY,JSON.stringify(record))}catch{}
        clearTimer();
        setUndo(record);
        timerRef.current=setTimeout(()=>{setUndo(null);try{session()?.removeItem(UNDO_KEY)}catch{}},UNDO_MS);
      },90);
    };
    document.addEventListener('pointerdown',onPointerDown,true);
    document.addEventListener('click',onClickCapture,true);
    return()=>{clearTimer();clearNotice();document.removeEventListener('pointerdown',onPointerDown,true);document.removeEventListener('click',onClickCapture,true)};
  },[]);

  const applyUndo=()=>{
    if(!undo?.checkpoint)return;
    try{
      storage()?.setItem(BATTLE_CHECKPOINT_KEY,undo.checkpoint);
      session()?.removeItem(UNDO_KEY);
    }catch{}
    location.reload();
  };

  return <>
    {notice&&<div className="chrono-kid-notice" role="status" aria-live="polite">{notice}</div>}
    {undo&&<div className="chrono-undo-toast" role="status" aria-live="polite">
      <span>↶ {undo.label}</span>
      <button onClick={applyUndo}>Undo</button>
      <button aria-label="Dismiss undo" onClick={()=>setUndo(null)}>×</button>
    </div>}
  </>;
}

import React,{useEffect,useRef,useState}from'react';
import{loadSave}from'../core/save.js';

const OCCUPIED='.cell.occupied,.retro-cell.occupied,.future-cell.occupied,.space-cell.occupied,.rift-cell.occupied';
const RESULTS='.result-card,.retro-result-card,.future-result-card,.space-result-card,.rift-result-card';
const UPGRADE='button';

function juniorEnabled(){return loadSave().settings?.juniorMode!==false}
function isWin(text=''){return /victory|you win|complete|cleared|saved|success/i.test(text)}
function isLoss(text=''){return /lost|defeat|fallen|failed|try again|game over/i.test(text)}

export function JuniorRewardBridge(){
 const[enabled,setEnabled]=useState(juniorEnabled);
 const[toast,setToast]=useState(null);
 const seenPlaced=useRef(new WeakSet());
 const seenResults=useRef(new WeakSet());
 const toastTimer=useRef(0);
 const show=(icon,title,body='')=>{
  window.clearTimeout(toastTimer.current);
  setToast({icon,title,body});
  toastTimer.current=window.setTimeout(()=>setToast(null),1700);
 };

 useEffect(()=>{
  const refresh=()=>setEnabled(juniorEnabled());
  window.addEventListener('chrono:save',refresh);
  return()=>window.removeEventListener('chrono:save',refresh);
 },[]);

 useEffect(()=>{
  if(!enabled)return undefined;
  document.querySelectorAll(OCCUPIED).forEach(el=>seenPlaced.current.add(el));
  const inspect=()=>{
   document.querySelectorAll(OCCUPIED).forEach(el=>{
    if(seenPlaced.current.has(el))return;
    seenPlaced.current.add(el);
    el.classList.add('junior-placed-pop');
    window.setTimeout(()=>el.classList.remove('junior-placed-pop'),700);
    show('✨','Nice build!','That tower is ready to help.');
   });
   document.querySelectorAll(RESULTS).forEach(card=>{
    if(seenResults.current.has(card))return;
    seenResults.current.add(card);
    const text=card.textContent||'';
    if(isWin(text)){
      card.classList.add('junior-result-win');
      show('🏆','You did it!','Great defense! Check the rewards you earned.');
    }else if(isLoss(text)){
      card.classList.add('junior-result-retry');
      show('💪','Good try!','Move a tower closer to the road and try again.');
    }
   });
  };
  inspect();
  const timer=window.setInterval(inspect,300);
  const click=event=>{
   const button=event.target?.closest?.(UPGRADE);
   if(!button||button.disabled)return;
   const text=(button.textContent||'').trim();
   if(/^upgrade|level up|evolve/i.test(text))show('⬆️','Power up!','Your tower just got stronger.');
   else if(/start wave|wave active/i.test(text))show('🌊','Here they come!','Watch the arrows and see where your towers attack.');
  };
  document.addEventListener('click',click,true);
  return()=>{window.clearInterval(timer);window.clearTimeout(toastTimer.current);document.removeEventListener('click',click,true)};
 },[enabled]);

 if(!enabled||!toast)return null;
 return <div className="junior-reward-toast" role="status" aria-live="polite"><span>{toast.icon}</span><div><b>{toast.title}</b>{toast.body&&<small>{toast.body}</small>}</div></div>;
}

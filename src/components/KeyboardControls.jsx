import{useEffect,useState}from'react';
const configs=[
 {id:'retro',root:'.retro-battle',start:'.retro-start',towers:'.retro-tower-grid button'},
 {id:'future',root:'.future-battle',start:'.future-start',towers:'.future-towers button'},
 {id:'space',root:'.space-battle',start:'.space-start',towers:'.space-towers button'},
 {id:'time-rift',root:'.rift-battle',start:'.rift-start',towers:'.rift-towers button'}
];
function active(){return configs.find(c=>document.querySelector(c.root));}
function usableTarget(target){return !target?.closest?.('input,textarea,select,[contenteditable="true"]');}
export function KeyboardControls(){const[activeId,setActiveId]=useState(null),[show,setShow]=useState(()=>globalThis.matchMedia?.('(pointer:fine)').matches??false);
 useEffect(()=>{const media=matchMedia('(pointer:fine)');const change=()=>setShow(media.matches);media.addEventListener?.('change',change);return()=>media.removeEventListener?.('change',change)},[]);
 useEffect(()=>{const scan=setInterval(()=>setActiveId(active()?.id??null),350);return()=>clearInterval(scan)},[]);
 useEffect(()=>{const keydown=e=>{if(!usableTarget(e.target))return;const config=active();if(!config)return;const root=document.querySelector(config.root);if(!root)return;
  if(e.code==='Space'){const button=root.querySelector(config.start);if(button&&!button.disabled){e.preventDefault();button.click()}return}
  if(e.key.toLowerCase()==='p'){const buttons=[...root.querySelectorAll('button')];const pause=buttons.find(b=>b.textContent.trim()==='⏸'||b.textContent.trim()==='▶');if(pause&&!pause.disabled)pause.click();return}
  if(e.key.toLowerCase()==='s'){const buttons=[...root.querySelectorAll('button')];const speed=buttons.find(b=>/^\d×$/.test(b.textContent.trim()));if(speed&&!speed.disabled)speed.click();return}
  if(/^\d$/.test(e.key)){const n=e.key==='0'?10:Number(e.key),buttons=[...root.querySelectorAll(config.towers)].filter(b=>!b.disabled);const button=buttons[n-1];if(button){e.preventDefault();button.click()}}
 };window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown)},[]);
 if(!show||!activeId)return null;return <div className="keyboard-hints" aria-hidden="true"><span><b>Space</b> Wave</span><span><b>P</b> Pause</span><span><b>S</b> Speed</span><span><b>1–0</b> Towers</span></div>}

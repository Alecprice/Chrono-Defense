import{useEffect}from'react';

const CONFIGS=[
 {root:'.game-frame.battle-screen.enhanced-battle',enemy:'.enemy',start:'.wave-button',host:'.board-wrap'},
 {root:'.retro-battle',enemy:'.retro-enemy',start:'.retro-start',host:'.retro-board-wrap'},
 {root:'.future-battle',enemy:'.future-enemy',start:'.future-start',host:'.future-board-wrap'},
 {root:'.space-battle',enemy:'.space-enemy',start:'.space-start',host:'.space-board-wrap'},
 {root:'.rift-battle',enemy:'.rift-enemy',start:'.rift-start',host:'.rift-board-wrap'},
];
function active(){for(const config of CONFIGS){const root=document.querySelector(config.root);if(root)return{config,root}}return null}
function isPaused(root,threats){if(!threats)return false;return[...root.querySelectorAll('button')].some(b=>!b.disabled&&b.textContent.trim()==='▶')}
function resultState(root){const result=root.querySelector('.result-overlay,.retro-result,.future-result,.space-result,.rift-result');if(!result)return null;const text=result.textContent.toLowerCase();return text.includes('victory')||text.includes('clear')||text.includes('stable')?'VICTORY':text.includes('game over')||text.includes('collapse')||text.includes('defeat')?'DEFEAT':'RESULT'}
function ensure(host){let node=host.querySelector(':scope > .chrono-wave-ribbon');if(!node){node=document.createElement('div');node.className='chrono-wave-ribbon';host.appendChild(node)}return node}
export function WaveStatusBridge(){useEffect(()=>{let last='';const timer=setInterval(()=>{const found=active();if(!found)return;const{config,root}=found,host=root.querySelector(config.host);if(!host)return;const threats=root.querySelectorAll(config.enemy).length,start=root.querySelector(config.start),result=resultState(root),paused=isPaused(root,threats);let state='READY',tone='ready';if(result){state=result;tone=result==='VICTORY'?'victory':result==='DEFEAT'?'defeat':'ready'}else if(paused){state='PAUSED';tone='paused'}else if(start?.disabled&&threats){state='ENGAGED';tone='engaged'}else if(start?.disabled){state='DEPLOYING';tone='engaged'}const key=`${config.root}:${state}:${threats}`;if(key===last)return;last=key;const ribbon=ensure(host);ribbon.className=`chrono-wave-ribbon ${tone}`;ribbon.innerHTML=`<i></i><b>${state}</b><span>${threats?`${threats} ${threats===1?'THREAT':'THREATS'}`:'BUILD PHASE'}</span>`},180);return()=>{clearInterval(timer);document.querySelectorAll('.chrono-wave-ribbon').forEach(n=>n.remove())}},[]);return null}

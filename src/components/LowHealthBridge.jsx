import React,{useEffect,useRef,useState}from'react';
import{loadSave}from'../core/save.js';
import{playUiSound}from'../core/audio.js';
const CONFIG={
 'stone-age':{root:'.battle-screen',max:250,label:'Village',icon:'🏕️'},
 retro:{root:'.retro-battle',max:100,label:'Arcade Base',icon:'❤️'},
 future:{root:'.future-battle',max:200,label:'Core',icon:'💙'},
 space:{root:'.space-battle',max:100,label:'Colony',icon:'🌍'},
 'time-rift':{root:'.rift-battle',max:1000,label:'Timeline',icon:'🧭'}
};
function detect(){for(const[world,c]of Object.entries(CONFIG)){const root=document.querySelector(c.root);if(!root)continue;const text=root.querySelector('header')?.textContent??root.textContent??'';const matches=[...text.matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m=>({value:Number(m[1]),max:Number(m[2])}));const found=matches.find(m=>m.max===c.max);if(found)return{world,...c,value:found.value,ratio:found.value/found.max}}return null}
export function LowHealthBridge(){const[warning,setWarning]=useState(null);const seen=useRef('');useEffect(()=>{const id=setInterval(()=>{const h=detect();if(!h){seen.current='';setWarning(null);return}const key=`${h.world}:${Math.ceil(h.ratio*10)}`;if(h.ratio<=.3&&h.value>0){setWarning(h);if(seen.current!==key){seen.current=key;const settings=loadSave().settings??{};playUiSound('warning',settings.sound!==false);if(settings.haptics!==false&&navigator.vibrate)navigator.vibrate([25,35,25])}}else{seen.current='';setWarning(null)}},650);return()=>clearInterval(id)},[]);if(!warning)return null;return <div className="low-health-warning" role="status" aria-live="assertive"><span>{warning.icon}</span><div><b>{warning.label} needs help!</b><small>{warning.value}/{warning.max} left • Stop enemies near the end of the road.</small></div></div>}

import{useEffect}from'react';
const CONFIGS=[
 {id:'retro',root:'.retro-battle',board:'.retro-board',cell:'.retro-cell.selected',panel:'.retro-selected-tower'},
 {id:'future',root:'.future-battle',board:'.future-board',cell:'.future-cell.selected',panel:'.future-selected-tower'},
 {id:'space',root:'.space-battle',board:'.space-board',cell:'.space-cell.selected',panel:'.space-selected-tower'},
 {id:'rift',root:'.rift-battle',board:'.rift-board',cell:'.rift-cell.selected',panel:'.rift-selected-tower'},
];
function rangeFrom(panel){const text=panel?.textContent??'';const match=text.match(/RNG\s*(\d+(?:\.\d+)?)/i)||text.match(/RANGE\s*(\d+(?:\.\d+)?)/i);return Number(match?.[1]??0)}
export function RangePreviewBridge(){useEffect(()=>{const timer=setInterval(()=>{for(const config of CONFIGS){const root=document.querySelector(config.root);if(!root)continue;const board=root.querySelector(config.board),cell=root.querySelector(config.cell),panel=root.querySelector(config.panel);let ring=board?.querySelector(':scope > .chrono-range-preview');const range=rangeFrom(panel);if(!board||!cell||!range){ring?.remove();continue}if(!ring){ring=document.createElement('div');ring.className=`chrono-range-preview ${config.id}`;board.appendChild(ring)}const boardRect=board.getBoundingClientRect(),cellRect=cell.getBoundingClientRect(),size=Math.max(22,(range*2/1200)*boardRect.width);ring.style.width=`${size}px`;ring.style.height=`${size}px`;ring.style.left=`${cellRect.left-boardRect.left+cellRect.width/2}px`;ring.style.top=`${cellRect.top-boardRect.top+cellRect.height/2}px`;ring.title=`Range ${Math.round(range)}`}},180);return()=>{clearInterval(timer);document.querySelectorAll('.chrono-range-preview').forEach(n=>n.remove())}},[]);return null}

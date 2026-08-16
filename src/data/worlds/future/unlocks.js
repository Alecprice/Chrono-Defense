import{futureTowers}from'./towers.js';
export function unlockedFutureTowerIds(completedMap=0){const count=Math.min(futureTowers.length,3+Math.floor(Math.max(0,completedMap)/2));return new Set(futureTowers.slice(0,count).map(t=>t.id));}
export function nextFutureTowerUnlock(completedMap=0){const unlocked=unlockedFutureTowerIds(completedMap);const tower=futureTowers.find(t=>!unlocked.has(t.id));if(!tower)return null;const index=futureTowers.findIndex(t=>t.id===tower.id);const required=Math.max(0,(index-2)*2);return{tower,required,label:`Stabilize Future map ${required} to unlock.`};}

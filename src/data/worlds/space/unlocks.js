import{spaceTowers}from'./towers.js';
export function unlockedSpaceTowerIds(completedMap=0){const count=Math.min(spaceTowers.length,3+Math.floor(Math.max(0,completedMap)/2));return new Set(spaceTowers.slice(0,count).map(t=>t.id));}
export function nextSpaceTowerUnlock(completedMap=0){const unlocked=unlockedSpaceTowerIds(completedMap);const tower=spaceTowers.find(t=>!unlocked.has(t.id));if(!tower)return null;const index=spaceTowers.findIndex(t=>t.id===tower.id);const required=Math.max(0,(index-2)*2);return{tower,required,label:`Secure Space map ${required} to unlock.`};}

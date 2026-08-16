export const stoneAgeTowerUnlocks = [
  { id:'rock-thrower', type:'start', value:0, label:'Starting tower' },
  { id:'spear-hunter', type:'start', value:0, label:'Starting tower' },
  { id:'fire-keeper', type:'map', value:2, label:'Clear Map 2' },
  { id:'tar-pit', type:'map', value:4, label:'Clear Map 4' },
  { id:'boulder-launcher', type:'map', value:5, label:'Defeat the Map 5 boss' },
  { id:'trapper', type:'totems', value:12, label:'Earn 12 Totems' },
  { id:'watchtower', type:'map', value:8, label:'Clear Map 8' },
  { id:'beast-tamer', type:'map', value:10, label:'Defeat the Map 10 boss' },
  { id:'shaman', type:'totems', value:25, label:'Earn 25 Totems' },
  { id:'tribal-warrior', type:'map', value:15, label:'Defeat the Map 15 boss' },
  { id:'mammoth-rider', type:'totems', value:40, label:'Earn 40 Totems' },
  { id:'fire-slinger', type:'map', value:20, label:'Defeat the Map 20 boss' },
];

export function unlockedTowerIds({ completedMap = 0, totems = 0 }) {
  const ids = new Set();
  stoneAgeTowerUnlocks.forEach(unlock=>{
    if(unlock.type==='start') ids.add(unlock.id);
    if(unlock.type==='map'&&completedMap>=unlock.value) ids.add(unlock.id);
    if(unlock.type==='totems'&&totems>=unlock.value) ids.add(unlock.id);
  });
  return ids;
}

export function nextTowerUnlock({completedMap=0,totems=0}={}){
  const unlocked=unlockedTowerIds({completedMap,totems});
  return stoneAgeTowerUnlocks.find(item=>!unlocked.has(item.id))??null;
}

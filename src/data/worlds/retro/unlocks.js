const rules=[
 ['pixel-blaster',()=>true,'Starter tower'],['boom-box',()=>true,'Starter tower'],['freeze-ray',s=>s.completedMap>=2,'Clear Retro Map 2'],['laser-grid',s=>s.completedMap>=4,'Clear Retro Map 4'],['missile-command',s=>s.completedMap>=5,'Beat the first Retro boss'],['tesla-coil',s=>s.cartridges>=12,'Earn 12 Cartridges'],['glitch-tower',s=>s.completedMap>=8,'Clear Retro Map 8'],['coin-magnet',s=>s.completedMap>=10,'Beat Game Over'],['power-station',s=>s.cartridges>=25,'Earn 25 Cartridges'],['boss-buster',s=>s.completedMap>=15,'Clear Retro Map 15'],['byte-cannon',s=>s.cartridges>=40,'Earn 40 Cartridges'],['warp-pad',s=>s.completedMap>=20,'Defeat the Arcade Overlord']
];
export function retroUnlockedTowerIds(retro={}){return new Set(rules.filter(([,test])=>test(retro)).map(([id])=>id));}
export function nextRetroTowerUnlock(retro={}){const found=rules.find(([,test])=>!test(retro));return found?{id:found[0],label:found[2]}:null;}

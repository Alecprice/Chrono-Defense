export const stoneAgeModes = [
  { id:'normal', name:'Normal', icon:'🗿', description:'The standard 10-wave Stone Age campaign.', unlock:()=>true, waves:10, hp:1, speed:1, reward:1, startingResources:1, campYield:1 },
  { id:'hard', name:'Hard', icon:'🪓', description:'Tougher, faster enemies with less room for mistakes.', unlock:s=>s.completedMap>=5, waves:10, hp:1.3, speed:1.08, reward:1.08, startingResources:.9, campYield:1 },
  { id:'survival', name:'Survival', icon:'🔥', description:'Survive 15 increasingly difficult waves.', unlock:s=>s.completedMap>=10, waves:15, hp:1.22, speed:1.05, reward:1.05, startingResources:1, campYield:1 },
  { id:'endless', name:'Endless 30', icon:'♾️', description:'A 30-wave endurance run with escalating enemies.', unlock:s=>s.completedMap>=15, waves:30, hp:1.3, speed:1.08, reward:1.08, startingResources:1, campYield:1 },
  { id:'scarcity', name:'Resource Scarcity', icon:'🏚️', description:'Start poor and gather fewer resources between waves.', unlock:s=>s.totems>=25, waves:10, hp:1.05, speed:1, reward:.82, startingResources:.58, campYield:.72 },
  { id:'one-tower', name:'One Tower', icon:'1️⃣', description:'Choose one combat tower family for the entire battle.', unlock:s=>s.totems>=35, waves:10, hp:1.08, speed:1.02, reward:1.12, startingResources:1.2, campYield:1, oneTower:true },
  { id:'boss-rush', name:'Boss Rush', icon:'👑', description:'Five brutal waves, each ending with a Stone Age boss.', unlock:s=>s.completedMap>=20, waves:5, hp:1.15, speed:1.03, reward:1.25, startingResources:1.45, campYield:1, bossRush:true },
  { id:'tribal-warfare', name:'Tribal Warfare', icon:'⚔️', description:'Rival tribes attack in dense, aggressive formations.', unlock:s=>s.totems>=50, waves:12, hp:1.25, speed:1.1, reward:1.1, startingResources:1, campYield:1, tribesOnly:true },
  { id:'nightmare', name:'Nightmare', icon:'☠️', description:'The ultimate Stone Age challenge.', unlock:s=>s.completedMap>=25&&s.totems>=60, waves:10, hp:1.85, speed:1.22, reward:.9, startingResources:.8, campYield:.85, nightmare:true }
];

export function modeById(id='normal') {
  return stoneAgeModes.find(mode=>mode.id===id) ?? stoneAgeModes[0];
}

export function unlockedModes(stoneSave) {
  return stoneAgeModes.filter(mode=>mode.unlock(stoneSave));
}

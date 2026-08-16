export const stoneAgeMilestones = [
  { id:'maps-1', icon:'🏕️', label:'First Defense', description:'Complete your first Stone Age map.', test:s=>(s.completedMap??0)>=1 },
  { id:'maps-5', icon:'🐅', label:'Valley Guardian', description:'Defeat the first region boss.', test:s=>(s.completedMap??0)>=5 },
  { id:'maps-10', icon:'🌴', label:'Jungle Survivor', description:'Clear the Wild Jungle.', test:s=>(s.completedMap??0)>=10 },
  { id:'maps-15', icon:'❄️', label:'Icebreaker', description:'Survive the Frozen Age.', test:s=>(s.completedMap??0)>=15 },
  { id:'maps-20', icon:'🌋', label:'Fire Walker', description:'Conquer the Burning Lands.', test:s=>(s.completedMap??0)>=20 },
  { id:'maps-25', icon:'🦖', label:'Chrono Pioneer', description:'Complete the Stone Age campaign.', test:s=>(s.completedMap??0)>=25 },
  { id:'totems-15', icon:'🗿', label:'Totem Seeker', description:'Earn 15 Totems.', test:s=>(s.totems??0)>=15 },
  { id:'totems-30', icon:'🗿', label:'Totem Keeper', description:'Earn 30 Totems.', test:s=>(s.totems??0)>=30 },
  { id:'totems-50', icon:'🗿', label:'Totem Guardian', description:'Earn 50 Totems.', test:s=>(s.totems??0)>=50 },
  { id:'totems-75', icon:'🗿', label:'Perfect Chronicle', description:'Earn all 75 Stone Age Totems.', test:s=>(s.totems??0)>=75 },
  { id:'mastery-25', icon:'🔥', label:'Tribal Veteran', description:'Reach Mastery 25.', test:s=>(s.mastery??0)>=25 },
  { id:'mastery-50', icon:'🔥', label:'Tribal Champion', description:'Reach Mastery 50.', test:s=>(s.mastery??0)>=50 },
  { id:'mastery-75', icon:'🔥', label:'Ancient Hero', description:'Reach Mastery 75.', test:s=>(s.mastery??0)>=75 },
  { id:'mastery-100', icon:'🔥', label:'Stone Age Legend', description:'Reach Mastery 100.', test:s=>(s.mastery??0)>=100 },
  { id:'kills-1000', icon:'💀', label:'Beast Breaker', description:'Defeat 1,000 enemies.', test:s=>(s.stats?.kills??0)>=1000 },
  { id:'waves-250', icon:'🌊', label:'Enduring Tribe', description:'Clear 250 waves.', test:s=>(s.stats?.wavesCleared??0)>=250 },
  { id:'bosses-10', icon:'👑', label:'King Slayer', description:'Defeat 10 bosses.', test:s=>(s.stats?.bossesDefeated??0)>=10 },
  { id:'flawless-10', icon:'✨', label:'Untouchable Tribe', description:'Win 10 maps without village damage.', test:s=>(s.stats?.flawlessMaps??0)>=10 },
];

export function milestoneProgress(stoneSave={}) {
  const unlocked=stoneAgeMilestones.filter(item=>item.test(stoneSave));
  const next=stoneAgeMilestones.find(item=>!item.test(stoneSave))??null;
  return { unlocked, next, total:stoneAgeMilestones.length };
}

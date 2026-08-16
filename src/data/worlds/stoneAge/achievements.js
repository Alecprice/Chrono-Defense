const milestones = [10,25,50,100,250,500,1000,2500,5000,10000];
const towerNames = ['Rock Thrower','Spear Hunter','Fire Keeper','Boulder Launcher','Tar Pit','Trapper','Beast Tamer','Shaman','Watchtower','Mammoth Rider','Tribal Warrior','Fire Slinger'];

const general = [
  ['first-blood','First Blood','Defeat your first enemy.',s=>s.kills>=1],
  ['first-wave','First Stand','Clear your first wave.',s=>s.wavesCleared>=1],
  ['first-map','Village Defender','Complete your first map.',s=>s.mapsCompleted>=1],
  ['first-boss','Big Game Hunter','Defeat your first boss.',s=>s.bossesDefeated>=1],
  ['untouched','Untouchable','Complete a map without village damage.',s=>s.flawlessMaps>=1],
  ['totem-15','Totem Seeker','Earn 15 Totems.',s=>s.totems>=15],
  ['totem-30','Totem Keeper','Earn 30 Totems.',s=>s.totems>=30],
  ['totem-50','Totem Guardian','Earn 50 Totems.',s=>s.totems>=50],
  ['totem-75','Stone Age Master','Earn all 75 campaign Totems.',s=>s.totems>=75],
  ['mastery-100','Ancient Legend','Reach Stone Age Mastery 100.',s=>s.mastery>=100]
].map(([id,name,description,test])=>({id,name,description,test,icon:'🏆'}));

const killAchievements = milestones.map((value,index)=>({
  id:`kills-${value}`,
  name:['Hunter','Tracker','Slayer','Warrior','Champion','Predator','Beast Breaker','Extinction Expert','Primal Reaper','Extinction Event'][index],
  description:`Defeat ${value.toLocaleString()} enemies.`,
  icon:'💀',
  test:s=>s.kills>=value
}));

const towerAchievements = towerNames.flatMap((name,towerIndex)=>[100,500,1500].map((value,tier)=>({
  id:`tower-${towerIndex+1}-${value}`,
  name:`${name} ${['Initiate','Veteran','Master'][tier]}`,
  description:`Defeat ${value.toLocaleString()} enemies with ${name}.`,
  icon:'🛖',
  test:s=>(s.towerKills?.[towerIndex]??0)>=value
})));

const mapAchievements = Array.from({length:25},(_,i)=>({
  id:`map-${i+1}-clear`, name:`Path ${i+1} Conquered`, description:`Complete Stone Age map ${i+1}.`, icon:'🗿',
  test:s=>(s.completedMap??0)>=i+1
}));

const modeNames = ['Hard','Survival','Endless 30','Resource Scarcity','One Tower','Boss Rush','Tribal Warfare','Nightmare'];
const modeAchievements = modeNames.map((name,i)=>({
  id:`mode-${i+1}`, name:`${name} Victor`, description:`Complete a ${name} challenge.`, icon:'⚔️',
  test:s=>(s.modeWins?.[name]??0)>=1
}));

const misc = [
  {id:'builder-25',name:'Busy Village',description:'Build 25 structures across all battles.',icon:'🛠️',test:s=>s.structuresBuilt>=25},
  {id:'builder-100',name:'Master Builder',description:'Build 100 structures across all battles.',icon:'🛠️',test:s=>s.structuresBuilt>=100},
  {id:'upgrades-25',name:'Sharper Stones',description:'Purchase 25 tower upgrades.',icon:'⬆️',test:s=>s.upgrades>=25},
  {id:'upgrades-100',name:'Evolutionary Leap',description:'Purchase 100 tower upgrades.',icon:'⬆️',test:s=>s.upgrades>=100},
  {id:'resources-5000',name:'Gatherer',description:'Collect 5,000 total resources.',icon:'🪵',test:s=>s.resourcesCollected>=5000},
  {id:'resources-25000',name:'Prosperous Tribe',description:'Collect 25,000 total resources.',icon:'🪵',test:s=>s.resourcesCollected>=25000},
  {id:'waves-100',name:'Centurion',description:'Clear 100 waves.',icon:'🌊',test:s=>s.wavesCleared>=100},
  {id:'waves-500',name:'Enduring Tribe',description:'Clear 500 waves.',icon:'🌊',test:s=>s.wavesCleared>=500},
  {id:'bosses-10',name:'Boss Breaker',description:'Defeat 10 bosses.',icon:'👑',test:s=>s.bossesDefeated>=10},
  {id:'bosses-50',name:'King Slayer',description:'Defeat 50 bosses.',icon:'👑',test:s=>s.bossesDefeated>=50},
  {id:'flawless-5',name:'Unscarred',description:'Complete 5 maps without village damage.',icon:'✨',test:s=>s.flawlessMaps>=5}
];

const all = [...general,...killAchievements,...towerAchievements,...mapAchievements,...modeAchievements,...misc];
export const stoneAgeAchievements = all.slice(0,100);

export function achievementStatsFromSave(stoneSave={}) {
  return {
    kills: stoneSave.stats?.kills??0,
    wavesCleared: stoneSave.stats?.wavesCleared??0,
    mapsCompleted: stoneSave.stats?.mapsCompleted??0,
    bossesDefeated: stoneSave.stats?.bossesDefeated??0,
    flawlessMaps: stoneSave.stats?.flawlessMaps??0,
    structuresBuilt: stoneSave.stats?.structuresBuilt??0,
    upgrades: stoneSave.stats?.upgrades??0,
    resourcesCollected: stoneSave.stats?.resourcesCollected??0,
    towerKills: stoneSave.stats?.towerKills??{},
    modeWins: stoneSave.stats?.modeWins??{},
    completedMap: stoneSave.completedMap??0,
    totems: stoneSave.totems??0,
    mastery: stoneSave.mastery??0
  };
}

export function newlyUnlockedAchievements(stoneSave, alreadyUnlocked=[]) {
  const known=new Set(alreadyUnlocked);
  const stats=achievementStatsFromSave(stoneSave);
  return stoneAgeAchievements.filter(a=>!known.has(a.id)&&a.test(stats));
}

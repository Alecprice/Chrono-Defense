export const SAVE_KEY = 'chrono-defense-save-v1';

const sharedStats={kills:0,wavesCleared:0,mapsCompleted:0,bossesDefeated:0,flawlessMaps:0,structuresBuilt:0,upgrades:0,resourcesCollected:0,towerKills:{},modeWins:{}};
const stoneAgeDefaults={highestMap:1,completedMap:0,totems:0,mastery:0,tutorialComplete:false,best:{},achievements:[],stats:{...sharedStats}};
const retroDefaults={unlocked:false,highestMap:1,completedMap:0,cartridges:0,mastery:0,tutorialComplete:false,highScore:0,bestCombo:1,best:{},achievements:[],stats:{...sharedStats}};
const futureDefaults={unlocked:false,highestMap:1,completedMap:0,dataCores:0,mastery:0,tutorialComplete:false,best:{},achievements:[],stats:{...sharedStats}};
const spaceDefaults={unlocked:false,highestMap:1,completedMap:0,starCores:0,mastery:0,tutorialComplete:false,best:{},achievements:[],stats:{...sharedStats}};

export function defaultSave(){return{version:1,activeWorld:'stone-age',worlds:{'stone-age':clone(stoneAgeDefaults),retro:clone(retroDefaults),future:clone(futureDefaults),space:clone(spaceDefaults),'time-rift':{unlocked:false}},settings:{reducedMotion:false,haptics:true,effects:'high',largeUI:false,highContrast:false,sound:true,music:true}};}
function clone(value){return JSON.parse(JSON.stringify(value));}
function normalizeStats(value={}){return{...sharedStats,...value,towerKills:{...(value?.towerKills??{})},modeWins:{...(value?.modeWins??{})}};}
function progress(value={},defaults={},rewardKey,maxReward=75){const completedMap=Math.max(0,Math.min(25,Number(value.completedMap)||0));const highestMap=Math.max(1,Math.min(25,Math.max(completedMap||1,Number(value.highestMap)||1)));return{...defaults,...value,completedMap,highestMap,[rewardKey]:Math.max(0,Math.min(maxReward,Number(value[rewardKey])||0)),mastery:Math.max(0,Math.min(100,Number(value.mastery)||0)),best:{...(value.best??{})},achievements:Array.isArray(value.achievements)?value.achievements:[],stats:normalizeStats(value.stats)};}

export function normalizeSave(parsed){
 const base=defaultSave();
 const stone=progress(parsed?.worlds?.['stone-age']??{},stoneAgeDefaults,'totems');
 const retroRaw=parsed?.worlds?.retro??{},retro=progress(retroRaw,retroDefaults,'cartridges');retro.unlocked=Boolean(retroRaw.unlocked||stone.completedMap>=25);retro.highScore=Math.max(0,Number(retroRaw.highScore)||0);retro.bestCombo=Math.max(1,Number(retroRaw.bestCombo)||1);
 const futureRaw=parsed?.worlds?.future??{},future=progress(futureRaw,futureDefaults,'dataCores');future.unlocked=Boolean(futureRaw.unlocked||retro.completedMap>=25);
 const spaceRaw=parsed?.worlds?.space??{},space=progress(spaceRaw,spaceDefaults,'starCores');space.unlocked=Boolean(spaceRaw.unlocked||future.completedMap>=25);
 const riftRaw=parsed?.worlds?.['time-rift']??{};const timeRift={...riftRaw,unlocked:Boolean(riftRaw.unlocked||space.completedMap>=25)};
 return{...base,...parsed,version:1,activeWorld:['stone-age','retro','future','space','time-rift'].includes(parsed?.activeWorld)?parsed.activeWorld:'stone-age',worlds:{...base.worlds,...(parsed?.worlds??{}),'stone-age':stone,retro,future,space,'time-rift':timeRift},settings:{...base.settings,...(parsed?.settings??{})}};
}
export function parseSaveText(text=''){const parsed=JSON.parse(text);if(parsed?.version!==1||!parsed?.worlds?.['stone-age'])throw new Error('This is not a compatible Chrono Defense save.');return normalizeSave(parsed);}
export function serializeSave(save){return JSON.stringify(normalizeSave(save),null,2);}
export function loadSave(storage=globalThis.localStorage){if(!storage)return defaultSave();try{const raw=storage.getItem(SAVE_KEY);return raw?parseSaveText(raw):defaultSave()}catch{return defaultSave()}}
export function persistSave(save,storage=globalThis.localStorage){storage?.setItem(SAVE_KEY,JSON.stringify(normalizeSave(save)));}

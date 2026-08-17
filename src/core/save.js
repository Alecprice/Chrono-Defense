export const SAVE_KEY = 'chrono-defense-save-v1';
export const SAVE_BACKUP_KEY = 'chrono-defense-save-v1-backup';
export const SAVE_META_KEY = 'chrono-defense-save-v1-meta';

const sharedStats={kills:0,wavesCleared:0,mapsCompleted:0,bossesDefeated:0,flawlessMaps:0,structuresBuilt:0,upgrades:0,resourcesCollected:0,towerKills:{},modeWins:{}};
const stoneAgeDefaults={highestMap:1,completedMap:0,totems:0,mastery:0,tutorialComplete:false,best:{},achievements:[],stats:{...sharedStats}};
const retroDefaults={unlocked:false,highestMap:1,completedMap:0,cartridges:0,mastery:0,tutorialComplete:false,highScore:0,bestCombo:1,best:{},achievements:[],stats:{...sharedStats}};
const futureDefaults={unlocked:false,highestMap:1,completedMap:0,dataCores:0,mastery:0,tutorialComplete:false,best:{},achievements:[],stats:{...sharedStats}};
const spaceDefaults={unlocked:false,highestMap:1,completedMap:0,starCores:0,mastery:0,tutorialComplete:false,best:{},achievements:[],stats:{...sharedStats}};
const riftDefaults={unlocked:false,highestMap:1,completedMap:0,riftShards:0,mastery:0,tutorialComplete:false,best:{},stats:{...sharedStats}};

export function defaultSave(){return{version:1,activeWorld:'stone-age',worlds:{'stone-age':clone(stoneAgeDefaults),retro:clone(retroDefaults),future:clone(futureDefaults),space:clone(spaceDefaults),'time-rift':clone(riftDefaults)},settings:{juniorMode:true,reducedMotion:false,haptics:true,effects:'high',largeUI:false,highContrast:false,sound:true,music:true,readAloud:true,dyslexiaFriendly:false,colorblindSafe:false,adaptiveHelp:true,autoPerformance:true,breakReminder:30}};}
function clone(value){return JSON.parse(JSON.stringify(value));}
function normalizeStats(value={}){return{...sharedStats,...value,towerKills:{...(value?.towerKills??{})},modeWins:{...(value?.modeWins??{})}};}
function progress(value={},defaults={},rewardKey,maxReward=75,maxMap=25){const completedMap=Math.max(0,Math.min(maxMap,Number(value.completedMap)||0));const highestMap=Math.max(1,Math.min(maxMap,Math.max(completedMap||1,Number(value.highestMap)||1)));return{...defaults,...value,completedMap,highestMap,[rewardKey]:Math.max(0,Math.min(maxReward,Number(value[rewardKey])||0)),mastery:Math.max(0,Math.min(100,Number(value.mastery)||0)),best:{...(value.best??{})},achievements:Array.isArray(value.achievements)?value.achievements:[],stats:normalizeStats(value.stats)};}

export function normalizeSave(parsed){
 const base=defaultSave();
 const stone=progress(parsed?.worlds?.['stone-age']??{},stoneAgeDefaults,'totems');
 const retroRaw=parsed?.worlds?.retro??{},retro=progress(retroRaw,retroDefaults,'cartridges');retro.unlocked=Boolean(retroRaw.unlocked||stone.completedMap>=25);retro.highScore=Math.max(0,Number(retroRaw.highScore)||0);retro.bestCombo=Math.max(1,Number(retroRaw.bestCombo)||1);
 const futureRaw=parsed?.worlds?.future??{},future=progress(futureRaw,futureDefaults,'dataCores');future.unlocked=Boolean(futureRaw.unlocked||retro.completedMap>=25);
 const spaceRaw=parsed?.worlds?.space??{},space=progress(spaceRaw,spaceDefaults,'starCores');space.unlocked=Boolean(spaceRaw.unlocked||future.completedMap>=25);
 const riftRaw=parsed?.worlds?.['time-rift']??{},timeRift=progress(riftRaw,riftDefaults,'riftShards',36,12);timeRift.unlocked=Boolean(riftRaw.unlocked||space.completedMap>=25);
 return{...base,...parsed,version:1,activeWorld:['stone-age','retro','future','space','time-rift'].includes(parsed?.activeWorld)?parsed.activeWorld:'stone-age',worlds:{...base.worlds,...(parsed?.worlds??{}),'stone-age':stone,retro,future,space,'time-rift':timeRift},settings:{...base.settings,...(parsed?.settings??{})}};
}
export function parseSaveText(text=''){const parsed=JSON.parse(text);if(parsed?.version!==1||!parsed?.worlds?.['stone-age'])throw new Error('This is not a compatible Chrono Defense save.');return normalizeSave(parsed);}
export function serializeSave(save){return JSON.stringify(normalizeSave(save),null,2);}
function parseStored(raw){if(!raw)return null;try{return parseSaveText(raw)}catch{return null}}
function browserStorage(){try{return globalThis.localStorage??null}catch{return null}}
function resolveStorage(storage){return storage===undefined?browserStorage():storage}
function getItem(storage,key){try{return storage?.getItem?.(key)??null}catch{return null}}
function setItem(storage,key,value){try{storage?.setItem?.(key,value);return true}catch{return false}}
function removeItem(storage,key){try{storage?.removeItem?.(key);return true}catch{return false}}

export function loadSave(storage=undefined){const target=resolveStorage(storage);if(!target)return defaultSave();const primary=parseStored(getItem(target,SAVE_KEY));if(primary)return primary;const backup=parseStored(getItem(target,SAVE_BACKUP_KEY));if(backup){setItem(target,SAVE_KEY,JSON.stringify(backup));setItem(target,SAVE_META_KEY,JSON.stringify({lastRecovered:new Date().toISOString(),source:'backup'}));try{globalThis.dispatchEvent?.(new CustomEvent('chrono:save-recovered'))}catch{}return backup}return defaultSave();}
export function persistSave(save,storage=undefined){const normalized=normalizeSave(save),target=resolveStorage(storage);if(!target)return normalized;const current=getItem(target,SAVE_KEY);if(parseStored(current))setItem(target,SAVE_BACKUP_KEY,current);setItem(target,SAVE_KEY,JSON.stringify(normalized));setItem(target,SAVE_META_KEY,JSON.stringify({lastSaved:new Date().toISOString(),version:normalized.version}));try{globalThis.dispatchEvent?.(new CustomEvent('chrono:save',{detail:{save:normalized}}))}catch{}return normalized;}
export function loadSaveMeta(storage=undefined){const target=resolveStorage(storage);try{return JSON.parse(getItem(target,SAVE_META_KEY)||'{}')}catch{return{}}}
export function restoreBackup(storage=undefined){const target=resolveStorage(storage),backup=parseStored(getItem(target,SAVE_BACKUP_KEY));if(!backup)throw new Error('No valid backup save is available.');if(!setItem(target,SAVE_KEY,JSON.stringify(backup)))throw new Error('This browser blocked local save restoration.');return backup;}
export function hasBackup(storage=undefined){return Boolean(parseStored(getItem(resolveStorage(storage),SAVE_BACKUP_KEY)))}
export function clearSaveStorage(storage=undefined){const target=resolveStorage(storage);removeItem(target,SAVE_KEY);removeItem(target,SAVE_BACKUP_KEY);removeItem(target,SAVE_META_KEY);return defaultSave();}

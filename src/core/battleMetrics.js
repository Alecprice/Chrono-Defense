const LIST_KEYS=['uniqueTowerIds','uniqueStructureIds','usedTowerIds','usedRoles','leakedEntityIds','killedEntityIds','erasUsed'];
const MAP_KEYS=['resourcesCollected','endingResources'];
let active={key:null,worldId:null,mapNumber:0,metrics:{}};

function record(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}
function list(value){return Array.isArray(value)?[...new Set(value)]:[];}
function applyContainerPatch(base,patch){
 const safePatch=record(patch)??{};
 const next={...base,...safePatch};
 for(const key of LIST_KEYS){
  if(Object.hasOwn(safePatch,key))next[key]=Array.isArray(safePatch[key])?list(safePatch[key]):list(base[key]);
 }
 for(const key of MAP_KEYS){
  if(Object.hasOwn(safePatch,key))next[key]=record(safePatch[key])?{...(record(base[key])??{}),...safePatch[key]}:{...(record(base[key])??{})};
 }
 return next;
}

export function resetBattleMetrics(worldId,mapNumber,seed={}){
 const defaults={won:false,sold:false,leaks:0,kills:0,bossDefeated:false,bestCombo:1,maxCombatTowers:0,uniqueTowerIds:[],uniqueStructureIds:[],usedTowerIds:[],usedRoles:[],resourcesCollected:{wood:0,stone:0,food:0},endingResources:{},endingCurrency:0,minPrimaryHealth:Infinity,primaryHealth:0,maxPrimaryHealth:0,lives:0,shield:0,core:0,colony:0,stability:0,powerFree:0,environmentActions:0,leakedEntityIds:[],killedEntityIds:[],erasUsed:[]};
 active={key:`${worldId}:${mapNumber}:${Date.now()}`,worldId,mapNumber,metrics:applyContainerPatch(defaults,seed)};return active.key;
}
export function updateBattleMetrics(worldId,mapNumber,patch={}){
 if(active.worldId!==worldId||active.mapNumber!==mapNumber)resetBattleMetrics(worldId,mapNumber);
 const next=applyContainerPatch(active.metrics,patch);
 active={...active,metrics:next};return next;
}
export function getBattleMetrics(worldId,mapNumber){
 if(active.worldId!==worldId||active.mapNumber!==mapNumber)return {};
 const metrics={...active.metrics};
 for(const key of LIST_KEYS)metrics[key]=list(active.metrics[key]);
 for(const key of MAP_KEYS)metrics[key]={...(record(active.metrics[key])??{})};
 return metrics;
}
export function markBattleWon(worldId,mapNumber){return updateBattleMetrics(worldId,mapNumber,{won:true});}

let active={key:null,worldId:null,mapNumber:0,metrics:{}};

export function resetBattleMetrics(worldId,mapNumber,seed={}){
 active={key:`${worldId}:${mapNumber}:${Date.now()}`,worldId,mapNumber,metrics:{won:false,sold:false,leaks:0,kills:0,bossDefeated:false,bestCombo:1,maxCombatTowers:0,uniqueTowerIds:[],uniqueStructureIds:[],usedTowerIds:[],usedRoles:[],resourcesCollected:{wood:0,stone:0,food:0},endingResources:{},endingCurrency:0,minPrimaryHealth:Infinity,primaryHealth:0,maxPrimaryHealth:0,lives:0,shield:0,core:0,colony:0,stability:0,powerFree:0,environmentActions:0,leakedEntityIds:[],killedEntityIds:[],erasUsed:[],...seed}};return active.key;
}
export function updateBattleMetrics(worldId,mapNumber,patch={}){
 if(active.worldId!==worldId||active.mapNumber!==mapNumber)resetBattleMetrics(worldId,mapNumber);
 const next={...active.metrics,...patch};
 if(patch.uniqueTowerIds)next.uniqueTowerIds=[...new Set(patch.uniqueTowerIds)];
 if(patch.uniqueStructureIds)next.uniqueStructureIds=[...new Set(patch.uniqueStructureIds)];
 if(patch.usedTowerIds)next.usedTowerIds=[...new Set(patch.usedTowerIds)];
 if(patch.usedRoles)next.usedRoles=[...new Set(patch.usedRoles)];
 if(patch.leakedEntityIds)next.leakedEntityIds=[...new Set(patch.leakedEntityIds)];
 if(patch.killedEntityIds)next.killedEntityIds=[...new Set(patch.killedEntityIds)];
 if(patch.erasUsed)next.erasUsed=[...new Set(patch.erasUsed)];
 if(patch.resourcesCollected)next.resourcesCollected={...(active.metrics.resourcesCollected??{}),...patch.resourcesCollected};
 if(patch.endingResources)next.endingResources={...(active.metrics.endingResources??{}),...patch.endingResources};
 active={...active,metrics:next};return next;
}
export function getBattleMetrics(worldId,mapNumber){return active.worldId===worldId&&active.mapNumber===mapNumber?{...active.metrics,uniqueTowerIds:[...(active.metrics.uniqueTowerIds??[])],uniqueStructureIds:[...(active.metrics.uniqueStructureIds??[])],usedTowerIds:[...(active.metrics.usedTowerIds??[])],usedRoles:[...(active.metrics.usedRoles??[])],leakedEntityIds:[...(active.metrics.leakedEntityIds??[])],killedEntityIds:[...(active.metrics.killedEntityIds??[])],erasUsed:[...(active.metrics.erasUsed??[])],resourcesCollected:{...(active.metrics.resourcesCollected??{})},endingResources:{...(active.metrics.endingResources??{})}}:{};}
export function markBattleWon(worldId,mapNumber){return updateBattleMetrics(worldId,mapNumber,{won:true});}

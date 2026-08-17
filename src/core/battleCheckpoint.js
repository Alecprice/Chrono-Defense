export const BATTLE_CHECKPOINT_KEY='chrono-defense-battle-checkpoint-v1';
const MAX_AGE_MS=24*60*60*1000;
function storage(){try{return globalThis.localStorage??null}catch{return null}}
function announce(type,detail={}){try{globalThis.dispatchEvent?.(new CustomEvent(type,{detail}))}catch{}}
export function saveBattleCheckpoint(checkpoint){try{const value={...checkpoint,version:1,savedAt:Date.now()};storage()?.setItem(BATTLE_CHECKPOINT_KEY,JSON.stringify(value));announce('chrono:checkpoint-saved',{checkpoint:value,savedAt:value.savedAt});return value}catch{return null}}
export function loadBattleCheckpoint(worldId=null){try{const raw=storage()?.getItem(BATTLE_CHECKPOINT_KEY);if(!raw)return null;const value=JSON.parse(raw);if(value?.version!==1||!value?.worldId||!value?.mapNumber)return null;if(Date.now()-(Number(value.savedAt)||0)>MAX_AGE_MS){clearBattleCheckpoint();return null}if(worldId&&value.worldId!==worldId)return null;return value}catch{return null}}
export function clearBattleCheckpoint(){try{storage()?.removeItem(BATTLE_CHECKPOINT_KEY);announce('chrono:checkpoint-cleared')}catch{}}
export function checkpointMatches(checkpoint,worldId,mapNumber,modeId='normal'){return Boolean(checkpoint&&checkpoint.worldId===worldId&&Number(checkpoint.mapNumber)===Number(mapNumber)&&(checkpoint.modeId??'normal')===modeId)}

import{eraChallenges,setEraChallenge}from'./eraChallenges.js';
const KEY='chrono-defense-era-daily-v1';const SESSION='chrono-defense-active-daily-v1';
function dateKey(date=new Date()){return date.toISOString().slice(0,10)}
function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
export function dailyMission(world,date=new Date()){const day=dateKey(date),h=hash(`${day}:${world}:chrono-defense`),mapNumber=1+(h%25),challenges=eraChallenges(world),challenge=challenges[1+(Math.floor(h/29)%Math.max(1,challenges.length-1))]??challenges[0];return{world,date:day,mapNumber,challengeId:challenge.id,challengeName:challenge.name,icon:challenge.icon,id:`${day}:${world}:${mapNumber}:${challenge.id}`}}
export function dailyStatus(mission,storage=globalThis.localStorage){try{const data=JSON.parse(storage?.getItem(KEY)||'{}');return data[mission.id]??null}catch{return null}}
export function launchDailyMission(mission){setEraChallenge(mission.world,mission.challengeId);try{sessionStorage.setItem(SESSION,JSON.stringify(mission))}catch{globalThis.__chronoDailyMission=mission}}
export function activeDailyMission(){try{return JSON.parse(sessionStorage.getItem(SESSION)||'null')??globalThis.__chronoDailyMission??null}catch{return globalThis.__chronoDailyMission??null}}
export function completeDailyMission(result={},storage=globalThis.localStorage){const mission=activeDailyMission();if(!mission)return null;try{const data=JSON.parse(storage?.getItem(KEY)||'{}');data[mission.id]={completedAt:new Date().toISOString(),...result};storage?.setItem(KEY,JSON.stringify(data));sessionStorage.removeItem(SESSION);globalThis.dispatchEvent?.(new CustomEvent('chrono:daily-complete',{detail:{mission,result:data[mission.id]}}));return data[mission.id]}catch{return null}}
export function clearActiveDaily(){try{sessionStorage.removeItem(SESSION)}catch{}globalThis.__chronoDailyMission=null}

import{riftEnemies}from'./enemies.js';

export const RIFT_WAVES=10;
export const RIFT_MUTATIONS=[
 {id:'unstable',name:'Unstable Current',icon:'⚡',description:'Rift currents accelerate invaders.',speed:1.10},
 {id:'hardened',name:'Hardened Timeline',icon:'🛡️',description:'Temporal armor reinforces every invader.',armor:.08},
 {id:'echoes',name:'Echo Swarm',icon:'👥',description:'The fracture creates extra temporal echoes.',count:1.22},
 {id:'starved',name:'Starved Reality',icon:'◇',description:'Destroyed invaders yield fewer Chronons.',reward:.78},
 {id:'regrowth',name:'Recursive Regrowth',icon:'♻️',description:'Enemies slowly reconstruct themselves.',regen:.004},
 {id:'phasing',name:'Phase Storm',icon:'🫥',description:'Some enemies flicker outside the timeline.',phaseChance:.22},
];
function hash(map,wave){return((map*37+wave*17+map*wave*3)>>>0)}
export function getRiftMutation(mapNumber=1,waveNumber=1){const tier=Math.min(RIFT_MUTATIONS.length-1,Math.floor((mapNumber-1)/2));return RIFT_MUTATIONS[(hash(mapNumber,waveNumber)+tier)%RIFT_MUTATIONS.length]}
function scale(base,mapNumber,waveNumber,mutation){const f=1+(mapNumber-1)*.09+(waveNumber-1)*.10,maxHp=Math.round(base.hp*f);const armor=Math.min(.78,(base.armor??0)+(mutation.armor??0));return{...base,hp:maxHp,maxHp,armor,speed:base.speed*(1+Math.min(.28,(waveNumber-1)*.018))*(mutation.speed??1),reward:Math.max(7,Math.round((8+(mapNumber+waveNumber)*2.2)*(mutation.reward??1))),riftMutation:mutation.id,regenRate:Math.max(base.regen?.01:0,mutation.regen??0),phase:base.phase||((hash(mapNumber,waveNumber+base.id.length)%100)/100<(mutation.phaseChance??0))};}
function mutateCount(base,mutation){return Math.max(1,Math.round(base*(mutation.count??1)))}
export function buildRiftWave({mapNumber=1,waveNumber=1}){const mutation=getRiftMutation(mapNumber,waveNumber),unlocked=Math.min(riftEnemies.length,4+Math.floor(mapNumber/2)),count=mutateCount(7+waveNumber*2+Math.floor(mapNumber/2),mutation),units=[];for(let i=0;i<count;i++){const base=riftEnemies[(i*3+waveNumber+mapNumber)%unlocked];units.push(scale(base,mapNumber,waveNumber,mutation));}if(mapNumber>=5&&waveNumber>=7)units.push(scale(riftEnemies[8],mapNumber,waveNumber,mutation));if(mapNumber>=9&&waveNumber>=8)units.push(scale(riftEnemies[9],mapNumber,waveNumber,mutation));if(mapNumber===12&&waveNumber===10)units.push({id:'chronophage',name:'The Chronophage',icon:'🌌',era:'Rift',hp:72000,maxHp:72000,speed:25,baseSpeed:25,armor:.60,stabilityDamage:350,boss:true,reward:1400,regenRate:.006,phase:true,chronophage:true,bossPhase:1,phaseClock:0,riftMutation:mutation.id});return units;}
export function summarizeRiftWave(units=[]){const m=new Map();units.forEach(u=>{const key=u.boss?`👑 ${u.name}`:u.name;m.set(key,(m.get(key)??0)+1)});return[...m.entries()].map(([name,count])=>({name,count}));}

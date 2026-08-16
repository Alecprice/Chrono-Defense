import{useEffect}from'react';
import{retroMaps}from'../data/worlds/retro/maps.js';
import{futureMaps}from'../data/worlds/future/maps.js';
import{spaceMaps}from'../data/worlds/space/maps.js';
import{riftMaps}from'../data/worlds/timeRift/maps.js';
import{buildRetroWave}from'../data/worlds/retro/waves.js';
import{buildFutureWave}from'../data/worlds/future/waves.js';
import{buildSpaceWave}from'../data/worlds/space/waves.js';
import{buildRiftWave}from'../data/worlds/timeRift/waves.js';

const configs=[
 {id:'retro',root:'.retro-battle',preview:'.retro-preview',enemy:'.retro-enemy',maps:retroMaps,build:buildRetroWave},
 {id:'future',root:'.future-battle',preview:'.future-preview',enemy:'.future-enemy',maps:futureMaps,build:buildFutureWave},
 {id:'space',root:'.space-battle',preview:'.space-preview',enemy:'.space-enemy',maps:spaceMaps,build:buildSpaceWave},
 {id:'time-rift',root:'.rift-battle',preview:'.rift-preview',enemy:'.rift-enemy',maps:riftMaps,build:buildRiftWave}
];
function activeConfig(){return configs.find(c=>document.querySelector(c.root));}
function waveNumber(root){const text=[...root.querySelectorAll('span')].map(el=>el.textContent).find(v=>v.includes('🌊'));const match=text?.match(/(\d+)\s*\/\s*\d+/);return Number(match?.[1]??1);}
function mapNumber(config,root){const text=root.querySelector('header b')?.textContent??'';return config.maps.find(map=>text.includes(map.name))?.number??1;}
function traits(units){const found=new Set();units.forEach(u=>{if(u.boss)found.add('👑 Boss');if(u.cloaked||u.stealth)found.add('🥷 Stealth');if(u.hacker)found.add('💻 Hacker');if(u.emp)found.add('⚡ EMP');if(u.healer||u.regen)found.add('➕ Recovery');if(u.phase)found.add('✨ Phase');if(u.spawns)found.add('🛸 Carrier');if(u.stealsCoins)found.add('🪙 Thief');if((u.armor??0)>=.4)found.add('🛡️ Heavy Armor');if((u.speed??0)>=82)found.add('💨 Very Fast');if(u.erratic)found.add('👾 Erratic');});return[...found].slice(0,6)}
function danger(units){const specials=units.filter(u=>u.boss||u.cloaked||u.stealth||u.hacker||u.emp||u.healer||u.regen||u.phase||u.spawns||u.stealsCoins).length;const armor=units.reduce((n,u)=>n+(u.armor??0),0)/Math.max(1,units.length);const speed=units.reduce((n,u)=>n+(u.speed??0),0)/Math.max(1,units.length);const score=units.length*.12+specials*.45+armor*6+speed/35+(units.some(u=>u.boss)?5:0);return score>=12?['EXTREME','danger-extreme']:score>=8?['HIGH','danger-high']:score>=5?['ELEVATED','danger-elevated']:['NORMAL','danger-normal']}
function ensureIntel(config,root,units){const preview=root.querySelector(config.preview);if(!preview)return;let panel=preview.querySelector('.battle-intel');if(!panel){panel=document.createElement('div');panel.className='battle-intel';preview.appendChild(panel)}const [label,cls]=danger(units),chips=traits(units);panel.className=`battle-intel ${cls}`;panel.innerHTML=`<span class="battle-danger">THREAT ${label}</span><span class="battle-traits">${chips.map(x=>`<i>${x}</i>`).join('')}</span>`;}
function ensureBoss(config,root,units){const boss=units.find(u=>u.boss);let hud=root.querySelector(':scope > .global-boss-hud');if(!boss){hud?.remove();return}if(!hud){hud=document.createElement('div');hud.className='global-boss-hud';root.appendChild(hud)}const live=root.querySelector(`${config.enemy}.boss`),bar=live?.querySelector('i b'),width=bar?.style.width||'100%';hud.innerHTML=`<span>${boss.icon??'👑'}</span><div><small>BOSS THREAT</small><b>${boss.name}</b><i><em style="width:${width}"></em></i></div><strong>${live?'ENGAGED':'INCOMING'}</strong>`;}
function decorateButtons(root){root.querySelectorAll('button:disabled').forEach(button=>{if(button.title)return;const text=button.textContent;if(button.classList.contains('no-power'))button.title='Insufficient Power capacity. Build grid support first.';else if(/LOCKED/i.test(text))button.title='Locked. Continue this era campaign to unlock.';else if(/START|DEPLOY|LAUNCH/i.test(text))button.title='Unavailable while the current wave is active.'})}
export function BattleIntelBridge(){useEffect(()=>{let last='';const timer=setInterval(()=>{const config=activeConfig();if(!config)return;const root=document.querySelector(config.root);if(!root)return;const map=mapNumber(config,root),wave=waveNumber(root),key=`${config.id}:${map}:${wave}:${root.querySelectorAll(config.enemy).length}`;if(key!==last){last=key;let units=[];try{units=config.build({mapNumber:map,waveNumber:wave})??[]}catch{}ensureIntel(config,root,units);ensureBoss(config,root,units)}else{let units=[];try{units=config.build({mapNumber:map,waveNumber:wave})??[]}catch{}ensureBoss(config,root,units)}decorateButtons(root)},250);return()=>clearInterval(timer)},[]);return null;}

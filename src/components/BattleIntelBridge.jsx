import{useEffect}from'react';
import{stoneAgeMaps}from'../data/worlds/stoneAge/maps.js';
import{buildWave as buildStoneAgeWave}from'../data/worlds/stoneAge/waves.js';
import{stoneAgeModes}from'../data/worlds/stoneAge/modes.js';
import{retroMaps}from'../data/worlds/retro/maps.js';
import{futureMaps}from'../data/worlds/future/maps.js';
import{spaceMaps}from'../data/worlds/space/maps.js';
import{riftMaps}from'../data/worlds/timeRift/maps.js';
import{buildRetroWave}from'../data/worlds/retro/waves.js';
import{buildFutureWave}from'../data/worlds/future/waves.js';
import{buildSpaceWave}from'../data/worlds/space/waves.js';
import{buildRiftWave}from'../data/worlds/timeRift/waves.js';

const configs=[
 {id:'stone-age',root:'.game-frame.battle-screen.enhanced-battle',preview:'.wave-preview',enemy:'.enemy',maps:stoneAgeMaps,build:(args,root)=>{const label=root.querySelector('.brand span')?.textContent??'',mode=stoneAgeModes.find(m=>label.includes(m.name))??stoneAgeModes[0];return buildStoneAgeWave({...args,mode})}},
 {id:'retro',root:'.retro-battle',preview:'.retro-preview',enemy:'.retro-enemy',maps:retroMaps,build:args=>buildRetroWave(args)},
 {id:'future',root:'.future-battle',preview:'.future-preview',enemy:'.future-enemy',maps:futureMaps,build:args=>buildFutureWave(args)},
 {id:'space',root:'.space-battle',preview:'.space-preview',enemy:'.space-enemy',maps:spaceMaps,build:args=>buildSpaceWave(args)},
 {id:'time-rift',root:'.rift-battle',preview:'.rift-preview',enemy:'.rift-enemy',maps:riftMaps,build:args=>buildRiftWave(args)}
];
function activeConfig(){return configs.find(c=>document.querySelector(c.root));}
function waveNumber(root){const text=[...root.querySelectorAll('span')].map(el=>el.textContent).find(v=>v.includes('🌊'));const match=text?.match(/(\d+)\s*\/\s*\d+/);return Number(match?.[1]??1);}
function mapNumber(config,root){if(config.id==='stone-age'){const text=root.querySelector('.brand span')?.textContent??'';return Number(text.match(/Map\s+(\d+)/i)?.[1]??1)}const text=root.querySelector('header b')?.textContent??'';return config.maps.find(map=>text.includes(map.name))?.number??1;}
function traits(units){const found=new Set();units.forEach(u=>{if(u.boss)found.add('👑 Boss');if(u.flying)found.add('🦅 Flying');if(u.cloaked||u.stealth)found.add('🥷 Stealth');if(u.hacker)found.add('💻 Hacker');if(u.emp)found.add('⚡ EMP');if(u.healer||u.regen||u.regenRate)found.add('➕ Recovery');if(u.phase)found.add('✨ Phase');if(u.spawns)found.add('🛸 Carrier');if(u.stealsCoins)found.add('🪙 Thief');if(u.berserk)found.add('🔥 Berserk');if(u.pack||u.packLeader)found.add('🐾 Pack');if((u.armor??0)>=.4)found.add('🛡️ Heavy Armor');if((u.speed??0)>=82)found.add('💨 Very Fast');if(u.erratic)found.add('👾 Erratic');});return[...found].slice(0,6)}
function danger(units){const specials=units.filter(u=>u.boss||u.flying||u.cloaked||u.stealth||u.hacker||u.emp||u.healer||u.regen||u.regenRate||u.phase||u.spawns||u.stealsCoins||u.berserk||u.pack||u.packLeader).length;const armor=units.reduce((n,u)=>n+(u.armor??0),0)/Math.max(1,units.length);const speed=units.reduce((n,u)=>n+(u.speed??0),0)/Math.max(1,units.length);const score=units.length*.12+specials*.45+armor*6+speed/35+(units.some(u=>u.boss)?5:0);return score>=12?['EXTREME','danger-extreme']:score>=8?['HIGH','danger-high']:score>=5?['ELEVATED','danger-elevated']:['NORMAL','danger-normal']}
function ensureIntel(config,root,units){const preview=root.querySelector(config.preview);if(!preview)return;let panel=preview.querySelector('.battle-intel');if(!panel){panel=document.createElement('div');panel.className='battle-intel';preview.appendChild(panel)}const [label,cls]=danger(units),chips=traits(units);panel.className=`battle-intel ${cls}`;panel.innerHTML=`<span class="battle-danger">THREAT ${label}</span><span class="battle-traits">${chips.map(x=>`<i>${x}</i>`).join('')}</span>`;}
function ensureBoss(config,root,units){const boss=units.find(u=>u.boss);let hud=root.querySelector(':scope > .global-boss-hud');if(!boss){hud?.remove();return}if(!hud){hud=document.createElement('div');hud.className='global-boss-hud';root.appendChild(hud)}const live=root.querySelector(`${config.enemy}.boss`),bar=live?.querySelector('i b'),width=bar?.style.width||'100%';hud.innerHTML=`<span>${boss.icon??'👑'}</span><div><small>BOSS THREAT</small><b>${boss.name}</b><i><em style="width:${width}"></em></i></div><strong>${live?'ENGAGED':'INCOMING'}</strong>`;}
function decorateButtons(root){root.querySelectorAll('button:disabled').forEach(button=>{if(button.title)return;const text=button.textContent;if(button.classList.contains('no-power'))button.title='Insufficient Power capacity. Build grid support first.';else if(/LOCKED/i.test(text))button.title='Locked. Continue this era campaign to unlock.';else if(/START|DEPLOY|LAUNCH/i.test(text))button.title='Unavailable while the current wave is active.'})}
export function BattleIntelBridge(){useEffect(()=>{let last='',cachedUnits=[];const timer=setInterval(()=>{const config=activeConfig();if(!config){last='';cachedUnits=[];return}const root=document.querySelector(config.root);if(!root){last='';cachedUnits=[];return}const map=mapNumber(config,root),wave=waveNumber(root),key=`${config.id}:${map}:${wave}`;const intelMissing=!root.querySelector(`${config.preview} .battle-intel`);if(key!==last||intelMissing){last=key;try{cachedUnits=config.build({mapNumber:map,waveNumber:wave},root)??[]}catch{cachedUnits=[]}ensureIntel(config,root,cachedUnits)}ensureBoss(config,root,cachedUnits);decorateButtons(root)},300);return()=>{clearInterval(timer);document.querySelectorAll('.battle-intel,.global-boss-hud').forEach(n=>n.remove())}},[]);return null;}

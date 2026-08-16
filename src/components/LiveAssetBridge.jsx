import{useEffect}from'react';
import{assetPath}from'../core/assets.js';
import{retroTowers}from'../data/worlds/retro/towers.js';
import{futureTowers}from'../data/worlds/future/towers.js';
import{spaceTowers}from'../data/worlds/space/towers.js';
import{riftTowers}from'../data/worlds/timeRift/towers.js';
import{retroEnemies}from'../data/worlds/retro/enemies.js';
import{futureEnemies}from'../data/worlds/future/enemies.js';
import{spaceEnemies}from'../data/worlds/space/enemies.js';
import{retroBosses}from'../data/worlds/retro/bosses.js';
import{futureBosses}from'../data/worlds/future/bosses.js';
import{spaceBosses}from'../data/worlds/space/bosses.js';

const worlds=[
 {id:'retro',towerSelector:'.retro-tower-grid button',enemySelector:'.retro-enemy>span',towers:retroTowers,enemies:retroEnemies,bosses:retroBosses},
 {id:'future',towerSelector:'.future-towers button',enemySelector:'.future-enemy>span',towers:futureTowers,enemies:futureEnemies,bosses:futureBosses},
 {id:'space',towerSelector:'.space-towers button',enemySelector:'.space-enemy>span',towers:spaceTowers,enemies:spaceEnemies,bosses:spaceBosses},
 {id:'time-rift',towerSelector:'.rift-towers button',enemySelector:null,towers:riftTowers,enemies:[],bosses:[]}
];
function uniqueIconMap(items){const counts=new Map();items.forEach(item=>counts.set(item.icon,(counts.get(item.icon)??0)+1));return new Map(items.filter(item=>counts.get(item.icon)===1).map(item=>[item.icon,item]));}
function rawIcon(host){return [...host.childNodes].find(node=>node.nodeType===Node.TEXT_NODE)?.textContent?.trim()||host.textContent.trim();}
function mountSprite(host,world,kind,id){if(!host||host.dataset.assetBridge===`${world}:${kind}:${id}`)return;host.dataset.assetBridge=`${world}:${kind}:${id}`;const fallback=rawIcon(host);const img=document.createElement('img');img.className='live-asset-sprite';img.alt='';img.draggable=false;img.src=assetPath(world,kind,id);img.addEventListener('load',()=>{host.dataset.assetLoaded='true';host.classList.add('has-live-asset')},{once:true});img.addEventListener('error',()=>{img.remove();host.classList.remove('has-live-asset');host.dataset.assetLoaded='false';if(!host.textContent.trim())host.append(document.createTextNode(fallback))},{once:true});host.prepend(img);}
function enhanceWorld(config){const byName=new Map(config.towers.map(item=>[item.name,item]));document.querySelectorAll(config.towerSelector).forEach(button=>{const item=byName.get(button.querySelector('b')?.textContent?.trim());const host=button.querySelector(':scope > span');if(item&&host)mountSprite(host,config.id,'towers',item.id)});if(config.enemySelector){const enemies=uniqueIconMap(config.enemies),bosses=uniqueIconMap(config.bosses);document.querySelectorAll(config.enemySelector).forEach(host=>{const icon=rawIcon(host),isBoss=host.parentElement?.classList.contains('boss'),item=(isBoss?bosses:enemies).get(icon);if(item)mountSprite(host,config.id,isBoss?'bosses':'enemies',item.id)})}}
export function LiveAssetBridge(){useEffect(()=>{let raf=0;const run=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>worlds.forEach(enhanceWorld))};const observer=new MutationObserver(run);observer.observe(document.body,{subtree:true,childList:true});run();return()=>{cancelAnimationFrame(raf);observer.disconnect()}},[]);return null;}

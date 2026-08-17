import{useEffect}from'react';
import{loadSave}from'../core/save.js';
import{stoneAgeTowers}from'../data/worlds/stoneAge/towers.js';
import{retroTowers}from'../data/worlds/retro/towers.js';
import{futureTowers}from'../data/worlds/future/towers.js';
import{spaceTowers}from'../data/worlds/space/towers.js';
import{riftTowers}from'../data/worlds/timeRift/towers.js';
const TOWERS=[...stoneAgeTowers,...retroTowers,...futureTowers,...spaceTowers,...riftTowers];
const selectors='.tower-card,.retro-tower-grid button,.future-towers button,.space-towers button,.rift-towers button,.sandbox-towers button';
function enabled(){return loadSave()?.settings?.juniorMode!==false}
function simpleRole(t){const r=(t.role??t.era??'Defense').toLowerCase();if(/starter/.test(r))return'Easy';if(/splash|group|multi/.test(r))return'Hits Groups';if(/control|slow|rewind/.test(r))return'Slows';if(/heavy|boss|strong|pierc|beam/.test(r))return'Strong';if(/support|economy|relay|reactor/.test(r))return'Helps';if(/detect/.test(r))return'Finds Sneaky';if(/damage over time|burn/.test(r))return'Keeps Hurting';return t.role??t.era??'Defense'}
function scan(){if(!enabled())return;document.querySelectorAll(selectors).forEach(button=>{const text=button.textContent??'';const tower=TOWERS.find(t=>text.includes(t.name));if(!tower)return;const role=simpleRole(tower);button.dataset.juniorRole=role;const damage=tower.damage>0?`Damage ${tower.damage}`:'Support';const range=tower.range?`Range ${tower.range}`:'';button.title=`${tower.name} — ${role}. ${damage}${range?`, ${range}`:''}.`;if(!button.getAttribute('aria-label'))button.setAttribute('aria-label',`${tower.name}, ${role}`)})}
export function TowerRoleBridge(){useEffect(()=>{scan();const observer=new MutationObserver(scan);observer.observe(document.body,{subtree:true,childList:true});const save=()=>scan();window.addEventListener('chrono:save',save);return()=>{observer.disconnect();window.removeEventListener('chrono:save',save)}},[]);return null}

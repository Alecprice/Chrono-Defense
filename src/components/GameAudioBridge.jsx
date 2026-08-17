import{useEffect}from'react';
import{loadSave}from'../core/save.js';
import{installGameAudio}from'../core/audio.js';
function currentEra(){const hash=(globalThis.location?.hash||'').replace('#','');return['stone-age','retro','future','space','time-rift'].includes(hash)?hash:'stone-age'}
export function GameAudioBridge(){useEffect(()=>installGameAudio({enabled:()=>loadSave().settings?.sound!==false,musicEnabled:()=>loadSave().settings?.music!==false,era:currentEra}),[]);return null;}

import{useEffect}from'react';
import{loadSave}from'../core/save.js';
import{installButtonSounds}from'../core/audio.js';
export function GameAudioBridge(){useEffect(()=>installButtonSounds({enabled:()=>loadSave().settings?.sound!==false}),[]);return null;}

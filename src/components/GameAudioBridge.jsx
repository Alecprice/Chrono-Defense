import{useEffect}from'react';
import{loadSave}from'../core/save.js';
import{installGameAudio}from'../core/audio.js';
export function GameAudioBridge(){useEffect(()=>installGameAudio({enabled:()=>loadSave().settings?.sound!==false}),[]);return null;}

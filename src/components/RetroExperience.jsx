import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{RetroCampaign}from'./RetroCampaign.jsx';
import{RetroBattle}from'./RetroBattle.jsx';
import{RetroCodex}from'./RetroCodex.jsx';
import{RetroTutorial}from'./RetroTutorial.jsx';

export function RetroExperience({onSwitchWorld}){
 const[save,setSave]=useState(()=>loadSave());const retro=save.worlds.retro;const[screen,setScreen]=useState('campaign');const[selectedMap,setSelectedMap]=useState(()=>Math.min(25,Math.max(1,retro.highestMap??1)));const[battleKey,setBattleKey]=useState(0);const[showCodex,setShowCodex]=useState(false);
 useEffect(()=>persistSave(save),[save]);
 useEffect(()=>{if(!retro.unlocked)onSwitchWorld?.('stone-age')},[retro.unlocked,onSwitchWorld]);
 const start=()=>{setBattleKey(v=>v+1);setScreen('battle')};const back=()=>onSwitchWorld?.('stone-age');const future=()=>onSwitchWorld?.('future');const exit=()=>{setSelectedMap(Math.min(25,Math.max(1,save.worlds.retro.highestMap??1)));setScreen('campaign')};const next=map=>{setSelectedMap(map);setBattleKey(v=>v+1);setScreen('battle')};const finishTutorial=()=>setSave(prev=>({...prev,worlds:{...prev.worlds,retro:{...prev.worlds.retro,tutorialComplete:true}}}));
 return <>{screen==='campaign'?<RetroCampaign save={save} selectedMap={selectedMap} setSelectedMap={setSelectedMap} onStart={start} onBack={back} onFuture={future} onCodex={()=>setShowCodex(true)}/>:<RetroBattle key={`${selectedMap}-${battleKey}`} mapNumber={selectedMap} save={save} setSave={setSave} onExit={exit} onNextMap={next}/>} {!retro.tutorialComplete&&<RetroTutorial onComplete={finishTutorial}/>} {showCodex&&<RetroCodex retroSave={retro} onClose={()=>setShowCodex(false)}/>}</>;
}

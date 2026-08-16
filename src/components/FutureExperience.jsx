import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{futureTowers}from'../data/worlds/future/towers.js';
import{futureEnemies}from'../data/worlds/future/enemies.js';
import{futureBosses}from'../data/worlds/future/bosses.js';
import{FutureCampaign}from'./FutureCampaign.jsx';
import{FutureBattle}from'./FutureBattle.jsx';
import{FutureTutorial}from'./FutureTutorial.jsx';
import{WorldCodex}from'./WorldCodex.jsx';
export function FutureExperience({onSwitchWorld}){
 const[save,setSave]=useState(()=>loadSave()),world=save.worlds.future,[screen,setScreen]=useState('campaign'),[selectedMap,setSelectedMap]=useState(()=>Math.min(25,Math.max(1,world.highestMap??1))),[battleKey,setBattleKey]=useState(0),[showCodex,setShowCodex]=useState(false);
 useEffect(()=>persistSave(save),[save]);useEffect(()=>{if(!world.unlocked)onSwitchWorld?.('retro')},[world.unlocked,onSwitchWorld]);
 const start=()=>{setBattleKey(v=>v+1);setScreen('battle')},back=()=>onSwitchWorld?.('retro'),space=()=>onSwitchWorld?.('space'),exit=()=>{setSelectedMap(Math.min(25,Math.max(1,save.worlds.future.highestMap??1)));setScreen('campaign')},next=map=>{setSelectedMap(map);setBattleKey(v=>v+1);setScreen('battle')},finishTutorial=()=>setSave(prev=>({...prev,worlds:{...prev.worlds,future:{...prev.worlds.future,tutorialComplete:true}}}));
 return <>{screen==='campaign'?<FutureCampaign save={save} selectedMap={selectedMap} setSelectedMap={setSelectedMap} onStart={start} onBack={back} onSpace={space} onCodex={()=>setShowCodex(true)}/>:<FutureBattle key={`${selectedMap}-${battleKey}`} mapNumber={selectedMap} save={save} setSave={setSave} onExit={exit} onNextMap={next}/>} {!world.tutorialComplete&&<FutureTutorial onComplete={finishTutorial}/>} {showCodex&&<WorldCodex world="future" title="Future Field Guide" towers={futureTowers} enemies={futureEnemies} bosses={futureBosses} onClose={()=>setShowCodex(false)}/>}</>;
}

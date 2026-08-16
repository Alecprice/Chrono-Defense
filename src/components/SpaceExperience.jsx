import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{SpaceCampaign}from'./SpaceCampaign.jsx';
import{SpaceBattle}from'./SpaceBattle.jsx';
import{SpaceTutorial}from'./SpaceTutorial.jsx';
import{AdvancedEraCodex}from'./AdvancedEraCodex.jsx';
import{spaceTowers}from'../data/worlds/space/towers.js';
import{spaceEnemies}from'../data/worlds/space/enemies.js';
import{spaceBosses}from'../data/worlds/space/bosses.js';
export function SpaceExperience({onSwitchWorld}){
 const[save,setSave]=useState(()=>loadSave()),world=save.worlds.space,[screen,setScreen]=useState('campaign'),[selectedMap,setSelectedMap]=useState(()=>Math.min(25,Math.max(1,world.highestMap??1))),[battleKey,setBattleKey]=useState(0),[showCodex,setShowCodex]=useState(false);
 useEffect(()=>persistSave(save),[save]);useEffect(()=>{if(!world.unlocked)onSwitchWorld?.('future')},[world.unlocked,onSwitchWorld]);
 const start=()=>{setBattleKey(v=>v+1);setScreen('battle')},back=()=>onSwitchWorld?.('future'),rift=()=>onSwitchWorld?.('time-rift'),exit=()=>{setSelectedMap(Math.min(25,Math.max(1,save.worlds.space.highestMap??1)));setScreen('campaign')},next=map=>{setSelectedMap(map);setBattleKey(v=>v+1);setScreen('battle')},finishTutorial=()=>setSave(prev=>({...prev,worlds:{...prev.worlds,space:{...prev.worlds.space,tutorialComplete:true}}}));
 return <>{screen==='campaign'?<SpaceCampaign save={save} selectedMap={selectedMap} setSelectedMap={setSelectedMap} onStart={start} onBack={back} onRift={rift} onCodex={()=>setShowCodex(true)}/>:<SpaceBattle key={`${selectedMap}-${battleKey}`} mapNumber={selectedMap} save={save} setSave={setSave} onExit={exit} onNextMap={next}/>} {!world.tutorialComplete&&<SpaceTutorial onComplete={finishTutorial}/>} {showCodex&&<AdvancedEraCodex worldId="space" title="Space Field Guide" subtitle="COLONY DEFENSE DATABASE" towers={spaceTowers} enemies={spaceEnemies} bosses={spaceBosses} onClose={()=>setShowCodex(false)}/>}</>;
}

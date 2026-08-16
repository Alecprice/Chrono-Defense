import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{setEraChallenge}from'../core/eraChallenges.js';
import{clearActiveDaily,launchDailyMission}from'../core/eraDaily.js';
import{RetroCampaign}from'./RetroCampaign.jsx';
import{RetroBattleV2}from'./RetroBattleV2.jsx';
import{RetroCodex}from'./RetroCodex.jsx';
import{RetroTutorial}from'./RetroTutorial.jsx';

export function RetroExperience({onSwitchWorld}){
 const[save,setSave]=useState(()=>loadSave());const retro=save.worlds.retro;const[screen,setScreen]=useState('campaign');const[selectedMap,setSelectedMap]=useState(()=>Math.min(25,Math.max(1,retro.highestMap??1)));const[battleKey,setBattleKey]=useState(0);const[showCodex,setShowCodex]=useState(false);const[challenge,setChallenge]=useState('normal');
 useEffect(()=>persistSave(save),[save]);useEffect(()=>setEraChallenge('retro',challenge),[challenge]);useEffect(()=>{if(!retro.unlocked)onSwitchWorld?.('stone-age')},[retro.unlocked,onSwitchWorld]);
 const start=()=>{clearActiveDaily();setEraChallenge('retro',challenge);setBattleKey(v=>v+1);setScreen('battle')};const launchDaily=mission=>{launchDailyMission(mission);setSelectedMap(mission.mapNumber);setChallenge(mission.challengeId);setBattleKey(v=>v+1);setScreen('battle')};const back=()=>onSwitchWorld?.('stone-age');const future=()=>onSwitchWorld?.('future');const exit=()=>{setSelectedMap(Math.min(25,Math.max(1,save.worlds.retro.highestMap??1)));setScreen('campaign')};const next=map=>{clearActiveDaily();setSelectedMap(map);setEraChallenge('retro',challenge);setBattleKey(v=>v+1);setScreen('battle')};const finishTutorial=()=>setSave(prev=>({...prev,worlds:{...prev.worlds,retro:{...prev.worlds.retro,tutorialComplete:true}}}));
 return <>{screen==='campaign'?<RetroCampaign save={save} selectedMap={selectedMap} setSelectedMap={setSelectedMap} challenge={challenge} setChallenge={setChallenge} onDaily={launchDaily} onStart={start} onBack={back} onFuture={future} onCodex={()=>setShowCodex(true)}/>:<RetroBattleV2 key={`${selectedMap}-${challenge}-${battleKey}`} mapNumber={selectedMap} save={save} setSave={setSave} onExit={exit} onNextMap={next}/>} {!retro.tutorialComplete&&<RetroTutorial onComplete={finishTutorial}/>} {showCodex&&<RetroCodex retroSave={retro} onClose={()=>setShowCodex(false)}/>}</>;
}

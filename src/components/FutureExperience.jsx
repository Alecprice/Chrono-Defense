import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{clearBattleCheckpoint,loadBattleCheckpoint}from'../core/battleCheckpoint.js';
import{setEraChallenge}from'../core/eraChallenges.js';
import{clearActiveDaily,launchDailyMission}from'../core/eraDaily.js';
import{trackedEraBattleSetter}from'../core/eraStats.js';
import{useEraActionStats}from'../core/eraActionStats.js';
import{FutureCampaign}from'./FutureCampaign.jsx';
import{FutureBattleV2}from'./FutureBattleV2.jsx';
import{FutureTutorial}from'./FutureTutorial.jsx';
import{AdvancedEraCodex}from'./AdvancedEraCodex.jsx';
import{futureTowers}from'../data/worlds/future/towers.js';
import{futureEnemies}from'../data/worlds/future/enemies.js';
import{futureBosses}from'../data/worlds/future/bosses.js';
export function FutureExperience({onSwitchWorld}){
 const[save,setSave]=useState(()=>loadSave()),world=save.worlds.future,[resumeCheckpoint,setResumeCheckpoint]=useState(()=>loadBattleCheckpoint('future')),[screen,setScreen]=useState(()=>world.tutorialComplete&&resumeCheckpoint?'battle':'campaign'),[selectedMap,setSelectedMap]=useState(()=>resumeCheckpoint?.mapNumber??Math.min(25,Math.max(1,world.highestMap??1))),[battleKey,setBattleKey]=useState(0),[showCodex,setShowCodex]=useState(false),[challenge,setChallenge]=useState(()=>resumeCheckpoint?.modeId??'normal'),battleSetSave=trackedEraBattleSetter(setSave,{worldId:'future',challenge,mapNumber:selectedMap});useEraActionStats(setSave,'future',screen==='battle');
 useEffect(()=>persistSave(save),[save]);useEffect(()=>setEraChallenge('future',challenge),[challenge]);useEffect(()=>{if(!world.unlocked)onSwitchWorld?.('retro')},[world.unlocked,onSwitchWorld]);
 const start=()=>{clearBattleCheckpoint();setResumeCheckpoint(null);clearActiveDaily();setEraChallenge('future',challenge);setBattleKey(v=>v+1);setScreen('battle')},launchDaily=mission=>{clearBattleCheckpoint();setResumeCheckpoint(null);launchDailyMission(mission);setSelectedMap(mission.mapNumber);setChallenge(mission.challengeId);setBattleKey(v=>v+1);setScreen('battle')},back=()=>onSwitchWorld?.('retro'),space=()=>onSwitchWorld?.('space'),exit=()=>{clearBattleCheckpoint();setResumeCheckpoint(null);setSelectedMap(Math.min(25,Math.max(1,save.worlds.future.highestMap??1)));setScreen('campaign')},next=map=>{clearBattleCheckpoint();setResumeCheckpoint(null);clearActiveDaily();setSelectedMap(map);setEraChallenge('future',challenge);setBattleKey(v=>v+1);setScreen('battle')},finishTutorial=()=>setSave(prev=>({...prev,worlds:{...prev.worlds,future:{...prev.worlds.future,tutorialComplete:true}}}));
 if(!world.tutorialComplete)return <FutureTutorial onComplete={finishTutorial}/>;
 return <>{screen==='campaign'?<FutureCampaign save={save} selectedMap={selectedMap} setSelectedMap={setSelectedMap} challenge={challenge} setChallenge={setChallenge} onDaily={launchDaily} onStart={start} onBack={back} onSpace={space} onCodex={()=>setShowCodex(true)}/>:<FutureBattleV2 key={`${selectedMap}-${challenge}-${battleKey}`} mapNumber={selectedMap} modeId={challenge} save={save} setSave={battleSetSave} onExit={exit} onNextMap={next} resumeCheckpoint={resumeCheckpoint}/>} {showCodex&&<AdvancedEraCodex worldId="future" title="Future Field Guide" subtitle="GRID INTELLIGENCE DATABASE" towers={futureTowers} enemies={futureEnemies} bosses={futureBosses} onClose={()=>setShowCodex(false)}/>}</>;
}

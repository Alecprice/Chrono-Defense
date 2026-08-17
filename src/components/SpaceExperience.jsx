import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{clearBattleCheckpoint,loadBattleCheckpoint}from'../core/battleCheckpoint.js';
import{setEraChallenge}from'../core/eraChallenges.js';
import{clearActiveDaily,launchDailyMission}from'../core/eraDaily.js';
import{trackedEraBattleSetter}from'../core/eraStats.js';
import{useEraActionStats}from'../core/eraActionStats.js';
import{SpaceCampaign}from'./SpaceCampaign.jsx';
import{SpaceBattleV2}from'./SpaceBattleV2.jsx';
import{SpaceTutorial}from'./SpaceTutorial.jsx';
import{AdvancedEraCodex}from'./AdvancedEraCodex.jsx';
import{ResumeBattlePrompt}from'./ResumeBattlePrompt.jsx';
import{spaceTowers}from'../data/worlds/space/towers.js';
import{spaceEnemies}from'../data/worlds/space/enemies.js';
import{spaceBosses}from'../data/worlds/space/bosses.js';
export function SpaceExperience({onSwitchWorld}){
 const[save,setSave]=useState(()=>loadSave()),world=save.worlds.space,[resumeCheckpoint,setResumeCheckpoint]=useState(()=>loadBattleCheckpoint('space')),[screen,setScreen]=useState(()=>world.tutorialComplete&&resumeCheckpoint?'resume':'campaign'),[selectedMap,setSelectedMap]=useState(()=>resumeCheckpoint?.mapNumber??Math.min(25,Math.max(1,world.highestMap??1))),[battleKey,setBattleKey]=useState(0),[showCodex,setShowCodex]=useState(false),[challenge,setChallenge]=useState(()=>resumeCheckpoint?.modeId??'normal'),battleSetSave=trackedEraBattleSetter(setSave,{worldId:'space',challenge,mapNumber:selectedMap});useEraActionStats(setSave,'space',screen==='battle');
 useEffect(()=>persistSave(save),[save]);useEffect(()=>setEraChallenge('space',challenge),[challenge]);useEffect(()=>{if(!world.unlocked)onSwitchWorld?.('future')},[world.unlocked,onSwitchWorld]);
 const start=()=>{clearBattleCheckpoint();setResumeCheckpoint(null);clearActiveDaily();setEraChallenge('space',challenge);setBattleKey(v=>v+1);setScreen('battle')},launchDaily=mission=>{clearBattleCheckpoint();setResumeCheckpoint(null);launchDailyMission(mission);setSelectedMap(mission.mapNumber);setChallenge(mission.challengeId);setBattleKey(v=>v+1);setScreen('battle')},back=()=>onSwitchWorld?.('future'),rift=()=>onSwitchWorld?.('time-rift'),exit=()=>{clearBattleCheckpoint();setResumeCheckpoint(null);setSelectedMap(Math.min(25,Math.max(1,save.worlds.space.highestMap??1)));setScreen('campaign')},next=map=>{clearBattleCheckpoint();setResumeCheckpoint(null);clearActiveDaily();setSelectedMap(map);setEraChallenge('space',challenge);setBattleKey(v=>v+1);setScreen('battle')},resume=()=>setScreen('battle'),fresh=()=>{clearBattleCheckpoint();setResumeCheckpoint(null);setBattleKey(v=>v+1);setScreen('battle')},campaign=()=>{clearBattleCheckpoint();setResumeCheckpoint(null);setScreen('campaign')},finishTutorial=()=>setSave(prev=>({...prev,worlds:{...prev.worlds,space:{...prev.worlds.space,tutorialComplete:true}}}));
 if(!world.tutorialComplete)return <SpaceTutorial onComplete={finishTutorial}/>;
 if(screen==='resume'&&resumeCheckpoint)return <ResumeBattlePrompt worldId="space" checkpoint={resumeCheckpoint} onContinue={resume} onFresh={fresh} onCampaign={campaign}/>;
 return <>{screen==='campaign'?<SpaceCampaign save={save} selectedMap={selectedMap} setSelectedMap={setSelectedMap} challenge={challenge} setChallenge={setChallenge} onDaily={launchDaily} onStart={start} onBack={back} onRift={rift} onCodex={()=>setShowCodex(true)}/>:<SpaceBattleV2 key={`${selectedMap}-${challenge}-${battleKey}`} mapNumber={selectedMap} modeId={challenge} save={save} setSave={battleSetSave} onExit={exit} onNextMap={next} resumeCheckpoint={resumeCheckpoint}/>} {showCodex&&<AdvancedEraCodex worldId="space" title="Space Field Guide" subtitle="COLONY DEFENSE DATABASE" towers={spaceTowers} enemies={spaceEnemies} bosses={spaceBosses} onClose={()=>setShowCodex(false)}/>}</>;
}

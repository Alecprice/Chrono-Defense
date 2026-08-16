import React,{useEffect,useState}from'react';
import{loadSave,persistSave}from'../core/save.js';
import{setEraChallenge}from'../core/eraChallenges.js';
import{clearActiveDaily,launchDailyMission}from'../core/eraDaily.js';
import{SpaceCampaign}from'./SpaceCampaign.jsx';
import{SpaceBattle}from'./SpaceBattle.jsx';
import{SpaceTutorial}from'./SpaceTutorial.jsx';
import{AdvancedEraCodex}from'./AdvancedEraCodex.jsx';
import{spaceTowers}from'../data/worlds/space/towers.js';
import{spaceEnemies}from'../data/worlds/space/enemies.js';
import{spaceBosses}from'../data/worlds/space/bosses.js';
export function SpaceExperience({onSwitchWorld}){
 const[save,setSave]=useState(()=>loadSave()),world=save.worlds.space,[screen,setScreen]=useState('campaign'),[selectedMap,setSelectedMap]=useState(()=>Math.min(25,Math.max(1,world.highestMap??1))),[battleKey,setBattleKey]=useState(0),[showCodex,setShowCodex]=useState(false),[challenge,setChallenge]=useState('normal');
 useEffect(()=>persistSave(save),[save]);useEffect(()=>setEraChallenge('space',challenge),[challenge]);useEffect(()=>{if(!world.unlocked)onSwitchWorld?.('future')},[world.unlocked,onSwitchWorld]);
 const start=()=>{clearActiveDaily();setEraChallenge('space',challenge);setBattleKey(v=>v+1);setScreen('battle')},launchDaily=mission=>{launchDailyMission(mission);setSelectedMap(mission.mapNumber);setChallenge(mission.challengeId);setBattleKey(v=>v+1);setScreen('battle')},back=()=>onSwitchWorld?.('future'),rift=()=>onSwitchWorld?.('time-rift'),exit=()=>{setSelectedMap(Math.min(25,Math.max(1,save.worlds.space.highestMap??1)));setScreen('campaign')},next=map=>{clearActiveDaily();setSelectedMap(map);setEraChallenge('space',challenge);setBattleKey(v=>v+1);setScreen('battle')},finishTutorial=()=>setSave(prev=>({...prev,worlds:{...prev.worlds,space:{...prev.worlds.space,tutorialComplete:true}}}));
 return <>{screen==='campaign'?<SpaceCampaign save={save} selectedMap={selectedMap} setSelectedMap={setSelectedMap} challenge={challenge} setChallenge={setChallenge} onDaily={launchDaily} onStart={start} onBack={back} onRift={rift} onCodex={()=>setShowCodex(true)}/>:<SpaceBattle key={`${selectedMap}-${challenge}-${battleKey}`} mapNumber={selectedMap} save={save} setSave={setSave} onExit={exit} onNextMap={next}/>} {!world.tutorialComplete&&<SpaceTutorial onComplete={finishTutorial}/>} {showCodex&&<AdvancedEraCodex worldId="space" title="Space Field Guide" subtitle="COLONY DEFENSE DATABASE" towers={spaceTowers} enemies={spaceEnemies} bosses={spaceBosses} onClose={()=>setShowCodex(false)}/>}</>;
}

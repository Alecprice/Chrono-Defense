import React, { useEffect, useMemo, useState } from 'react';
import { loadSave, persistSave } from '../core/save.js';
import { objectiveAwareBattleSetter } from '../core/eraStats.js';
import { stoneAgeAchievements, newlyUnlockedAchievements } from '../data/worlds/stoneAge/achievements.js';
import { stoneAgeModes } from '../data/worlds/stoneAge/modes.js';
import { StoneAgeCampaign } from './StoneAgeCampaign.jsx';
import { StoneAgeBattleV3 } from './StoneAgeBattleV3.jsx';
import { StoneAgeCodex } from './StoneAgeCodex.jsx';
import { StoneAgeTutorial } from './StoneAgeTutorial.jsx';
import { GameSettings } from './GameSettings.jsx';
import { StoneAgeStats } from './StoneAgeStats.jsx';
import { SaveManager } from './SaveManager.jsx';

export function StoneAgeExperience({onSwitchWorld}) {
  const [save,setSave]=useState(()=>loadSave());
  const stone=save.worlds['stone-age'];
  const [screen,setScreen]=useState('campaign');
  const [selectedMap,setSelectedMap]=useState(()=>Math.min(25,Math.max(1,stone.highestMap??1)));
  const [selectedMode,setSelectedMode]=useState('normal');
  const [battleKey,setBattleKey]=useState(0);
  const [showAchievements,setShowAchievements]=useState(false);
  const [showCodex,setShowCodex]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [showStats,setShowStats]=useState(false);
  const [showSaveTools,setShowSaveTools]=useState(false);
  const [achievementToast,setAchievementToast]=useState(null);
  const objectiveSetSave=useMemo(()=>objectiveAwareBattleSetter(setSave,{worldId:'stone-age',mapNumber:selectedMap}),[selectedMap]);
  const battleSetSave=selectedMode==='normal'?objectiveSetSave:setSave;

  useEffect(()=>persistSave(save),[save]);

  useEffect(()=>{
    const root=document.documentElement;
    root.classList.toggle('chrono-reduced-motion',Boolean(save.settings?.reducedMotion));
    root.classList.toggle('chrono-large-ui',Boolean(save.settings?.largeUI));
    root.classList.toggle('chrono-high-contrast',Boolean(save.settings?.highContrast));
    root.dataset.effects=save.settings?.effects??'high';
    return()=>{
      root.classList.remove('chrono-reduced-motion','chrono-large-ui','chrono-high-contrast');
      delete root.dataset.effects;
    };
  },[save.settings]);

  useEffect(()=>{
    if(save.settings?.haptics===false||typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return undefined;
    const pulse=event=>{const button=event.target?.closest?.('button');if(button&&!button.disabled)try{navigator.vibrate(8)}catch{}};
    document.addEventListener('pointerup',pulse,{passive:true});
    return()=>document.removeEventListener('pointerup',pulse);
  },[save.settings?.haptics]);

  useEffect(()=>{
    const mode=stoneAgeModes.find(item=>item.id===selectedMode);
    if(mode&&!mode.unlock(stone)) setSelectedMode('normal');
  },[selectedMode,stone.completedMap,stone.totems]);

  useEffect(()=>{
    if(!stone.tutorialComplete)return;
    const unlocked=stone.achievements??[];
    const fresh=newlyUnlockedAchievements(stone,unlocked);
    if(!fresh.length) return;
    setSave(prev=>{
      const old=prev.worlds['stone-age'];
      const ids=[...(old.achievements??[]),...fresh.map(item=>item.id)];
      return {...prev,worlds:{...prev.worlds,'stone-age':{...old,achievements:[...new Set(ids)]}}};
    });
    setAchievementToast(fresh[0]);
  },[
    stone.tutorialComplete,stone.stats?.kills,stone.stats?.wavesCleared,stone.stats?.mapsCompleted,stone.stats?.bossesDefeated,
    stone.stats?.flawlessMaps,stone.stats?.structuresBuilt,stone.stats?.upgrades,stone.stats?.resourcesCollected,
    stone.completedMap,stone.totems,stone.mastery
  ]);

  useEffect(()=>{if(!achievementToast)return;const timer=setTimeout(()=>setAchievementToast(null),4200);return()=>clearTimeout(timer)},[achievementToast]);

  const unlockedSet=useMemo(()=>new Set(stone.achievements??[]),[stone.achievements]);
  const enterBattle=()=>{setBattleKey(value=>value+1);setScreen('battle')};
  const exitBattle=()=>{setSelectedMap(Math.min(25,Math.max(1,save.worlds['stone-age'].highestMap??selectedMap)));setScreen('campaign')};
  const nextMap=next=>{setSelectedMap(next);setBattleKey(value=>value+1);setScreen('battle')};
  const updateSettings=settings=>setSave(prev=>({...prev,settings}));
  const finishTutorial=()=>{
    setScreen('campaign');
    setSelectedMode('normal');
    setSave(prev=>{const old=prev.worlds['stone-age'];return {...prev,worlds:{...prev.worlds,'stone-age':{...old,tutorialComplete:true}}}});
  };
  const launchDaily=challenge=>{setSelectedMap(challenge.mapNumber);setSelectedMode(challenge.modeId);setBattleKey(value=>value+1);setScreen('battle')};
  const replaceSave=next=>{setSave(next);setSelectedMap(Math.min(25,Math.max(1,next.worlds['stone-age'].highestMap??1)));setSelectedMode('normal')};

  if(!stone.tutorialComplete){
    return <StoneAgeTutorial onComplete={finishTutorial}/>;
  }

  return <>
    {screen==='campaign' ? <StoneAgeCampaign
      save={save}
      selectedMap={selectedMap}
      setSelectedMap={setSelectedMap}
      selectedMode={selectedMode}
      setSelectedMode={setSelectedMode}
      onStart={enterBattle}
      onAchievements={()=>setShowAchievements(true)}
      onCodex={()=>setShowCodex(true)}
      onSettings={()=>setShowSettings(true)}
      onStats={()=>setShowStats(true)}
      onSaveTools={()=>setShowSaveTools(true)}
      onDaily={launchDaily}
      onSwitchWorld={onSwitchWorld}
    /> : <StoneAgeBattleV3
      key={`${selectedMap}-${selectedMode}-${battleKey}`}
      mapNumber={selectedMap}
      modeId={selectedMode}
      save={save}
      setSave={battleSetSave}
      onExit={exitBattle}
      onNextMap={nextMap}
    />}

    {showAchievements&&<div className="achievement-overlay" onClick={()=>setShowAchievements(false)}>
      <div className="achievement-book" onClick={event=>event.stopPropagation()}>
        <div className="achievement-book-head"><div><small>STONE AGE MASTERY</small><h2>Achievements</h2></div><b>{unlockedSet.size}/100</b><button onClick={()=>setShowAchievements(false)}>×</button></div>
        <div className="achievement-grid">{stoneAgeAchievements.map(item=>{
          const unlocked=unlockedSet.has(item.id);
          return <div key={item.id} className={`achievement-card ${unlocked?'unlocked':'locked'}`}><span>{unlocked?item.icon:'?'}</span><div><b>{unlocked?item.name:'Hidden Challenge'}</b><small>{unlocked?item.description:'Keep playing Stone Age to discover this achievement.'}</small></div></div>
        })}</div>
      </div>
    </div>}

    {showCodex&&<StoneAgeCodex stoneSave={stone} onClose={()=>setShowCodex(false)}/>} 
    {showSettings&&<GameSettings settings={save.settings??{}} onChange={updateSettings} onClose={()=>setShowSettings(false)}/>} 
    {showStats&&<StoneAgeStats stoneSave={stone} onClose={()=>setShowStats(false)}/>} 
    {showSaveTools&&<SaveManager save={save} onReplace={replaceSave} onClose={()=>setShowSaveTools(false)}/>} 

    {achievementToast&&<div className="achievement-toast"><span>{achievementToast.icon}</span><div><small>ACHIEVEMENT UNLOCKED</small><b>{achievementToast.name}</b><p>{achievementToast.description}</p></div></div>}
  </>;
}

import React, { useEffect, useMemo, useState } from 'react';
import { loadSave, persistSave } from '../core/save.js';
import { stoneAgeAchievements, newlyUnlockedAchievements } from '../data/worlds/stoneAge/achievements.js';
import { stoneAgeModes } from '../data/worlds/stoneAge/modes.js';
import { StoneAgeCampaign } from './StoneAgeCampaign.jsx';
import { StoneAgeBattle } from './StoneAgeBattle.jsx';

export function StoneAgeExperience() {
  const [save,setSave]=useState(()=>loadSave());
  const stone=save.worlds['stone-age'];
  const [screen,setScreen]=useState('campaign');
  const [selectedMap,setSelectedMap]=useState(()=>Math.min(25,Math.max(1,stone.highestMap??1)));
  const [selectedMode,setSelectedMode]=useState('normal');
  const [battleKey,setBattleKey]=useState(0);
  const [showAchievements,setShowAchievements]=useState(false);
  const [achievementToast,setAchievementToast]=useState(null);

  useEffect(()=>persistSave(save),[save]);

  useEffect(()=>{
    const mode=stoneAgeModes.find(item=>item.id===selectedMode);
    if(mode&&!mode.unlock(stone)) setSelectedMode('normal');
  },[selectedMode,stone.completedMap,stone.totems]);

  useEffect(()=>{
    const unlocked=stone.achievements??[];
    const fresh=newlyUnlockedAchievements(stone,unlocked);
    if(!fresh.length) return;
    setSave(prev=>{
      const old=prev.worlds['stone-age'];
      const ids=[...(old.achievements??[]),...fresh.map(item=>item.id)];
      return {...prev,worlds:{...prev.worlds,'stone-age':{...old,achievements:[...new Set(ids)]}}};
    });
    setAchievementToast(fresh[0]);
  },[stone.stats,stone.completedMap,stone.totems,stone.mastery]);

  useEffect(()=>{
    if(!achievementToast)return;
    const timer=setTimeout(()=>setAchievementToast(null),4200);
    return()=>clearTimeout(timer);
  },[achievementToast]);

  const unlockedSet=useMemo(()=>new Set(stone.achievements??[]),[stone.achievements]);

  const enterBattle=()=>{setBattleKey(key=>key+1);setScreen('battle')};
  const exitBattle=()=>setScreen('campaign');
  const replayBattle=()=>setBattleKey(key=>key+1);
  const nextMap=next=>{setSelectedMap(next);setBattleKey(key=>key+1);setScreen('battle')};

  return <>
    {screen==='campaign' ? <StoneAgeCampaign
      save={save}
      selectedMap={selectedMap}
      setSelectedMap={setSelectedMap}
      selectedMode={selectedMode}
      setSelectedMode={setSelectedMode}
      onStart={enterBattle}
      onAchievements={()=>setShowAchievements(true)}
    /> : <StoneAgeBattle
      key={`${selectedMap}:${selectedMode}:${battleKey}`}
      mapNumber={selectedMap}
      modeId={selectedMode}
      save={save}
      setSave={setSave}
      onExit={exitBattle}
      onReplay={replayBattle}
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

    {achievementToast&&<div className="achievement-toast"><span>{achievementToast.icon}</span><div><small>ACHIEVEMENT UNLOCKED</small><b>{achievementToast.name}</b><p>{achievementToast.description}</p></div></div>}
  </>
}

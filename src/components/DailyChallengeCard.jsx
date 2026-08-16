import React, { useMemo } from 'react';
import { stoneAgeDailyChallenge } from '../core/dailyChallenge.js';
import { stoneAgeMaps } from '../data/worlds/stoneAge/maps.js';
import { modeById } from '../data/worlds/stoneAge/modes.js';

export function DailyChallengeCard({stoneSave,onLaunch}){
  const challenge=useMemo(()=>stoneAgeDailyChallenge(stoneSave),[stoneSave.highestMap,stoneSave.completedMap,stoneSave.totems]);
  const map=stoneAgeMaps[challenge.mapNumber-1];
  const mode=modeById(challenge.modeId);
  const completed=stoneSave.dailyChallenges?.[challenge.key]?.completed;
  return <div className={`daily-card ${completed?'completed':''}`}>
    <div className="daily-mark">{completed?'✅':'☀️'}</div>
    <div className="daily-copy"><small>DAILY CHALLENGE • {challenge.key}</small><b>{map.icon} {map.name}</b><span>{mode.icon} {mode.name} • Map {map.number}</span><p>{challenge.objective}</p></div>
    <button disabled={completed} onClick={()=>onLaunch(challenge)}>{completed?'Completed':'Play Daily'}</button>
  </div>
}

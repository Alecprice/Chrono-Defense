import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STARTING_RESOURCES, addResources, canAfford, spend } from '../core/economy.js';
import { checkpointMatches, clearBattleCheckpoint, saveBattleCheckpoint } from '../core/battleCheckpoint.js';
import { chooseTarget, damageVillage, distance, towerStats, upgradeCost } from '../core/combat.js';
import { applyStoneAgeAttack, shieldWallMultiplier } from '../core/stoneAgeRuntime.js';
import { mapTotems, masteryReward } from '../core/progression.js';
import { unlockedTowerIds } from '../core/unlocks.js';
import { stoneAgeTowers } from '../data/worlds/stoneAge/towers.js';
import { stoneAgeEnemies } from '../data/worlds/stoneAge/enemies.js';
import { stoneAgeMaps } from '../data/worlds/stoneAge/maps.js';
import { resourceStructures } from '../data/worlds/stoneAge/resourceStructures.js';
import { buildWave, summarizeWave } from '../data/worlds/stoneAge/waves.js';
import { modeById } from '../data/worlds/stoneAge/modes.js';
import { cellCenter, getStoneAgeLayout } from '../data/worlds/stoneAge/layouts.js';
import {
  actionEffect,
  enemyEnvironmentDamage,
  enemyEnvironmentMultiplier,
  environmentCellKind,
  environmentIcon,
  getStoneAgeEnvironment,
  towerEnvironmentRangeMultiplier,
} from '../data/worlds/stoneAge/environment.js';

const CELLS = Array.from({ length: 60 }, (_, index) => index);
const TARGET_MODES = ['first', 'strong', 'closest', 'last'];
const MAX_VILLAGE_HP = 250;

function resourceIcon(key) {
  return key === 'wood' ? '🪵' : key === 'stone' ? '🪨' : '🍖';
}

function formatCost(cost = {}) {
  return Object.entries(cost)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${resourceIcon(key)}${value}`)
    .join(' ');
}

function resourceTotal(resources = {}) {
  return Object.values(resources).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function scaledResources(scale = 1) {
  return Object.fromEntries(
    Object.entries(STARTING_RESOURCES).map(([key, value]) => [key, Math.max(0, Math.round(value * scale))]),
  );
}

function pathLength(path) {
  let total = 0;
  for (let index = 0; index < path.length - 1; index += 1) {
    total += distance(cellCenter(path[index]), cellCenter(path[index + 1]));
  }
  return total;
}

function pointAlongPath(path, travel) {
  if (!path.length) return { x: 0, y: 0, progress: 0, currentCell: 0 };
  const points = path.map(cellCenter);
  const lengths = [];
  let total = 0;

  for (let index = 0; index < points.length - 1; index += 1) {
    const segment = distance(points[index], points[index + 1]);
    lengths.push(segment);
    total += segment;
  }

  let remaining = Math.max(0, travel);
  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index]) {
      const ratio = remaining / lengths[index];
      return {
        x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
        y: points[index].y + (points[index + 1].y - points[index].y) * ratio,
        progress: total ? Math.min(1, travel / total) : 0,
        currentCell: ratio < 0.5 ? path[index] : path[index + 1],
      };
    }
    remaining -= lengths[index];
  }

  return { ...points.at(-1), progress: 1, currentCell: path.at(-1) };
}

function enemyIcon(enemy) {
  if (enemy.boss) return '👑';
  if (enemy.flying) return '🦅';
  if (enemy.id.includes('mammoth')) return '🐘';
  if (enemy.id.includes('raptor') || enemy.id.includes('dinosaur') || enemy.id.includes('trex')) return '🦖';
  if (enemy.tags?.includes('tribe')) return '🪓';
  if (enemy.id.includes('snake')) return '🐍';
  return '🐾';
}

function blankBattleStats() {
  return {
    kills: 0,
    wavesCleared: 0,
    mapsCompleted: 0,
    bossesDefeated: 0,
    flawlessMaps: 0,
    structuresBuilt: 0,
    upgrades: 0,
    resourcesCollected: 0,
    towerKills: {},
  };
}

function mergeStats(oldStats = {}, battle = {}, modeName = null) {
  const towerKills = { ...(oldStats.towerKills ?? {}) };
  Object.entries(battle.towerKills ?? {}).forEach(([id, value]) => {
    towerKills[id] = (towerKills[id] ?? 0) + value;
  });
  const modeWins = { ...(oldStats.modeWins ?? {}) };
  if (modeName) modeWins[modeName] = (modeWins[modeName] ?? 0) + 1;

  return {
    ...oldStats,
    kills: (oldStats.kills ?? 0) + (battle.kills ?? 0),
    wavesCleared: (oldStats.wavesCleared ?? 0) + (battle.wavesCleared ?? 0),
    mapsCompleted: (oldStats.mapsCompleted ?? 0) + (battle.mapsCompleted ?? 0),
    bossesDefeated: (oldStats.bossesDefeated ?? 0) + (battle.bossesDefeated ?? 0),
    flawlessMaps: (oldStats.flawlessMaps ?? 0) + (battle.flawlessMaps ?? 0),
    structuresBuilt: (oldStats.structuresBuilt ?? 0) + (battle.structuresBuilt ?? 0),
    upgrades: (oldStats.upgrades ?? 0) + (battle.upgrades ?? 0),
    resourcesCollected: (oldStats.resourcesCollected ?? 0) + (battle.resourcesCollected ?? 0),
    towerKills,
    modeWins,
  };
}

export function StoneAgeBattleV3({ mapNumber, modeId = 'normal', save, setSave, onExit, onNextMap, resumeCheckpoint = null }) {
  const mode = modeById(modeId);
  const waveLimit = mode.waves;
  const stoneSave = save.worlds['stone-age'];
  const currentMap = stoneAgeMaps[mapNumber - 1];
  const layout = useMemo(() => getStoneAgeLayout(mapNumber), [mapNumber]);
  const environment = useMemo(() => getStoneAgeEnvironment(currentMap, layout), [currentMap, layout]);
  const pathSet = useMemo(() => new Set(layout.path), [layout]);
  const totalPathLength = useMemo(() => pathLength(layout.path), [layout]);
  const unlocked = useMemo(
    () => unlockedTowerIds({ completedMap: stoneSave.completedMap, totems: stoneSave.totems }),
    [stoneSave.completedMap, stoneSave.totems],
  );
  const allBuildables = useMemo(() => [...stoneAgeTowers, ...resourceStructures], []);

  const checkpoint = checkpointMatches(resumeCheckpoint, 'stone-age', mapNumber, modeId) ? resumeCheckpoint : null;

  const [resources, setResources] = useState(() => checkpoint?.resources ?? scaledResources(mode.startingResources));
  const [villageHp, setVillageHp] = useState(() => checkpoint?.villageHp ?? MAX_VILLAGE_HP);
  const [wave, setWave] = useState(() => checkpoint?.wave ?? 1);
  const [selected, setSelected] = useState(() => checkpoint?.selected ?? 'rock-thrower');
  const [placed, setPlaced] = useState(() => checkpoint?.placed ?? {});
  const [selectedPlaced, setSelectedPlaced] = useState(() => checkpoint?.selectedPlaced ?? null);
  const [enemies, setEnemies] = useState(() => checkpoint?.enemies ?? []);
  const [running, setRunning] = useState(() => Boolean(checkpoint?.running));
  const [paused, setPaused] = useState(() => Boolean(checkpoint?.running || checkpoint?.paused));
  const [speed, setSpeed] = useState(() => checkpoint?.speed ?? 1);
  const [status, setStatus] = useState(() => checkpoint?.status ?? 'ready');
  const [kills, setKills] = useState(() => checkpoint?.kills ?? 0);
  const [message, setMessage] = useState(() => checkpoint ? 'Battle restored! Tap ▶ when you are ready.' : 'Build your defenses, inspect the terrain, then begin.');
  const [drag, setDrag] = useState(null);
  const [effects, setEffects] = useState([]);
  const [actionCooldown, setActionCooldown] = useState(() => checkpoint?.actionCooldown ?? 0);
  const [caveSealed, setCaveSealed] = useState(() => Boolean(checkpoint?.caveSealed));

  const resourcesRef = useRef(resources);
  const villageRef = useRef(villageHp);
  const placedRef = useRef(placed);
  const enemiesRef = useRef(enemies);
  const runningRef = useRef(running);
  const pausedRef = useRef(paused);
  const waveRef = useRef(wave);
  const queueRef = useRef(checkpoint?.queue ?? []);
  const cooldownRef = useRef(checkpoint?.cooldowns ?? {});
  const battleStatsRef = useRef(checkpoint?.battleStats ?? blankBattleStats());
  const finalizedRef = useRef(false);
  const oneTowerChoiceRef = useRef(checkpoint?.oneTowerChoice ?? null);
  const orientationBlockedRef = useRef(false);
  const placeBuildableRef = useRef(null);
  const effectsRef = useRef([]);
  const effectIdRef = useRef(1);
  const shotCounterRef = useRef({});

  const previewUnits = useMemo(() => buildWave({ mapNumber, waveNumber: wave, mode }), [mapNumber, wave, modeId]);
  const waveSummary = useMemo(() => summarizeWave(previewUnits).slice(0, 5), [previewUnits]);
  const bossPreview = previewUnits.find((unit) => unit.boss);

  const syncResources = (next) => { resourcesRef.current = next; setResources(next); };
  const syncVillage = (next) => { villageRef.current = next; setVillageHp(next); };
  const syncPlaced = (next) => { placedRef.current = next; setPlaced(next); };
  const syncEnemies = (next) => { enemiesRef.current = next; setEnemies(next); };
  const syncRunning = (next) => { runningRef.current = next; setRunning(next); };

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { waveRef.current = wave; }, [wave]);

  useEffect(() => {
    const writeCheckpoint = () => {
      if (status === 'won' || status === 'lost') return;
      saveBattleCheckpoint({worldId:'stone-age',mapNumber,modeId,resources:resourcesRef.current,villageHp:villageRef.current,wave:waveRef.current,selected,selectedPlaced,placed:placedRef.current,enemies:enemiesRef.current,running:runningRef.current,paused:pausedRef.current,speed,status,kills,queue:queueRef.current,cooldowns:cooldownRef.current,battleStats:battleStatsRef.current,oneTowerChoice:oneTowerChoiceRef.current,actionCooldown,caveSealed});
    };
    writeCheckpoint();
    const timer=window.setInterval(writeCheckpoint,900);
    const pagehide=()=>writeCheckpoint();
    const visibility=()=>{if(document.visibilityState==='hidden')writeCheckpoint()};
    window.addEventListener('pagehide',pagehide);
    document.addEventListener('visibilitychange',visibility);
    return()=>{window.clearInterval(timer);window.removeEventListener('pagehide',pagehide);document.removeEventListener('visibilitychange',visibility)};
  }, [mapNumber,modeId,selected,selectedPlaced,speed,status,kills,actionCooldown,caveSealed]);

  useEffect(() => {
    const handler = (event) => {
      orientationBlockedRef.current = Boolean(event.detail?.blocked);
      if (event.detail?.blocked) {
        pausedRef.current = true;
        setDrag(null);
      } else {
        pausedRef.current = paused;
      }
    };
    window.addEventListener('chrono:orientation-block', handler);
    return () => window.removeEventListener('chrono:orientation-block', handler);
  }, [paused]);

  useEffect(() => {
    if (actionCooldown <= 0) return undefined;
    const timer = window.setInterval(() => setActionCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [actionCooldown]);

  const resourceNodeType = (cell) => Object.entries(layout.resourceNodes).find(([, cells]) => cells.includes(cell))?.[0] ?? null;
  const isCombat = (id) => stoneAgeTowers.some((tower) => tower.id === id);

  const commitStatsOnly = () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    const battle = { ...battleStatsRef.current, towerKills: { ...battleStatsRef.current.towerKills } };
    setSave((previous) => {
      const old = previous.worlds['stone-age'];
      return { ...previous, worlds: { ...previous.worlds, 'stone-age': { ...old, stats: mergeStats(old.stats, battle) } } };
    });
  };

  const completeMap = () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    clearBattleCheckpoint();
    syncRunning(false);
    setStatus('won');
    const combatCount = Object.values(placedRef.current).filter((item) => isCombat(item.id)).length;
    const earned = mapTotems({ won: true, villageHp: villageRef.current, specialComplete: combatCount <= 6 });
    const mastery = masteryReward({ kills: kills, mapNumber, bossDefeated: battleStatsRef.current.bossesDefeated > 0 }) + (modeId === 'normal' ? 0 : 2);
    battleStatsRef.current.mapsCompleted += 1;
    if (villageRef.current === MAX_VILLAGE_HP) battleStatsRef.current.flawlessMaps += 1;
    const battle = { ...battleStatsRef.current, towerKills: { ...battleStatsRef.current.towerKills } };

    setSave((previous) => {
      const old = previous.worlds['stone-age'];
      const normal = modeId === 'normal';
      const bestKey = normal ? currentMap.id : `${currentMap.id}:${modeId}`;
      const prior = old.best?.[bestKey] ?? {};
      const priorTotems = normal ? (prior.totems ?? 0) : 0;
      const added = normal ? Math.max(0, earned - priorTotems) : 0;
      const completedMap = normal ? Math.max(old.completedMap, mapNumber) : old.completedMap;
      const highestMap = normal ? Math.min(25, Math.max(old.highestMap, mapNumber < 25 ? mapNumber + 1 : 25)) : old.highestMap;
      const stats = mergeStats(old.stats, battle, normal ? null : mode.name);
      const nextStone = {
        ...old,
        completedMap,
        highestMap,
        totems: Math.min(75, (old.totems ?? 0) + added),
        mastery: Math.min(100, (old.mastery ?? 0) + mastery),
        stats,
        best: { ...(old.best ?? {}), [bestKey]: { ...prior, won: true, totems: normal ? Math.max(priorTotems, earned) : (prior.totems ?? 0), villageHp: villageRef.current, kills, mode: mode.id } },
      };
      const next = { ...previous, worlds: { ...previous.worlds, 'stone-age': nextStone } };
      if (normal && mapNumber === 25) next.worlds.retro = { ...next.worlds.retro, unlocked: true };
      return next;
    });

    setMessage(modeId === 'normal' ? `Victory! ${earned}/3 Totems earned.` : `${mode.name} complete! Mastery reward earned.`);
  };

  const failMap = () => {
    if (finalizedRef.current) return;
    clearBattleCheckpoint();
    syncRunning(false);
    queueRef.current = [];
    setStatus('lost');
    setMessage('The village has fallen. Rebuild and try again.');
    commitStatsOnly();
  };

  const finishWave = () => {
    battleStatsRef.current.wavesCleared += 1;
    const gain = { wood: 0, stone: 0, food: 0 };
    let heal = 0;
    Object.values(placedRef.current).forEach((item) => {
      const structure = resourceStructures.find((entry) => entry.id === item.id);
      if (structure) Object.entries(structure.yield).forEach(([key, value]) => { gain[key] += Math.max(0, Math.round(value * (mode.campYield ?? 1))); });
      if (item.id === 'shaman' && item.branch === 'B') heal += 4;
    });
    if (resourceTotal(gain)) {
      syncResources(addResources(resourcesRef.current, gain));
      battleStatsRef.current.resourcesCollected += resourceTotal(gain);
    }
    if (heal) syncVillage(Math.min(MAX_VILLAGE_HP, villageRef.current + heal));
    syncRunning(false);
    if (waveRef.current >= waveLimit) {
      completeMap();
      return;
    }
    const next = waveRef.current + 1;
    waveRef.current = next;
    setWave(next);
    setStatus('between');
    setMessage(`Wave cleared.${resourceTotal(gain) ? ` Camps gathered ${formatCost(gain)}.` : ''}`);
  };

  const startWave = () => {
    if (runningRef.current || status === 'won' || status === 'lost') return;
    let units = buildWave({ mapNumber, waveNumber: waveRef.current, mode });
    if (caveSealed && environment.caveCell != null) {
      let removed = 0;
      units = units.filter((unit) => {
        if (removed < Math.max(1, environment.caveAmbush) && unit.id.includes('raptor')) {
          removed += 1;
          return false;
        }
        return true;
      });
      setCaveSealed(false);
    }
    queueRef.current = units.map((unit, index) => ({
      ...unit,
      uid: `${Date.now()}-${index}`,
      delay: index * 620,
      travel: 0,
      x: cellCenter(layout.path[0]).x,
      y: cellCenter(layout.path[0]).y,
      progress: 0,
      currentCell: layout.path[0],
      dead: false,
      escaped: false,
      abilityClock: unit.abilityEvery ?? 0,
    }));
    syncRunning(true);
    setStatus('running');
    setMessage(units.some((unit) => unit.boss) ? `⚠️ ${units.find((unit) => unit.boss).name} approaches!` : `Wave ${waveRef.current} incoming!`);
  };

  const activateEnvironment = () => {
    if (actionCooldown > 0 || !runningRef.current) return;
    const result = actionEffect(environment.action.id, enemiesRef.current, environment);
    syncEnemies(result.enemies);
    if (result.sealCave) setCaveSealed(true);
    setActionCooldown(environment.action.cooldown);
    setMessage(result.message);
    effectsRef.current = [...effectsRef.current, { id: effectIdRef.current++, x: 600, y: 250, type: 'environment-burst', ttl: 0.7 }].slice(-40);
    setEffects(effectsRef.current);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!runningRef.current || pausedRef.current) return;
      const dt = 0.05 * speed;
      const spawned = [];
      const waiting = [];
      queueRef.current.forEach((enemy) => {
        const nextDelay = enemy.delay - dt * 1000;
        if (nextDelay <= 0) spawned.push({ ...enemy, delay: 0 });
        else waiting.push({ ...enemy, delay: nextDelay });
      });
      queueRef.current = waiting;
      const active = [...enemiesRef.current.map((enemy) => ({ ...enemy })), ...spawned];
      const newEffects = [];
      effectsRef.current = effectsRef.current.map((effect) => ({ ...effect, ttl: effect.ttl - dt })).filter((effect) => effect.ttl > 0);

      active.forEach((enemy) => {
        if (enemy.dead) return;
        if (enemy.burnTime > 0) {
          enemy.hp -= Math.max(0, (enemy.burnDps ?? 0) * (1 - (enemy.fireResistance ?? 0)) * dt);
          enemy.burnTime -= dt;
        }
        if (enemy.hp <= 0) { enemy.dead = true; return; }
        if (enemy.regenPercent) enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.maxHp * enemy.regenPercent * dt);
        if (enemy.armorBreakTime > 0) {
          enemy.armorBreakTime -= dt;
          if (enemy.armorBreakTime <= 0) enemy.armorDebuff = 0;
        }
        if (enemy.stunTime > 0) { enemy.stunTime -= dt; return; }

        let movement = 1;
        if (enemy.environmentSlow > 0) { movement *= 0.55; enemy.environmentSlow -= dt; }
        if (enemy.berserkAt && enemy.hp / enemy.maxHp <= enemy.berserkAt) movement *= enemy.berserkSpeed ?? 1.25;

        Object.entries(placedRef.current).forEach(([cell, item]) => {
          if (item.id !== 'tar-pit' || enemy.flying) return;
          const origin = cellCenter(Number(cell));
          const position = pointAlongPath(layout.path, enemy.travel);
          const stats = towerStats(stoneAgeTowers.find((tower) => tower.id === item.id), item.level, item.branch);
          if (distance(origin, position) <= stats.range) {
            movement *= item.branch === 'A' ? 0.5 : 0.68;
            if (item.branch === 'B') {
              enemy.hp -= 5 * item.level * dt;
              enemy.lastHitTower = 'tar-pit';
            }
          }
        });

        const before = pointAlongPath(layout.path, enemy.travel);
        movement *= enemyEnvironmentMultiplier(enemy, before.currentCell, environment);
        enemy.hp -= enemyEnvironmentDamage(enemy, before.currentCell, environment) * dt;
        enemy.travel += enemy.speed * movement * dt;
        const position = pointAlongPath(layout.path, enemy.travel);
        enemy.x = position.x;
        enemy.y = position.y;
        enemy.progress = position.progress;
        enemy.currentCell = position.currentCell;

        if (enemy.abilityEvery) {
          enemy.abilityClock = (enemy.abilityClock ?? enemy.abilityEvery) - dt;
          if (enemy.abilityClock <= 0) {
            enemy.abilityClock = enemy.abilityEvery;
            if (enemy.ability === 'heal') active.forEach((other) => { if (!other.dead && distance(other, enemy) <= 135) other.hp = Math.min(other.maxHp, other.hp + other.maxHp * (enemy.healPercent ?? 0.06)); });
            if (enemy.ability === 'howl') active.forEach((other) => { if (!other.dead && distance(other, enemy) <= 180) other.environmentSlow = Math.max(0, (other.environmentSlow ?? 0) - 1); });
            if (enemy.ability === 'eruption' || enemy.ability === 'ancient-roar') Object.keys(placedRef.current).forEach((cell) => { cooldownRef.current[cell] = (cooldownRef.current[cell] ?? 0) + 0.9; });
            if (enemy.ability === 'spawn-raptors') {
              const raptor = stoneAgeEnemies.find((item) => item.id === 'raptor');
              if (raptor) {
                for (let index = 0; index < (enemy.spawnCount ?? 2); index += 1) {
                  const maxHp = Math.round(raptor.hp * (mode.hp ?? 1));
                  active.push({ ...raptor, uid: `spawn-${Date.now()}-${index}`, hp: maxHp, maxHp, reward: { food: 2, wood: 0, stone: 0 }, travel: Math.max(0, enemy.travel - 20 - index * 15), delay: 0, progress: enemy.progress, x: enemy.x, y: enemy.y, currentCell: enemy.currentCell, dead: false, escaped: false });
                }
              }
            }
          }
        }
      });

      Object.entries(placedRef.current).forEach(([cell, item]) => {
        const base = stoneAgeTowers.find((tower) => tower.id === item.id);
        if (!base || base.damage <= 0) return;
        const key = String(cell);
        cooldownRef.current[key] = (cooldownRef.current[key] ?? 0) - dt;
        if (cooldownRef.current[key] > 0) return;
        const rawStats = towerStats(base, item.level, item.branch);
        const stats = { ...rawStats, range: Math.round(rawStats.range * towerEnvironmentRangeMultiplier(Number(cell), environment)) };
        const origin = cellCenter(Number(cell));
        const target = chooseTarget(active, origin, stats.range, item.targeting ?? 'first');
        if (!target) return;
        shotCounterRef.current[key] = (shotCounterRef.current[key] ?? 0) + 1;
        const result = applyStoneAgeAttack({ base, item, stats, target, enemies: active });
        if (result.villageHeal && shotCounterRef.current[key] % 6 === 0) syncVillage(Math.min(MAX_VILLAGE_HP, villageRef.current + result.villageHeal));
        newEffects.push({ id: effectIdRef.current++, x: target.x, y: target.y, type: base.id, ttl: 0.25 });
        cooldownRef.current[key] = stats.fireRate || 1;
      });

      const gains = { wood: 0, stone: 0, food: 0 };
      let killed = 0;
      let bossKills = 0;
      let hp = villageRef.current;
      const leakMultiplier = shieldWallMultiplier(placedRef.current);
      const survivors = [];

      active.forEach((enemy) => {
        if (enemy.dead || enemy.hp <= 0) {
          killed += 1;
          if (enemy.boss) bossKills += 1;
          Object.entries(enemy.reward ?? {}).forEach(([key, value]) => { gains[key] = (gains[key] ?? 0) + value; });
          if (enemy.lastHitTower) battleStatsRef.current.towerKills[enemy.lastHitTower] = (battleStatsRef.current.towerKills[enemy.lastHitTower] ?? 0) + 1;
          return;
        }
        if (enemy.travel >= totalPathLength) {
          hp = damageVillage(hp, { ...enemy, villageDamage: Math.max(1, Math.round((enemy.villageDamage ?? 5) * leakMultiplier)) });
          newEffects.push({ id: effectIdRef.current++, x: 1160, y: 450, type: 'village-hit', ttl: 0.4 });
          return;
        }
        survivors.push(enemy);
      });

      if (killed) {
        setKills((value) => value + killed);
        battleStatsRef.current.kills += killed;
        battleStatsRef.current.bossesDefeated += bossKills;
        battleStatsRef.current.resourcesCollected += resourceTotal(gains);
        syncResources(addResources(resourcesRef.current, gains));
      }
      if (hp !== villageRef.current) syncVillage(hp);
      syncEnemies(survivors);
      effectsRef.current = [...effectsRef.current, ...newEffects].slice(-40);
      setEffects(effectsRef.current);
      if (hp <= 0) { failMap(); return; }
      if (queueRef.current.length === 0 && survivors.length === 0) finishWave();
    }, 50);

    return () => window.clearInterval(timer);
  }, [environment, layout, mapNumber, modeId, speed, totalPathLength, waveLimit]);

  const placeBuildable = (cell, buildId = selected) => {
    if (runningRef.current || pathSet.has(cell)) return;
    if (placedRef.current[cell]) { setSelectedPlaced(cell); return; }
    const buildable = allBuildables.find((item) => item.id === buildId);
    if (!buildable) return;
    const combat = isCombat(buildable.id);
    if (combat && !unlocked.has(buildable.id)) return;
    if (combat && mode.oneTower) {
      if (oneTowerChoiceRef.current && oneTowerChoiceRef.current !== buildable.id) { setMessage('One Tower mode allows only one combat tower family.'); return; }
      if (!oneTowerChoiceRef.current) oneTowerChoiceRef.current = buildable.id;
    }
    if (!combat) {
      const required = buildable.id === 'wood-camp' ? 'wood' : buildable.id === 'quarry' ? 'stone' : 'food';
      if (resourceNodeType(cell) !== required) { setMessage(`${buildable.name} must be built on a ${required} node.`); return; }
    }
    if (!canAfford(resourcesRef.current, buildable.cost)) { setMessage(`Not enough resources for ${buildable.name}.`); return; }
    syncResources(spend(resourcesRef.current, buildable.cost));
    syncPlaced({ ...placedRef.current, [cell]: { id: buildable.id, level: 1, branch: null, targeting: 'first', invested: { ...buildable.cost } } });
    battleStatsRef.current.structuresBuilt += 1;
    setSelectedPlaced(cell);
    setMessage(`${buildable.name} built.`);
  };
  placeBuildableRef.current = placeBuildable;

  const beginDrag = (event, id, disabled = false) => {
    if (disabled || runningRef.current || orientationBlockedRef.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    setSelected(id);
    setDrag({ id, x: event.clientX, y: event.clientY, pointerId: event.pointerId });
  };

  useEffect(() => {
    if (!drag) return undefined;
    const move = (event) => { if (event.pointerId === drag.pointerId) setDrag((value) => value ? { ...value, x: event.clientX, y: event.clientY } : value); };
    const end = (event) => {
      if (event.pointerId !== drag.pointerId) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-cell]');
      if (target?.dataset?.cell != null) placeBuildableRef.current?.(Number(target.dataset.cell), drag.id);
      setDrag(null);
    };
    const cancel = (event) => { if (event.pointerId === drag.pointerId) setDrag(null); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', end, { passive: true });
    window.addEventListener('pointercancel', cancel, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [drag?.id, drag?.pointerId]);

  const selectedPlacedData = selectedPlaced != null ? placed[selectedPlaced] : null;
  const selectedBase = selectedPlacedData ? allBuildables.find((item) => item.id === selectedPlacedData.id) : null;

  const upgradeSelected = () => {
    if (selectedPlaced == null || !selectedPlacedData || !selectedBase || !isCombat(selectedBase.id)) return;
    if (selectedPlacedData.level >= 3) { setMessage('Choose an evolution branch instead.'); return; }
    const cost = upgradeCost(selectedBase.cost, selectedPlacedData.level + 1);
    if (!canAfford(resourcesRef.current, cost)) { setMessage('Not enough resources to upgrade.'); return; }
    syncResources(spend(resourcesRef.current, cost));
    syncPlaced({ ...placedRef.current, [selectedPlaced]: { ...selectedPlacedData, level: selectedPlacedData.level + 1, invested: addResources(selectedPlacedData.invested, cost) } });
    battleStatsRef.current.upgrades += 1;
  };

  const evolveSelected = (branch) => {
    if (!selectedPlacedData || selectedPlacedData.level < 3 || selectedPlacedData.branch || !selectedBase) return;
    const cost = upgradeCost(selectedBase.cost, 4);
    if (!canAfford(resourcesRef.current, cost)) { setMessage('Not enough resources to evolve.'); return; }
    syncResources(spend(resourcesRef.current, cost));
    syncPlaced({ ...placedRef.current, [selectedPlaced]: { ...selectedPlacedData, branch, invested: addResources(selectedPlacedData.invested, cost) } });
    battleStatsRef.current.upgrades += 1;
    setMessage(`${selectedBase.name} evolved into ${branch === 'A' ? selectedBase.branchA : selectedBase.branchB}.`);
  };

  const sellSelected = () => {
    if (selectedPlaced == null || !selectedPlacedData) return;
    const refund = Object.fromEntries(Object.entries(selectedPlacedData.invested ?? {}).map(([key, value]) => [key, Math.round(value * 0.65)]));
    syncResources(addResources(resourcesRef.current, refund));
    const next = { ...placedRef.current };
    delete next[selectedPlaced];
    syncPlaced(next);
    setSelectedPlaced(null);
    setMessage(`Sold for ${formatCost(refund)}.`);
  };

  const cycleTargeting = () => {
    if (!selectedPlacedData || !isCombat(selectedPlacedData.id)) return;
    const index = TARGET_MODES.indexOf(selectedPlacedData.targeting ?? 'first');
    const targeting = TARGET_MODES[(index + 1) % TARGET_MODES.length];
    syncPlaced({ ...placedRef.current, [selectedPlaced]: { ...selectedPlacedData, targeting } });
  };

  return (
    <section className="game-frame battle-screen enhanced-battle">
      <header className="top-hud">
        <div className="brand"><b>🪨 STONE AGE</b><span>Map {mapNumber} • {currentMap.region} • {mode.icon} {mode.name}</span></div>
        <div className="resource-strip"><span>🪵 {resources.wood}</span><span>🪨 {resources.stone}</span><span>🍖 {resources.food}</span><span className={villageHp < 80 ? 'danger' : ''}>🏕️ {villageHp}/{MAX_VILLAGE_HP}</span><span>🌊 {wave}/{waveLimit}</span><span>💀 {kills}</span></div>
        <div className="battle-actions"><button className="campaign-back" disabled={running} onClick={onExit}>⌂</button><button onClick={() => setPaused((value) => !value)} disabled={!running}>{paused ? '▶' : '⏸'}</button><button onClick={() => setSpeed((value) => value === 1 ? 2 : value === 2 ? 3 : 1)}>{speed}×</button><button className="wave-button" onClick={startWave} disabled={running || status === 'won' || status === 'lost'}>{running ? 'Wave Active' : `Start Wave ${wave}`}</button></div>
      </header>

      <div className="game-body">
        <div className="board-wrap">
          <div className="map-title"><div><b>{currentMap.icon} {currentMap.name}</b><small>{currentMap.mechanic}</small></div><div className="wave-preview"><small>NEXT</small>{bossPreview && <strong>👑 {bossPreview.name}</strong>}{waveSummary.map((item) => <span key={item.name}>{item.name} ×{item.count}</span>)}</div></div>
          <div className="battle-message">{message}</div>
          <div className="environment-action-bar"><span>{environment.icon} {environment.name}</span><button onClick={activateEnvironment} disabled={!running || actionCooldown > 0}>{environment.action.icon} {actionCooldown > 0 ? `${environment.action.name} ${actionCooldown}s` : environment.action.name}</button><small>{environment.action.description}</small></div>

          <div className="board" aria-label="Stone Age battlefield">
            {CELLS.map((cell) => {
              const itemData = placed[cell];
              const item = itemData ? allBuildables.find((entry) => entry.id === itemData.id) : null;
              const node = resourceNodeType(cell);
              const kind = environmentCellKind(cell, environment);
              return <button key={cell} aria-label={`cell ${cell}`} data-cell={cell} className={`cell ${pathSet.has(cell) ? 'path' : ''} ${item ? 'occupied' : ''} ${selectedPlaced === cell ? 'selected-cell' : ''} ${node ? 'resource-node' : ''} ${kind ? `env-${kind}` : ''}`} onClick={() => placeBuildable(cell)}>{item ? <span className="placed-icon" title={item.name}>{item.icon}<small>{itemData.level > 1 ? `L${itemData.level}` : ''}{itemData.branch ? ` ${itemData.branch}` : ''}</small></span> : pathSet.has(cell) ? <span className="path-mark">•</span> : node ? <span className="node-mark">{resourceIcon(node)}</span> : null}{kind && <span className="environment-mark">{environmentIcon(kind)}</span>}</button>;
            })}
            {enemies.map((enemy) => <div key={enemy.uid} className={`enemy ${enemy.boss ? 'boss' : ''} ${enemy.burnTime > 0 ? 'burning' : ''} ${enemy.stunTime > 0 ? 'stunned' : ''}`} style={{ left: `${enemy.x / 12}%`, top: `${enemy.y / 5}%` }} title={`${enemy.name} ${Math.max(0, Math.ceil(enemy.hp))}/${enemy.maxHp}`}><span>{enemyIcon(enemy)}</span><i><b style={{ width: `${Math.max(0, enemy.hp / enemy.maxHp * 100)}%` }} /></i></div>)}
            {effects.map((effect) => <span key={effect.id} className={`hit-effect ${effect.type}`} style={{ left: `${effect.x / 12}%`, top: `${effect.y / 5}%`, opacity: Math.min(1, effect.ttl * 4) }} />)}
            <div className="village">🏕️<small>Village</small></div>
            {selectedPlacedData && isCombat(selectedPlacedData.id) && (() => {
              const raw = towerStats(stoneAgeTowers.find((tower) => tower.id === selectedPlacedData.id), selectedPlacedData.level, selectedPlacedData.branch);
              const range = Math.round(raw.range * towerEnvironmentRangeMultiplier(Number(selectedPlaced), environment));
              const center = cellCenter(Number(selectedPlaced));
              return <div className="range-ring" style={{ left: `${center.x / 12}%`, top: `${center.y / 5}%`, width: `${range / 6}%`, aspectRatio: '1' }} />;
            })()}
          </div>
          <div className="objective-strip"><span>🗿 Complete map</span><span>🗿 Village ≥75%</span><span>🗿 {currentMap.totems?.[2] ?? 'Complete special objective'}</span><strong>{mode.icon} {mode.name}</strong></div>
        </div>

        <aside className="tower-panel">
          <div className="panel-heading"><div><b>Stone Age Build Menu</b><small>Tap or drag onto the battlefield</small></div><span>{mode.oneTower && oneTowerChoiceRef.current ? '1️⃣ locked' : ''}</span></div>
          <div className="tower-grid">{stoneAgeTowers.map((tower) => {
            const locked = !unlocked.has(tower.id);
            const affordable = canAfford(resources, tower.cost);
            const modeBlocked = mode.oneTower && oneTowerChoiceRef.current && oneTowerChoiceRef.current !== tower.id;
            return <button key={tower.id} className={`tower-card ${selected === tower.id ? 'selected' : ''}`} disabled={locked || modeBlocked} onPointerDown={(event) => beginDrag(event, tower.id, locked || modeBlocked)} onClick={() => setSelected(tower.id)}><span className="tower-icon">{tower.icon}</span><span className="tower-copy"><b>{tower.name}</b><small>{locked ? '🔒 Locked' : modeBlocked ? '1️⃣ Other family chosen' : tower.role}</small></span><span className={`cost ${!affordable ? 'poor' : ''}`}>{formatCost(tower.cost)}</span></button>;
          })}</div>
          <div className="economy-heading">Resource Camps</div>
          <div className="economy-grid">{resourceStructures.map((structure) => <button key={structure.id} className={`economy-card ${selected === structure.id ? 'selected' : ''}`} onPointerDown={(event) => beginDrag(event, structure.id)} onClick={() => setSelected(structure.id)}><span>{structure.icon}</span><b>{structure.name}</b><small>{formatCost(structure.cost)}</small></button>)}</div>

          {selectedPlacedData && selectedBase ? <div className="selected-info placed-info"><div className="selected-title"><b>{selectedBase.icon} {selectedBase.name}</b><button onClick={() => setSelectedPlaced(null)}>×</button></div>{isCombat(selectedBase.id) ? <><span>Level {selectedPlacedData.level}{selectedPlacedData.branch ? ` • ${selectedPlacedData.branch === 'A' ? selectedBase.branchA : selectedBase.branchB}` : ''}</span><small>{(() => { const raw = towerStats(selectedBase, selectedPlacedData.level, selectedPlacedData.branch); const range = Math.round(raw.range * towerEnvironmentRangeMultiplier(Number(selectedPlaced), environment)); return `DMG ${raw.damage} • RNG ${range} • ${raw.fireRate}s`; })()}</small><div className="tower-actions"><button onClick={upgradeSelected} disabled={selectedPlacedData.level >= 3}>Upgrade</button><button onClick={cycleTargeting}>Target: {selectedPlacedData.targeting}</button><button className="sell" onClick={sellSelected}>Sell</button></div>{selectedPlacedData.level >= 3 && !selectedPlacedData.branch && <div className="branch-actions"><button onClick={() => evolveSelected('A')}><b>{selectedBase.branchA}</b><small>{selectedBase.branchADescription}</small></button><button onClick={() => evolveSelected('B')}><b>{selectedBase.branchB}</b><small>{selectedBase.branchBDescription}</small></button></div>}</> : <><span>{selectedBase.description}</span><small>Produces {formatCost(selectedBase.yield)} after each wave.</small><button className="sell-resource" onClick={sellSelected}>Remove / Sell</button></>}</div> : <div className="selected-info">{(() => { const item = allBuildables.find((entry) => entry.id === selected); return <><b>{item.icon} {item.name}</b><span>{item.role}{item.damage != null ? ` • DMG ${item.damage} • RNG ${item.range}` : ''}</span><small>{item.branchA ? `Evolves into ${item.branchA} or ${item.branchB}.` : item.description}</small></>; })()}</div>}
        </aside>
      </div>

      {drag && <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>{allBuildables.find((item) => item.id === drag.id)?.icon}<small>{allBuildables.find((item) => item.id === drag.id)?.name}</small></div>}
      {(status === 'won' || status === 'lost') && <div className="result-overlay"><div className="result-card"><div className="result-icon">{status === 'won' ? '🗿' : '💀'}</div><h2>{status === 'won' ? 'Village Defended!' : 'Village Lost'}</h2><p>{message}</p><div><button onClick={onExit}>Campaign</button>{status === 'won' && modeId === 'normal' && mapNumber < 25 && <button onClick={() => onNextMap(mapNumber + 1)}>Next Map →</button>}</div></div></div>}
    </section>
  );
}

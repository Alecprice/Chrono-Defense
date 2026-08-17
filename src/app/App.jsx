import React from 'react';
import { FullscreenShell } from '../components/FullscreenShell.jsx';
import { ChronoRouter } from '../components/ChronoRouter.jsx';
import { AppStatus } from '../components/AppStatus.jsx';
import { GameAudioBridge } from '../components/GameAudioBridge.jsx';
import { SettingsBridge } from '../components/SettingsBridge.jsx';
import { DragPlacementBridge } from '../components/DragPlacementBridge.jsx';
import { LiveAssetBridge } from '../components/LiveAssetBridge.jsx';
import { BattleIntelBridge } from '../components/BattleIntelBridge.jsx';
import { KeyboardControls } from '../components/KeyboardControls.jsx';
import { DailyMissionBridge } from '../components/DailyMissionBridge.jsx';
import { BossEntranceBridge } from '../components/BossEntranceBridge.jsx';
import { BaseImpactBridge } from '../components/BaseImpactBridge.jsx';
import { ShopAffordabilityBridge } from '../components/ShopAffordabilityBridge.jsx';
import { MapObjectiveBridge } from '../components/MapObjectiveBridge.jsx';
import { AppErrorBoundary } from '../components/AppErrorBoundary.jsx';
import { StoneAgeRouteGuard } from '../components/StoneAgeRouteGuard.jsx';
import { JuniorCoach } from '../components/JuniorCoach.jsx';
import { JuniorRewardBridge } from '../components/JuniorRewardBridge.jsx';
import { KidSafeActionBridge } from '../components/KidSafeActionBridge.jsx';
import { JuniorTrainingPath } from '../components/JuniorTrainingPath.jsx';
import { JuniorEraProgression } from '../components/JuniorEraProgression.jsx';
import { KidPolishBridge } from '../components/KidPolishBridge.jsx';
import { JuniorSandbox } from '../components/JuniorSandbox.jsx';
import { EnemyEncounterBook } from '../components/EnemyEncounterBook.jsx';
import { SessionBreakBridge } from '../components/SessionBreakBridge.jsx';
import { TowerRoleBridge } from '../components/TowerRoleBridge.jsx';
import { LowHealthBridge } from '../components/LowHealthBridge.jsx';

export function App() {
  return (
    <AppErrorBoundary>
      <FullscreenShell>
        <ChronoRouter />
        <AppStatus />
        <GameAudioBridge />
        <SettingsBridge />
        <DragPlacementBridge />
        <LiveAssetBridge />
        <BattleIntelBridge />
        <KeyboardControls />
        <DailyMissionBridge />
        <BossEntranceBridge />
        <BaseImpactBridge />
        <ShopAffordabilityBridge />
        <MapObjectiveBridge />
        <StoneAgeRouteGuard />
        <JuniorCoach />
        <JuniorRewardBridge />
        <KidSafeActionBridge />
        <JuniorTrainingPath />
        <JuniorEraProgression />
        <KidPolishBridge />
        <JuniorSandbox />
        <EnemyEncounterBook />
        <SessionBreakBridge />
        <TowerRoleBridge />
        <LowHealthBridge />
      </FullscreenShell>
    </AppErrorBoundary>
  );
}

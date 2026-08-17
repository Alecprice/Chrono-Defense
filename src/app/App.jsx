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
      </FullscreenShell>
    </AppErrorBoundary>
  );
}

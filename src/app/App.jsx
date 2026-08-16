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

export function App() {
  return (
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
    </FullscreenShell>
  );
}

import React from 'react';
import { FullscreenShell } from '../components/FullscreenShell.jsx';
import { ChronoRouter } from '../components/ChronoRouter.jsx';
import { AppStatus } from '../components/AppStatus.jsx';
import { GameAudioBridge } from '../components/GameAudioBridge.jsx';
import { SettingsBridge } from '../components/SettingsBridge.jsx';
import { DragPlacementBridge } from '../components/DragPlacementBridge.jsx';

export function App() {
  return (
    <FullscreenShell>
      <ChronoRouter />
      <AppStatus />
      <GameAudioBridge />
      <SettingsBridge />
      <DragPlacementBridge />
    </FullscreenShell>
  );
}

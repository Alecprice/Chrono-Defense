import React from 'react';
import { FullscreenShell } from '../components/FullscreenShell.jsx';
import { ChronoRouter } from '../components/ChronoRouter.jsx';
import { AppStatus } from '../components/AppStatus.jsx';

export function App() {
  return (
    <FullscreenShell>
      <ChronoRouter />
      <AppStatus />
    </FullscreenShell>
  );
}

import React from 'react';
import { FullscreenShell } from '../components/FullscreenShell.jsx';
import { StoneAgeGame } from '../components/StoneAgeGame.jsx';

export function App() {
  return (
    <FullscreenShell>
      <StoneAgeGame />
    </FullscreenShell>
  );
}

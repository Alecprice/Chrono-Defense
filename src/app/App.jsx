import React from 'react';
import { FullscreenShell } from '../components/FullscreenShell.jsx';
import { StoneAgeExperience } from '../components/StoneAgeExperience.jsx';
import { AppStatus } from '../components/AppStatus.jsx';

export function App() {
  return (
    <FullscreenShell>
      <StoneAgeExperience />
      <AppStatus />
    </FullscreenShell>
  );
}

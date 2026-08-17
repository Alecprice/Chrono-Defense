import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.jsx';
import './styles/global.css';
import './styles/campaign.css';
import './styles/mechanics.css';
import './styles/codex.css';
import './styles/village.css';
import './styles/settings.css';
import './styles/progression.css';
import './styles/tutorial.css';
import './styles/meta.css';
import './styles/retro.css';
import './styles/retro-meta.css';
import './styles/future.css';
import './styles/space.css';
import './styles/time-rift.css';
import './styles/rift-meta.css';
import './styles/era-switcher.css';
import './styles/world-meta.css';
import './styles/profile.css';
import './styles/performance.css';
import './styles/interactions.css';
import './styles/advanced-codex.css';
import './styles/late-era-progress.css';
import './styles/battle-intel.css';
import './styles/keyboard.css';
import './styles/save-resilience.css';
import './styles/era-challenges.css';
import './styles/era-daily.css';
import './styles/evolutions.css';
import './styles/rift-boss.css';
import './styles/chronicle-stats.css';
import './styles/polish.css';
import './styles/combat-juice.css';
import './styles/wave-status.css';
import './styles/range-preview.css';
import './styles/compact-landscape.css';
import './styles/app-update.css';
import './styles/boss-entry.css';
import './styles/base-impact.css';
import './styles/shop-affordability.css';
import './styles/map-objectives.css';
import './styles/objective-checklist.css';
import './styles/stone-route.css';
import './styles/junior-mode.css';
import './styles/junior-rewards.css';
import './styles/resume-battle.css';
import './styles/kid-safe-actions.css';
import { registerServiceWorker } from './core/registerServiceWorker.js';
import { installGameTimerGuard } from './core/gameTimers.js';

installGameTimerGuard();

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);

registerServiceWorker();

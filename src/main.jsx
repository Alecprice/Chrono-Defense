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
import { registerServiceWorker } from './core/registerServiceWorker.js';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);

registerServiceWorker();

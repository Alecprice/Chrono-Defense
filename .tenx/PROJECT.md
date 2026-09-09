# Chrono Defense Project State

Product: browser-based tower-defense game built with React/Vite and Playwright browser QA.

Priorities:
- P0: production/game cannot load or start, failed deploy/CI, save/progression corruption if applicable.
- P1: broken core gameplay, controls, wave/tower behavior, mobile/browser usability, performance regressions.
- P2: gameplay systems, content, progression, modes, balancing improvements.
- P3: polish and refactors.

Critical release checks:
- `npm run build`
- `npm run test:e2e`
- Existing Browser Smoke QA workflow passes
- Affected gameplay flow verified in Chromium

Tracked work should live in GitHub Issues and pull requests. Update this file when priorities, critical flows, or release assumptions materially change.
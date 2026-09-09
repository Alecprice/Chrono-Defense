# Repository Development Workflow

TENX is the standard development workflow for this project.

## Workflow
1. Review repository state, recent pull requests, CI results, browser-smoke results, deployment evidence, and `.tenx/PROJECT.md`.
2. Verify current Vite/React/Playwright/browser/platform/security details from primary documentation when they affect the change.
3. Prioritize production/game-breaking failures first, then gameplay reliability/usability, then features/content, then polish/refactoring.
4. Use a dedicated branch and keep each pull request focused on one coherent outcome.
5. Run `npm run build` and `npm run test:e2e` for code changes; the existing Browser Smoke QA workflow must pass before merge.
6. For gameplay changes, verify the affected player flow in Chromium and add/adjust Playwright coverage where practical.
7. Pull requests should state the problem, implementation, verification, risks, and rollback path.
8. Update `.tenx/PROJECT.md` when priorities, critical flows, or release assumptions materially change.

## Engineering rules
- Preserve working gameplay unless a task intentionally changes it.
- Prefer root-cause fixes with regression coverage.
- Keep credentials, tokens, local secrets, and production data out of source control.
- Reuse the existing browser-smoke workflow rather than creating weaker duplicate checks.

## Completion standard
Work is complete when the intended outcome is implemented, build/E2E gates pass or any failure is understood and documented, and the affected gameplay flow is verified where practical.
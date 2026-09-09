import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import {
  OFFLINE_CACHE_VERSION,
  OFFLINE_READY_KEY,
  offlineReadinessReconcile,
  storedOfflineReady,
} from '../src/core/offlineReadiness.js';

test('a persisted ready marker cannot override missing CacheStorage evidence', async () => {
  expect(offlineReadinessReconcile({ storedReady: true, cacheReady: false })).toEqual({
    ready: false,
    staleMarker: true,
    needsPrecache: true,
  });
  expect(offlineReadinessReconcile({ storedReady: true, cacheReady: true })).toEqual({
    ready: true,
    staleMarker: false,
    needsPrecache: false,
  });
});

test('stored readiness is scoped to the current offline cache version', async () => {
  const storage = {
    getItem(key) {
      expect(key).toBe(OFFLINE_READY_KEY);
      return OFFLINE_CACHE_VERSION;
    },
  };
  expect(storedOfflineReady(storage)).toBe(true);
  expect(storedOfflineReady({ getItem: () => 'older-cache' })).toBe(false);
});

test('AppStatus clears stale readiness and requests a fresh precache', async () => {
  const source = await readFile(new URL('../src/components/AppStatus.jsx', import.meta.url), 'utf8');
  expect(source).toContain('offlineReadinessReconcile({storedReady,cacheReady:Boolean(ready)})');
  expect(source).toContain('if(result.staleMarker){clearStoredOfflineReady();setOfflineReady(false);setOfflineLoading(true);setOfflineProgress(0);requestPrecache()}');
  expect(source).toContain("worker?.postMessage('PRECACHE_ALL')");
});

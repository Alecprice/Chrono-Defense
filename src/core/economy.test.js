import test from 'node:test';
import assert from 'node:assert/strict';
import { addResources, canAfford, spend } from './economy.js';

const resources = { wood: 150, stone: 100, food: 75 };

test('valid non-negative numeric costs remain affordable and spend normally', () => {
  const cost = { wood: 50, stone: 25 };
  assert.equal(canAfford(resources, cost), true);
  assert.deepEqual(spend(resources, cost), { wood: 100, stone: 75, food: 75 });
});

test('negative costs cannot mint resources through spend', () => {
  const cost = { wood: -50 };
  assert.equal(canAfford(resources, cost), false);
  assert.equal(spend(resources, cost), resources);
});

test('malformed cost and resource amounts fail closed', () => {
  for (const amount of [NaN, Infinity, '25', null]) {
    assert.equal(canAfford(resources, { wood: amount }), false, String(amount));
  }
  assert.equal(canAfford({ ...resources, wood: Infinity }, { wood: 1 }), false);
  assert.equal(canAfford(null, { wood: 1 }), false);
  assert.equal(canAfford(resources, []), false);
});

test('resource gains preserve finite numeric arithmetic, including established negative deltas', () => {
  assert.deepEqual(addResources(resources, { wood: 25, stone: -10, crystal: 3 }), {
    wood: 175,
    stone: 90,
    food: 75,
    crystal: 3,
  });
  assert.deepEqual(resources, { wood: 150, stone: 100, food: 75 });
});

test('malformed gain containers and amounts cannot poison resource state', () => {
  for (const gains of [null, [], 'wood', { wood: '25' }, { wood: NaN }, { wood: Infinity }, { wood: null }]) {
    assert.equal(addResources(resources, gains), resources);
  }
  const poisoned = { ...resources, wood: Infinity };
  assert.equal(addResources(poisoned, { wood: 1 }), poisoned);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {getBattleMetrics,resetBattleMetrics,updateBattleMetrics} from './battleMetrics.js';

test('battle metric arrays are deduplicated and copied',()=>{
  resetBattleMetrics('stone-age',1);
  const source=['tower-a','tower-a','tower-b'];
  const updated=updateBattleMetrics('stone-age',1,{uniqueTowerIds:source});
  assert.deepEqual(updated.uniqueTowerIds,['tower-a','tower-b']);
  source.push('tower-c');
  assert.deepEqual(getBattleMetrics('stone-age',1).uniqueTowerIds,['tower-a','tower-b']);
});

test('malformed list and map patches preserve the last valid containers',()=>{
  resetBattleMetrics('stone-age',2,{usedRoles:['damage'],resourcesCollected:{wood:4}});
  assert.doesNotThrow(()=>updateBattleMetrics('stone-age',2,{usedRoles:false,resourcesCollected:['poisoned'],endingResources:'bad'}));
  const metrics=getBattleMetrics('stone-age',2);
  assert.deepEqual(metrics.usedRoles,['damage']);
  assert.deepEqual(metrics.resourcesCollected,{wood:4,stone:0,food:0});
  assert.deepEqual(metrics.endingResources,{});
});

test('malformed seed containers cannot poison later metric reads',()=>{
  resetBattleMetrics('bronze-age',3,{uniqueTowerIds:{},erasUsed:'stone-age',resourcesCollected:null});
  assert.doesNotThrow(()=>getBattleMetrics('bronze-age',3));
  const metrics=getBattleMetrics('bronze-age',3);
  assert.deepEqual(metrics.uniqueTowerIds,[]);
  assert.deepEqual(metrics.erasUsed,[]);
  assert.deepEqual(metrics.resourcesCollected,{wood:0,stone:0,food:0});
});

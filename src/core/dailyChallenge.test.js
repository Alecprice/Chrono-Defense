import test from 'node:test';
import assert from 'node:assert/strict';
import {stoneAgeDailyChallenge} from './dailyChallenge.js';

const day=new Date('2026-09-09T12:00:00');

test('daily challenge map stays inside unlocked integer bounds',()=>{
  for(const highestMap of [1,4,25,100,4.9,'10']){
    const result=stoneAgeDailyChallenge({highestMap},day);
    const expectedMax=Math.max(1,Math.min(25,Math.floor(Number(highestMap))));
    assert.equal(Number.isInteger(result.mapNumber),true);
    assert.ok(result.mapNumber>=1&&result.mapNumber<=expectedMax);
  }
});

test('daily challenge recovers from corrupt non-finite map progress',()=>{
  for(const highestMap of [NaN,Infinity,-Infinity,'not-a-map',{},undefined]){
    const result=stoneAgeDailyChallenge({highestMap},day);
    assert.equal(result.mapNumber,1);
    assert.equal(Number.isFinite(result.mapNumber),true);
  }
});

test('daily challenge treats malformed save containers as fresh progress',()=>{
  const baseline=stoneAgeDailyChallenge({},day);
  for(const save of [null,[],42,'bad',true]){
    assert.doesNotThrow(()=>stoneAgeDailyChallenge(save,day));
    assert.deepEqual(stoneAgeDailyChallenge(save,day),baseline);
  }
});

test('daily challenge still honors valid progression fields',()=>{
  const result=stoneAgeDailyChallenge({highestMap:25,completedMap:25,totems:100},day);
  assert.equal(Number.isInteger(result.mapNumber),true);
  assert.ok(result.mapNumber>=1&&result.mapNumber<=25);
  assert.equal(typeof result.modeId,'string');
  assert.equal(typeof result.objective,'string');
});

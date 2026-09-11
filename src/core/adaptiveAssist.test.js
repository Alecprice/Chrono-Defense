import test from 'node:test';
import assert from 'node:assert/strict';
import {applyAdaptiveAssist,armAdaptiveAssist,clearAdaptiveAssist} from './adaptiveAssist.js';

function installSessionStorage(){
  const values=new Map();
  globalThis.sessionStorage={
    getItem:key=>values.has(key)?values.get(key):null,
    setItem:(key,value)=>values.set(key,String(value)),
    removeItem:key=>values.delete(key),
  };
}

test('adaptive assist keeps inactive input untouched',()=>{
  installSessionStorage();
  const malformed={bad:true};
  assert.equal(applyAdaptiveAssist('stone-age',1,malformed),malformed);
});

test('adaptive assist fails safely on malformed active unit collections',()=>{
  installSessionStorage();
  armAdaptiveAssist('stone-age',1);
  for(const units of [null,{},'bad',42])assert.deepEqual(applyAdaptiveAssist('stone-age',1,units),[]);
  clearAdaptiveAssist('stone-age',1);
});

test('adaptive assist ignores malformed rows and still scales valid units',()=>{
  installSessionStorage();
  armAdaptiveAssist('stone-age',2);
  const result=applyAdaptiveAssist('stone-age',2,[null,42,[],{id:'grunt',hp:100,maxHp:100,speed:10,baseDamage:10}]);
  assert.equal(result.length,1);
  assert.equal(result[0].id,'grunt');
  assert.equal(result[0].hp,80);
  assert.equal(result[0].maxHp,80);
  assert.equal(result[0].baseDamage,8);
  assert.equal(result[0].speed,9);
});

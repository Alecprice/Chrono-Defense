import test from 'node:test';
import assert from 'node:assert/strict';
import {applyAdaptiveAssist} from './adaptiveAssist.js';

function withSessionStorage(values,fn){
  const original=globalThis.sessionStorage;
  globalThis.sessionStorage={getItem:key=>values.get(key)??null,setItem(){},removeItem(){}};
  try{return fn()}finally{if(original===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=original;}
}

test('adaptive assist returns an empty unit list for malformed unit containers',()=>{
  withSessionStorage(new Map([['chrono-adaptive-assist:stone-age:1','1']]),()=>{
    assert.deepEqual(applyAdaptiveAssist('stone-age',1,null),[]);
    assert.deepEqual(applyAdaptiveAssist('stone-age',1,'bad'),[]);
    assert.deepEqual(applyAdaptiveAssist('stone-age',1,{}),[]);
  });
});

test('adaptive assist does not crash when an active unit list contains malformed rows',()=>{
  const unit={id:'grunt',hp:100,maxHp:100,speed:10,baseDamage:10};
  withSessionStorage(new Map([['chrono-adaptive-assist:stone-age:1','1']]),()=>{
    const result=applyAdaptiveAssist('stone-age',1,[null,'bad',[],unit]);
    assert.equal(result[0],null);
    assert.equal(result[1],'bad');
    assert.deepEqual(result[2],[]);
    assert.equal(result[3].hp,80);
    assert.equal(result[3].maxHp,80);
    assert.equal(result[3].speed,9);
    assert.equal(result[3].baseDamage,8);
  });
});

test('inactive adaptive assist preserves a valid unit array identity',()=>{
  const units=[{id:'grunt',hp:100}];
  withSessionStorage(new Map(),()=>assert.equal(applyAdaptiveAssist('stone-age',1,units),units));
});

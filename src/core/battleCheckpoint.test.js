import test from 'node:test';
import assert from 'node:assert/strict';
import {BATTLE_CHECKPOINT_KEY,loadBattleCheckpoint,saveBattleCheckpoint} from './battleCheckpoint.js';

const NOW=Date.UTC(2026,8,9,18,45,0);
const MAX_AGE_MS=24*60*60*1000;

function memoryStorage(){
  const values=new Map();
  return {
    getItem(key){return values.has(key)?values.get(key):null},
    setItem(key,value){values.set(key,String(value))},
    removeItem(key){values.delete(key)},
  };
}

function put(storage,value){storage.setItem(BATTLE_CHECKPOINT_KEY,JSON.stringify(value))}

test('battle checkpoint loader accepts only fresh structurally valid checkpoints',()=>{
  const originalNow=Date.now;
  const originalDescriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  const store=memoryStorage();
  Object.defineProperty(globalThis,'localStorage',{value:store,configurable:true});
  Date.now=()=>NOW;
  try{
    const valid={version:1,worldId:'stone-age',mapNumber:7,modeId:'normal',savedAt:NOW-60_000};
    put(store,valid);
    assert.deepEqual(loadBattleCheckpoint('stone-age'),valid);

    assert.equal(loadBattleCheckpoint('industrial-age'),null);
    assert.notEqual(store.getItem(BATTLE_CHECKPOINT_KEY),null,'world mismatch must not erase a valid checkpoint');

    for(const invalid of [
      {...valid,savedAt:NOW+1},
      {...valid,savedAt:NOW-MAX_AGE_MS-1},
      {...valid,savedAt:'Infinity'},
      {...valid,savedAt:0},
      {...valid,worldId:''},
      {...valid,mapNumber:'7'},
      {...valid,mapNumber:0},
      {...valid,mapNumber:-1},
      {...valid,mapNumber:1.5},
    ]){
      put(store,invalid);
      assert.equal(loadBattleCheckpoint(),null);
      assert.equal(store.getItem(BATTLE_CHECKPOINT_KEY),null,'corrupt checkpoints must be cleared');
    }

    store.setItem(BATTLE_CHECKPOINT_KEY,'{"broken"');
    assert.equal(loadBattleCheckpoint(),null);
    assert.equal(store.getItem(BATTLE_CHECKPOINT_KEY),null,'malformed JSON must be cleared');
  }finally{
    Date.now=originalNow;
    if(originalDescriptor)Object.defineProperty(globalThis,'localStorage',originalDescriptor);
    else delete globalThis.localStorage;
  }
});

test('checkpoint saver rejects malformed identities without replacing recoverable progress',()=>{
  const originalNow=Date.now;
  const originalDescriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  const store=memoryStorage();
  Object.defineProperty(globalThis,'localStorage',{value:store,configurable:true});
  Date.now=()=>NOW;
  try{
    const saved=saveBattleCheckpoint({worldId:' stone-age ',mapNumber:7,modeId:' normal ',gold:25});
    assert.equal(saved.worldId,'stone-age');
    assert.equal(saved.modeId,'normal');
    assert.equal(saved.version,1);
    assert.equal(saved.savedAt,NOW);
    const durable=store.getItem(BATTLE_CHECKPOINT_KEY);

    for(const invalid of [null,[],true,'checkpoint',{}, {worldId:'',mapNumber:7}, {worldId:'stone-age',mapNumber:'7'}, {worldId:'stone-age',mapNumber:0}, {worldId:'stone-age',mapNumber:1.5}, {worldId:'stone-age',mapNumber:7,modeId:''}, {worldId:'stone-age',mapNumber:7,modeId:42}]){
      assert.equal(saveBattleCheckpoint(invalid),null);
      assert.equal(store.getItem(BATTLE_CHECKPOINT_KEY),durable,'invalid writes must leave the previous checkpoint untouched');
    }
  }finally{
    Date.now=originalNow;
    if(originalDescriptor)Object.defineProperty(globalThis,'localStorage',originalDescriptor);
    else delete globalThis.localStorage;
  }
});

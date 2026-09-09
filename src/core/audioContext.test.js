import test from'node:test';
import assert from'node:assert/strict';
import{createAudioContextSafely,ensureAudioContextReady}from'./audioContext.js';

test('audio context construction fails closed',()=>{
  assert.equal(createAudioContextSafely(null),null);
  class BrokenAudioContext{constructor(){throw new Error('blocked')}}
  assert.equal(createAudioContextSafely(BrokenAudioContext),null);
});

test('running audio contexts do not resume unnecessarily',()=>{
  let resumes=0;
  const context={state:'running',resume(){resumes+=1}};
  assert.equal(ensureAudioContextReady(context),context);
  assert.equal(resumes,0);
});

test('synchronous audio resume failures are contained',()=>{
  const context={state:'suspended',resume(){throw new Error('gesture required')}};
  assert.equal(ensureAudioContextReady(context),context);
});

test('asynchronous audio resume failures are observed and contained',()=>{
  let rejectionHandled=false;
  const context={
    state:'suspended',
    resume(){return{catch(handler){rejectionHandled=true;handler(new Error('not allowed'));return this}}},
  };
  assert.equal(ensureAudioContextReady(context),context);
  assert.equal(rejectionHandled,true,'resume rejection must receive a catch handler');
});

test('new suspended contexts are immediately prepared through the safe path',()=>{
  let resumes=0;
  class SuspendedAudioContext{
    constructor(){this.state='suspended'}
    resume(){resumes+=1;return Promise.resolve()}
  }
  const context=createAudioContextSafely(SuspendedAudioContext);
  assert.ok(context instanceof SuspendedAudioContext);
  assert.equal(resumes,1);
});

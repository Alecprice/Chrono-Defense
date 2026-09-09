import test from 'node:test';
import assert from 'node:assert/strict';
import {enterGameFullscreen,exitGameFullscreen,isGameFullscreen} from './display.js';

function swapGlobal(name,value){
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,name);
  Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  return()=>{if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]};
}

test('fullscreen helpers fail closed when browser globals are unavailable',async()=>{
  const restoreDocument=swapGlobal('document',undefined);
  const restoreMatchMedia=swapGlobal('matchMedia',undefined);
  const restoreScreen=swapGlobal('screen',undefined);
  try{
    assert.equal(await enterGameFullscreen(),false);
    assert.equal(await exitGameFullscreen(),undefined);
    assert.equal(isGameFullscreen(),false);
  }finally{restoreScreen();restoreMatchMedia();restoreDocument();}
});

test('fullscreen detection contains matchMedia failures',()=>{
  const restoreDocument=swapGlobal('document',{fullscreenElement:null});
  const restoreMatchMedia=swapGlobal('matchMedia',()=>{throw new Error('media unavailable')});
  try{assert.equal(isGameFullscreen(),false)}finally{restoreMatchMedia();restoreDocument();}
});

test('fullscreen helpers preserve supported browser behavior',async()=>{
  const calls=[];
  const documentElement={requestFullscreen:async options=>{calls.push(['enter',options]);fakeDocument.fullscreenElement=documentElement}};
  const fakeDocument={fullscreenElement:null,documentElement,exitFullscreen:async()=>{calls.push(['exit']);fakeDocument.fullscreenElement=null}};
  const restoreDocument=swapGlobal('document',fakeDocument);
  const restoreScreen=swapGlobal('screen',{orientation:{lock:async mode=>calls.push(['lock',mode])}});
  const restoreMatchMedia=swapGlobal('matchMedia',()=>({matches:false}));
  try{
    assert.equal(await enterGameFullscreen(),true);
    assert.equal(isGameFullscreen(),true);
    await exitGameFullscreen();
    assert.equal(isGameFullscreen(),false);
    assert.deepEqual(calls,[['enter',{navigationUI:'hide'}],['lock','landscape'],['exit']]);
  }finally{restoreMatchMedia();restoreScreen();restoreDocument();}
});

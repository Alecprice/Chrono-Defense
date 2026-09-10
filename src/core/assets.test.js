import assert from 'node:assert/strict';
import test from 'node:test';
import {assetManifest,assetPath,registerAsset,registerAssetPack} from './assets.js';

test('asset pack registration ignores malformed pack containers',()=>{
  assert.equal(registerAssetPack('test-world',null),null);
  assert.equal(registerAssetPack('test-world','bad'),null);
  assert.equal(assetManifest()['test-world'],undefined);
});

test('asset pack registration skips malformed entry groups without corrupting valid assets',()=>{
  const pack=registerAssetPack('test-world',{towers:{club:'/club.webp'},structures:'bad',enemies:[]});
  assert.equal(pack.towers.club,'/club.webp');
  assert.equal(assetPath('test-world','towers','club'),'/club.webp');
  assert.deepEqual(pack.structures,{});
  assert.deepEqual(pack.enemies,{});
});

test('single asset registration rejects unsafe registry keys',()=>{
  assert.equal(registerAsset('__proto__','towers','bad','/bad.webp'),false);
  assert.equal(registerAsset('safe-world','constructor','bad','/bad.webp'),false);
  assert.equal(registerAsset('safe-world','towers','club','/safe.webp'),true);
  assert.equal(assetPath('safe-world','towers','club'),'/safe.webp');
});

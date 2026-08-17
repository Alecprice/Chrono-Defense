import { test, expect } from '@playwright/test';

const saveKey = 'chrono-defense-save-v1';
const readySave = {
  version: 1,
  activeWorld: 'stone-age',
  worlds: {
    'stone-age': { tutorialComplete: true, highestMap: 1, completedMap: 0, totems: 0, mastery: 0, best: {}, achievements: [], stats: {} },
    retro: {}, future: {}, space: {}, 'time-rift': {},
  },
  settings: { juniorMode: false, sound: false, music: false, haptics: false },
};
async function setReadySave(page){await page.addInitScript(({key,value})=>{localStorage.setItem(key,JSON.stringify(value));localStorage.setItem('chrono-welcome-seen','1')},{key:saveKey,value:readySave})}
async function enterStoneBattle(page){await page.goto('/');await expect(page.getByRole('heading',{name:'STONE AGE'})).toBeVisible();await page.getByRole('button',{name:/Enter Battle/}).click();await expect(page.locator('.battle-screen')).toBeVisible()}

test('tutorial hands off to campaign without blank screen',async({page})=>{
 const errors=[],consoleErrors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});
 await page.addInitScript(()=>localStorage.setItem('chrono-welcome-seen','1'));await page.goto('/');await expect(page.getByRole('heading',{name:/Protect Your Village!/})).toBeVisible();await page.getByRole('button',{name:'Skip'}).click();await page.waitForTimeout(500);
 if(!(await page.locator('.campaign-screen').count())){console.log('POST_SKIP_BODY:',(await page.locator('body').innerText()).slice(0,3000));console.log('POST_SKIP_SAVE:',await page.evaluate(key=>localStorage.getItem(key),saveKey));console.log('POST_SKIP_PAGE_ERRORS:',JSON.stringify(errors));console.log('POST_SKIP_CONSOLE_ERRORS:',consoleErrors.join('\n---\n'))}
 await expect(page.locator('.campaign-screen')).toBeVisible();await expect(page.getByRole('heading',{name:'STONE AGE'})).toBeVisible();expect(errors).toEqual([])
});

test('clicking the village cannot place or replace a tower',async({page})=>{await setReadySave(page);await enterStoneBattle(page);await page.getByRole('button',{name:/Rock Thrower/}).click();const before=await page.locator('.cell.occupied').count();await page.locator('.village').dispatchEvent('click');await page.waitForTimeout(150);expect(await page.locator('.cell.occupied').count()).toBe(before);await expect(page.locator('.village')).toContainText('Village')});

test('touch orientation blocks in portrait and resumes cleanly in landscape',async({browser})=>{const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await setReadySave(page);await enterStoneBattle(page);await page.setViewportSize({width:390,height:844});await expect(page.getByRole('heading',{name:/Rotate to landscape/})).toBeVisible();await page.setViewportSize({width:844,height:390});await expect(page.getByRole('heading',{name:/Rotate to landscape/})).toBeHidden();await expect(page.locator('.battle-screen')).toBeVisible();expect(errors).toEqual([]);await context.close()});

test('mid-wave refresh restores unfinished battle instead of losing it',async({page})=>{await setReadySave(page);await enterStoneBattle(page);await page.getByRole('button',{name:/Rock Thrower/}).click();await page.locator('.cell:not(.path):not(.occupied)').first().click();await expect(page.locator('.cell.occupied')).toHaveCount(1);await page.getByRole('button',{name:/Start Wave 1/}).click();await page.waitForTimeout(1200);await page.reload();await expect(page.getByText(/We saved your game!/)).toBeVisible();await expect(page.getByRole('button',{name:/Continue Battle/})).toBeVisible()});

test('fully precached build reloads while browser is offline',async({browser})=>{
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await setReadySave(page);await page.goto('/');await expect(page.getByRole('heading',{name:'STONE AGE'})).toBeVisible();
 await page.waitForFunction(async()=>{if(!('caches'in window))return false;const cache=await caches.open('chrono-defense-shell-v29');return Boolean(await cache.match(new URL('/__chrono-offline-ready-v29',location.origin).href))},null,{timeout:30000});
 const missing=await page.evaluate(async()=>{const cache=await caches.open('chrono-defense-shell-v29');const files=await (await fetch('/precache-manifest.json')).json();const urls=[...new Set(['/','/index.html','/manifest.webmanifest','/precache-manifest.json',...files])];const absent=[];for(const url of urls){if(!(await cache.match(new URL(url,location.origin).href)))absent.push(url)}return absent});
 expect(missing).toEqual([]);await expect(page.locator('.offline-ready-pill')).toBeVisible({timeout:10000});
 await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});if(!(await page.locator('.campaign-screen').count()))console.log('OFFLINE_RELOAD_BODY:',(await page.locator('body').innerText()).slice(0,2000));await expect(page.getByRole('heading',{name:'STONE AGE'})).toBeVisible({timeout:10000});expect(errors).toEqual([]);await context.setOffline(false);await context.close()
});

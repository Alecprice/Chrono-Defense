const CACHE='chrono-defense-shell-v30';
const READY='/__chrono-offline-ready-v30';
const CORE=['/','/index.html','/manifest.webmanifest','/precache-manifest.json'];
const canonical=url=>new URL(url,self.location.origin).href;
const requestFor=url=>new Request(canonical(url),{cache:'reload'});
let precachePromise=null;
async function post(target,message){if(target?.postMessage){target.postMessage(message);return}const clients=await self.clients.matchAll({type:'window'});clients.forEach(client=>client.postMessage(message))}
async function readyData(){try{const cache=await caches.open(CACHE);const marker=await cache.match(canonical(READY));if(!marker)return null;const data=await marker.clone().json();for(const url of data.urls??[]){if(!(await cache.match(canonical(url))))return null}return data}catch{return null}}
async function isOfflineReady(){return Boolean(await readyData())}
async function cacheOne(cache,url){const request=requestFor(url);const response=await fetch(request);if(!response.ok)throw new Error(`Failed ${url}: ${response.status}`);await cache.put(canonical(url),response.clone())}
async function runPrecache(target=null){
  const existing=await readyData();if(existing){await post(target,{type:'CHRONO_OFFLINE_PROGRESS',done:existing.urls.length,total:existing.urls.length,cache:CACHE});return true}
  const cache=await caches.open(CACHE);
  await cache.delete(canonical(READY));
  try{
    const manifestRequest=requestFor('/precache-manifest.json');
    const manifestNetwork=await fetch(manifestRequest);
    if(!manifestNetwork.ok)throw new Error(`Manifest ${manifestNetwork.status}`);
    const files=await manifestNetwork.clone().json();
    const urls=[...new Set([...CORE,...files])];
    await cache.put(canonical('/precache-manifest.json'),manifestNetwork.clone());
    let done=0;await post(target,{type:'CHRONO_OFFLINE_PROGRESS',done,total:urls.length,cache:CACHE});
    for(const url of urls){if(url!=='/precache-manifest.json')await cacheOne(cache,url);done+=1;await post(target,{type:'CHRONO_OFFLINE_PROGRESS',done,total:urls.length,cache:CACHE})}
    const indexResponse=await cache.match(canonical('/index.html'));if(!indexResponse)throw new Error('Missing cached index');
    const indexText=await indexResponse.clone().text();
    const referenced=[...indexText.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match=>match[1]).filter(url=>url.startsWith('/'));
    for(const url of [...new Set(referenced)]){if(!urls.includes(url)){await cacheOne(cache,url);urls.push(url)}}
    for(const url of urls){if(!(await cache.match(canonical(url))))throw new Error(`Verification failed ${url}`)}
    await cache.put(canonical(READY),new Response(JSON.stringify({cache:CACHE,urls,createdAt:Date.now()}),{headers:{'content-type':'application/json'}}));
    return true;
  }catch(error){await cache.delete(canonical(READY));console.error('Chrono offline precache failed',error);return false}
}
function precache(target=null){if(!precachePromise)precachePromise=runPrecache(target).finally(()=>{precachePromise=null});return precachePromise}
async function announceOfflineReady(target=null){await post(target,{type:'CHRONO_OFFLINE_READY',cache:CACHE})}
self.addEventListener('install',event=>{event.waitUntil(precache().then(ok=>ok&&self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()).then(()=>precache()).then(ok=>ok&&announceOfflineReady()))});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();if(event.data==='PRECACHE_ALL')event.waitUntil(precache(event.source).then(ok=>ok&&announceOfflineReady(event.source)));if(event.data==='GET_OFFLINE_STATUS')event.waitUntil(isOfflineReady().then(ready=>post(event.source,{type:ready?'CHRONO_OFFLINE_READY':'CHRONO_OFFLINE_NOT_READY',cache:CACHE})))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(caches.open(CACHE).then(cache=>cache.match(canonical('/index.html')).then(cached=>cached||fetch(event.request))));return}
  event.respondWith(caches.open(CACHE).then(cache=>cache.match(canonical(url.pathname+url.search)).then(cached=>cached||cache.match(canonical(url.pathname)).then(pathCached=>pathCached||fetch(event.request).then(response=>{if(response.ok)cache.put(canonical(url.pathname),response.clone());return response})))))
});

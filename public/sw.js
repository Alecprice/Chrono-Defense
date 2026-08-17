const CACHE='chrono-defense-shell-v29';
const READY='/__chrono-offline-ready-v29';
const CORE=['/','/index.html','/manifest.webmanifest','/precache-manifest.json'];
const canonical=url=>new URL(url,self.location.origin).href;
async function post(target,message){if(target?.postMessage){target.postMessage(message);return}const clients=await self.clients.matchAll({type:'window'});clients.forEach(client=>client.postMessage(message))}
async function isOfflineReady(){try{const cache=await caches.open(CACHE);return Boolean(await cache.match(canonical(READY)))}catch{return false}}
async function cacheRequired(cache,url){
  const request=new Request(canonical(url),{cache:'reload'});
  const response=await fetch(request);
  if(!response.ok)throw new Error(`Failed to precache ${url}: ${response.status}`);
  await cache.put(canonical(url),response.clone());
}
async function precache(target=null){
  const cache=await caches.open(CACHE);
  await cache.delete(canonical(READY));
  try{
    await Promise.all(CORE.map(url=>cacheRequired(cache,url)));
    const manifestResponse=await cache.match(canonical('/precache-manifest.json'));
    if(!manifestResponse)throw new Error('Missing precache manifest');
    const files=await manifestResponse.json();
    const urls=[...new Set([...CORE,...files])];
    let done=0;
    await post(target,{type:'CHRONO_OFFLINE_PROGRESS',done,total:urls.length,cache:CACHE});
    for(const url of urls){
      await cacheRequired(cache,url);
      done+=1;
      await post(target,{type:'CHRONO_OFFLINE_PROGRESS',done,total:urls.length,cache:CACHE});
    }
    for(const url of urls){if(!(await cache.match(canonical(url))))throw new Error(`Missing cached asset ${url}`)}
    await cache.put(canonical(READY),new Response('ready',{headers:{'content-type':'text/plain'}}));
    return true;
  }catch(error){
    await cache.delete(canonical(READY));
    console.error('Chrono offline precache failed',error);
    return false;
  }
}
async function announceOfflineReady(target=null){await post(target,{type:'CHRONO_OFFLINE_READY',cache:CACHE})}
self.addEventListener('install',event=>{event.waitUntil(precache().then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()).then(()=>precache()).then(ok=>ok&&announceOfflineReady()))});
self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING')self.skipWaiting();
  if(event.data==='PRECACHE_ALL')event.waitUntil(precache(event.source).then(ok=>ok&&announceOfflineReady(event.source)));
  if(event.data==='GET_OFFLINE_STATUS')event.waitUntil(isOfflineReady().then(ready=>post(event.source,{type:ready?'CHRONO_OFFLINE_READY':'CHRONO_OFFLINE_NOT_READY',cache:CACHE})));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(caches.open(CACHE).then(cache=>cache.match(canonical('/index.html')).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok)cache.put(canonical('/index.html'),response.clone());return response}))));
    return;
  }
  event.respondWith(caches.open(CACHE).then(cache=>cache.match(canonical(url.pathname+url.search)).then(cached=>cached||cache.match(canonical(url.pathname)).then(pathCached=>pathCached||fetch(event.request).then(response=>{if(response.ok)cache.put(canonical(url.pathname),response.clone());return response})))));
});

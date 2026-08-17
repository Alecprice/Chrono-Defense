const CACHE='chrono-defense-shell-v19';
const CORE=['/','/index.html','/manifest.webmanifest','/precache-manifest.json'];
async function precache(){
  const cache=await caches.open(CACHE);
  await cache.addAll(CORE);
  try{
    const response=await fetch('/precache-manifest.json',{cache:'no-store'});
    if(!response.ok)throw new Error('manifest');
    const files=await response.json();
    const urls=[...new Set([...CORE,...files])];
    for(let i=0;i<urls.length;i+=20){
      await Promise.all(urls.slice(i,i+20).map(async url=>{
        try{
          const request=new Request(url,{cache:'reload'});
          const asset=await fetch(request);
          if(asset.ok)await cache.put(request,asset);
        }catch{}
      }));
    }
    return true;
  }catch{return false}
}
async function announceOfflineReady(target=null){
  if(target?.postMessage){target.postMessage({type:'CHRONO_OFFLINE_READY',cache:CACHE});return}
  const clients=await self.clients.matchAll({type:'window'});
  clients.forEach(client=>client.postMessage({type:'CHRONO_OFFLINE_READY',cache:CACHE}));
}
self.addEventListener('install',event=>{event.waitUntil(precache().then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()).then(()=>precache()).then(ok=>ok&&announceOfflineReady()))});
self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING')self.skipWaiting();
  if(event.data==='PRECACHE_ALL')event.waitUntil(precache().then(ok=>ok&&announceOfflineReady(event.source)));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(caches.match('/index.html').then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('/index.html',copy));return response})));return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}));
});

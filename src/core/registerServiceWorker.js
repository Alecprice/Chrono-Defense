function announceUpdate(registration){window.dispatchEvent(new CustomEvent('chrono:sw-update',{detail:{registration}}))}
async function requestPersistentStorage(){try{if(navigator.storage?.persist)await navigator.storage.persist()}catch{}}
export function registerServiceWorker(){
  if('serviceWorker' in navigator && import.meta.env.PROD){
    window.addEventListener('load',async()=>{
      try{
        await requestPersistentStorage();
        const registration=await navigator.serviceWorker.register('/sw.js');
        const sendPrecache=()=>registration.active?.postMessage('PRECACHE_ALL');
        if(registration.waiting&&navigator.serviceWorker.controller)announceUpdate(registration);
        registration.addEventListener('updatefound',()=>{
          const worker=registration.installing;if(!worker)return;
          worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)announceUpdate(registration);if(worker.state==='activated')sendPrecache()});
        });
        navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='CHRONO_OFFLINE_READY')window.dispatchEvent(new CustomEvent('chrono:offline-ready'))});
        if(registration.active)sendPrecache();
      }catch{/* offline play should not fail if SW registration does */}
    },{once:true});
  }
}

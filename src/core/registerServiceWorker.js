function announceUpdate(registration){window.dispatchEvent(new CustomEvent('chrono:sw-update',{detail:{registration}}))}
export function registerServiceWorker(){
  if('serviceWorker' in navigator && import.meta.env.PROD){
    window.addEventListener('load',async()=>{
      try{
        const registration=await navigator.serviceWorker.register('/sw.js');
        if(registration.waiting&&navigator.serviceWorker.controller)announceUpdate(registration);
        registration.addEventListener('updatefound',()=>{
          const worker=registration.installing;if(!worker)return;
          worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)announceUpdate(registration)});
        });
      }catch{/* offline play should not fail if SW registration does */}
    },{once:true});
  }
}

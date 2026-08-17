let installed=false;
export function installGameTimerGuard(){
  if(installed||typeof window==='undefined')return;
  installed=true;
  const nativeSetInterval=window.setInterval.bind(window);
  window.setInterval=(callback,delay,...args)=>{
    if(typeof callback!=='function')return nativeSetInterval(callback,delay,...args);
    return nativeSetInterval((...callbackArgs)=>{
      if(window.__chronoOrientationBlocked||window.__chronoSessionBlocked||document.hidden)return;
      callback(...callbackArgs);
    },delay,...args);
  };
}

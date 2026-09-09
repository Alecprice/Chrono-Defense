export function ensureAudioContextReady(audioContext){
  if(!audioContext)return null;
  if(audioContext.state==='suspended'&&typeof audioContext.resume==='function'){
    try{
      const pending=audioContext.resume();
      if(pending&&typeof pending.catch==='function')void pending.catch(()=>{});
    }catch{/* audio resume is optional */}
  }
  return audioContext;
}

export function createAudioContextSafely(AudioContextCtor){
  if(typeof AudioContextCtor!=='function')return null;
  try{return ensureAudioContextReady(new AudioContextCtor());}
  catch{return null;}
}

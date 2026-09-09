function doc(){return globalThis.document??null}
function mediaMatches(query){try{return globalThis.matchMedia?.(query)?.matches===true}catch{return false}}
export async function enterGameFullscreen(){
  const d=doc();
  if(!d)return false;
  try{
    if(!d.fullscreenElement)await d.documentElement?.requestFullscreen?.({navigationUI:'hide'});
  }catch{/* fullscreen is optional */}
  try{await globalThis.screen?.orientation?.lock?.('landscape')}catch{/* orientation lock requires supported fullscreen/PWA context */}
  return Boolean(d.fullscreenElement);
}
export async function exitGameFullscreen(){const d=doc();try{if(d?.fullscreenElement)await d.exitFullscreen?.()}catch{/* optional */}}
export function isGameFullscreen(){const d=doc();return Boolean(d?.fullscreenElement||mediaMatches('(display-mode: fullscreen)')||mediaMatches('(display-mode: standalone)'))}

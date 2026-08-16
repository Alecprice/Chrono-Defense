export async function enterGameFullscreen(){
  try{
    if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.({navigationUI:'hide'});
  }catch{/* fullscreen is optional */}
  try{await screen.orientation?.lock?.('landscape');}catch{/* orientation lock requires supported fullscreen/PWA context */}
  return Boolean(document.fullscreenElement);
}
export async function exitGameFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen?.()}catch{/* optional */}}
export function isGameFullscreen(){return Boolean(document.fullscreenElement||matchMedia?.('(display-mode: fullscreen)').matches||matchMedia?.('(display-mode: standalone)').matches);}

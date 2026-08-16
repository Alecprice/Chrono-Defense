import React, { useState } from 'react';
import { assetPath } from '../core/assets.js';

export function AssetSprite({world='stone-age',kind,id,fallback,alt='',className=''}){
  const src=assetPath(world,kind,id);
  const [failed,setFailed]=useState(false);
  if(!src||failed)return <span className={`asset-fallback ${className}`} aria-label={alt||undefined}>{fallback}</span>;
  return <img className={`asset-sprite ${className}`} src={src} alt={alt} draggable="false" onError={()=>setFailed(true)}/>;
}

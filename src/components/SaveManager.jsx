import React, { useRef, useState } from 'react';
import { defaultSave, parseSaveText, serializeSave } from '../core/save.js';

export function SaveManager({save,onReplace,onClose}){
  const inputRef=useRef(null);
  const [message,setMessage]=useState('Back up your progress before moving devices or clearing browser storage.');
  const [dangerArmed,setDangerArmed]=useState(false);

  const download=()=>{
    const blob=new Blob([serializeSave(save)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;
    anchor.download=`chrono-defense-save-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage('Save backup downloaded.');
  };

  const importFile=async event=>{
    const file=event.target.files?.[0];
    event.target.value='';
    if(!file)return;
    try{
      const imported=parseSaveText(await file.text());
      onReplace(imported);
      setMessage('Save restored successfully.');
    }catch(error){
      setMessage(error?.message||'Unable to read that save file.');
    }
  };

  const reset=()=>{
    if(!dangerArmed){setDangerArmed(true);setMessage('Press Reset Progress again to confirm. This cannot be undone without a backup.');return;}
    onReplace(defaultSave());
    setDangerArmed(false);
    setMessage('Local progress reset to a new game.');
  };

  return <div className="save-overlay" onClick={onClose}>
    <section className="save-panel" onClick={event=>event.stopPropagation()}>
      <header><div><small>LOCAL PLAYER DATA</small><h2>Save & Backup</h2></div><button onClick={onClose}>×</button></header>
      <p className="save-message">{message}</p>
      <div className="save-actions">
        <button onClick={download}><span>⬇️</span><div><b>Export Save</b><small>Download your progress as a JSON backup.</small></div></button>
        <button onClick={()=>inputRef.current?.click()}><span>⬆️</span><div><b>Import Save</b><small>Restore a Chrono Defense backup file.</small></div></button>
        <button className={dangerArmed?'danger armed':'danger'} onClick={reset}><span>⚠️</span><div><b>{dangerArmed?'Confirm Reset':'Reset Progress'}</b><small>{dangerArmed?'Press again to permanently reset local progress.':'Start Stone Age over from the beginning.'}</small></div></button>
      </div>
      <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={importFile}/>
      <footer><small>Chrono Defense currently stores progression locally in this browser. Exporting a backup is the safest way to preserve it.</small></footer>
    </section>
  </div>
}

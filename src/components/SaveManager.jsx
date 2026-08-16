import React,{useRef,useState}from'react';
import{defaultSave,loadSaveMeta,parseSaveText,restoreBackup,serializeSave,SAVE_BACKUP_KEY}from'../core/save.js';

export function SaveManager({save,onReplace,onClose}){
 const inputRef=useRef(null);const[message,setMessage]=useState('Back up your progress before moving devices or clearing browser storage.');const[dangerArmed,setDangerArmed]=useState(false);const[restoreArmed,setRestoreArmed]=useState(false);const[meta]=useState(()=>loadSaveMeta());const backupAvailable=Boolean(globalThis.localStorage?.getItem(SAVE_BACKUP_KEY));
 const download=()=>{const blob=new Blob([serializeSave(save)],{type:'application/json'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`chrono-defense-save-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);setMessage('Save backup downloaded.')};
 const importFile=async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;try{const imported=parseSaveText(await file.text());onReplace(imported);setMessage('Save restored successfully.')}catch(error){setMessage(error?.message||'Unable to read that save file.')}};
 const restoreLocal=()=>{if(!backupAvailable){setMessage('No valid rolling backup is available on this device.');return}if(!restoreArmed){setRestoreArmed(true);setMessage('Press Restore Rolling Backup again to replace the current save with the previous valid save.');return}try{const restored=restoreBackup();onReplace(restored);setRestoreArmed(false);setMessage('Previous valid local save restored.')}catch(error){setMessage(error?.message||'Unable to restore the rolling backup.')}};
 const reset=()=>{if(!dangerArmed){setDangerArmed(true);setMessage('Press Reset Progress again to confirm. Export a backup first if you may want this progress later.');return}onReplace(defaultSave());setDangerArmed(false);setMessage('Local progress reset to a new game.')};
 const savedAt=meta.lastSaved?new Date(meta.lastSaved).toLocaleString():null,recoveredAt=meta.lastRecovered?new Date(meta.lastRecovered).toLocaleString():null;
 return <div className="save-overlay" onClick={onClose}><section className="save-panel" onClick={event=>event.stopPropagation()}>
  <header><div><small>LOCAL PLAYER DATA</small><h2>Save & Backup</h2></div><button onClick={onClose}>×</button></header>
  <div className="save-health"><span><b>{savedAt?'✓ Saved':'Local Save'}</b><small>{savedAt?`Last write: ${savedAt}`:'Progress saves automatically in this browser.'}</small></span><span><b>{backupAvailable?'✓ Rolling Backup':'No Backup Yet'}</b><small>{backupAvailable?'Previous valid save is available for recovery.':'A backup is created after the next successful save write.'}</small></span>{recoveredAt&&<span><b>Recovery Used</b><small>{recoveredAt}</small></span>}</div>
  <p className="save-message">{message}</p>
  <div className="save-actions">
   <button onClick={download}><span>⬇️</span><div><b>Export Save</b><small>Download your progress as a portable JSON backup.</small></div></button>
   <button onClick={()=>inputRef.current?.click()}><span>⬆️</span><div><b>Import Save</b><small>Restore a Chrono Defense backup file.</small></div></button>
   <button disabled={!backupAvailable} className={restoreArmed?'armed':''} onClick={restoreLocal}><span>↩️</span><div><b>{restoreArmed?'Confirm Backup Restore':'Restore Rolling Backup'}</b><small>Return to the previous valid local save.</small></div></button>
   <button className={dangerArmed?'danger armed':'danger'} onClick={reset}><span>⚠️</span><div><b>{dangerArmed?'Confirm Reset':'Reset Progress'}</b><small>{dangerArmed?'Press again to permanently reset local progress.':'Start Stone Age over from the beginning.'}</small></div></button>
  </div>
  <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={importFile}/>
  <footer><small>Chrono Defense automatically keeps one previous valid local save. Exported backups are still recommended before clearing browser storage or changing devices.</small></footer>
 </section></div>
}

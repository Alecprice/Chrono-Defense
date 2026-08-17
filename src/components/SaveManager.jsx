import React,{useMemo,useRef,useState}from'react';
import{clearSaveStorage,defaultSave,hasBackup,loadSaveMeta,parseSaveText,restoreBackup,serializeSave}from'../core/save.js';

const ACTIVE_PROFILE_KEY='chrono-defense-active-profile-v1';
const PROFILE_META_KEY='chrono-defense-profile-meta-v1';
const slotKey=id=>`chrono-defense-profile-${id}-v1`;
function storage(){try{return localStorage}catch{return null}}
function readMeta(){try{return JSON.parse(storage()?.getItem(PROFILE_META_KEY)||'{}')}catch{return{}}}
function writeMeta(meta){try{storage()?.setItem(PROFILE_META_KEY,JSON.stringify(meta))}catch{}}
function activeProfile(){try{return Number(storage()?.getItem(ACTIVE_PROFILE_KEY)||1)||1}catch{return 1}}
function setActiveProfile(id){try{storage()?.setItem(ACTIVE_PROFILE_KEY,String(id))}catch{}}
function readSlot(id){try{const raw=storage()?.getItem(slotKey(id));return raw?parseSaveText(raw):null}catch{return null}}
function writeSlot(id,save){try{storage()?.setItem(slotKey(id),serializeSave(save));return true}catch{return false}}

export function SaveManager({save,onReplace,onClose}){
 const inputRef=useRef(null);const[message,setMessage]=useState('Back up your progress before moving devices or clearing browser storage.');const[dangerArmed,setDangerArmed]=useState(false);const[restoreArmed,setRestoreArmed]=useState(false);const[meta]=useState(()=>loadSaveMeta());const backupAvailable=hasBackup();const[profile,setProfile]=useState(()=>activeProfile());const[profileMeta,setProfileMeta]=useState(()=>readMeta());
 const profiles=useMemo(()=>[1,2,3].map(id=>({id,name:profileMeta[id]?.name||`Player ${id}`,hasSave:Boolean(readSlot(id))})),[profileMeta,profile,save]);
 const download=()=>{const blob=new Blob([serializeSave(save)],{type:'application/json'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`chrono-defense-save-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);setMessage('Save backup downloaded.')};
 const importFile=async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;try{const imported=parseSaveText(await file.text());onReplace(imported);writeSlot(profile,imported);setMessage('Save restored successfully.')}catch(error){setMessage(error?.message||'Unable to read that save file.')}};
 const restoreLocal=()=>{if(!backupAvailable){setMessage('No valid rolling backup is available on this device.');return}if(!restoreArmed){setRestoreArmed(true);setMessage('Press Restore Rolling Backup again to replace the current save with the previous valid save.');return}try{const restored=restoreBackup();onReplace(restored);writeSlot(profile,restored);setRestoreArmed(false);setMessage('Previous valid local save restored.')}catch(error){setMessage(error?.message||'Unable to restore the rolling backup.')}};
 const reset=()=>{if(!dangerArmed){setDangerArmed(true);setMessage('Press Reset Progress again to confirm. Export a backup first if you may want this progress later.');return}const fresh=clearSaveStorage();writeSlot(profile,fresh??defaultSave());onReplace(fresh??defaultSave());setDangerArmed(false);setRestoreArmed(false);setMessage(`Only ${profileMeta[profile]?.name||`Player ${profile}`} was reset. Other profile slots were kept.`)};
 const rename=(id,name)=>{const next={...profileMeta,[id]:{...(profileMeta[id]??{}),name:(name||'').slice(0,18)}};setProfileMeta(next);writeMeta(next)};
 const switchProfile=id=>{if(id===profile)return;writeSlot(profile,save);const next=readSlot(id)??defaultSave();writeSlot(id,next);setActiveProfile(id);setProfile(id);onReplace(next);setMessage(`Switched to ${profileMeta[id]?.name||`Player ${id}`}. The previous profile was saved first.`)};
 const savedAt=meta.lastSaved?new Date(meta.lastSaved).toLocaleString():null,recoveredAt=meta.lastRecovered?new Date(meta.lastRecovered).toLocaleString():null;
 return <div className="save-overlay" onClick={onClose}><section className="save-panel" onClick={event=>event.stopPropagation()}>
  <header><div><small>PARENT & LOCAL PLAYER DATA</small><h2>Profiles, Save & Backup</h2></div><button onClick={onClose} aria-label="Close save manager">×</button></header>
  <section className="profile-slots"><div className="profile-slots-head"><b>Kid Profiles</b><small>Three separate local progress slots on this device.</small></div><div className="profile-slot-grid">{profiles.map(item=><article key={item.id} className={profile===item.id?'active':''}><span>{profile===item.id?'⭐':'🙂'}</span><input aria-label={`Name for profile ${item.id}`} value={item.name} onChange={e=>rename(item.id,e.target.value)}/><small>{profile===item.id?'Playing now':item.hasSave?'Progress saved':'New profile'}</small><button disabled={profile===item.id} onClick={()=>switchProfile(item.id)}>{profile===item.id?'Active':'Switch'}</button></article>)}</div></section>
  <div className="save-health"><span><b>{savedAt?'✓ Saved':'Local Save'}</b><small>{savedAt?`Last write: ${savedAt}`:'Progress saves automatically in this browser.'}</small></span><span><b>{backupAvailable?'✓ Rolling Backup':'No Backup Yet'}</b><small>{backupAvailable?'Previous valid save is available for recovery.':'A backup is created after the next successful save write.'}</small></span>{recoveredAt&&<span><b>Recovery Used</b><small>{recoveredAt}</small></span>}</div>
  <p className="save-message" aria-live="polite">{message}</p>
  <div className="save-actions">
   <button onClick={download}><span>⬇️</span><div><b>Export Active Profile</b><small>Download this child’s progress as a portable JSON backup.</small></div></button>
   <button onClick={()=>inputRef.current?.click()}><span>⬆️</span><div><b>Import Into Active Profile</b><small>Restore a Chrono Defense backup into the profile being played now.</small></div></button>
   <button disabled={!backupAvailable} className={restoreArmed?'armed':''} onClick={restoreLocal}><span>↩️</span><div><b>{restoreArmed?'Confirm Backup Restore':'Restore Rolling Backup'}</b><small>Return the active profile to the previous valid local save.</small></div></button>
   <button className={dangerArmed?'danger armed':'danger'} onClick={reset}><span>⚠️</span><div><b>{dangerArmed?'Confirm Profile Reset':'Reset Active Profile'}</b><small>{dangerArmed?'Press again to reset only this profile.':'Other child profiles will not be deleted.'}</small></div></button>
  </div>
  <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={importFile}/>
  <footer><small>Each profile is stored locally on this device. Chrono Defense also keeps one previous valid active save. Exported backups are recommended before clearing browser storage.</small></footer>
 </section></div>
}

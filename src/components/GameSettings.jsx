import React from 'react';

const EFFECT_OPTIONS=['low','medium','high'];

export function GameSettings({settings,onChange,onClose}){
  const update=(key,value)=>onChange({...settings,[key]:value});
  return <div className="settings-overlay" onClick={onClose}>
    <div className="settings-card" onClick={event=>event.stopPropagation()}>
      <header><div><small>CHRONO DEFENSE</small><h2>Game Settings</h2></div><button onClick={onClose}>×</button></header>
      <div className="settings-list">
        <label><span><b>Reduced Motion</b><small>Disables most animation and movement effects.</small></span><input type="checkbox" checked={Boolean(settings.reducedMotion)} onChange={event=>update('reducedMotion',event.target.checked)}/></label>
        <label><span><b>Haptics</b><small>Use vibration feedback on supported touch devices.</small></span><input type="checkbox" checked={settings.haptics!==false} onChange={event=>update('haptics',event.target.checked)}/></label>
        <label><span><b>Large UI</b><small>Increase important controls and text size.</small></span><input type="checkbox" checked={Boolean(settings.largeUI)} onChange={event=>update('largeUI',event.target.checked)}/></label>
        <label><span><b>High Contrast</b><small>Increase borders and battlefield readability.</small></span><input type="checkbox" checked={Boolean(settings.highContrast)} onChange={event=>update('highContrast',event.target.checked)}/></label>
        <div className="effects-setting"><span><b>Effects Quality</b><small>Lower effects can improve performance on older phones and tablets.</small></span><div>{EFFECT_OPTIONS.map(option=><button key={option} className={settings.effects===option?'active':''} onClick={()=>update('effects',option)}>{option}</button>)}</div></div>
      </div>
      <footer><small>Settings save automatically on this device.</small><button onClick={onClose}>Done</button></footer>
    </div>
  </div>
}

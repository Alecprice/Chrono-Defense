import React from 'react';

const EFFECT_OPTIONS=['low','medium','high'];

export function GameSettings({settings,onChange,onClose}){
  const update=(key,value)=>onChange({...settings,[key]:value});
  return <div className="settings-overlay" onClick={onClose}>
    <div className="settings-card" role="dialog" aria-modal="true" aria-labelledby="chrono-settings-title" onClick={event=>event.stopPropagation()}>
      <header><div><small>CHRONO DEFENSE</small><h2 id="chrono-settings-title">Game Settings</h2></div><button onClick={onClose} aria-label="Close settings">×</button></header>
      <div className="settings-list">
        <label><span><b>Junior Mode</b><small>Shows a friendly helper, highlights what to tap next, and makes important controls easier to spot.</small></span><input type="checkbox" checked={settings.juniorMode!==false} onChange={event=>update('juniorMode',event.target.checked)}/></label>
        <label><span><b>Adaptive Help</b><small>After repeated losses, offer extra hints and an easier retry without changing your normal progress.</small></span><input type="checkbox" checked={settings.adaptiveHelp!==false} onChange={event=>update('adaptiveHelp',event.target.checked)}/></label>
        <label><span><b>Read Hints Aloud</b><small>Adds spoken help for Junior hints and boss preparation on supported devices.</small></span><input type="checkbox" checked={settings.readAloud!==false} onChange={event=>update('readAloud',event.target.checked)}/></label>
        <label><span><b>Dyslexia-Friendly Text</b><small>Uses wider spacing and simpler text rhythm for important Junior guidance.</small></span><input type="checkbox" checked={Boolean(settings.dyslexiaFriendly)} onChange={event=>update('dyslexiaFriendly',event.target.checked)}/></label>
        <label><span><b>Color-Safe Indicators</b><small>Uses shapes and stronger outlines so important information is not communicated by color alone.</small></span><input type="checkbox" checked={Boolean(settings.colorblindSafe)} onChange={event=>update('colorblindSafe',event.target.checked)}/></label>
        <label><span><b>Sound Effects</b><small>Button, placement, wave, boss and combat feedback.</small></span><input type="checkbox" checked={settings.sound!==false} onChange={event=>update('sound',event.target.checked)}/></label>
        <label><span><b>Music</b><small>Subtle procedural ambience changes with each era and pauses when the game is hidden.</small></span><input type="checkbox" checked={settings.music!==false} onChange={event=>update('music',event.target.checked)}/></label>
        <label><span><b>Reduced Motion</b><small>Disables most animation and movement effects.</small></span><input type="checkbox" checked={Boolean(settings.reducedMotion)} onChange={event=>update('reducedMotion',event.target.checked)}/></label>
        <label><span><b>Haptics</b><small>Use vibration feedback on supported touch devices.</small></span><input type="checkbox" checked={settings.haptics!==false} onChange={event=>update('haptics',event.target.checked)}/></label>
        <label><span><b>Large UI</b><small>Increase important controls and text size.</small></span><input type="checkbox" checked={Boolean(settings.largeUI)} onChange={event=>update('largeUI',event.target.checked)}/></label>
        <label><span><b>High Contrast</b><small>Increase borders and battlefield readability.</small></span><input type="checkbox" checked={Boolean(settings.highContrast)} onChange={event=>update('highContrast',event.target.checked)}/></label>
        <label><span><b>Auto Performance</b><small>Automatically reduce visual effects on low-memory or slower devices while keeping gameplay unchanged.</small></span><input type="checkbox" checked={settings.autoPerformance!==false} onChange={event=>update('autoPerformance',event.target.checked)}/></label>
        <div className="effects-setting"><span><b>Effects Quality</b><small>Lower effects can improve performance on older phones and tablets.</small></span><div role="group" aria-label="Effects quality">{EFFECT_OPTIONS.map(option=><button key={option} aria-pressed={settings.effects===option} className={settings.effects===option?'active':''} onClick={()=>update('effects',option)}>{option}</button>)}</div></div>
      </div>
      <footer><small>Settings save automatically on this device.</small><button onClick={onClose}>Done</button></footer>
    </div>
  </div>
}

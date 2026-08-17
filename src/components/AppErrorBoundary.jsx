import React from 'react';
import { SAVE_KEY, SAVE_BACKUP_KEY, SAVE_META_KEY, restoreBackup } from '../core/save.js';

export class AppErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null,recoveryMessage:''};}
  static getDerivedStateFromError(error){return{error};}
  componentDidCatch(error,info){console.error('Chrono Defense runtime error',error,info);}
  reload=()=>location.reload();
  restore=()=>{
    try{
      restoreBackup();
      this.setState({recoveryMessage:'Backup restored. Reloading…'});
      setTimeout(()=>location.reload(),250);
    }catch(error){
      this.setState({recoveryMessage:error?.message||'No valid backup is available.'});
    }
  };
  reset=()=>{
    try{
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_BACKUP_KEY);
      localStorage.removeItem(SAVE_META_KEY);
    }catch{}
    location.hash='stone-age';
    location.reload();
  };
  render(){
    if(!this.state.error)return this.props.children;
    return <div role="alert" aria-live="assertive" style={{position:'fixed',inset:0,display:'grid',placeItems:'center',padding:20,background:'#17130f',color:'#f5ead7',fontFamily:'system-ui',zIndex:99999}}>
      <div style={{width:'min(560px,92vw)',padding:22,border:'1px solid #8a633d',borderRadius:18,background:'#2b2018',boxShadow:'0 20px 70px #000a'}}>
        <small style={{color:'#d7a45e',letterSpacing:'.12em'}}>CHRONO DEFENSE RECOVERY</small>
        <h1 style={{margin:'6px 0 8px'}}>The timeline hit an error.</h1>
        <p style={{color:'#cbb493',lineHeight:1.5}}>Your progress is still stored locally. Reload first. If the error returns, try your rolling backup before resetting all local progress.</p>
        <pre style={{whiteSpace:'pre-wrap',fontSize:11,color:'#ffb39e',background:'#140e0a',padding:10,borderRadius:8,maxHeight:130,overflow:'auto'}}>{String(this.state.error?.message||this.state.error)}</pre>
        {this.state.recoveryMessage&&<p style={{margin:'10px 0 0',color:'#f2c981',fontWeight:800}}>{this.state.recoveryMessage}</p>}
        <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
          <button onClick={this.reload}>Reload Game</button>
          <button onClick={this.restore}>Restore Backup</button>
          <button onClick={this.reset} style={{marginLeft:'auto'}}>Reset All Local Progress</button>
        </div>
      </div>
    </div>;
  }
}

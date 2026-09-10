const MODE_ROTATION=['normal','hard','scarcity','one-tower','survival','tribal-warfare'];

function hashString(value=''){
  let hash=2166136261;
  for(let index=0;index<value.length;index+=1){
    hash^=value.charCodeAt(index);
    hash=Math.imul(hash,16777619);
  }
  return hash>>>0;
}

function record(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}

export function localDayKey(date=new Date()){
  const year=date.getFullYear();
  const month=String(date.getMonth()+1).padStart(2,'0');
  const day=String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

export function stoneAgeDailyChallenge(stoneSave={},date=new Date()){
  const save=record(stoneSave);
  const key=localDayKey(date);
  const seed=hashString(`chrono-stone-age-${key}`);
  const rawHighest=Number(save.highestMap);
  const highest=Number.isFinite(rawHighest)?Math.max(1,Math.min(25,Math.floor(rawHighest))):1;
  const mapNumber=1+(seed%highest);
  const availableModes=MODE_ROTATION.filter(id=>{
    if(id==='hard')return (save.completedMap??0)>=5;
    if(id==='survival')return (save.completedMap??0)>=10;
    if(id==='scarcity')return (save.totems??0)>=25;
    if(id==='one-tower')return (save.totems??0)>=35;
    if(id==='tribal-warfare')return (save.totems??0)>=50;
    return true;
  });
  const modeId=availableModes[(seed>>>8)%availableModes.length]??'normal';
  const objectives=[
    'Finish with at least 75% village health.',
    'Use six or fewer combat towers.',
    'Build at least one resource camp before Wave 3.',
    'Evolve at least one tower before the final wave.',
    'Win without selling a tower.',
  ];
  return {key,mapNumber,modeId,objective:objectives[(seed>>>16)%objectives.length]};
}

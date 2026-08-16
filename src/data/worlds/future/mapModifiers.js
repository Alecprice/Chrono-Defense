export function applyFutureMapModifiers(units,mapNumber,waveNumber){
 return units.map((unit,index)=>{
  const next={...unit};
  if(mapNumber===2)next.speed*=1.08;
  if(mapNumber===3&&index%3===0)next.shieldHp=Math.round((next.shieldHp??0)+next.maxHp*.12);
  if(mapNumber===4){next.creditReward=Math.round((next.creditReward??8)*1.15);next.hp=Math.round(next.hp*1.06);next.maxHp=next.hp;}
  if(mapNumber===6&&index%4===0)next.cloaked=true;
  if(mapNumber===7&&index%4===0)next.hacker=true;
  if(mapNumber===8&&index%5===0)next.healer=true;
  if(mapNumber===9&&index%4===0)next.emp=true;
  if(mapNumber===11){next.speed*=1.12;next.armor=Math.min(.82,(next.armor??0)+.04);}
  if(mapNumber===12&&index%3===0)next.phase=true;
  if(mapNumber===13){next.armor=Math.min(.85,(next.armor??0)+.14);next.speed*=.93;}
  if(mapNumber===14&&index%2===0)next.speed*=1.18;
  if(mapNumber===16){next.hp=Math.round(next.hp*1.1);next.maxHp=next.hp;}
  if(mapNumber===17&&index%3===0){next.hacker=true;next.cloaked=true;}
  if(mapNumber===18){next.creditReward=Math.round((next.creditReward??8)*1.5);next.hp=Math.round(next.hp*1.18);next.maxHp=next.hp;}
  if(mapNumber===19&&waveNumber>=5&&index%5===0){next.hp=Math.round(next.hp*1.65);next.maxHp=next.hp;next.armor=Math.min(.88,(next.armor??0)+.15);next.elite=true;}
  if(mapNumber===21){next.cloaked=index%3===0;next.emp=index%5===0;}
  if(mapNumber===22)next.speed*=1.16;
  if(mapNumber===23){next.shieldHp=Math.round((next.shieldHp??0)+next.maxHp*.18);next.creditReward=Math.round((next.creditReward??8)*.9);}
  if(mapNumber===24){next.hp=Math.round(next.hp*1.24);next.maxHp=next.hp;next.armor=Math.min(.9,(next.armor??0)+.1);next.speed*=1.08;}
  return next;
 });
}

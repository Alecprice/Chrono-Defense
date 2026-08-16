export function applyRetroMapModifiers(units,mapNumber,waveNumber){
 return units.flatMap((unit,index)=>{
  const next={...unit};
  if(mapNumber===3){next.speed*=1.08;next.erratic=true;}
  if(mapNumber===4){next.speed*=1.12;next.coinReward=Math.round((next.coinReward??5)*1.15);}
  if(mapNumber===6&&index%3===0)next.hp=Math.round(next.hp*.88);
  if(mapNumber===7&&index%3===0)next.phase=true;
  if(mapNumber===8&&index%4===0)next.stealsCoins=true;
  if(mapNumber===9){next.erratic=true;next.speed*=.95+((index%5)*.035);}
  if(mapNumber===11&&index%4===0)next.splitCount=Math.max(2,next.splitCount??0);
  if(mapNumber===12)next.speed*=1.1;
  if(mapNumber===13){next.armor=Math.min(.82,(next.armor??0)+.15);next.speed*=.92;}
  if(mapNumber===14)next.speed*=index%2?1.22:.82;
  if(mapNumber===16)next.speed*=1.28;
  if(mapNumber===17&&index%3===0)next.virus=true;
  if(mapNumber===18){next.hp=Math.round(next.hp*1.18);next.maxHp=Math.max(next.maxHp??0,next.hp);next.coinReward=Math.round((next.coinReward??5)*1.75);}
  if(mapNumber===19&&waveNumber>=5&&index%5===0){next.hp=Math.round(next.hp*1.55);next.maxHp=next.hp;next.armor=Math.min(.8,(next.armor??0)+.12);next.coinReward=Math.round((next.coinReward??5)*1.7);next.elite=true;}
  if(mapNumber===21){next.hp=Math.round(next.hp*1.1);next.maxHp=next.hp;next.erratic=index%3===0;}
  if(mapNumber===22&&index%4===0)next.phase=true;
  if(mapNumber===23){next.speed*=1.12;next.coinReward=Math.round((next.coinReward??5)*.85);}
  if(mapNumber===24){next.hp=Math.round(next.hp*1.2);next.maxHp=next.hp;next.speed*=1.12;next.armor=Math.min(.84,(next.armor??0)+.08);}
  return[next];
 });
}

export function mapTotems({ won, villageHp, maxHp=250, specialComplete=false }){
  if(!won) return 0;
  let total=1;
  if(villageHp/maxHp >= .75) total++;
  if(specialComplete) total++;
  return total;
}

export function masteryReward({ kills=0, mapNumber=1, bossDefeated=false }){
  return Math.max(1, Math.round(kills/8) + mapNumber + (bossDefeated?10:0));
}

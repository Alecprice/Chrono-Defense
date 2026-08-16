const regions = [
  ['Green Valley','🌿'], ['Wild Jungle','🌴'], ['Frozen Age','❄️'], ['Burning Lands','🌋'], ['Lost World','🦖']
];
const mechanics = [
  'Open grassland','Forest build pockets','River crossing','Hunting grounds','Boss arena',
  'Dense jungle','Split path','Hidden cave entrance','Resource-rich clearing','Boss arena',
  'Snow field','Ice speed zones','Frozen river','Mammoth trail','Boss arena',
  'Ash field','Lava hazards','Volcanic vents','Cracked earth lanes','Boss arena',
  'Fossil basin','Three-path defense','Ancient ruins','All mechanics combined','Final boss arena'
];
export const stoneAgeMaps = Array.from({ length:25 }, (_, i) => {
  const number=i+1; const regionIndex=Math.floor(i/5); const [region,icon]=regions[regionIndex];
  return { id:`stone-${String(number).padStart(2,'0')}`, number, name:`${region} ${number}`, region, icon, mechanic: mechanics[i], boss: number%5===0,
    totems:[ 'Complete the map', number%2 ? 'Village stays above 75%' : 'Take no village damage', number%3 ? 'Complete the special objective' : 'Use six or fewer combat towers' ] };
});

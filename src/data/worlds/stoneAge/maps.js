const MAPS = [
  ['First Camp','Green Valley','🌿','Open grassland','Use six or fewer combat towers'],
  ['Whispering Pines','Green Valley','🌲','Forest build pockets','Build at least one resource camp'],
  ['River of Beginnings','Green Valley','🌊','River crossing','Finish with the village above 90% health'],
  ['Hunters’ Meadow','Green Valley','🦌','Hunting grounds','Earn 100 Food during the battle'],
  ['Fang at Dusk','Green Valley','🐅','Boss arena','Defeat the Alpha Sabertooth without losing the village'],
  ['Vinebound Trail','Wild Jungle','🌴','Dense jungle','Use at least three different tower families'],
  ['Forked Canopy','Wild Jungle','🌿','Split path','Complete the map without selling a tower'],
  ['Cave of Teeth','Wild Jungle','🕳️','Hidden cave entrance','Survive every cave ambush'],
  ['Emerald Clearing','Wild Jungle','🌱','Resource-rich clearing','Build all three resource camp types'],
  ['Nest of the Queen','Wild Jungle','🦖','Boss arena','Defeat the Raptor Queen and her summoned packs'],
  ['White Expanse','Frozen Age','❄️','Snow field','Keep the village above 75% health'],
  ['Shattered Ice','Frozen Age','🧊','Ice speed zones','Defeat 75 enemies before they reach the final bend'],
  ['Frozen Crossing','Frozen Age','🌊','Frozen river','Use no more than eight combat towers'],
  ['Trail of Giants','Frozen Age','🦣','Mammoth trail','Defeat every Mammoth-class enemy'],
  ['The Long Winter','Frozen Age','👑','Boss arena','Defeat the Great Mammoth'],
  ['Ashen Approach','Burning Lands','🌋','Ash field','Finish with at least 50 Stone remaining'],
  ['River of Fire','Burning Lands','🔥','Lava hazards','Use Fire Keeper or Fire Slinger at least once'],
  ['Mouth of the Mountain','Burning Lands','🌋','Volcanic vents','Use the environment action at least once'],
  ['Broken Earth','Burning Lands','🪨','Cracked earth lanes','Complete the map using five or fewer tower families'],
  ['Tyrant’s Caldera','Burning Lands','🦖','Boss arena','Defeat the Volcano Tyrant'],
  ['Bonefield','Lost World','🦴','Fossil basin','Defeat 100 enemies'],
  ['Paths of Extinction','Lost World','🦖','Three-path defense','Use at least one support tower'],
  ['Ruins Before Time','Lost World','🏛️','Ancient ruins','Finish with all three resources above 25'],
  ['Worlds Collide','Lost World','🌀','All mechanics combined','Complete the map without village damage'],
  ['Throne of the Ancient King','Lost World','👑','Final boss arena','Defeat The Ancient King'],
];

export const stoneAgeMaps = MAPS.map(([name,region,icon,mechanic,bonusObjective],index)=>{
  const number=index+1;
  const highHealthObjective=number%2?'Village stays above 75%':'Take no village damage';
  return {
    id:`stone-${String(number).padStart(2,'0')}`,
    number,
    name,
    region,
    icon,
    mechanic,
    boss:number%5===0,
    bonusObjective,
    totems:['Complete the map',highHealthObjective,bonusObjective],
  };
});

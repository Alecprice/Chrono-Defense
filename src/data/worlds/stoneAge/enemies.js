const baseEnemies = [
 ['boar','Boar',55,45,0,5], ['wolf','Wolf',42,72,0,5], ['rival-scout','Rival Scout',70,58,.05,7],
 ['giant-beetle','Giant Beetle',110,35,.25,8], ['raptor','Raptor',82,82,.05,9], ['armored-tribesman','Armored Tribesman',160,38,.35,12],
 ['dire-wolf','Dire Wolf',125,78,.08,12], ['sabertooth','Sabertooth',185,62,.12,15], ['triceratops','Triceratops',420,30,.45,24],
 ['enemy-shaman','Enemy Shaman',135,46,.08,12], ['pterodactyl','Pterodactyl',120,75,.05,10], ['mammoth','Mammoth',650,24,.50,30],
 ['alpha-raptor','Alpha Raptor',260,88,.15,18], ['giant-snake','Giant Snake',290,52,.18,20], ['ankylosaurus','Ankylosaurus',780,22,.62,34],
 ['tribal-raider','Tribal Raider',260,67,.2,20], ['trex-juvenile','T-Rex Juvenile',900,34,.35,42], ['war-mammoth','War Mammoth',1200,23,.55,50],
 ['titan-beast','Titan Beast',1600,28,.48,60], ['elder-dinosaur','Elder Dinosaur',2200,30,.52,75]
];

const traits = {
  wolf:{tags:['pack']},
  'giant-beetle':{tags:['armored']},
  raptor:{tags:['pack','fast']},
  'armored-tribesman':{tags:['armored','tribe']},
  'dire-wolf':{tags:['pack']},
  sabertooth:{tags:['berserk'],berserkAt:.35,berserkSpeed:1.32},
  triceratops:{tags:['armored','siege']},
  'enemy-shaman':{tags:['tribe','healer'],ability:'heal',abilityEvery:3.2,healPercent:.08,healRadius:1.35},
  pterodactyl:{tags:['flying'],flying:true},
  mammoth:{tags:['armored','siege','unstoppable'],slowResistance:.55},
  'alpha-raptor':{tags:['pack','leader'],ability:'pack-haste',packHaste:1.18,packRadius:1.8},
  'giant-snake':{tags:['regeneration'],regenPercent:.012},
  ankylosaurus:{tags:['armored','siege','unstoppable'],slowResistance:.7},
  'tribal-raider':{tags:['tribe','fast']},
  'trex-juvenile':{tags:['siege','berserk'],berserkAt:.3,berserkSpeed:1.28},
  'war-mammoth':{tags:['armored','siege','unstoppable'],slowResistance:.72},
  'titan-beast':{tags:['siege','regeneration'],regenPercent:.01},
  'elder-dinosaur':{tags:['armored','siege','berserk'],berserkAt:.4,berserkSpeed:1.25}
};

export const stoneAgeEnemies = baseEnemies.map(([id,name,hp,speed,armor,villageDamage], index) => ({
  id,name,hp,speed,armor,villageDamage,tier:index+1,tags:[],...(traits[id]??{})
}));

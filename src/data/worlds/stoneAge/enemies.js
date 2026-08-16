export const stoneAgeEnemies = [
 ['boar','Boar',55,45,0,5], ['wolf','Wolf',42,72,0,5], ['rival-scout','Rival Scout',70,58,.05,7],
 ['giant-beetle','Giant Beetle',110,35,.25,8], ['raptor','Raptor',82,82,.05,9], ['armored-tribesman','Armored Tribesman',160,38,.35,12],
 ['dire-wolf','Dire Wolf',125,78,.08,12], ['sabertooth','Sabertooth',185,62,.12,15], ['triceratops','Triceratops',420,30,.45,24],
 ['enemy-shaman','Enemy Shaman',135,46,.08,12], ['pterodactyl','Pterodactyl',120,75,.05,10], ['mammoth','Mammoth',650,24,.50,30],
 ['alpha-raptor','Alpha Raptor',260,88,.15,18], ['giant-snake','Giant Snake',290,52,.18,20], ['ankylosaurus','Ankylosaurus',780,22,.62,34],
 ['tribal-raider','Tribal Raider',260,67,.2,20], ['trex-juvenile','T-Rex Juvenile',900,34,.35,42], ['war-mammoth','War Mammoth',1200,23,.55,50],
 ['titan-beast','Titan Beast',1600,28,.48,60], ['elder-dinosaur','Elder Dinosaur',2200,30,.52,75]
].map(([id,name,hp,speed,armor,villageDamage], index) => ({ id,name,hp,speed,armor,villageDamage,tier:index+1 }));

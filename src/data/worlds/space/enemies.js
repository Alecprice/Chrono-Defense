const raw=[
['scout-fighter','Scout Fighter',62,70,.02,8,'🚀'],['alien-drone','Alien Drone',75,62,.05,9,'🛸'],['asteroid','Asteroid',125,40,.28,14,'☄️'],['bio-ship','Bio Ship',145,48,.10,16,'🧬'],['shield-cruiser','Shield Cruiser',180,42,.22,18,'🛡️'],
['swarm-ship','Swarm Ship',95,88,.03,10,'🐝'],['stealth-ship','Stealth Ship',165,66,.12,18,'🌑'],['carrier','Carrier',320,34,.30,28,'🚢'],['parasite','Parasite',210,54,.14,22,'🦠'],['gravity-skimmer','Gravity Skimmer',260,58,.18,24,'🌀'],
['battlecruiser','Battlecruiser',480,30,.42,38,'🚀'],['comet-rider','Comet Rider',360,76,.20,32,'☄️'],['void-beast','Void Beast',620,28,.38,46,'👾'],['war-carrier','War Carrier',780,25,.48,58,'🛸'],['planet-cracker','Planet Cracker',980,23,.55,80,'💥'],
['dark-frigate','Dark Frigate',1150,31,.46,72,'🌑'],['hive-ship','Hive Ship',1350,27,.50,86,'🐝'],['star-eater','Star Eater',1650,28,.52,100,'⭐'],['dreadnought','Dreadnought',2100,22,.64,130,'🚢'],['omega-fleet','Omega Fleet',2800,30,.60,160,'☠️']
];
export const spaceEnemies=raw.map(([id,name,hp,speed,armor,colonyDamage,icon],i)=>({id,name,hp,speed,armor,colonyDamage,icon,tier:i+1,shield:id==='shield-cruiser'?100:0,stealth:id==='stealth-ship'||id==='dark-frigate',spawns:id==='carrier'||id==='war-carrier'||id==='hive-ship',regen:id==='bio-ship'||id==='void-beast',gravityResist:id==='gravity-skimmer'||id==='star-eater'}));

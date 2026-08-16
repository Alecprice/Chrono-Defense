const raw=[
['drone','Drone',65,58,.02,12,'🤖'],['runner','Runner',48,96,0,10,'🏃'],['tank','Tank',160,38,.30,20,'🧱'],['shield-unit','Shield Unit',145,48,.12,18,'🛡️'],['hacker','Hacker',135,54,.08,16,'💻'],
['cloaked-unit','Cloaked Unit',155,62,.10,18,'🥷'],['repair-bot','Repair Bot',190,42,.14,20,'🔧'],['emp-carrier','EMP Carrier',230,40,.20,24,'⚡'],['nanite-swarm','Nanite Swarm',90,92,.02,10,'🧬'],['assault-mech','Assault Mech',360,37,.38,32,'🤖'],
['phase-bike','Phase Bike',245,82,.12,22,'🏍️'],['siege-bot','Siege Bot',560,29,.44,45,'🦾'],['guardian','Guardian',680,27,.55,52,'🛡️'],['ai-proxy','AI Proxy',430,46,.28,38,'🧠'],['quantum-runner','Quantum Runner',360,92,.18,35,'✨'],
['war-machine','War Machine',980,25,.58,70,'⚙️'],['stealth-tank','Stealth Tank',820,34,.48,65,'🥷'],['core-breaker','Core Breaker',1280,28,.52,90,'💥'],['singularity-drone','Singularity Drone',1700,32,.45,110,'🌀'],['omega-unit','Omega Unit',2400,30,.62,140,'☠️']
];
export const futureEnemies=raw.map(([id,name,hp,speed,armor,coreDamage,icon],index)=>({id,name,hp,speed,armor,coreDamage,icon,tier:index+1,
 shield:id==='shield-unit'||id==='guardian'?Math.round(hp*.45):0,hacker:id==='hacker'||id==='ai-proxy',cloaked:id==='cloaked-unit'||id==='stealth-tank',healer:id==='repair-bot',emp:id==='emp-carrier',swarm:id==='nanite-swarm',phase:id==='phase-bike'||id==='quantum-runner'
}));

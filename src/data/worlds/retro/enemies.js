const raw=[
  ['bit','Bit',45,60,0,8,'🟩'],['speedster','Speedster',38,96,0,8,'💨'],['block','Block',105,42,.24,12,'🟥'],['ghost','Ghost',82,58,.05,10,'👻'],['splitter','Splitter',118,48,.08,14,'✂️'],
  ['virus','Virus',145,52,.10,16,'🦠'],['coin-thief','Coin Thief',130,72,.05,18,'💰'],['glitch','Glitch',165,64,.12,16,'👾'],['shield-byte','Shield Byte',245,44,.34,22,'🛡️'],['turbo-ghost','Turbo Ghost',180,86,.08,20,'👻'],
  ['memory-leak','Memory Leak',310,39,.18,28,'💾'],['packet-swarm','Packet Swarm',120,98,.02,12,'📦'],['firewall','Firewall',480,32,.52,38,'🔥'],['lag-beast','Lag Beast',520,28,.36,42,'🐌'],['boss-minion','Boss Minion',610,42,.40,48,'🎮'],
  ['corruptor','Corruptor',740,37,.32,55,'☣️'],['hyper-block','Hyper Block',980,26,.62,65,'🟥'],['arcade-tank','Arcade Tank',1320,23,.58,80,'🕹️'],['game-breaker','Game Breaker',1700,31,.46,95,'💥'],['final-byte','Final Byte',2300,34,.52,120,'☠️']
];
export const retroEnemies=raw.map(([id,name,hp,speed,armor,baseDamage,icon],index)=>({id,name,hp,speed,armor,baseDamage,icon,tier:index+1,
  phase:id.includes('ghost'),split:id==='splitter'?2:0,stealsCoins:id==='coin-thief',disrupt:id==='virus'||id==='corruptor',shield:id==='shield-byte'?90:0,erratic:id==='glitch',swarm:id==='packet-swarm'
}));

const A=(id,icon,name,description,test)=>({id,icon,name,description,test});
const world=(save,id)=>save.worlds?.[id]??{};
const done=(save,id)=>world(save,id).completedMap??0;
const mastery=(save,id)=>world(save,id).mastery??0;
const reward=(save,id,key)=>world(save,id)[key]??0;
const unlocked=(save,id)=>id==='stone-age'||Boolean(world(save,id).unlocked);

export const chronicleAchievements=[
 A('first-defense','🛡️','The First Defense','Complete your first Stone Age map.',s=>done(s,'stone-age')>=1),
 A('valley-secured','🌿','Valley Secured','Complete Stone Age map 5.',s=>done(s,'stone-age')>=5),
 A('jungle-master','🌴','Jungle Master','Complete Stone Age map 10.',s=>done(s,'stone-age')>=10),
 A('frozen-survivor','❄️','Frozen Survivor','Complete Stone Age map 15.',s=>done(s,'stone-age')>=15),
 A('volcano-walker','🌋','Volcano Walker','Complete Stone Age map 20.',s=>done(s,'stone-age')>=20),
 A('stone-age-complete','🦖','End of the Beginning','Complete Stone Age.',s=>done(s,'stone-age')>=25),
 A('stone-totem-15','🗿','Tribal Honors','Earn 15 Stone Age Totems.',s=>reward(s,'stone-age','totems')>=15),
 A('stone-totem-45','🗿','Great Tribe','Earn 45 Stone Age Totems.',s=>reward(s,'stone-age','totems')>=45),
 A('stone-totem-75','🏆','Perfect Prehistory','Earn all 75 Stone Age Totems.',s=>reward(s,'stone-age','totems')>=75),
 A('stone-mastery','🔥','Stone Age Master','Reach 100 Stone Age Mastery.',s=>mastery(s,'stone-age')>=100),

 A('retro-found','🕹️','Insert Coin','Unlock Retro Tower Defense.',s=>unlocked(s,'retro')),
 A('retro-5','📺','Arcade Regular','Clear five Retro cabinets.',s=>done(s,'retro')>=5),
 A('retro-10','💾','Neon Champion','Clear ten Retro cabinets.',s=>done(s,'retro')>=10),
 A('retro-15','👾','System Breaker','Clear fifteen Retro cabinets.',s=>done(s,'retro')>=15),
 A('retro-20','🏁','Tournament Finalist','Clear twenty Retro cabinets.',s=>done(s,'retro')>=20),
 A('retro-complete','🏆','High Score History','Complete Retro Tower Defense.',s=>done(s,'retro')>=25),
 A('retro-cart-25','📼','Cartridge Collector','Earn 25 Retro Cartridges.',s=>reward(s,'retro','cartridges')>=25),
 A('retro-cart-75','📼','Full Collection','Earn all 75 Retro Cartridges.',s=>reward(s,'retro','cartridges')>=75),
 A('retro-combo-10','🔥','Combo Starter','Reach a best Retro combo of 10.',s=>(world(s,'retro').bestCombo??1)>=10),
 A('retro-combo-40','⚡','Combo Legend','Reach a best Retro combo of 40.',s=>(world(s,'retro').bestCombo??1)>=40),
 A('retro-score-100k','🎯','Six Digits','Score at least 100,000 in Retro.',s=>(world(s,'retro').highScore??0)>=100000),
 A('retro-mastery','🌟','Arcade Master','Reach 100 Retro Mastery.',s=>mastery(s,'retro')>=100),

 A('future-found','🤖','Tomorrow Arrives','Unlock Future Tower Defense.',s=>unlocked(s,'future')),
 A('future-5','⚡','Grid Technician','Stabilize five Future sectors.',s=>done(s,'future')>=5),
 A('future-10','🌐','Network Architect','Stabilize ten Future sectors.',s=>done(s,'future')>=10),
 A('future-15','🧠','Machine Whisperer','Stabilize fifteen Future sectors.',s=>done(s,'future')>=15),
 A('future-20','🔷','AI Hunter','Stabilize twenty Future sectors.',s=>done(s,'future')>=20),
 A('future-complete','💠','Singularity Contained','Complete Future Tower Defense.',s=>done(s,'future')>=25),
 A('future-core-25','💠','Data Hoarder','Earn 25 Data Cores.',s=>reward(s,'future','dataCores')>=25),
 A('future-core-75','💎','Perfect Dataset','Earn all 75 Data Cores.',s=>reward(s,'future','dataCores')>=75),
 A('future-mastery','🧬','Future Master','Reach 100 Future Mastery.',s=>mastery(s,'future')>=100),

 A('space-found','🚀','Beyond Earth','Unlock Space Tower Defense.',s=>unlocked(s,'space')),
 A('space-5','🌎','Home System Secure','Secure five Space systems.',s=>done(s,'space')>=5),
 A('space-10','🪐','Frontier Guardian','Secure ten Space systems.',s=>done(s,'space')>=10),
 A('space-15','🌌','Deep Space Defender','Secure fifteen Space systems.',s=>done(s,'space')>=15),
 A('space-20','☄️','Fleet Commander','Secure twenty Space systems.',s=>done(s,'space')>=20),
 A('space-complete','🌠','Edge of Everything','Complete Space Tower Defense.',s=>done(s,'space')>=25),
 A('space-core-25','⭐','Star Collector','Earn 25 Star Cores.',s=>reward(s,'space','starCores')>=25),
 A('space-core-75','✨','Constellation Complete','Earn all 75 Star Cores.',s=>reward(s,'space','starCores')>=75),
 A('space-mastery','🛸','Space Master','Reach 100 Space Mastery.',s=>mastery(s,'space')>=100),

 A('rift-found','🌀','The Fracture Opens','Unlock the Time Rift.',s=>unlocked(s,'time-rift')),
 A('rift-3','⏳','Timeline Walker','Seal three Time Rift fractures.',s=>done(s,'time-rift')>=3),
 A('rift-6','🧭','Paradox Navigator','Seal six Time Rift fractures.',s=>done(s,'time-rift')>=6),
 A('rift-9','♾️','Reality Anchor','Seal nine Time Rift fractures.',s=>done(s,'time-rift')>=9),
 A('rift-complete','👑','Chronophage Defeated','Complete the Time Rift campaign.',s=>done(s,'time-rift')>=12),
 A('rift-shards-18','🔮','Shard Keeper','Earn 18 Rift Shards.',s=>reward(s,'time-rift','riftShards')>=18),
 A('rift-shards-36','💜','Perfect Timeline','Earn all 36 Rift Shards.',s=>reward(s,'time-rift','riftShards')>=36),
 A('rift-mastery','🌀','Rift Master','Reach 100 Time Rift Mastery.',s=>mastery(s,'time-rift')>=100),

 A('two-eras','⏱️','Two Ages','Complete two main eras.',s=>[done(s,'stone-age'),done(s,'retro'),done(s,'future'),done(s,'space')].filter(v=>v>=25).length>=2),
 A('three-eras','⌛','Three Ages','Complete three main eras.',s=>[done(s,'stone-age'),done(s,'retro'),done(s,'future'),done(s,'space')].filter(v=>v>=25).length>=3),
 A('four-eras','🕰️','Master of Ages','Complete all four main eras.',s=>['stone-age','retro','future','space'].every(id=>done(s,id)>=25)),
 A('all-maps','🌐','Chrono Defender','Complete all 112 campaign maps and fractures.',s=>done(s,'stone-age')+done(s,'retro')+done(s,'future')+done(s,'space')+done(s,'time-rift')>=112),
 A('all-mastery','🔥','Fivefold Mastery','Reach 100 Mastery in every timeline.',s=>['stone-age','retro','future','space','time-rift'].every(id=>mastery(s,id)>=100)),
 A('all-awards','🏆','Nothing Left Behind','Earn every campaign collectible.',s=>reward(s,'stone-age','totems')>=75&&reward(s,'retro','cartridges')>=75&&reward(s,'future','dataCores')>=75&&reward(s,'space','starCores')>=75&&reward(s,'time-rift','riftShards')>=36),
 A('timeline-perfect','♾️','Timeline Perfect','Complete every map, every collectible, and every mastery track.',s=>done(s,'stone-age')+done(s,'retro')+done(s,'future')+done(s,'space')+done(s,'time-rift')>=112&&['stone-age','retro','future','space','time-rift'].every(id=>mastery(s,id)>=100)&&reward(s,'stone-age','totems')>=75&&reward(s,'retro','cartridges')>=75&&reward(s,'future','dataCores')>=75&&reward(s,'space','starCores')>=75&&reward(s,'time-rift','riftShards')>=36)
];

export function unlockedChronicleAchievements(save){return chronicleAchievements.filter(item=>{try{return Boolean(item.test(save))}catch{return false}})}
export function chronoRank(save){const maps=(done(save,'stone-age')+done(save,'retro')+done(save,'future')+done(save,'space')+done(save,'time-rift'))/112;const master=['stone-age','retro','future','space','time-rift'].reduce((n,id)=>n+mastery(save,id),0)/500;const awards=(reward(save,'stone-age','totems')+reward(save,'retro','cartridges')+reward(save,'future','dataCores')+reward(save,'space','starCores')+reward(save,'time-rift','riftShards'))/336;const score=Math.round((maps*.5+master*.25+awards*.25)*100);const title=score>=100?'Chrono Sovereign':score>=85?'Timeline Guardian':score>=65?'Era Commander':score>=45?'Rift Veteran':score>=25?'Time Scout':'Village Defender';return{score,title}}

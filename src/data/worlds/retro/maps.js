const maps=[
 ['Boot Sequence','Tutorial lanes and bonus coin pads.','Insert Coin'],['Pixel Plains','Two clean lanes introduce combo pressure.','No Miss'],['CRT Crossing','Screen-warp tiles alter enemy speed.','Perfect Picture'],['High Score Highway','Long route rewards aggressive builds.','Combo x10'],['Champion Cabinet','First boss arena.','Beat The High Score'],
 ['Neon Alley','Tight corners create splash opportunities.','Neon Sweep'],['Ghost Channel','Phasing enemies enter the game.','Ghost Hunter'],['Coin-Op Canyon','Coin Thieves target your wallet.','Protect The Bank'],['Glitch Garden','Erratic movement disrupts targeting.','Stable Signal'],['Continue?','Second boss arena.','Defy Game Over'],
 ['Memory Maze','Long twisting route with splitters.','No Leaks'],['Packet Panic','Dense swarms punish slow towers.','Packet Perfect'],['Firewall Fortress','Heavy armor dominates waves.','Armor Breaker'],['Lag City','Slow giants mix with speedsters.','Zero Lag'],['Bad Cartridge','Third boss arena.','Clean The Cartridge'],
 ['Turbo Tunnel','Extreme speed lanes reward control.','Speedrunner'],['Virus Vault','Tower disruption becomes constant.','Antivirus'],['Bonus Stage','High rewards with dangerous elite waves.','Jackpot'],['Boss Rush Boulevard','Mini-boss pressure before wave ten.','Boss Breaker'],['Arcade Throne','Fourth boss arena.','Topple The Overlord'],
 ['Corruption Core','Every enemy family can appear.','Clean Run'],['Infinite Loop','Repeated bends create control puzzles.','Break The Loop'],['Final Continue','Very limited build space.','One Credit'],['Last Cabinet','Endgame elite gauntlet.','No Continue'],['Game Master','Retro final boss arena.','Finish The Game']
];
const zones=[['Starter Arcade','🟩'],['Neon District','🌃'],['System Core','💾'],['Championship','🏆'],['Final Cabinet','👑']];
export const retroMaps=maps.map(([name,mechanic,bonusObjective],index)=>{
 const number=index+1;const [zone,icon]=zones[Math.floor(index/5)];
 return{id:`retro-${String(number).padStart(2,'0')}`,number,name,zone,icon,mechanic,bonusObjective,boss:number%5===0,
 cartridges:['Complete the map',number%2?'Finish with at least 2 lives':'Reach combo x12',bonusObjective]};
});

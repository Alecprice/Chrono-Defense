export const stoneAgeBosses = [
  { map:5, id:'alpha-sabertooth', name:'Alpha Sabertooth', hp:1800, speed:68, armor:.14, villageDamage:50, mechanic:'Howl periodically accelerates nearby beasts.', ability:'howl', abilityEvery:4.5, auraSpeed:1.28, auraRadius:2.2, tags:['boss','beast','berserk'], berserkAt:.25, berserkSpeed:1.35 },
  { map:10, id:'raptor-queen', name:'Raptor Queen', hp:4200, speed:48, armor:.2, villageDamage:60, mechanic:'Spawns raptor packs while moving.', ability:'spawn-raptors', abilityEvery:5.5, spawnCount:3, tags:['boss','raptor','summoner'] },
  { map:15, id:'great-mammoth', name:'Great Mammoth', hp:9000, speed:20, armor:.6, villageDamage:85, mechanic:'Crushes traps and resists control effects.', ability:'crush-traps', abilityEvery:6, slowResistance:.82, tags:['boss','armored','unstoppable','siege'] },
  { map:20, id:'volcano-tyrant', name:'Volcano Tyrant', hp:14500, speed:29, armor:.45, villageDamage:100, mechanic:'Triggers lava hazards and resists burn damage.', ability:'eruption', abilityEvery:5, fireResistance:.7, tags:['boss','fire','siege'] },
  { map:25, id:'ancient-king', name:'The Ancient King', hp:26000, speed:31, armor:.5, villageDamage:150, mechanic:'Multi-phase final boss; enters Berserk below 35% HP.', ability:'ancient-roar', abilityEvery:4.2, tags:['boss','armored','berserk','siege'], berserkAt:.35, berserkSpeed:1.5, phaseTwoArmor:.62 }
];

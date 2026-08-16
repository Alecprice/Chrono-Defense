const patterns = [
  [6,7,8,9,10,11,17,23,29,35,41,47,46,45,44,43,42],
  [48,49,50,51,52,53,41,29,17,5,6,7,8,9,10,11],
  [0,1,2,3,15,27,39,51,52,53,54,55,43,31,19,7,8,9,10,11],
  [12,13,14,15,16,17,18,19,20,21,22,23,35,47,46,45,44,43,42,41,40,39,38,37,36],
  [59,58,57,56,44,32,20,8,9,10,11,23,35,47,46,45,33,21,22]
];

const nodeSets = [
  { wood:[2,14], stone:[31], food:[54] },
  { wood:[3,16], stone:[34,55], food:[25] },
  { wood:[13,36], stone:[58], food:[24,48] },
  { wood:[1], stone:[28,52], food:[10,57] },
  { wood:[4,49], stone:[30,54], food:[15] }
];

export function getStoneAgeLayout(mapNumber=1){
  const region = Math.max(0, Math.min(4, Math.floor((mapNumber-1)/5)));
  const variant = (mapNumber-1)%5;
  const base = patterns[(region + variant) % patterns.length];
  const resourceNodes = nodeSets[(region*2 + variant) % nodeSets.length];
  return { path:[...base], resourceNodes };
}

export function cellCenter(cell){
  const col = cell % 12;
  const row = Math.floor(cell / 12);
  return { x: (col + .5) * 100, y: (row + .5) * 100 };
}

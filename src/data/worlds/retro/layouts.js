const patterns=[
 [48,49,50,38,26,14,2,3,4,5,17,29,41,42,43,44,32,20,8,9,10,11],
 [0,1,2,14,26,38,50,51,52,40,28,16,4,5,6,18,30,42,54,55,56,57,45,33,21,9,10,11],
 [12,13,14,15,27,39,51,52,53,41,29,17,5,6,7,19,31,43,44,45,33,21,22,23],
 [59,58,57,45,33,21,9,8,7,19,31,43,42,41,29,17,5,4,3,15,27,39,51,50,49,48],
 [6,7,8,20,32,44,56,55,54,42,30,18,19,20,21,22,34,46,47,35,23,11]
];
const bonusSets=[[1,13,25,37],[4,16,28,40],[10,22,34,46],[2,26,50],[15,39,52]];
export function getRetroLayout(mapNumber=1){
 const zone=Math.max(0,Math.min(4,Math.floor((mapNumber-1)/5)));const variant=(mapNumber-1)%5;
 const path=patterns[(zone+variant)%patterns.length];
 return{path:[...path],bonusPads:bonusSets[(zone*2+variant)%bonusSets.length].filter(cell=>!path.includes(cell))};
}
export function retroCellCenter(cell){const col=cell%12,row=Math.floor(cell/12);return{x:(col+.5)*100,y:(row+.5)*100};}

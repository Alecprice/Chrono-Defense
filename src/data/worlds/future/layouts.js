const patterns=[
[48,49,50,51,39,27,15,3,4,5,6,18,30,42,43,44,45,46,47],[0,1,2,14,26,38,50,51,52,40,28,16,4,5,6,7,19,31,43,55,56,57,45,33,21,9,10,11],[59,58,57,45,33,21,9,8,7,19,31,43,42,41,29,17,5,4,3,15,27,39,51,50,49,48],[12,13,14,15,16,28,40,52,53,54,42,30,18,6,7,8,20,32,44,45,46,34,22,10,11],[6,18,30,42,54,55,43,31,19,7,8,9,21,33,45,46,47,35,23,11]
];
const powerNodes=[[1,13,25,37],[4,16,28,52],[10,22,34,46],[2,26,50,58],[15,39,53]];
export function getFutureLayout(mapNumber=1){const sector=Math.max(0,Math.min(4,Math.floor((mapNumber-1)/5))),variant=(mapNumber-1)%5,path=patterns[(sector+variant)%patterns.length];return{path:[...path],powerNodes:powerNodes[(sector*2+variant)%powerNodes.length].filter(cell=>!path.includes(cell))};}
export function futureCellCenter(cell){const col=cell%12,row=Math.floor(cell/12);return{x:(col+.5)*100,y:(row+.5)*100};}

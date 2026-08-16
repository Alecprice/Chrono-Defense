const patterns=[
[48,49,50,38,26,14,2,3,4,16,28,40,52,53,54,42,30,18,6,7,8,20,32,44,45,46,47],[0,1,13,25,37,49,50,51,39,27,15,3,4,5,17,29,41,53,54,55,43,31,19,7,8,9,10,11],[59,58,46,34,22,10,9,8,20,32,44,56,55,54,42,30,18,6,5,4,16,28,40,52,51,50,49,48],[12,13,14,26,38,50,51,52,40,28,16,4,5,6,18,30,42,54,55,43,31,19,7,8,9,21,33,45,46,47],[6,18,30,42,54,55,43,31,19,7,8,20,32,44,56,57,45,33,21,9,10,22,34,46,47]
];
const anomalies=[[1,13,25],[4,28,52],[10,34,58],[2,26,50],[15,39,53]];
export function getSpaceLayout(mapNumber=1){const region=Math.max(0,Math.min(4,Math.floor((mapNumber-1)/5))),variant=(mapNumber-1)%5,path=patterns[(region+variant)%patterns.length];return{path:[...path],anomalies:anomalies[(region*2+variant)%anomalies.length].filter(cell=>!path.includes(cell))};}
export function spaceCellCenter(cell){const col=cell%12,row=Math.floor(cell/12);return{x:(col+.5)*100,y:(row+.5)*100};}

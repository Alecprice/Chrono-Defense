const patterns=[
[48,49,50,38,26,14,2,3,4,16,28,40,52,53,54,42,30,18,6,7,8,20,32,44,45,46,47],[0,1,13,25,37,49,50,51,39,27,15,3,4,5,17,29,41,53,54,55,43,31,19,7,8,9,10,11],[59,58,46,34,22,10,9,8,20,32,44,56,55,54,42,30,18,6,5,4,16,28,40,52,51,50,49,48],[12,13,14,26,38,50,51,52,40,28,16,4,5,6,18,30,42,54,55,43,31,19,7,8,9,21,33,45,46,47],[6,18,30,42,54,55,43,31,19,7,8,20,32,44,56,57,45,33,21,9,10,22,34,46,47]
];
const anomalies=[[1,13,25],[4,28,52],[10,34,58],[2,26,50],[15,39,53]];
const routeChoices=[[0,5],[1,3],[2,1],[3,7],[4,5],[1,1],[2,7],[3,5],[4,3],[0,1],[2,5],[3,3],[4,1],[0,7],[1,5],[3,1],[4,7],[0,6],[1,7],[2,3],[4,6],[0,3],[3,6],[3,2],[3,0]];
function h(cell){const r=Math.floor(cell/12),c=cell%12;return r*12+(11-c)}function v(cell){const r=Math.floor(cell/12),c=cell%12;return(4-r)*12+c}function tx(cells,mode){let out=[...cells];if(mode&1)out=out.map(h);if(mode&2)out=out.map(v);if(mode&4)out.reverse();return out}
export function getSpaceLayout(mapNumber=1){const n=Math.max(1,Math.min(25,mapNumber)),region=Math.floor((n-1)/5),variant=(n-1)%5,[baseIndex,mode]=routeChoices[n-1],path=tx(patterns[baseIndex],mode),used=new Set(path),anomalyCells=tx(anomalies[(region*2+variant)%anomalies.length],mode).filter(cell=>!used.has(cell));return{path,anomalies:anomalyCells,layoutId:`space-layout-${n}`}}
export function spaceCellCenter(cell){const col=cell%12,row=Math.floor(cell/12);return{x:(col+.5)*100,y:(row+.5)*100}}

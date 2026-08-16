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
function h(cell){const r=Math.floor(cell/12),c=cell%12;return r*12+(11-c)}
function v(cell){const r=Math.floor(cell/12),c=cell%12;return(4-r)*12+c}
function transformCells(cells,mode){let out=[...cells];if(mode&1)out=out.map(h);if(mode&2)out=out.map(v);if(mode&4)out.reverse();return out}
function transformedNodes(nodes,mode,path){const used=new Set(path),mapCells=cells=>transformCells(cells,mode).filter(cell=>!used.has(cell));return{wood:mapCells(nodes.wood),stone:mapCells(nodes.stone),food:mapCells(nodes.food)}}
export function getStoneAgeLayout(mapNumber=1){const n=Math.max(1,Math.min(25,mapNumber)),region=Math.floor((n-1)/5),variant=(n-1)%5,base=patterns[(region+variant)%patterns.length],mode=(n*5+region*3+variant)%8,path=transformCells(base,mode),nodes=nodeSets[(region*2+variant)%nodeSets.length];return{path,resourceNodes:transformedNodes(nodes,mode,path),layoutId:`stone-layout-${n}`}}
export function cellCenter(cell){const col=cell%12,row=Math.floor(cell/12);return{x:(col+.5)*100,y:(row+.5)*100}}

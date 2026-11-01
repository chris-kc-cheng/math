// A baby's squeaky toy hammer, tilted so its head lands on the mole. The red head is a stack of nine soft rubber ribs
// (like a squeaker bellows) that squashes along its length when it hits; the handle is fat and yellow. No face.
const ribs=Array.from({length:9},(_,i)=>{
 const width=34,step=(176-width)/8,height=96-Math.abs(i-4)*5,x=12+i*step,y=58-height/2;
 return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width}" height="${height}" rx="17" fill="url(#toy-red)" stroke="#8a1410" stroke-width="4"/>`
  +`<path d="M${(x+9).toFixed(2)} ${(y+12).toFixed(2)} Q${(x+17).toFixed(2)} ${(y+5).toFixed(2)} ${(x+25).toFixed(2)} ${(y+12).toFixed(2)}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;
}).join('');
const SVG=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" focusable="false">
<defs>
<linearGradient id="toy-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a5f"/><stop offset="1" stop-color="#d9261c"/></linearGradient>
<linearGradient id="toy-yellow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe45c"/><stop offset=".55" stop-color="#ffd21f"/><stop offset="1" stop-color="#f0b800"/></linearGradient>
</defs>
<g transform="translate(150 150) rotate(210) translate(-100 -125)">
<g class="toy-handle">
<rect x="80" y="92" width="40" height="140" rx="18" fill="url(#toy-yellow)" stroke="#b88700" stroke-width="4"/>
<rect x="80" y="152" width="40" height="9" fill="#f0a800" opacity=".5"/>
<rect x="80" y="176" width="40" height="9" fill="#f0a800" opacity=".5"/>
<ellipse cx="100" cy="232" rx="28" ry="15" fill="#ffd21f" stroke="#b88700" stroke-width="4"/>
<rect x="89" y="102" width="8" height="42" rx="4" fill="#fff7b0" opacity=".8"/>
</g>
<g class="toy-head">${ribs}</g>
</g>
</svg>`;
export function toyHammer(){
 const node=document.createElement('span');node.className='mole-hammer';node.setAttribute('aria-hidden','true');
 node.innerHTML=SVG;
 return node;
}

// Where the top of each mole's head is in its sprite (fractions of the picture, measured from the artwork), so the hammer can just touch the forehead.
const FOREHEAD=[[0.5,0.236],[0.487,0.206],[0.499,0.201],[0.497,0.252],[0.5,0.189]];
const SIZE=210,CONTACT=[0.545*SIZE,0.925*SIZE],OVERLAP=5,SETTLE=2;
// Puts the hammer's lowest head corner on the forehead of the mole in `button` (the mole index is its sprite number minus one), so the head
// just touches the top of the mole's head and stays clear of its face. The hammer ends with a 2px settle after its swing.
export function placeHammer(button,hammer,index){
 const sprite=button.querySelector('.mole-sprite');if(!sprite||!sprite.offsetWidth)return;
 const [fx,fy]=FOREHEAD[index]||FOREHEAD[0];
 const x=sprite.offsetLeft+fx*sprite.offsetWidth,y=sprite.offsetTop+fy*sprite.offsetHeight;
 hammer.style.left=`${Math.round(x-CONTACT[0])}px`;hammer.style.top=`${Math.round(y+OVERLAP-SETTLE-CONTACT[1])}px`;
}

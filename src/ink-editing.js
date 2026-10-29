const pointDistance=(p,a,b)=>{
 const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;
 const t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;
 return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
};
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function segmentDistance(a,b,c,d){
 const abC=cross(a,b,c),abD=cross(a,b,d),cdA=cross(c,d,a),cdB=cross(c,d,b);
 if(abC*abD<0&&cdA*cdB<0)return 0;
 return Math.min(pointDistance(a,c,d),pointDistance(b,c,d),pointDistance(c,a,b),pointDistance(d,a,b));
}
export function strokeTouchesEraser(stroke,from,to,radius){
 const points=stroke.points;
 if(points.length===1)return pointDistance(points[0],from,to)<=radius;
 return points.some((p,i)=>i>0&&segmentDistance(points[i-1],p,from,to)<=radius+(stroke.lineWidth||3)/2);
}

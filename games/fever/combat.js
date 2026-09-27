// Distance to the whole swipe segment, so fast events cannot tunnel through a target.
export function segmentDistance(x,z,ax,az,bx,bz){
  const dx=bx-ax,dz=bz-az,length=dx*dx+dz*dz;
  const t=length?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/length)):0;
  return Math.hypot(x-ax-t*dx,z-az-t*dz);
}
export function nextCombo(previous,last,now,windowMs=1100){return now-last<=windowMs?Math.min(8,previous+1):1;}

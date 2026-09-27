import * as THREE from 'three';

// Original deterministic texture work. No remote assets or texture licensing dependencies.
export function surface(kind, size = 256) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d'), data = ctx.createImageData(size, size);
  let seed = 7491;
  const rand = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4, n = rand();
    const ridge = Math.pow(Math.abs(Math.sin(y / size * Math.PI * 12)), 12);
    const stain = Math.sin(x * .041) * Math.sin(y * .063) * 15;
    const base = kind === 'peel' ? [214, 177, 28] : kind === 'shell' ? [99, 43, 22] : [145, 147, 137];
    const detail = kind === 'shell' ? ridge * 28 : stain;
    const pore = n > .985 ? .35 : .85 + n * .22;
    for (let c = 0; c < 3; c++) data.data[i + c] = Math.max(0, (base[c] + detail) * pore);
    data.data[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  if (kind === 'peel') {
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = `rgba(65,35,12,${.1 + rand() * .5})`;
      ctx.beginPath(); ctx.ellipse(rand()*size,rand()*size,.3+rand()*2,.4+rand()*4,rand()*3,0,Math.PI*2);ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const bump = texture.clone(); bump.colorSpace = THREE.NoColorSpace; bump.needsUpdate = true;
  return { map: texture, bumpMap: bump };
}

export function createBanana() {
  const group = new THREE.Group();
  const material = new THREE.MeshPhysicalMaterial({ color: '#fff3a1', ...surface('peel',512), roughness:.49, envMapIntensity:.3, bumpScale:.017, clearcoat:.14, clearcoatRoughness:.4 });
  // Tapered, five-ridged peel with a curved centreline; UVs follow the fruit.
  const vertices=[], uv=[], indices=[], rings=64, sides=24;
  for(let i=0;i<=rings;i++) {
    const t=i/rings, x=(t-.5)*1.85, y=.13+Math.sin(t*Math.PI)*.36;
    const radius=.025+.185*Math.pow(Math.sin(t*Math.PI),.65);
    for(let j=0;j<=sides;j++) {
      const a=j/sides*Math.PI*2, r=radius*(1+.065*Math.cos(a*5));
      vertices.push(x,y+Math.cos(a)*r,Math.sin(a)*r);
      uv.push(t,j/sides);
      if(i<rings&&j<sides) {const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
    }
  }
  const geometry=new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const fruit=new THREE.Mesh(geometry,material);fruit.castShadow=fruit.receiveShadow=true;group.add(fruit);
  const stemMat=new THREE.MeshStandardMaterial({color:'#48391c',roughness:.87});
  for(const side of [-1,1]) {const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.045,side<0?.23:.08,10),stemMat);stem.position.set(side*.95,.18,0);stem.rotation.z=-side*.65;stem.castShadow=true;group.add(stem);}
  return group;
}

export function createSplatter(scene,dream) {
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle='#fff';ctx.beginPath();
  for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,r=22+8*Math.sin(i*2.7)+5*Math.cos(i*5.9);const x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.fill();
  for(let i=0;i<27;i++){const a=i*2.399,r=32+(i%5)*5;ctx.beginPath();ctx.ellipse(64+Math.cos(a)*r,64+Math.sin(a)*r,1+i%3,2+i%4,a,0,Math.PI*2);ctx.fill();}
  const map=new THREE.CanvasTexture(c), geometry=new THREE.PlaneGeometry(1.7,1.7,8,8);
  const pool=Array.from({length:40},()=>{const material=new THREE.MeshStandardMaterial({color:'#780b27',map,transparent:true,opacity:.9,depthWrite:false,roughness:.22,polygonOffset:true,polygonOffsetFactor:-2});const mesh=new THREE.Mesh(geometry,material);mesh.rotation.x=-Math.PI/2;mesh.visible=false;mesh.receiveShadow=true;scene.add(mesh);dream?.attach(mesh);return mesh;});
  let cursor=0;
  return { add(x,z,green=false){const m=pool[cursor++%pool.length];m.visible=true;m.position.set(x,.026+(cursor%4)*.0004,z);m.rotation.z=cursor*2.399;m.material.color.set(green?'#b2cf18':'#a00b32');m.scale.setScalar(.75+(cursor%5)*.09);},clear(){pool.forEach(m=>m.visible=false);cursor=0;},get count(){return Math.min(cursor,pool.length);} };
}

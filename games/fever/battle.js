import * as THREE from 'three';
const WALL = { x: 2.9, z: 3.15 };
export function createBattle(scene) {
  const bulletGeo = new THREE.SphereGeometry(.035, 6, 6);
  const tracerGeo = new THREE.CylinderGeometry(.012, .006, 1, 5);
  tracerGeo.rotateX(Math.PI / 2);
  const flashGeo = new THREE.SphereGeometry(.08, 8, 6);
  const slashGeo = new THREE.PlaneGeometry(.9, .08);
  const sparkGeo = new THREE.OctahedronGeometry(.03, 0);
  const bulletMat = new THREE.MeshStandardMaterial({ color: '#ffe27a', emissive: '#ffbf3b', emissiveIntensity: 2.4, roughness: .2, metalness: .4 });
  const hotMat = new THREE.MeshBasicMaterial({ color: '#fff1a8' });
  const flashMat = new THREE.MeshBasicMaterial({ color: '#fff4c4', transparent: true, opacity: .9 });
  const slashMat = new THREE.MeshBasicMaterial({ color: '#f4fff0', transparent: true, opacity: .85, side: THREE.DoubleSide, depthWrite: false });
  const sparkMat = new THREE.MeshBasicMaterial({ color: '#ffd36a' });
  const trailMat = new THREE.LineBasicMaterial({ color: '#f7ffe8', transparent: true, opacity: .82 });
  function pool(n, geo, mat, cloneMat=false) {
    return Array.from({length:n}, () => {
      const mesh = new THREE.Mesh(geo, cloneMat ? mat.clone() : mat);
      mesh.visible = false; mesh.castShadow = false; mesh.userData.fx = true; scene.add(mesh);
      return { mesh, life: 0, vx:0, vy:0, vz:0 };
    });
  }
  const bullets = Array.from({length:20}, () => {
    const mesh = new THREE.Mesh(bulletGeo, bulletMat);
    const tracer = new THREE.Mesh(tracerGeo, hotMat);
    mesh.visible = tracer.visible = false; mesh.castShadow = false;
    mesh.userData.fx = tracer.userData.fx = true;
    scene.add(mesh); scene.add(tracer);
    return { mesh, tracer, life:0, x:0, y:0, z:0, vx:0, vy:0, vz:0, damage:.72, bounced:0 };
  });
  const flashes = pool(3, flashGeo, flashMat, true);
  const slashes = pool(8, slashGeo, slashMat, true);
  const sparks = pool(24, sparkGeo, sparkMat);
  const trailMax = 22;
  const trailPositions = new Float32Array(trailMax * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeo.setDrawRange(0, 0);
  const trail = new THREE.Line(trailGeo, trailMat);
  trail.frustumCulled = false; trail.userData.fx = true; scene.add(trail);
  const trailPts = [];
  function take(list) { return list.find(p => p.life <= 0) || list[0]; }
  function sparkBurst(x, y, z, count = 6) {
    let n = 0;
    for (const s of sparks) {
      if (s.life > 0) continue;
      s.life = .18 + Math.random() * .16; s.mesh.visible = true; s.mesh.position.set(x, y, z);
      s.vx = (Math.random()-.5)*4; s.vy = 1+Math.random()*3; s.vz = (Math.random()-.5)*4;
      if (++n >= count) break;
    }
  }
  return {
    slash(x, z, angle) {
      const s = take(slashes); s.life = .18; s.mesh.visible = true;
      s.mesh.position.set(x, .18, z); s.mesh.rotation.set(-.4, angle, Math.random()*.4);
      s.mesh.scale.set(1.1+Math.random()*.4, 1, 1); s.mesh.material.opacity = .95;
    },
    trailPush(x, z) {
      trailPts.push(x, .07, z);
      if (trailPts.length > trailMax*3) trailPts.splice(0, trailPts.length - trailMax*3);
      trailPositions.fill(0);
      for (let i=0;i<trailPts.length;i++) trailPositions[i]=trailPts[i];
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.setDrawRange(0, trailPts.length/3); trailMat.opacity = .88;
    },
    trailClear() { trailPts.length = 0; trailGeo.setDrawRange(0, 0); },
    muzzle(x, y, z) {
      const f = take(flashes); f.life = .06; f.mesh.visible = true; f.mesh.position.set(x,y,z); f.mesh.scale.setScalar(1);
    },
    fire(x, y, z, tx, ty, tz, damage, spread = .04) {
      const b = take(bullets);
      const dx = tx-x, dy=ty-y, dz=tz-z, dist=Math.hypot(dx,dy,dz)||1, speed=16+Math.random()*3;
      b.life=1.15; b.bounced=0; b.damage=damage; b.x=x; b.y=y; b.z=z;
      b.vx=dx/dist*speed+(Math.random()-.5)*spread*8;
      b.vy=dy/dist*speed+.15;
      b.vz=dz/dist*speed+(Math.random()-.5)*spread*8;
      b.mesh.visible=b.tracer.visible=true; this.muzzle(x,y,z); sparkBurst(x,y,z,3);
    },
    step(dt, roaches, onHit, onRicochet) {
      for (const s of slashes) { if(s.life<=0) continue; s.life-=dt; s.mesh.material.opacity=Math.max(0,s.life*5); s.mesh.scale.x+=dt*6; if(s.life<=0)s.mesh.visible=false; }
      for (const f of flashes) { if(f.life<=0) continue; f.life-=dt; f.mesh.scale.setScalar(1+(1-f.life/.06)*1.8); f.mesh.material.opacity=Math.max(0,f.life/.06); if(f.life<=0)f.mesh.visible=false; }
      for (const s of sparks) {
        if(s.life<=0) continue; s.life-=dt; s.vy-=14*dt;
        s.mesh.position.x+=s.vx*dt; s.mesh.position.y+=s.vy*dt; s.mesh.position.z+=s.vz*dt;
        if(s.mesh.position.y<.03){s.mesh.position.y=.03;s.vy=Math.abs(s.vy)*.28;s.vx*=.6;s.vz*=.6;}
        s.mesh.scale.setScalar(Math.max(.2,s.life*4)); if(s.life<=0)s.mesh.visible=false;
      }
      if (trailPts.length) { trailMat.opacity=Math.max(0,trailMat.opacity-dt*2.4); if(trailMat.opacity<=0) this.trailClear(); }
      for (const b of bullets) {
        if (b.life<=0) continue;
        b.life-=dt; b.vy-=4.2*dt;
        const nx=b.x+b.vx*dt, ny=b.y+b.vy*dt, nz=b.z+b.vz*dt;
        let hit=false;
        for (const r of roaches) {
          if(!r.active||r.dying) continue;
          const radius=r.green?.42:.36;
          if (Math.hypot(nx-r.x,nz-r.z)<radius && ny<.42) {
            const incoming=new THREE.Vector3(b.vx,b.vy,b.vz);
            const normal=new THREE.Vector3(nx-r.x,Math.max(.05,ny-.12),nz-r.z).normalize();
            const speed=incoming.length();
            const glancing=incoming.clone().normalize().dot(normal)>-.42 || (r.green && b.bounced<2 && Math.random()<.38);
            if (glancing && b.bounced<3 && speed>4) {
              incoming.reflect(normal).multiplyScalar(.62);
              b.vx=incoming.x; b.vy=Math.abs(incoming.y)*.55+.4; b.vz=incoming.z;
              b.bounced++; b.damage*=.55; b.life=Math.min(b.life,.35);
              sparkBurst(nx,ny,nz,8); onRicochet?.(nx,nz,r);
            } else { sparkBurst(nx,Math.max(.12,ny),nz,10); onHit?.(r,b.damage,nx,nz); b.life=0; hit=true; }
            break;
          }
        }
        if (!hit) {
          if (ny<.05) { b.y=.05; b.vy=Math.abs(b.vy)*.34; b.vx*=.72; b.vz*=.72; b.bounced++; sparkBurst(nx,.06,nz,3); if(b.bounced>3||Math.hypot(b.vx,b.vy,b.vz)<2.2) b.life=0; }
          else b.y=ny;
          if (Math.abs(nx)>WALL.x) { b.vx*=-.55; b.x=Math.sign(nx)*WALL.x; b.bounced++; onRicochet?.(nx,nz); sparkBurst(b.x,b.y,nz,4); }
          else b.x=nx;
          if (Math.abs(nz)>WALL.z) { b.vz*=-.55; b.z=Math.sign(nz)*WALL.z; b.bounced++; onRicochet?.(nx,nz); sparkBurst(nx,b.y,b.z,4); }
          else b.z=nz;
        }
        if (b.life<=0) { b.mesh.visible=b.tracer.visible=false; continue; }
        b.mesh.position.set(b.x,b.y,b.z);
        const spd=Math.hypot(b.vx,b.vy,b.vz)||1;
        b.tracer.position.set(b.x-b.vx/spd*.18,b.y-b.vy/spd*.18,b.z-b.vz/spd*.18);
        b.tracer.lookAt(b.x+b.vx,b.y+b.vy,b.z+b.vz);
        b.tracer.scale.set(1,1,.28+Math.min(1.4,spd*.05));
      }
    },
    reset() {
      for (const b of bullets) { b.life=0; b.mesh.visible=b.tracer.visible=false; }
      for (const s of slashes) { s.life=0; s.mesh.visible=false; }
      for (const f of flashes) { f.life=0; f.mesh.visible=false; }
      for (const s of sparks) { s.life=0; s.mesh.visible=false; }
      this.trailClear();
    },
    get liveBullets() { return bullets.filter(b => b.life>0).length; }
  };
}
export function createKillCam(camera) {
  const look=new THREE.Vector3(), target=new THREE.Vector3(), home=new THREE.Vector3();
  let time=0, duration=0, active=false;
  const ease=t=>t*t*(3-2*t);
  return {
    trigger(x,z,homePos,length=.82){ if(active&&time<duration*.45)return false; home.copy(homePos); target.set(x,.16,z); time=0; duration=length; active=true; return true; },
    cancel(){ active=false; time=0; },
    update(dt,homePos,lookDefault,blocked){
      home.copy(homePos);
      if(!active) return false;
      if(blocked){ active=false; camera.position.copy(home); camera.lookAt(lookDefault); return false; }
      time+=dt;
      const u=Math.min(1,time/duration);
      const punch=u<.22?ease(u/.22):u>.62?1-ease((u-.62)/.38):1;
      const side=target.x>=0?1:-1;
      camera.position.set(target.x+side*(.55+punch*.35),.42+punch*.28,target.z+1.05-punch*.35);
      look.set(target.x,.12+punch*.08,target.z); camera.lookAt(look);
      if(u>=1){ active=false; camera.position.copy(home); camera.lookAt(lookDefault); return false; }
      return true;
    },
    get active(){ return active; }, get time(){ return time; }
  };
}

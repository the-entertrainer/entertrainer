import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createVolumetricPipeline } from './volumetric.js';

// Fever Dream: one-finger kitchen defence. Fixed-step simulation; local assets only.
const $ = (s) => document.querySelector(s);
const canvas = $('#world');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
} catch {
  $('#loading').innerHTML = '<h2>This kitchen needs WebGL.</h2><p>Enable hardware acceleration or try a current browser.</p><button onclick="location.reload()">Try again</button>';
  throw new Error('WebGL unavailable');
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#191b20');
scene.fog = new THREE.Fog('#191b20', 22, 44);
const camera = new THREE.PerspectiveCamera(44, 1, .1, 65);
scene.add(new THREE.HemisphereLight('#fff1d4', '#24332e', .75));
const sun = new THREE.DirectionalLight('#ffe2a8', 3.1);
sun.position.set(-4, 7, -6); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 20 });
sun.shadow.normalBias = .04; scene.add(sun);
const rim = new THREE.DirectionalLight('#b8d8db', .45); rim.position.set(4, 5, -4); scene.add(rim);
const mat = (color, roughness = .65, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const volume = createVolumetricPipeline(renderer, camera, sun);
let graphics='balanced';
const M = { yellow: mat('#ffd43b', .38), tip: mat('#665137'), dark: mat('#263238'), steel: mat('#a9b8b5', .32, .6), tile: mat('#e9d8b5', .5), tile2: mat('#7d9b8e', .48), cream: mat('#f7edcf'), wood: mat('#b57743'), cabinet: mat('#54786c', .5), pink: mat('#c8876e'), roach: mat('#71351c', .38), shell: mat('#a75227', .4), black: mat('#121512', .6), green: mat('#72bf61', .3), greenDark: mat('#284c3a'), white: mat('#fff8df'), copper: mat('#bc7647', .35, .5) };
const boxG = new THREE.BoxGeometry(1, 1, 1), ballG = new THREE.SphereGeometry(1, 14, 10);
function mesh(geometry, material, parent = scene) { const o = new THREE.Mesh(geometry, material); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; }
function box(w, h, d, material, x, y, z, parent = scene) { const o = mesh(boxG, material, parent); o.scale.set(w, h, d); o.position.set(x, y, z); return o; }
function ball(x, y, z, sx, sy, sz, material, parent) { const o = mesh(ballG, material, parent); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o; }
function tube(points, radius, material, parent = scene, segments = 20) { return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), segments, radius, 8, false), material, parent); }

// A coherent, deliberately modelled environment rather than a flat playfield.
box(12, .2, 13, M.dark, 0, -.14, 0);
for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) box(.98, .045, .98, (x + z) % 2 === 0 ? M.tile : M.tile2, x, -.018, z);
box(12, 3.3, .15, M.cream, 0, 1.6, -5.1).castShadow=false;
box(.15, 3.3, 11, M.cream, -5.65, 1.6, 0);
for (let i = -2; i <= 2; i++) {
  box(1.6, 1.3, 1.3, M.cabinet, i * 1.65, .68, -4.35);
  box(1.48, 1.08, .06, M.cabinet, i * 1.65, .7, -3.665);
  box(.5, .055, .1, M.steel, i * 1.65, 1.12, -3.60);
  box(1.65, .16, 1.48, M.wood, i * 1.65, 1.42, -4.32);
}
// Fridge with separate doors, handles, feet and a slightly ajar lower drawer.
box(1.05, 2.45, 1.12, M.pink, 4.65, 1.23, -4.05);
box(.98, 1.36, .08, M.pink, 4.65, 1.72, -3.44);
box(.98, .82, .12, M.pink, 4.65, .57, -3.42);
box(.045, .45, .09, M.cream, 4.26, 1.6, -3.35);
box(.045, .3, .09, M.cream, 4.26, .72, -3.32);
// Window, shelf, dishes, leaking pipe and a mug give the room actual depth.
box(2.6, 1.65, .07, M.wood, -2, 2.25, -4.99);
box(2.35, 1.4, .08, mat('#b7d9dd', .22), -2, 2.25, -4.93).castShadow=false;
box(.07, 1.4, .10, M.cream, -2, 2.25, -4.85);
box(2.4, .07, .10, M.cream, -2, 2.25, -4.85);
box(2.4, .09, .50, M.wood, 1.45, 2.65, -4.8);
for (let i = 0; i < 5; i++) { const dish = mesh(new THREE.CylinderGeometry(.26, .26, .045, 24), M.cream); dish.position.set(1.1, 2.74 + i * .046, -4.6); }
const mug = mesh(new THREE.CylinderGeometry(.2, .17, .38, 16), M.yellow); mug.position.set(-3.2, 1.69, -4.15);
const handle = mesh(new THREE.TorusGeometry(.13, .045, 6, 12), M.yellow); handle.position.set(-2.97, 1.72, -4.15);
tube([[-5.49, 1.5, -2], [-5.49, .4, -2], [-5.49, .15, -1.5], [-4.95, .12, -1.5]], .055, M.copper);
for (let i = 0; i < 8; i++) { const crumb = box(.10, .06, .13, M.wood, 2.9 + Math.sin(i * 3) * .35, .04, -1.3 + i * .13); crumb.rotation.y = i; }
const puddle = mesh(new THREE.CircleGeometry(.6, 32), new THREE.MeshStandardMaterial({ color: '#698d90', roughness: .12, transparent: true, opacity: .45 })); puddle.rotation.x = -Math.PI / 2; puddle.scale.set(1.3, .65, 1); puddle.position.set(-4.7, .012, -1.2); puddle.castShadow = false;
// The arena is framed in-world, not as an HTML panel.
const bounds = { x: 2.75, z: 3.0 };
for (const x of [-3.15, 3.15]) box(.055, .015, 6.6, M.yellow, x, .014, 0);
for (const z of [-3.3, 3.3]) box(6.35, .015, .055, M.yellow, 0, .014, z);

// Curved 3D banana with stems, spots and a tiny, increasingly worried face.
const banana = new THREE.Group(); scene.add(banana);
const bananaPoints = [[-.85,.10,0],[-.65,.25,.03],[-.2,.40,.02],[.25,.39,0],[.67,.22,-.02],[.86,.04,-.04]];
tube(bananaPoints,.20,M.yellow,banana,28);
tube([[-.9,.12,0],[-1.0,.22,0],[-1.03,.38,0]],.06,M.tip,banana,6);
ball(.87,.05,-.04,.10,.10,.10,M.tip,banana);
for (let i = 0; i < 5; i++) ball(-.45 + i*.21,.50+Math.sin(i)*.03,.06,.024,.009,.022,M.tip,banana);
const eyes = [];
for (const x of [-.16,.16]) { ball(x,.43,.195,.065,.075,.028,M.white,banana); eyes.push(ball(x,.43,.22,.027,.034,.014,M.black,banana)); }
tube([[-.08,.33,.214],[0,.31,.225],[.08,.33,.214]],.018,M.black,banana,8);
banana.position.y = .04;
const shield = mesh(new THREE.SphereGeometry(1.15,24,14), new THREE.MeshStandardMaterial({ color:'#ffd43b', transparent:true, opacity:.12, roughness:.1, side:THREE.DoubleSide })); shield.scale.set(1,.44,.65); shield.position.y=.22; shield.visible=false; shield.castShadow=false;

const modelLoader=new GLTFLoader();
const loadedModels=[];
function fitModel(model,width){model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const scale=width/Math.max(size.x,size.z);model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.roughness=.52;}}});return model;}
const modelReady=Promise.allSettled([
  modelLoader.loadAsync('./models/banana.glb').then(g=>{g.scene.rotation.y=Math.PI/2;const model=fitModel(g.scene,1.8);for(const child of banana.children)child.visible=false;banana.add(model);loadedModels.push('Kenney banana');}),
  modelLoader.loadAsync('./models/mug.glb').then(g=>{mug.visible=false;handle.visible=false;const root=new THREE.Group();root.position.set(-3.2,1.51,-4.15);root.add(fitModel(g.scene,.45));scene.add(root);loadedModels.push('Kenney mug');}),
  modelLoader.loadAsync('./models/bowl.glb').then(g=>{const root=new THREE.Group();root.position.set(.6,1.51,-4.0);root.add(fitModel(g.scene,.7));scene.add(root);loadedModels.push('Kenney bowl');}),
  modelLoader.loadAsync('./models/plate-dinner.glb').then(g=>{const root=new THREE.Group();root.position.set(2.3,1.51,-4.0);root.add(fitModel(g.scene,.8));scene.add(root);loadedModels.push('Kenney plate');})
]);
function buildRoach(green = false) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const shell = green ? M.green : M.shell, dark = green ? M.greenDark : M.roach;
  ball(0,.14,0,.22,.13,.35,shell,body);
  ball(0,.16,.27,.16,.12,.16,dark,body);
  box(.018,.017,.52,dark,0,.263,-.025,body);
  for (let i = 0; i < 3; i++) tube([[-.17,.17,-.19+i*.11],[0,.255,-.21+i*.11],[.17,.17,-.19+i*.11]],.007,dark,body,6);
  for (const x of [-.075,.075]) ball(x,.23,.365,.043,.05,.032,green?M.yellow:M.black,body);
  const legs = [];
  for (let i = 0; i < 6; i++) { const side=i<3?-1:1, z=(i%3-1)*.20, pivot=new THREE.Group(); pivot.position.set(side*.15,.1,z); g.add(pivot); tube([[0,0,0],[side*.19,.035,-.07],[side*.29,-.07,-.12]],.025,dark,pivot,5); legs.push(pivot); }
  for (const side of [-1,1]) tube([[side*.07,.22,.35],[side*.13,.36,.53],[side*.20,.29,.72]],.012,dark,body,7);
  if(green){const ring=mesh(new THREE.TorusGeometry(.12,.024,6,16),M.yellow,body);ring.position.set(0,.3,-.08);ring.rotation.x=-Math.PI/2;}
  g.userData={legs,body,green};g.visible=false;scene.add(g);return g;
}
const roachPool = Array.from({length:24},(_,i)=>({mesh:buildRoach(i>=18),active:false,green:i>=18,x:0,z:0,hp:1,bite:0,phase:Math.random()*6,dying:0}));
function buildTurret(x,z){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);const base=mesh(new THREE.CylinderGeometry(.25,.3,.18,12),M.dark,g);base.position.y=.10;const ring=mesh(new THREE.TorusGeometry(.23,.04,6,16),M.yellow,g);ring.rotation.x=-Math.PI/2;ring.position.y=.18;const head=new THREE.Group();g.add(head);head.position.y=.25;ball(0,.08,0,.20,.16,.20,M.steel,head);const barrel=box(.13,.13,.46,M.yellow,0,.08,.24,head);box(.15,.15,.04,M.black,0,.08,.49,head);return {mesh:g,head,x,z,hp:6,cool:0};}
const socketPositions=[[-2.5,-2.7],[2.5,-2.7]];
const sockets=socketPositions.map(([x,z])=>{const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);box(.5,.15,.4,M.cream,0,.1,0,g);for(const dx of[-.09,.09])box(.035,.02,.10,M.black,dx,.183,0,g);const led=ball(0,.18,.13,.045,.02,.035,M.green,g);return{mesh:g,led,x,z,hp:6};});
const pointerRing=mesh(new THREE.TorusGeometry(.45,.025,6,32),new THREE.MeshBasicMaterial({color:'#ffdc57',transparent:true,opacity:.9}));pointerRing.rotation.x=-Math.PI/2;pointerRing.visible=false;pointerRing.castShadow=false;
const placement=mesh(new THREE.CylinderGeometry(.30,.33,.20,12),new THREE.MeshStandardMaterial({color:'#ffd43b',transparent:true,opacity:.6}));placement.visible=false;placement.castShadow=false;
const particles=Array.from({length:50},()=>{const o=mesh(new THREE.OctahedronGeometry(.045,0),M.yellow);o.visible=false;o.castShadow=false;return{mesh:o,life:0,v:new THREE.Vector3()};});
const beams=Array.from({length:4},()=>{const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const o=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:'#ffe89b'}));scene.add(o);o.visible=false;return{mesh:o,life:0};});
let seed=1033;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const state={phase:'title',hp:8,coins:8,time:0,kills:0,wave:1,spawn:1.2,shield:0,over:0,placing:false,turrets:[],score:0,best:0,combo:0,lastKill:-10,paused:false,toastUntil:0};
try{state.best=Math.max(0,Number(localStorage.getItem('entertrainer.fever.best.v2'))||0);}catch{}
let held=false, pointerId=null, pointer=new THREE.Vector3(),pointerHit=false,lastGreenHint=-10,sound=false,audio;
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function playSound(kind){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),v=audio.createGain(),t=audio.currentTime;o.type=kind==='zap'?'sawtooth':'triangle';o.frequency.setValueAtTime(kind==='coin'?720:kind==='zap'?430:130,t);o.frequency.exponentialRampToValueAtTime(kind==='coin'?1100:70,t+.09);v.gain.setValueAtTime(.035,t);v.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(v);v.connect(audio.destination);o.start();o.stop(t+.13);}catch{}}
function toast(message){$('#toast').textContent=message;state.toastUntil=performance.now()+2200;$('#toast').classList.add('on');}
function burst(x,z,green=false){let n=0;for(const p of particles){if(p.life>0)continue;p.life=.45+random()*.25;p.mesh.visible=true;p.mesh.position.set(x,.15,z);p.mesh.material=green?M.green:M.yellow;p.v.set((random()-.5)*2,1+random()*2,(random()-.5)*2);if(++n===8)break;}}
function kill(r){if(!r.active||r.dying)return;r.dying=.3;state.kills++;state.combo=state.time-state.lastKill<1.5?Math.min(5,state.combo+1):1;state.lastKill=state.time;state.coins+=r.green?3:1;state.score+=(r.green?40:10)*state.combo;burst(r.x,r.z,r.green);playSound('coin');if(state.kills===1)$('#hint').classList.add('off');}
function spawn(){const greens=state.time>16&&random()<Math.min(.30,.1+state.wave*.025);const r=roachPool.find(r=>!r.active&&r.green===greens);if(!r)return;let side=Math.floor(random()*4);r.x=side===0?-bounds.x:side===1?bounds.x:(random()-.5)*bounds.x*2;r.z=side===2?-bounds.z:side===3?bounds.z:(random()-.5)*bounds.z*2;r.hp=greens?2.8:1;r.bite=.7;r.active=true;r.dying=0;r.mesh.visible=true;r.mesh.scale.setScalar(1);}
function validPlacement(x,z){return Math.abs(x)<2.45&&Math.abs(z)<2.7&&Math.hypot(x,z)>1.05&&state.turrets.every(t=>Math.hypot(t.x-x,t.z-z)>.85)&&sockets.every(t=>Math.hypot(t.x-x,t.z-z)>.5);}
function start(){for(const r of roachPool){r.active=false;r.mesh.visible=false;}for(const t of state.turrets)scene.remove(t.mesh);for(const p of particles){p.life=0;p.mesh.visible=false;}for(const b of beams){b.life=0;b.mesh.visible=false;}Object.assign(state,{phase:'play',hp:8,coins:8,time:0,kills:0,wave:1,spawn:1.3,shield:0,over:0,placing:false,turrets:[],score:0,combo:0,lastKill:-10,paused:false});sockets.forEach(s=>{s.hp=6;s.led.material=M.green;});held=false;pointerId=null;lastGreenHint=-10;$('#overlay').hidden=true;$('#hud').hidden=false;$('#shop').hidden=false;$('#hint').classList.remove('off');$('#hint').innerHTML='<b>Hold a brown roach to squash it.</b><br>Build a turret before the green ones arrive.';$('#pause').disabled=false;toast('Protect the banana. It has no transferable skills.');updateHud();}
function end(){if(state.phase!=='play')return;state.phase='over';held=false;state.placing=false;pointerRing.visible=false;state.best=Math.max(state.best,state.score);try{localStorage.setItem('entertrainer.fever.best.v2',String(state.best));}catch{}$('#pause').disabled=true;$('#shop').hidden=true;showOverlay('THE NIGHT SHIFT IS OVER','Banana. Gone.',`Wave ${state.wave} · ${state.kills} roaches · ${Math.floor(state.time)} seconds<br><strong>${state.score.toLocaleString()} points</strong> · Best ${state.best.toLocaleString()}`,'Drop another banana',start);}
function setPaused(paused){if(state.phase!=='play')return;state.paused=paused;held=false;pointerId=null;pointerRing.visible=false;if(paused)showOverlay('TAKE A BREATHER','Kitchen closed.', 'The roaches can wait. Time and damage are paused.','Resume night shift',()=>setPaused(false));else $('#overlay').hidden=true;}
function showOverlay(tag,title,body,label,action){$('#overlay').hidden=false;$('#overlay').innerHTML=`<section class="modal-card"><p class="eyebrow">${tag}</p><h1>${title}</h1><p class="intro-copy">${body}</p><button class="primary" id="action">${label} <span>→</span></button><a class="exit" href="/engage" target="_top">Back to Engage</a></section>`;$('#action').onclick=action;$('#action').focus({preventScroll:true});}
function buy(kind){if(state.phase!=='play'||state.paused)return;if(kind==='turret'){if(state.placing){state.placing=false;toast('Placement cancelled. Your coins are safe.');return;}if(state.coins<6||state.turrets.length>=3)return;state.placing=true;toast('Tap clear floor inside the yellow lines.');}
if(kind==='over'){if(state.coins<5||state.over>0||!state.turrets.length||!sockets.some(s=>s.hp>0))return;state.coins-=5;state.over=8;playSound('zap');toast('Eight seconds of unreasonable electricity.');}
if(kind==='wrap'){if(state.coins<8||state.shield>0)return;state.coins-=8;state.shield=3;toast('Three bites covered. This is not a warranty.');}updateHud();}
function projectPointer(e){const rect=canvas.getBoundingClientRect();ndc.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(ndc,camera);pointerHit=!!ray.ray.intersectPlane(floorPlane,pointer);return pointerHit;}
canvas.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||state.phase!=='play'||state.paused)return;projectPointer(e);if(state.placing){if(pointerHit&&validPlacement(pointer.x,pointer.z)&&state.coins>=6&&state.turrets.length<3){state.coins-=6;state.turrets.push(buildTurret(pointer.x,pointer.z));state.placing=false;playSound('zap');toast('Turret hired. No lunch break requested.');updateHud();}else toast('Leave space around the banana and other equipment.');return;}pointerId=e.pointerId;held=true;canvas.setPointerCapture(e.pointerId);e.preventDefault();});
canvas.addEventListener('pointermove',e=>{if(pointerId!==null&&e.pointerId!==pointerId)return;projectPointer(e);});
function release(e){if(e.pointerId!==pointerId)return;held=false;pointerId=null;}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
$('#quality').onclick=()=>{graphics=graphics==='balanced'?'high':graphics==='high'?'low':'balanced';volume.setQuality(graphics);$('#quality').textContent=graphics==='balanced'?'FX MED':graphics==='high'?'FX HIGH':'FX LOW';};
$('#pause').onclick=()=>setPaused(!state.paused);
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'SFX ON':'SFX OFF';$('#sound').setAttribute('aria-pressed',String(sound));playSound('coin');};
$('#turret').onclick=()=>buy('turret');$('#over').onclick=()=>buy('over');$('#wrap').onclick=()=>buy('wrap');
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);});
window.addEventListener('blur',()=>{held=false;pointerId=null;if(state.phase==='play')setPaused(true);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.placing){state.placing=false;updateHud();}else setPaused(!state.paused);}if(e.code==='Space'&&e.target===canvas){e.preventDefault();held=true;pointer.set(0,0,1);pointerHit=true;}});
document.addEventListener('keyup',e=>{if(e.code==='Space')held=false;});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();setPaused(true);showOverlay('GRAPHICS INTERRUPTED','The lights went out.','Your best score is safe. Reload to reconnect the kitchen.','Reload game',()=>location.reload());});

function tick(dt){if(state.phase!=='play'||state.paused)return;state.time+=dt;state.wave=1+Math.floor(state.time/30);state.over=Math.max(0,state.over-dt);state.spawn-=dt;if(state.spawn<=0){spawn();state.spawn=Math.max(.40,1.45-state.wave*.13);}
  const speed=.28+Math.min(.7,state.wave*.065);
  for(const r of roachPool){if(!r.active)continue;if(r.dying){r.dying-=dt;if(r.dying<=0){r.active=false;r.mesh.visible=false;}continue;}
    if(held&&pointerHit&&Math.hypot(r.x-pointer.x,r.z-pointer.z)<.52){if(r.green){if(state.time-lastGreenHint>3){toast('Green is shockproof to fingers. Use a turret.');lastGreenHint=state.time;}}else{r.hp-=dt*3.6;if(r.hp<=0){kill(r);continue;}}}
    const targets=state.turrets.filter(t=>t.hp>0).concat(sockets.filter(s=>s.hp>0));let target=r.green?targets.sort((a,b)=>Math.hypot(r.x-a.x,r.z-a.z)-Math.hypot(r.x-b.x,r.z-b.z))[0]:null;
    // With every wire destroyed, green roaches leave rather than creating an unwinnable soft lock.
    const tx=target?.x??0,tz=target?.z??0;
    if(r.green&&!target){r.hp-=dt;if(r.hp<=0){r.active=false;r.mesh.visible=false;}continue;}
    let dx=tx-r.x,dz=tz-r.z,dist=Math.hypot(dx,dz),limit=r.green?.40:.64;
    if(dist>limit){r.x+=dx/dist*speed*dt;r.z+=dz/dist*speed*dt;}else{r.bite-=dt;if(r.bite<=0){r.bite=r.green?.65:1.15;if(r.green){target.hp--;if(target.hp<=0){if(target.led)target.led.material=M.black;else{scene.remove(target.mesh);state.turrets=state.turrets.filter(t=>t!==target);}toast(target.led?'Power socket lost. Keep the other one alive.':'Turret down. The union has declined comment.');}}else{if(state.shield>0)state.shield--;else state.hp--;playSound('bite');if(state.hp<=0){state.hp=0;end();return;}}}}
    r.mesh.rotation.y=Math.atan2(dx,dz);
  }
  const power=sockets.some(s=>s.hp>0);
  for(const t of state.turrets){t.cool-=dt;if(t.cool>0||!power)continue;const target=roachPool.filter(r=>r.active&&!r.dying).sort((a,b)=>Math.hypot(a.x-t.x,a.z-t.z)-Math.hypot(b.x-t.x,b.z-t.z))[0];if(!target||Math.hypot(target.x-t.x,target.z-t.z)>2.6)continue;t.cool=state.over>0?.18:.55;t.head.rotation.y=Math.atan2(target.x-t.x,target.z-t.z);target.hp-=state.over>0?1.1:.72;const beam=beams.find(b=>b.life<=0)||beams[0];beam.life=.09;beam.mesh.visible=true;const pos=beam.mesh.geometry.attributes.position;pos.setXYZ(0,t.x,.42,t.z);pos.setXYZ(1,target.x,.17,target.z);pos.needsUpdate=true;playSound('zap');if(target.hp<=0)kill(target);}
}
let last=performance.now(),accumulator=0,uiTimer=0,elapsed=0;
function updateHud(){const sec=Math.floor(state.time);$('#health').textContent=`${state.hp}/8`;$('#health-bar').style.width=`${state.hp/8*100}%`;$('#coins').textContent=state.coins;$('#wave').textContent=`WAVE ${String(state.wave).padStart(2,'0')}`;$('#clock').textContent=`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;$('#score').textContent=state.score.toLocaleString();$('#power').textContent=`${sockets.filter(s=>s.hp>0).length}/2 POWER`;$('#turret').disabled=!state.placing&&(state.coins<6||state.turrets.length>=3);$('#turret .name').textContent=state.placing?'Cancel':'Turret';$('#turret .price').textContent=state.placing?'Tap clear floor':'6 coins';$('#over').disabled=state.coins<5||!state.turrets.length||state.over>0||!sockets.some(s=>s.hp>0);$('#over .price').textContent=state.over>0?`${Math.ceil(state.over)}s active`:'5 coins';$('#wrap').disabled=state.coins<8||state.shield>0;$('#wrap .price').textContent=state.shield?`${state.shield} bites left`:'8 coins';}
function animate(now){const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;accumulator+=dt;let n=0;while(accumulator>=1/60&&n++<4){tick(1/60);accumulator-=1/60;}if(n>=4)accumulator=0;
  if(!state.paused){for(const r of roachPool){if(!r.active)continue;r.mesh.position.set(r.x,.035,r.z);if(r.dying)r.mesh.scale.set(1.15,Math.max(.06,r.dying/.3),1.15);else{r.mesh.scale.setScalar(1);r.mesh.userData.body.position.y=Math.sin(elapsed*16+r.phase)*.012;for(let i=0;i<6;i++)r.mesh.userData.legs[i].rotation.y=Math.sin(elapsed*20+i*.9+r.phase)*.30;}}for(const p of particles){if(p.life<=0)continue;p.life-=dt;p.v.y-=dt*5;p.mesh.position.addScaledVector(p.v,dt);p.mesh.scale.setScalar(Math.max(0,p.life*2));if(p.life<=0)p.mesh.visible=false;}for(const b of beams){b.life-=dt;b.mesh.visible=b.life>0;}}
  shield.visible=state.shield>0;pointerRing.visible=held&&pointerHit&&state.phase==='play'&&!state.paused;pointerRing.position.set(pointer.x,.04,pointer.z);pointerRing.scale.setScalar(.95+Math.sin(elapsed*9)*.04);placement.visible=state.placing&&pointerHit&&!state.paused;placement.position.set(pointer.x,.12,pointer.z);placement.material.color.set(validPlacement(pointer.x,pointer.z)?'#ffd43b':'#ed7158');
  if(!reduced&&state.phase==='title'){banana.rotation.y=Math.sin(elapsed*.35)*.1;banana.position.y=.05+Math.sin(elapsed*1.1)*.012;}else banana.rotation.y=0;
  eyes.forEach(e=>{e.scale.y=state.hp<=2?.055:.034;});
  if(performance.now()>state.toastUntil)$('#toast').classList.remove('on');uiTimer+=dt;if(uiTimer>.12){uiTimer=0;updateHud();}
  volume.render(scene,elapsed);requestAnimationFrame(animate);
}
function resize(){const w=innerWidth,h=innerHeight,aspect=w/h;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));renderer.setSize(w,h,false);camera.aspect=aspect;const distance=Math.max(10.1,6.8/(2*Math.tan(THREE.MathUtils.degToRad(44/2))*aspect));camera.position.set(.1,distance*.82,distance*.62);camera.lookAt(0,0,-.1);camera.updateProjectionMatrix();volume.resize();}
window.addEventListener('resize',resize);resize();
modelReady.then(()=>{$('#loading').hidden=true;});
showOverlay('ENTERTRAINER PRESENTS','Fever<br><em>Dream.</em>','One banana. An unreasonable number of roaches.<br>Hold brown ones to squash them. Let your turrets handle the green ones.','Start the night shift',start);
requestAnimationFrame(animate);
// Read-only observability for smoke tests and diagnostics; no production cheats.
window.feverSnapshot=()=>({phase:state.phase,paused:state.paused,time:state.time,hp:state.hp,coins:state.coins,kills:state.kills,wave:state.wave,placing:state.placing,turrets:state.turrets.length,renderer:'WebGL',camera:camera.type,models:loadedModels.slice(),volumetrics:'depth-clipped shadowed ray march',quality:graphics,active:roachPool.filter(r=>r.active&&!r.dying).map(r=>{const pos=new THREE.Vector3(r.x,.1,r.z).project(camera);return{green:r.green,x:(pos.x+1)*innerWidth/2,y:(1-pos.y)*innerHeight/2};})});

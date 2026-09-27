import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { surface } from './art.js';

const sphere=new THREE.SphereGeometry(1,20,12);
const chitin=new THREE.MeshPhysicalMaterial({...surface('shell',512),color:'#ca9c78',envMapIntensity:.45,roughness:.32,clearcoat:.55,clearcoatRoughness:.3,bumpScale:.013});
const belly=new THREE.MeshStandardMaterial({color:'#321a16',roughness:.58});
const black=new THREE.MeshPhysicalMaterial({color:'#080708',roughness:.16,clearcoat:.7});
const tissue=new THREE.MeshStandardMaterial({color:'#ad143d',roughness:.22});
function ellipsoid(x,y,z,sx,sy,sz){const g=sphere.clone();g.scale(sx,sy,sz);g.translate(x,y,z);return g;}
function curve(points,radius){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),10,radius,5,false);}
function combine(parts){const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());return geometry;}
const abdomen=combine(Array.from({length:7},(_,i)=>ellipsoid(0,.115,-.28+i*.07,.185-Math.abs(i-3)*.018,.075,.066)));
const thorax=combine([ellipsoid(0,.16,.25,.17,.11,.16),ellipsoid(0,.105,.39,.11,.075,.095)]);
const eyes=combine([-1,1].map(side=>ellipsoid(side*.085,.155,.415,.028,.025,.027)));
const wing=ellipsoid(0,0,0,.105,.074,.31);
const antenna=combine([-1,1].map(side=>curve([[side*.065,.15,.44],[side*.14,.23,.65],[side*.3,.17,.9],[side*.38,.08,1.03]],.008)));
const rear=combine([-1,1].map(side=>curve([[side*.06,.09,-.33],[side*.1,.07,-.49],[side*.14,.05,-.54]],.012)));
const legGeometries=[-1,1].map(side=>combine([
  curve([[0,0,0],[side*.18,.02,-.07],[side*.34,-.06,-.15],[side*.4,-.075,-.07]],.016),
  ...[.12,.19,.26,.32].map((n,i)=>curve([[side*n,-.01-i*.015,-n*.38],[side*(n+.045),.025-i*.016,-n*.38-.045]],.006))
]));
const woundGeo=combine([ellipsoid(0,.185,-.07,.1,.035,.19),ellipsoid(.12,.15,.06,.04,.04,.07)]);
function add(parent,geometry,material){const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
export function createRoach(green=false){
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const damage={value:0},shell=chitin.clone();if(green)shell.color.set('#8dce72');
  shell.onBeforeCompile=shader=>{shader.uniforms.uDamage=damage;shader.fragmentShader='uniform float uDamage;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float split=abs(sin(vMapUv.x*57.+sin(vMapUv.y*32.)*2.));
    float torn=(1.-smoothstep(.02,.11,split))*uDamage;
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.29,.005,.024),torn*.92);`);};
  shell.customProgramCacheKey=()=> 'fever-physical-damage-v1';
  add(body,abdomen,belly);add(body,thorax,shell);add(body,eyes,black);add(body,antenna,belly);add(body,rear,belly);
  const wings=[-1,1].map(side=>{const w=add(body,wing,shell);w.position.set(side*.09,.21,-.065);w.rotation.y=side*.035;return w;});
  const wound=add(body,woundGeo,tissue);wound.visible=false;
  const legs=Array.from({length:6},(_,i)=>{const pivot=new THREE.Group();pivot.position.set(i<3?-.14:.14,.1,(i%3-1)*.19);pivot.rotation.y=(i%3-1)*.35;add(pivot,legGeometries[i<3?0:1],belly);g.add(pivot);return pivot;});
  g.userData={body,legs,wings,wound,damage,green};g.visible=false;return g;
}
export function damageRoach(mesh,fraction,time){const d=mesh.userData;d.damage.value=fraction;d.wound.visible=fraction>.25;d.wings.forEach((wing,i)=>{const side=i?1:-1;wing.rotation.z=side*fraction*.7;wing.position.x=side*(.09+fraction*.055);});d.body.rotation.z=Math.sin(time*45)*fraction*.065;}

import * as THREE from 'three';

// Matching world-space vertex deformation in colour and shadow passes.
// The play surface stays within 2cm of its collision plane; walls breathe more deeply.
export function createDream(reduced) {
  const uniforms={uDreamTime:{value:0},uDreamPower:{value:reduced?0:1}};
  const declarations='uniform float uDreamTime;uniform float uDreamPower;\n';
  const warp=`vec3 dreamWorld=(modelMatrix*vec4(transformed,1.)).xyz;
    float dreamWall=smoothstep(.3,2.5,abs(dreamWorld.y));
    transformed.x+=sin(dreamWorld.z*1.3+uDreamTime*.7)*(.016+.085*dreamWall)*uDreamPower;
    transformed.y+=sin(dreamWorld.x*1.7+uDreamTime*.9)*cos(dreamWorld.z*.9-uDreamTime*.4)*(.018+.06*dreamWall)*uDreamPower;
    transformed.z+=cos(dreamWorld.x*1.1+uDreamTime*.6)*.045*dreamWall*uDreamPower;`;
  function patch(material,color=true){
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,uniforms);
      shader.vertexShader=declarations+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+warp);
      if(color){shader.fragmentShader=declarations+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float hueDrift=.5+.5*sin(uDreamTime*.43+vViewPosition.x*.45+vViewPosition.y*.8);
        diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*mix(vec3(.76,1.13,1.05),vec3(1.2,.77,1.11),hueDrift),.38*uDreamPower);`);}
    };
    material.customProgramCacheKey=()=>color?'fever-dream-color-v1':'fever-dream-depth-v1';
    material.needsUpdate=true;
  }
  const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});patch(depth,false);
  const attached=new Set();
  return {attach(mesh){if(!attached.has(mesh.material)){patch(mesh.material);attached.add(mesh.material);}mesh.customDepthMaterial=depth;},update(time,intensity){uniforms.uDreamTime.value=time;uniforms.uDreamPower.value=reduced?0:intensity;},get amount(){return uniforms.uDreamPower.value;}};
}

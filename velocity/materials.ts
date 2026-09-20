import * as THREE from "three";

export interface PlanetMaps {
  day: THREE.Texture;
  night: THREE.Texture;
  clouds: THREE.Texture;
  specular?: THREE.Texture;
  normal?: THREE.Texture;
}
export function earthMaterial(
  maps: PlanetMaps,
  sunDirection: THREE.Vector3,
): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    map: maps.day,
    normalMap: maps.normal,
    normalScale: new THREE.Vector2(0.14, 0.14),
    roughness: 0.75,
    metalness: 0,
    clearcoat: 0.06,
    clearcoatRoughness: 0.24,
    emissive: 0xffffff,
    emissiveMap: maps.night,
    emissiveIntensity: 1.2,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.sunDirection = { value: sunDirection };
    shader.uniforms.cloudShadow = { value: maps.clouds };
    shader.uniforms.oceanMask = { value: maps.specular || maps.day };
    shader.vertexShader =
      "varying vec3 vEarthWorldNormal;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <defaultnormal_vertex>",
      "#include <defaultnormal_vertex>\nvEarthWorldNormal=normalize(mat3(modelMatrix)*objectNormal);",
    );
    shader.fragmentShader =
      "uniform vec3 sunDirection; uniform sampler2D cloudShadow; uniform sampler2D oceanMask; varying vec3 vEarthWorldNormal;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
      float daylight=dot(normalize(vEarthWorldNormal),sunDirection);
      totalEmissiveRadiance*=1.0-smoothstep(-0.12,0.12,daylight);
    `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      "#include <roughnessmap_fragment>\nroughnessFactor=mix(0.85,0.24,texture2D(oceanMask,vMapUv).r);",
    );
    // Deliberately subtle: cloud shadows do not become mountains at planet scale.
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `#include <map_fragment>
      float shadowCloud=texture2D(cloudShadow,vMapUv+vec2(0.0015,0.0004)).r;
      diffuseColor.rgb*=1.0-shadowCloud*0.16;
    `,
    );
  };
  material.customProgramCacheKey = () => "velocity-earth-terminator-v2";
  return material;
}
export function atmosphere(sunDirection: THREE.Vector3): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: { sunDirection: { value: sunDirection } },
    vertexShader: `varying vec3 worldPosition; varying vec3 vEarthWorldNormal;
      void main(){worldPosition=(modelMatrix*vec4(position,1.0)).xyz;vEarthWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*vec4(worldPosition,1.0);}`,
    fragmentShader: `uniform vec3 sunDirection; varying vec3 worldPosition; varying vec3 vEarthWorldNormal;
      void main(){
        vec3 n=normalize(vEarthWorldNormal);vec3 viewDir=normalize(cameraPosition-worldPosition);
        float rim=pow(clamp(1.0-abs(dot(n,viewDir)),0.0,1.0),3.4);
        float day=smoothstep(-0.35,0.8,dot(n,sunDirection));
        vec3 blue=mix(vec3(0.04,0.18,0.48),vec3(0.22,0.52,1.0),day);
        float sunset=exp(-pow(dot(n,sunDirection)*8.0,2.0));
        gl_FragColor=vec4(mix(blue,vec3(0.85,0.28,0.08),sunset*0.24),rim*(0.08+day*0.56));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}
export function sunHalo(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 n; varying vec3 p; void main(){n=normalize(normalMatrix*normal);vec4 q=modelViewMatrix*vec4(position,1.);p=q.xyz;gl_Position=projectionMatrix*q;}`,
    fragmentShader: `varying vec3 n; varying vec3 p; void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(-p))),4.);gl_FragColor=vec4(vec3(1.,0.42,0.08),rim*0.3);}`,
  });
}
export function stellarMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: { pixelRatio: { value: 1 } },
    vertexShader: `attribute float size; uniform float pixelRatio; varying vec3 starColor; void main(){starColor=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*pixelRatio*150./-p.z,1.,40.);gl_Position=projectionMatrix*p;}`,
    fragmentShader: `varying vec3 starColor; void main(){float d=length(gl_PointCoord-0.5)*2.;if(d>1.)discard;float a=exp(-d*d*6.)*0.7;gl_FragColor=vec4(starColor,a);}`,
  });
}
export function dipoleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    uniforms: {},
    vertexShader: `varying vec3 n;void main(){n=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 n;void main(){float x=normalize(n).x;vec3 cold=vec3(.06,.22,.54);vec3 mid=vec3(.72,.64,.40);vec3 warm=vec3(1.,.25,.08);vec3 c=x<0.?mix(mid,cold,-x):mix(mid,warm,x);float bands=0.015*sin(x*45.);gl_FragColor=vec4(c+bands,.86);}`,
  });
}

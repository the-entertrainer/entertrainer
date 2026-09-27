import * as THREE from 'three';

// Depth-clipped single-scattering ray march through two window-light volumes.
// Real world-space integration with shadow-map occlusion, rendered below native resolution.
export function createVolumetricPipeline(renderer, camera, light) {
  const sceneTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true });
  sceneTarget.samples = 0;
  sceneTarget.depthTexture = new THREE.DepthTexture(1, 1, THREE.UnsignedIntType);
  const volumeTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  const quadScene = new THREE.Scene();
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const vertexShader = 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  const scatter = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: {
      uDepth: { value: sceneTarget.depthTexture }, uInvProjection: { value: camera.projectionMatrixInverse },
      uCameraWorld: { value: camera.matrixWorld }, uCameraPosition: { value: camera.position },
      uTime: { value: 0 }, uSteps: { value: 24 }, uShadow: { value: null },
      uShadowMatrix: { value: light.shadow.matrix }, uHasShadow: { value: 0 }
    }, vertexShader,
    fragmentShader: `
      #include <packing>
      varying vec2 vUv;
      uniform sampler2D uDepth,uShadow;
      uniform mat4 uInvProjection,uCameraWorld,uShadowMatrix;
      uniform vec3 uCameraPosition;
      uniform float uTime,uSteps,uHasShadow;
      float noise(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
      float lightDensity(vec3 p,vec3 source){
        vec3 axis=normalize(vec3(.35,-.42,1.));
        vec3 v=p-source;float along=dot(v,axis);
        if(along<0.||along>9.)return 0.;
        float radius=.20+along*.13;
        float radial=length(v-axis*along)/radius;
        return exp(-radial*radial*2.8)*smoothstep(0.,.4,along)*exp(-along*.07);
      }
      void main(){
        float depth=texture2D(uDepth,vUv).r;
        vec4 view=uInvProjection*vec4(vUv*2.-1.,depth*2.-1.,1.);view/=view.w;
        vec3 end=(uCameraWorld*view).xyz;
        vec3 ray=normalize(end-uCameraPosition);
        float stop=min(length(end-uCameraPosition),40.);
        vec3 safeRay=(step(vec3(0.),ray)*2.-1.)*max(abs(ray),vec3(.00001));
        vec3 t0=(vec3(-5.5,.06,-5.)-uCameraPosition)/safeRay;
        vec3 t1=(vec3(5.5,3.5,5.)-uCameraPosition)/safeRay;
        vec3 low=min(t0,t1),high=max(t0,t1);
        float start=max(0.,max(low.x,max(low.y,low.z)));
        float finish=min(stop,min(high.x,min(high.y,high.z)));
        if(finish<=start){gl_FragColor=vec4(0.);return;}
        float stepLength=(finish-start)/uSteps;
        float offset=noise(vec3(vUv*650.,0.));
        float total=0.;float transmission=1.;
        for(int i=0;i<40;i++){
          if(float(i)>=uSteps)break;
          vec3 p=uCameraPosition+ray*(start+(float(i)+offset)*stepLength);
          float density=lightDensity(p,vec3(-2.55,2.65,-4.75))+lightDensity(p,vec3(-1.5,2.65,-4.75));
          density*=.80+.20*sin(p.x*6.+p.y*4.+p.z*3.+uTime*.18);
          float visible=1.;
          if(uHasShadow>.5){vec4 sp=uShadowMatrix*vec4(p,1.);sp/=sp.w;if(sp.x>0.&&sp.x<1.&&sp.y>0.&&sp.y<1.&&sp.z>0.&&sp.z<1.){float sd=unpackRGBAToDepth(texture2D(uShadow,sp.xy));visible=sp.z-.003>sd?.10:1.;}}
          float extinction=density*.23;
          float absorbed=1.-exp(-extinction*stepLength);
          total+=transmission*absorbed*visible;
          transmission*=1.-absorbed;
        }
        gl_FragColor=vec4(vec3(1.,.77,.37)*total*.65,1.);
      }
    `
  });
  const composite = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { uColor:{value:sceneTarget.texture},uVolume:{value:volumeTarget.texture},uTime:{value:0} }, vertexShader,
    fragmentShader: `varying vec2 vUv;uniform sampler2D uColor,uVolume;uniform float uTime;void main(){vec2 p=vUv-.5;vec3 c=texture2D(uColor,vUv).rgb+texture2D(uVolume,vUv).rgb;float grain=fract(sin(dot(vUv*831.,vec2(12.9898,78.233))+floor(uTime*24.))*43758.5453)-.5;c*=1.-.48*dot(p,p);c+=grain*.006;gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`.replace(';#include',';\n#include')
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2),scatter);quad.frustumCulled=false;quadScene.add(quad);
  let quality='balanced';
  function resize(){const size=renderer.getDrawingBufferSize(new THREE.Vector2());sceneTarget.setSize(size.x,size.y);const scale=quality==='low'?.25:.5;volumeTarget.setSize(Math.max(1,Math.round(size.x*scale)),Math.max(1,Math.round(size.y*scale)));scatter.uniforms.uSteps.value=quality==='low'?12:quality==='high'?36:24;}
  return {
    resize,
    setQuality(value){quality=value;resize();},
    render(scene,time){
      composite.uniforms.uTime.value=time;
      renderer.setRenderTarget(sceneTarget);renderer.render(scene,camera);
      scatter.uniforms.uTime.value=time;scatter.uniforms.uShadow.value=light.shadow.map?.texture??sceneTarget.texture;scatter.uniforms.uHasShadow.value=light.shadow.map?1:0;
      quad.material=scatter;renderer.setRenderTarget(volumeTarget);renderer.render(quadScene,quadCamera);
      quad.material=composite;renderer.setRenderTarget(null);renderer.render(quadScene,quadCamera);
    },
    dispose(){sceneTarget.dispose();volumeTarget.dispose();scatter.dispose();composite.dispose();quad.geometry.dispose();}
  };
}

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const GrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime:    { value: 0 },
    uAmount:  { value: 0.032 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAmount;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec4 col = texture2D(tDiffuse, vUv);
      float grain = rand(vUv + uTime * 0.07) * 2.0 - 1.0;
      col.rgb += grain * uAmount;
      gl_FragColor = col;
    }
  `,
}

const VignetteShader = {
  uniforms: {
    tDiffuse:   { value: null },
    uFillColor: { value: new THREE.Color(0x0D0C0A) },
    uStrength:  { value: 0.88 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec3 uFillColor;
    uniform float uStrength;
    varying vec2 vUv;

    float remap(float v, float a, float b, float c, float d) {
      return c + (d-c)*(v-a)/(b-a);
    }

    void main() {
      float bot = clamp(remap(vUv.y, 0.0, 0.20, 1.0, 0.0), 0.0, 1.0);
      float top = clamp(remap(vUv.y, 0.80, 1.0, 0.0, 1.0), 0.0, 1.0);
      float lft = clamp(remap(vUv.x, 0.0, 0.08, 1.0, 0.0), 0.0, 1.0);
      float rgt = clamp(remap(vUv.x, 0.92, 1.0, 0.0, 1.0), 0.0, 1.0);
      float str = clamp(top + bot + lft + rgt, 0.0, 1.0);
      vec4 tex = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(mix(tex.rgb, uFillColor, str * uStrength), tex.a);
    }
  `,
}

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uOffset:  { value: 0.002 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uOffset;
    varying vec2 vUv;

    void main() {
      vec2 off = (vUv - 0.5) * uOffset;
      float r = texture2D(tDiffuse, vUv + off).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - off).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
}

export class PostFX {
  composer: EffectComposer
  private bloom: UnrealBloomPass
  private grain: ShaderPass
  private vignette: ShaderPass
  private chromatic: ShaderPass

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    w: number, h: number,
    pixelRatio: number
  ) {
    this.composer = new EffectComposer(renderer)
    this.composer.setPixelRatio(pixelRatio)
    this.composer.setSize(w, h)

    this.composer.addPass(new RenderPass(scene, camera))

    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.55, 0.5, 0.12)
    this.composer.addPass(this.bloom)

    this.grain = new ShaderPass(GrainShader)
    this.composer.addPass(this.grain)

    this.chromatic = new ShaderPass(ChromaticAberrationShader)
    this.composer.addPass(this.chromatic)

    this.vignette = new ShaderPass(VignetteShader)
    this.composer.addPass(this.vignette)
  }

  tick(time: number) {
    this.grain.material.uniforms.uTime.value = time
  }

  setFillColor(hex: number) {
    this.vignette.material.uniforms.uFillColor.value.set(hex)
  }

  resize(w: number, h: number, pixelRatio: number) {
    this.composer.setSize(w, h)
    this.composer.setPixelRatio(pixelRatio)
    this.bloom.resolution.set(w, h)
  }

  render() { this.composer.render() }

  dispose() { this.composer.dispose() }
}

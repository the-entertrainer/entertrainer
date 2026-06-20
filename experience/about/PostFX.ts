import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const VignetteShader = {
  uniforms: {
    tDiffuse:   { value: null },
    uFillColor: { value: new THREE.Color(0x0D0C0A) },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec3 uFillColor;
    varying vec2 vUv;

    float remap(float v, float a, float b, float c, float d) {
      return c + (d - c) * (v - a) / (b - a);
    }

    void main() {
      float bot = clamp(remap(vUv.y, 0.0, 0.18, 1.0, 0.0), 0.0, 1.0);
      float top = clamp(remap(vUv.y, 0.82, 1.0, 0.0, 1.0), 0.0, 1.0);
      float str = clamp(top + bot, 0.0, 1.0);
      vec4 tex = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(mix(tex.rgb, uFillColor, str * 0.9), tex.a);
    }
  `,
}

export class PostFX {
  composer: EffectComposer
  private bloom: UnrealBloomPass
  private vignette: ShaderPass

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    w: number,
    h: number,
    pixelRatio: number
  ) {
    this.composer = new EffectComposer(renderer)
    this.composer.setPixelRatio(pixelRatio)
    this.composer.setSize(w, h)

    this.composer.addPass(new RenderPass(scene, camera))

    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.75, 0.4, 0.15)
    this.composer.addPass(this.bloom)

    this.vignette = new ShaderPass(VignetteShader)
    this.composer.addPass(this.vignette)
  }

  setFillColor(hex: number) {
    this.vignette.material.uniforms.uFillColor.value.set(hex)
  }

  resize(w: number, h: number, pixelRatio: number) {
    this.composer.setSize(w, h)
    this.composer.setPixelRatio(pixelRatio)
    this.bloom.resolution.set(w, h)
  }

  render() {
    this.composer.render()
  }

  dispose() {
    this.composer.dispose()
  }
}

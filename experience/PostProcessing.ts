import { Color } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import type Experience from './Experience'

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uFillColor: { value: new Color(0x0D0C0A) }
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

    float remap(float value, float inputMin, float inputMax, float outputMin, float outputMax) {
      return outputMin + (outputMax - outputMin) * (value - inputMin) / (inputMax - inputMin);
    }

    void main() {
      float bot = clamp(remap(vUv.y, 0.0, 0.2, 1.0, 0.0), 0.0, 1.0);
      float top = clamp(remap(vUv.y, 0.8, 1.0, 0.0, 1.0), 0.0, 1.0);
      float strength = clamp(top + bot, 0.0, 1.0);

      vec4 tex = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(mix(tex.rgb, uFillColor, strength), tex.a);
    }
  `
}

export default class PostProcessing {
  experience: Experience
  composer: EffectComposer
  vignettePass: ShaderPass

  constructor(experience: Experience) {
    this.experience = experience

    this.composer = new EffectComposer(experience.renderer.instance)
    this.composer.addPass(new RenderPass(experience.scene, experience.camera.instance))

    this.vignettePass = new ShaderPass(VignetteShader)
    this.vignettePass.material.uniforms.uFillColor.value = new Color('#0D0C0A')
    this.composer.addPass(this.vignettePass)
  }

  setVignetteColor(hex: number) {
    this.vignettePass.material.uniforms.uFillColor.value.set(hex)
  }

  resize() {
    this.composer.setSize(this.experience.sizes.width, this.experience.sizes.height)
    this.composer.setPixelRatio(this.experience.sizes.pixelRatio)
  }

  render() {
    this.composer.render()
  }

  destroy() {
    this.composer.dispose()
  }
}

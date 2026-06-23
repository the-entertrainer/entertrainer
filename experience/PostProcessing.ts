import { Color, Vector2 } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
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

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse:  { value: null },
    uStrength: { value: 0.0007 },
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
    uniform float uStrength;
    varying vec2 vUv;

    void main() {
      vec2 fromCenter = vUv - 0.5;
      float dist = length(fromCenter);
      vec2 aberration = normalize(fromCenter) * dist * dist * uStrength * 10.0;
      float r = texture2D(tDiffuse, vUv - aberration).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + aberration).b;
      float a = texture2D(tDiffuse, vUv).a;
      gl_FragColor = vec4(r, g, b, a);
    }
  `
}

const ColorGradeShader = {
  uniforms: {
    tDiffuse:      { value: null },
    uContrast:     { value: 1.06 },
    uShadowTint:   { value: new Color(0.06, 0.08, 0.14) },
    uTintStrength: { value: 0.08 },
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
    uniform float uContrast;
    uniform vec3 uShadowTint;
    uniform float uTintStrength;
    varying vec2 vUv;

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      vec3 col = tex.rgb;
      // subtle contrast lift
      col = clamp((col - 0.5) * uContrast + 0.5, 0.0, 1.0);
      // shadow tint: darkest areas receive most colour push
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = clamp(col + uShadowTint * (1.0 - luma) * uTintStrength, 0.0, 1.0);
      gl_FragColor = vec4(col, tex.a);
    }
  `
}

export default class PostProcessing {
  experience: Experience
  composer: EffectComposer
  bloomPass: UnrealBloomPass
  vignettePass: ShaderPass
  chromaPass: ShaderPass
  colorGradePass: ShaderPass

  constructor(experience: Experience) {
    this.experience = experience

    this.composer = new EffectComposer(experience.renderer.instance)
    this.composer.addPass(new RenderPass(experience.scene, experience.camera.instance))

    // bloom — subtle halo on bright card surfaces
    this.bloomPass = new UnrealBloomPass(
      new Vector2(experience.sizes.width, experience.sizes.height),
      0.32,   // strength
      0.55,   // radius
      0.80    // threshold — only highlights bloom
    )
    this.composer.addPass(this.bloomPass)

    this.vignettePass = new ShaderPass(VignetteShader)
    this.vignettePass.material.uniforms.uFillColor.value = new Color('#0D0C0A')
    this.composer.addPass(this.vignettePass)

    // chromatic aberration — subtle radial RGB fringe at screen edges
    this.chromaPass = new ShaderPass(ChromaticAberrationShader)
    this.composer.addPass(this.chromaPass)

    this.colorGradePass = new ShaderPass(ColorGradeShader)
    this.composer.addPass(this.colorGradePass)
  }

  setVignetteColor(hex: number) {
    this.vignettePass.material.uniforms.uFillColor.value.set(hex)
  }

  setColorGrade(isDark: boolean) {
    const u = this.colorGradePass.material.uniforms
    if (isDark) {
      u.uContrast.value = 1.06
      u.uShadowTint.value.setRGB(0.06, 0.08, 0.14)   // cool blue-grey shadows
      u.uTintStrength.value = 0.08
    } else {
      u.uContrast.value = 1.04
      u.uShadowTint.value.setRGB(0.12, 0.08, 0.04)   // warm amber shadows
      u.uTintStrength.value = 0.05
    }
    // Light mode gets only a whisper of bloom (high threshold so cream card
    // surfaces don't blow out — just the white dust + window highlights glow)
    this.bloomPass.strength  = isDark ? 0.32 : 0.07
    this.bloomPass.threshold = isDark ? 0.80 : 0.90
  }

  resize() {
    const { width, height, pixelRatio } = this.experience.sizes
    this.composer.setSize(width, height)
    this.composer.setPixelRatio(pixelRatio)
    this.bloomPass.resolution.set(width, height)
  }

  render() {
    this.composer.render()
  }

  destroy() {
    this.composer.dispose()
  }
}

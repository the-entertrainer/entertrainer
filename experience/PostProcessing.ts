import { Color, Vector2 } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import type Experience from './Experience'

const VignetteShader = {
  uniforms: {
    tDiffuse:   { value: null },
    uFillColor: { value: new Color(0x0D0C0A) },
    uStrength:  { value: 0.72 }
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
    uniform float uStrength;
    varying vec2 vUv;

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      // Radial vignette — cinematic oval, slightly taller than wide
      vec2 uv2 = (vUv - 0.5) * vec2(1.0, 1.15);
      float dist = length(uv2);
      float vignette = smoothstep(0.30, 0.90, dist) * uStrength;
      gl_FragColor = vec4(mix(tex.rgb, uFillColor, vignette), tex.a);
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
    const u  = this.colorGradePass.material.uniforms
    const vu = this.vignettePass.material.uniforms
    if (isDark) {
      u.uContrast.value = 1.10
      u.uShadowTint.value.setRGB(0.04, 0.06, 0.13)   // deeper cool blue
      u.uTintStrength.value = 0.12
      vu.uStrength.value = 0.76                        // strong cinematic vignette
    } else {
      u.uContrast.value = 1.07
      u.uShadowTint.value.setRGB(0.15, 0.09, 0.04)   // warm amber
      u.uTintStrength.value = 0.08
      vu.uStrength.value = 0.48                        // softer vignette in light mode
    }
    this.bloomPass.strength  = isDark ? 0.38 : 0.18
    this.bloomPass.threshold = isDark ? 0.78 : 0.82
    this.bloomPass.radius    = isDark ? 0.60 : 0.45
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

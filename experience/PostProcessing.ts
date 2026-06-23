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

const LightRaysShader = {
  uniforms: {
    tDiffuse:   { value: null },
    uTime:      { value: 0.0 },
    uOpacity:   { value: 0.0 },
    // screen-space origin of the rays (UV). Upper-left matches the workshop window.
    uOrigin:    { value: new Vector2(0.18, 0.88) }
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
    uniform float uTime;
    uniform float uOpacity;
    uniform vec2  uOrigin;
    varying vec2  vUv;

    float ray(vec2 uv, vec2 origin, float angle, float width) {
      vec2 dir = uv - origin;
      float a = atan(dir.y, dir.x);
      float dist = length(dir);
      float diff = mod(a - angle + 3.14159, 6.28318) - 3.14159;
      float beam = smoothstep(width, 0.0, abs(diff));
      // fade with distance and bias toward the source
      float fade = smoothstep(0.0, 0.08, dist) * smoothstep(1.4, 0.1, dist);
      return beam * fade;
    }

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      if (uOpacity <= 0.001) { gl_FragColor = tex; return; }

      // five beams spread in a fan from upper-left, each with own breathe offset
      float angles[5];
      angles[0] = -0.45;
      angles[1] = -0.25;
      angles[2] = -0.08;
      angles[3] =  0.12;
      angles[4] =  0.30;

      float breathe[5];
      breathe[0] = sin(uTime * 0.41 + 0.0) * 0.5 + 0.5;
      breathe[1] = sin(uTime * 0.37 + 1.1) * 0.5 + 0.5;
      breathe[2] = sin(uTime * 0.29 + 2.3) * 0.5 + 0.5;
      breathe[3] = sin(uTime * 0.44 + 3.7) * 0.5 + 0.5;
      breathe[4] = sin(uTime * 0.33 + 0.8) * 0.5 + 0.5;

      float raysSum = 0.0;
      for (int i = 0; i < 5; i++) {
        float width = mix(0.04, 0.10, breathe[i]);
        float strength = mix(0.55, 1.0, breathe[i]);
        raysSum += ray(vUv, uOrigin, angles[i], width) * strength;
      }
      raysSum = clamp(raysSum, 0.0, 1.0);

      // warm golden tint for sunlight
      vec3 rayColor = vec3(1.0, 0.93, 0.72);
      vec3 composite = tex.rgb + rayColor * raysSum * uOpacity;
      gl_FragColor = vec4(composite, tex.a);
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
  lightRaysPass: ShaderPass

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

    // light rays — warm sunbeams in light mode only
    this.lightRaysPass = new ShaderPass(LightRaysShader)
    this.composer.addPass(this.lightRaysPass)
  }

  tick(delta: number) {
    this.lightRaysPass.material.uniforms.uTime.value += delta / 1000
  }

  setLightRays(enabled: boolean) {
    this.lightRaysPass.material.uniforms.uOpacity.value = enabled ? 0.28 : 0.0
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
    // bloom destroys light mode (cream surfaces blow out); disable it there
    this.bloomPass.strength  = isDark ? 0.32 : 0.0
    this.bloomPass.threshold = isDark ? 0.80 : 1.00
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

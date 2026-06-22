import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils
} from 'three'
import type Experience from './Experience'

// Floating dust motes that live in the 3D scene behind/around the cards.
// They drift slowly and are tied into the scene fog, so distant motes fade
// into the background colour and never read as a flat overlay. Because they
// sit in world space they parallax as the spiral turns — pure backdrop depth,
// nothing ever touches the card faces.

const COUNT = 260

const vertexShader = /* glsl */`
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  #include <fog_pars_vertex>

  void main() {
    vec3 p = position;
    // gentle per-mote drift
    p.y += sin(uTime * 0.30 + aPhase) * 0.18;
    p.x += cos(uTime * 0.21 + aPhase * 1.3) * 0.14;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // size attenuates with distance; clamped so nothing balloons near the camera
    gl_PointSize = clamp(
      aSize * uPixelRatio * (8.0 / -mvPosition.z),
      1.0,
      34.0 * uPixelRatio
    );
    #include <fog_vertex>
  }
`

const fragmentShader = /* glsl */`
  uniform vec3  uColor;
  uniform float uOpacity;
  #include <fog_pars_fragment>

  void main() {
    // soft round mote
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    if (a <= 0.001) discard;
    gl_FragColor = vec4(uColor, a * uOpacity);
    #include <fog_fragment>
  }
`

export default class Particles {
  experience: Experience
  points: Points
  material: ShaderMaterial

  constructor(experience: Experience) {
    this.experience = experience

    const positions = new Float32Array(COUNT * 3)
    const sizes     = new Float32Array(COUNT)
    const phases    = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Box volume around the spiral, kept clear of the camera at z = 8.
      positions[i * 3]     = (Math.random() * 2 - 1) * 9      // x
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 7.5    // y
      positions[i * 3 + 2] = -9 + Math.random() * 14          // z: -9 .. 5
      sizes[i]  = Math.random() * 9 + 3
      phases[i] = Math.random() * Math.PI * 2
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('aSize',    new BufferAttribute(sizes, 1))
    geometry.setAttribute('aPhase',   new BufferAttribute(phases, 1))

    this.material = new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        UniformsLib.fog,
        {
          uTime:       { value: 0 },
          uPixelRatio: { value: experience.sizes.pixelRatio },
          uColor:      { value: new Color(0.55, 0.68, 0.92) },
          uOpacity:    { value: 0.5 }
        }
      ]),
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      fog: true
    })

    this.points = new Points(geometry, this.material)
    this.points.frustumCulled = false
    experience.scene.add(this.points)
  }

  setTheme(isDark: boolean) {
    const u = this.material.uniforms
    if (isDark) {
      u.uColor.value.setRGB(0.55, 0.68, 0.92) // soft blue-white over the dark wash
      u.uOpacity.value = 0.50
    } else {
      u.uColor.value.setRGB(0.18, 0.27, 0.44) // deep Pi Blue, readable on cream
      u.uOpacity.value = 0.38
    }
  }

  update(delta: number) {
    this.material.uniforms.uTime.value      += delta / 1000
    this.material.uniforms.uPixelRatio.value = this.experience.sizes.pixelRatio
    // whole cloud rotates very slowly for ambient drift + parallax
    this.points.rotation.y += delta * 0.00002
  }

  destroy() {
    this.experience.scene.remove(this.points)
    this.points.geometry.dispose()
    this.material.dispose()
  }
}

/**
 * The lens.
 *
 * Everything up to this point in the composer is a *render*: geometry, lights,
 * bloom. This pass is the piece of glass it is all being seen through, and it
 * is the difference between a scene that looks computed and one that looks
 * photographed.
 *
 * Four optics, in the order light actually meets them:
 *
 *  1. Barrel distortion — a real lens does not map the world to a flat grid.
 *     The amount here is tiny (a few pixels at the corners); you should never
 *     be able to point at it, only notice that straight edges near the frame
 *     have a very slight bow.
 *
 *  2. Radial chromatic aberration — the colour fringing at the edge of a fast
 *     lens. Crucially this is ZERO at the optical centre and grows with r^2,
 *     which is how glass behaves: the card you are actually looking at stays
 *     pristine while the stack falling away toward the frame picks up colour.
 *     A uniform, full-frame RGB split is the tell of a fake one.
 *
 *  3. Velocity coupling — the part that makes it feel like a camera rather
 *     than a filter. The deck's spring velocity feeds both the aberration and
 *     a short directional smear along the axis the cards actually travel, so
 *     a hard flick tears the highlights into streaks and they resolve as the
 *     spring settles. Nothing here is animated on a timer; the optics are a
 *     read-out of physics that is already running.
 *
 *  4. Vignette and grain — the frame and the film. Grain is generated per
 *     pixel per frame in shader space rather than tiled from a texture, so it
 *     never repeats and never crawls in a pattern.
 */
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { Vector2 } from 'three'

/**
 * Directional smear taps — a compile-time constant, not a uniform, because the
 * cost is real: every tap is three texture fetches (one per channel) at every
 * pixel of a fullscreen quad.
 *
 * So the pass is compiled per device. The lite build keeps all the optics —
 * barrel, radial fringe, vignette, grain — and drops only the smear, which is
 * the expensive part and the part a phone's own display already blurs.
 */
const TAPS_FULL = 3
const TAPS_LITE = 1

function buildShader(taps: number) {
  // With a single tap there is no offset to interpolate across, so the loop
  // math has to avoid dividing by (taps - 1) == 0.
  const kExpr = taps > 1
    ? `(float(i) / float(${taps - 1})) - 0.5`
    : `0.0`

  return {
    uniforms: {
      tDiffuse:    { value: null as any },
      uTime:       { value: 0 },
      /** Corner fringe width in UV units, before velocity. */
      uAberration: { value: 0.0016 },
      /** 0..1 normalised deck speed. */
      uMotion:     { value: 0 },
      /** Unit vector, screen space, of the axis the cards travel along. */
      uMotionDir:  { value: new Vector2(0, 1) },
      uBarrel:     { value: 0.028 },
      uVignette:   { value: 0.28 },
      uGrain:      { value: 0.028 }
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
      uniform float uAberration;
      uniform float uMotion;
      uniform vec2  uMotionDir;
      uniform float uBarrel;
      uniform float uVignette;
      uniform float uGrain;
      varying vec2 vUv;

      // Cheap, well-distributed hash. Two dimensions of pixel plus one of time,
      // so the grain is different every frame instead of a fixed pattern that
      // reads as dirt on the screen.
      float hash(vec2 p, float t) {
        vec3 v = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195) + t);
        v += dot(v, v.yzx + 19.19);
        return fract((v.x + v.y) * v.z);
      }

      void main() {
        vec2 c = vUv - 0.5;
        float r2 = dot(c, c);

        // 1. Barrel. Everything below samples from the distorted coordinate,
        //    so the fringing inherits the bow rather than fighting it.
        vec2 uv = vUv + c * r2 * uBarrel;

        // 2. The static fringe: radial, r^2, zero at the optical centre.
        float fringe = uAberration * r2 * 4.0;
        vec2 radial  = normalize(c + 1e-6) * fringe;

        // 3. The moving fringe travels ALONG the axis, not outward. Feeding
        //    velocity into the radial term instead (the first attempt) made
        //    the card edges band into rainbows the moment the stack moved —
        //    a glitch effect, not an optic. Channels that trail each other
        //    along the direction of travel is what a real lens does, and it
        //    reads as speed rather than as damage.
        vec2 along = uMotionDir * uMotion * 0.010;
        vec2 trail = along * 0.35;

        // The smear: symmetric taps either side of the centre sample, so a
        // fast card reads as one object in motion rather than a ghosted double.
        vec3 sum = vec3(0.0);
        float wsum = 0.0;
        for (int i = 0; i < ${taps}; i++) {
          float k = ${kExpr};
          // Triangular weighting keeps the centre dominant, so detail survives.
          float w = 1.0 - abs(k) * 1.6;
          vec2 off = along * k;
          // Per-channel offsets: static radial fringe plus the moving trail.
          sum.r += texture2D(tDiffuse, uv + off + radial + trail).r * w;
          sum.g += texture2D(tDiffuse, uv + off).g * w;
          sum.b += texture2D(tDiffuse, uv + off - radial - trail).b * w;
          wsum += w;
        }
        vec3 col = sum / wsum;

        // 4a. Vignette. Smooth falloff rather than a hard ring — the corners
        //     should read as unlit, not masked.
        float v = smoothstep(0.92, 0.18, r2 * 2.0);
        col *= mix(1.0, v, uVignette);

        // 4b. Grain, gated by luminance so it lives in the mid-tones. Grain in
        //     the blacks is just noise on a near-black site, and grain in the
        //     highlights eats the bloom this pass was deliberately put after.
        float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
        float g = hash(gl_FragCoord.xy, uTime) - 0.5;
        col += g * uGrain * smoothstep(0.0, 0.35, lum) * (1.0 - smoothstep(0.6, 1.0, lum));

        gl_FragColor = vec4(col, 1.0);
      }
    `
  }
}

export interface LensOptions {
  /** Reduced motion: keep the optics, drop everything that moves. */
  calm?: boolean
  /** Phones and other bandwidth-poor GPUs: compile without the smear. */
  lite?: boolean
}

export function createLensPass(opts: LensOptions = {}) {
  // Reduced motion has nothing to smear either, so it takes the cheap build.
  const taps = (opts.lite || opts.calm) ? TAPS_LITE : TAPS_FULL
  const pass = new ShaderPass(buildShader(taps))
  const u = pass.uniforms

  if (opts.calm) {
    // The lens is still a lens — a still photograph has a vignette, grain and
    // corner fringing. What goes is everything that MOVES: the velocity
    // coupling and the smear. Someone who asked for less motion did not ask
    // for a worse-looking page.
    u.uAberration.value = 0.0014
    u.uGrain.value = 0.02
  }

  let motion = 0

  return {
    pass,
    /**
     * @param t     seconds
     * @param speed deck spring velocity in cards/sec — sign carries direction
     * @param dir   unit screen-space axis the cards travel along
     * @param dt    seconds since the previous frame
     */
    update(t: number, speed: number, dir: Vector2, dt = 1 / 60) {
      u.uTime.value = t
      if (opts.calm) return
      // Normalise against a flick that crosses ~6 cards a second, then ease
      // toward it. Easing matters: raw spring velocity is noisy at the instant
      // a finger lifts, and an un-eased uniform makes the fringe pop.
      // Eased against dt, not per frame, so the smear does not build up three
      // times faster on a 120Hz display than on a 40Hz one.
      const goal = Math.min(1, Math.abs(speed) / 6)
      motion += (goal - motion) * (1 - Math.pow(0.0001, dt))
      u.uMotion.value = motion
      // Sign the axis so the smear trails the travel rather than leading it.
      const s = speed < 0 ? -1 : 1
      u.uMotionDir.value.set(dir.x * s, dir.y * s)
    },
    dispose() { pass.dispose?.() }
  }
}

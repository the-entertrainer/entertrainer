/**
 * liquidGlass — a real Apple-style Liquid Glass renderer for the web.
 *
 * Built from the documented technique rather than a CSS blur fake:
 *
 *   1. Each panel is a rounded-rect signed distance field (Inigo Quilez's
 *      sdRoundBox).
 *   2. The surface normal is the *gradient* of that SDF, obtained by numerical
 *      differentiation — this is what makes the lensing follow the shape,
 *      including into the corners.
 *   3. A bevel profile `curve = pow(1 - band, 1.6)` concentrates the optics in
 *      a band at the edge, so the centre stays readable and the rim bends hard,
 *      exactly like a real lens.
 *   4. Refraction displaces where we sample the backdrop, by
 *      `grad * curve * refraction * maxDisp`.
 *   5. Dispersion samples R and B at opposite offsets around G.
 *   6. The normal is lifted into 3D as `vec3(grad * curve, 1 - curve)` and
 *      lit — giving Fresnel rim and a specular streak that slides as the light
 *      or the panel moves.
 *
 * The backdrop is procedural and evaluated *as a function*, so refraction can
 * simply call it at the displaced coordinate. That removes the framebuffer
 * round-trip (and the html2canvas hack most web implementations resort to),
 * which is what makes it cheap enough to run a dozen panels at 60fps.
 */

export type Backdrop =
  | 'mesh' | 'aurora' | 'waves' | 'grid' | 'spotlight' | 'rings' | 'strata' | 'bokeh'

export interface Panel {
  /** CSS pixels, relative to the canvas. */
  x: number; y: number; w: number; h: number; r: number
  /** 0 = flat, 1 = fully lifted (drives shadow + specular strength). */
  lift?: number
  /** Extra tint, 0..1 mix toward `tint`. */
  tintAmount?: number
}

export interface GlassOptions {
  canvas: HTMLCanvasElement
  backdrop?: Backdrop
  /** 3 backdrop colours + 1 glass tint, each '#rrggbb'. */
  colors?: [string, string, string]
  tint?: string
  /** Optical parameters. */
  refraction?: number     // 0.4–1.6
  aberration?: number     // 0–0.02
  specular?: number       // 0–2
  edge?: number           // bevel width in CSS px, 14–48
  /** Backdrop animation speed; 0 freezes it (reduced-motion). */
  speed?: number
  /** Background base darkness 0..1 (0 = as-authored). */
  vignette?: number
}

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#define MAX_PANELS 10

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;
uniform int   uCount;
uniform vec4  uRect[MAX_PANELS];   // x, y, w, h  (CSS px, y down from top)
uniform vec3  uMeta[MAX_PANELS];   // radius, lift, tintAmount
uniform vec3  uC1, uC2, uC3, uTint;
uniform float uRefract, uAberr, uSpec, uEdge, uMode, uVignette;

// ── helpers ────────────────────────────────────────────────────────────────
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}
mat2 rot(float a){ float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }

/**
 * The backdrop, as a pure function of position. Refraction calls this at a
 * displaced coordinate, which is why no framebuffer copy is needed.
 * q is in pixels with y measured downward.
 */
vec3 backdrop(vec2 q){
  vec2 a  = (q - 0.5 * uRes) / uRes.y;   // aspect-correct, centred
  float t = uTime;
  vec3 col;

  if (uMode < 0.5) {
    // mesh — four drifting metaball-ish colour wells
    vec2 p1 = vec2(sin(t*0.31)*0.42, cos(t*0.27)*0.30);
    vec2 p2 = vec2(cos(t*0.23+1.7)*0.50, sin(t*0.33+0.6)*0.34);
    vec2 p3 = vec2(sin(t*0.19+3.1)*0.38, cos(t*0.29+2.2)*0.42);
    float w1 = 1.0/(0.10+dot(a-p1,a-p1)*2.2);
    float w2 = 1.0/(0.10+dot(a-p2,a-p2)*2.2);
    float w3 = 1.0/(0.10+dot(a-p3,a-p3)*2.2);
    col = (uC1*w1 + uC2*w2 + uC3*w3) / (w1+w2+w3);
  } else if (uMode < 1.5) {
    // aurora — layered vertical curtains warped by fbm
    float n = fbm(vec2(a.x*2.0 + t*0.08, a.y*1.4 - t*0.05));
    float band = smoothstep(0.15, 0.9, n + a.y*0.5 + 0.4);
    float band2 = smoothstep(0.2, 0.95, fbm(vec2(a.x*3.1 - t*0.06, a.y*1.1 + 2.0)));
    col = mix(uC1, uC2, band);
    col = mix(col, uC3, band2 * 0.75);
  } else if (uMode < 2.5) {
    // waves — long interference ridges
    float w = sin(a.x*4.0 + t*0.5) * 0.5 + sin(a.y*5.5 - t*0.36) * 0.5
            + sin((a.x+a.y)*3.4 + t*0.28);
    float m = smoothstep(-1.2, 1.6, w);
    col = mix(uC1, uC2, m);
    col = mix(col, uC3, smoothstep(0.55, 1.4, w) * 0.8);
  } else if (uMode < 3.5) {
    // grid — technical plane with a travelling glow
    vec2 g = fract(a * 9.0) - 0.5;
    float line = smoothstep(0.46, 0.5, max(abs(g.x), abs(g.y)));
    float glow = exp(-length(a - vec2(sin(t*0.4)*0.5, cos(t*0.3)*0.3)) * 1.7);
    col = mix(uC1, uC2, glow);
    col = mix(col, uC3, line * 0.55);
  } else if (uMode < 4.5) {
    // spotlight — a single soft key that tracks the pointer
    vec2 lp = (uPointer - 0.5) * vec2(uRes.x/uRes.y, 1.0);
    float d = length(a - lp);
    col = mix(uC2, uC1, exp(-d * 1.35));
    col = mix(col, uC3, smoothstep(0.7, 1.5, d) * 0.7);
  } else if (uMode < 5.5) {
    // rings — concentric pulse
    float d = length(a) * 6.0 - t * 0.7;
    float r = sin(d) * 0.5 + 0.5;
    col = mix(uC1, uC2, r);
    col = mix(col, uC3, smoothstep(0.75, 1.0, r) * 0.6);
  } else if (uMode < 6.5) {
    // strata — geological bands, slowly shearing
    vec2 s = a * rot(0.32);
    float band = fract(s.y * 3.2 + fbm(s * 1.6 + t * 0.05) * 0.8);
    float step1 = smoothstep(0.0, 0.5, band), step2 = smoothstep(0.5, 1.0, band);
    col = mix(uC1, uC2, step1);
    col = mix(col, uC3, step2 * 0.85);
  } else {
    // bokeh — soft defocused discs
    col = uC1;
    for (int i = 0; i < 6; i++){
      float fi = float(i);
      vec2 c = vec2(sin(t*0.17 + fi*2.1)*0.55, cos(t*0.13 + fi*1.7)*0.4);
      float d = length(a - c);
      col = mix(col, mod(fi, 2.0) < 0.5 ? uC2 : uC3, exp(-d*d*26.0) * 0.75);
    }
  }

  // grain keeps flat gradients from banding on wide screens
  col += (hash(q + fract(t) * 91.0) - 0.5) * 0.016;
  float vig = smoothstep(1.35, 0.15, length(a));
  col *= mix(1.0 - uVignette, 1.0, vig);
  return col;
}

/** Inigo Quilez's rounded-box SDF. Negative inside. */
float sdRound(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main(){
  // gl_FragCoord is y-up; flip so it matches DOM coordinates.
  vec2 q = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec3 col = backdrop(q);

  for (int i = 0; i < MAX_PANELS; i++){
    if (i >= uCount) break;
    vec4 R = uRect[i];
    vec3 M = uMeta[i];
    vec2 hs   = R.zw * 0.5;
    vec2 cen  = R.xy + hs;
    vec2 p    = q - cen;

    float d = sdRound(p, hs, M.x);
    if (d > 2.0) continue;                       // outside + AA margin

    // Normal from the SDF gradient (numerical differentiation).
    float e = 1.5;
    vec2 grad = vec2(
      sdRound(p + vec2(e, 0.0), hs, M.x) - sdRound(p - vec2(e, 0.0), hs, M.x),
      sdRound(p + vec2(0.0, e), hs, M.x) - sdRound(p - vec2(0.0, e), hs, M.x)
    );
    grad = length(grad) > 1e-5 ? normalize(grad) : vec2(0.0);

    // Bevel: 1 at the very edge, 0 by the time we're uEdge px inside.
    float band  = clamp(-d / uEdge, 0.0, 1.0);
    float curve = pow(1.0 - band, 1.6);

    // Refraction — displace where we read the backdrop.
    float maxDisp = uEdge * 0.9;
    vec2  disp    = grad * curve * uRefract * maxDisp;
    // Dispersion — R and B pull apart around G.
    vec2  ca      = grad * curve * uAberr * 14.0;

    vec3 refr = vec3(
      backdrop(q + disp + ca).r,
      backdrop(q + disp).g,
      backdrop(q + disp - ca).b
    );

    // Lift the 2D gradient into a 3D normal and light it.
    vec3 n = normalize(vec3(grad * curve, 1.0 - curve * 0.85));
    vec3 L = normalize(vec3(uPointer.x * 2.0 - 1.0, -(uPointer.y * 2.0 - 1.0), 0.85));
    float spec   = pow(max(dot(n, L), 0.0), 12.0) * smoothstep(0.0, 0.9, curve);
    float fres   = pow(1.0 - abs(n.z), 2.2);

    vec3 glass = refr;
    glass = mix(glass, uTint, 0.05 + M.z * 0.28);            // body tint
    glass += vec3(1.0) * spec * uSpec * (0.55 + M.y * 0.9);  // specular streak
    glass += uTint * fres * 0.18;                            // Fresnel rim
    // Bright inner stroke right at the boundary — the "lip" of the glass.
    glass += vec3(1.0) * smoothstep(0.55, 1.0, curve) * 0.10;

    // Contact shadow just outside the panel, scaled by lift.
    float sh = smoothstep(0.0, 22.0 * (0.4 + M.y), d) ;
    vec3 shadowed = col * mix(0.62, 1.0, sh);
    col = mix(shadowed, glass, 1.0 - smoothstep(-1.0, 1.0, d));
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`

const MODE: Record<Backdrop, number> = {
  mesh: 0, aurora: 1, waves: 2, grid: 3, spotlight: 4, rings: 5, strata: 6, bokeh: 7
}

const hexToRgb = (h: string): [number, number, number] => {
  const s = h.replace('#', '')
  const n = s.length === 3 ? s.split('').map(c => c + c).join('') : s
  return [parseInt(n.slice(0, 2), 16) / 255, parseInt(n.slice(2, 4), 16) / 255, parseInt(n.slice(4, 6), 16) / 255]
}

export function createLiquidGlass(opts: GlassOptions) {
  const gl = opts.canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
  if (!gl) return null

  const mk = (t: number, src: string) => {
    const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s))
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog); gl.useProgram(prog)

  const buf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const U = (n: string) => gl.getUniformLocation(prog, n)
  const uRes = U('uRes'), uTime = U('uTime'), uPtr = U('uPointer'), uCount = U('uCount')
  const uRect = U('uRect'), uMeta = U('uMeta')

  const c = opts.colors ?? ['#2A2F6B', '#8E4FE0', '#101018']
  const setC = (name: string, hex: string) => gl.uniform3fv(U(name), hexToRgb(hex))
  setC('uC1', c[0]); setC('uC2', c[1]); setC('uC3', c[2] ?? '#101018')
  setC('uTint', opts.tint ?? '#FFFFFF')
  gl.uniform1f(U('uRefract'), opts.refraction ?? 0.95)
  gl.uniform1f(U('uAberr'), opts.aberration ?? 0.006)
  gl.uniform1f(U('uSpec'), opts.specular ?? 1.0)
  gl.uniform1f(U('uEdge'), opts.edge ?? 26)
  gl.uniform1f(U('uMode'), MODE[opts.backdrop ?? 'mesh'])
  gl.uniform1f(U('uVignette'), opts.vignette ?? 0.28)

  let panels: Panel[] = []
  const rectBuf = new Float32Array(10 * 4)
  const metaBuf = new Float32Array(10 * 3)
  const ptr = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 }
  let raf = 0, t0 = performance.now()
  const speed = opts.speed ?? 1

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const w = opts.canvas.clientWidth || innerWidth
    const h = opts.canvas.clientHeight || innerHeight
    opts.canvas.width = Math.floor(w * dpr); opts.canvas.height = Math.floor(h * dpr)
    gl!.viewport(0, 0, opts.canvas.width, opts.canvas.height)
    // Uniforms are in CSS px; the shader divides gl_FragCoord by dpr implicitly
    // by us passing the *device* resolution and scaling rects on upload.
    gl!.uniform2f(uRes, opts.canvas.width, opts.canvas.height)
  }
  const onPointer = (e: PointerEvent) => {
    ptr.tx = e.clientX / innerWidth; ptr.ty = e.clientY / innerHeight
  }
  addEventListener('resize', resize)
  addEventListener('pointermove', onPointer, { passive: true })
  resize()

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06
    const dpr = Math.min(devicePixelRatio || 1, 2)

    const n = Math.min(panels.length, 10)
    for (let i = 0; i < n; i++) {
      const p = panels[i]
      rectBuf[i * 4] = p.x * dpr; rectBuf[i * 4 + 1] = p.y * dpr
      rectBuf[i * 4 + 2] = p.w * dpr; rectBuf[i * 4 + 3] = p.h * dpr
      metaBuf[i * 3] = p.r * dpr
      metaBuf[i * 3 + 1] = p.lift ?? 0.5
      metaBuf[i * 3 + 2] = p.tintAmount ?? 0
    }
    gl!.uniform1i(uCount, n)
    gl!.uniform4fv(uRect, rectBuf)
    gl!.uniform3fv(uMeta, metaBuf)
    gl!.uniform1f(U('uEdge'), (opts.edge ?? 26) * dpr)
    gl!.uniform1f(uTime, ((now - t0) / 1000) * speed)
    gl!.uniform2f(uPtr, ptr.x, ptr.y)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }
  raf = requestAnimationFrame(frame)

  return {
    setPanels(p: Panel[]) { panels = p },
    dispose() {
      cancelAnimationFrame(raf)
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onPointer)
      gl!.deleteProgram(prog); gl!.deleteBuffer(buf)
    }
  }
}

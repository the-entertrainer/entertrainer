<script setup lang="ts">
// Hidden developer playground for tuning the fractal-glass backdrop live.
// Not linked anywhere — navigate to /glass-lab directly. Colours stay random
// (shuffle button); the "Copy config" button emits the non-colour settings to
// paste back so the live Backdrop can be tuned to match.
definePageMeta({ layout: false })
useHead({ title: 'Glass Lab' })

const canvas = ref<HTMLCanvasElement | null>(null)
const copied = ref(false)

const params = reactive({
  theme: 'dark' as 'dark' | 'light',
  algo: 0,                 // 0 = blobs, 1 = ellipses
  fluteWidth: 48,
  fluteStrength: 70,
  warp: 0.05,
  exposure: 1.10,
  grain: 0.07,
  timeScale: 1.0,
  freeze: false,
  phone: true,             // preview inside a 9:16 phone frame
})

// ── Palette pools (mirror Backdrop.ts) ──────────────────────────────────────
const DARK_PALETTES: number[][][] = [
  [[1.0,0.15,0.60],[0.15,0.90,1.00],[0.30,0.30,1.00],[0.70,0.20,1.00],[1.00,0.40,0.85]],
  [[1.0,0.50,0.15],[1.00,0.20,0.25],[1.00,0.78,0.20],[0.90,0.20,0.60],[0.50,0.15,0.65]],
  [[0.2,1.00,0.60],[0.10,0.80,0.95],[0.20,0.50,1.00],[0.50,1.00,0.80],[0.55,0.30,1.00]],
  [[1.0,0.30,0.10],[1.00,0.62,0.12],[1.00,0.85,0.30],[0.95,0.20,0.35],[0.60,0.10,0.25]],
  [[0.6,0.20,1.00],[1.00,0.20,0.80],[0.20,0.65,1.00],[0.95,0.45,1.00],[0.30,0.95,1.00]],
]
const LIGHT_PALETTES: number[][][] = [
  [[0.95,0.55,0.68],[0.55,0.80,1.00],[0.82,0.68,1.00],[1.00,0.78,0.60],[0.70,0.92,0.86]],
  [[0.60,0.92,0.86],[0.66,0.84,1.00],[0.86,0.78,1.00],[0.98,0.84,0.66],[0.80,0.94,0.90]],
  [[1.00,0.76,0.68],[0.84,0.74,1.00],[0.96,0.68,0.85],[0.74,0.86,1.00],[0.92,0.86,0.74]],
]
function genColors(theme: 'dark' | 'light'): number[][] {
  const pool = theme === 'dark' ? DARK_PALETTES : LIGHT_PALETTES
  const pal = pool[Math.floor(Math.random() * pool.length)]
  const scale = theme === 'dark' ? 1.0 : 0.62
  return pal.map(c => c.map(x => x * scale))
}
const baseFor = (theme: 'dark' | 'light') =>
  theme === 'dark' ? [0.005, 0.010, 0.055] : [0.58, 0.57, 0.60]

let colors = genColors('dark')
let seed = Math.random() * 10

function shuffleColours() { colors = genColors(params.theme) }
function randomizeAll() {
  params.algo = Math.random() < 0.5 ? 0 : 1
  params.fluteWidth = Math.round(28 + Math.random() * 58)
  params.fluteStrength = Math.round(34 + Math.random() * 86)
  params.warp = +(0.02 + Math.random() * 0.07).toFixed(3)
  params.exposure = +(params.theme === 'dark' ? 0.95 + Math.random() * 0.6 : 0.80 + Math.random() * 0.28).toFixed(2)
  params.grain = +((params.theme === 'dark' ? 0.05 : 0.04) + Math.random() * 0.045).toFixed(3)
  seed = Math.random() * 10
  shuffleColours()
}
watch(() => params.theme, () => { shuffleColours() })

const configText = computed(() => JSON.stringify({
  theme: params.theme,
  algo: params.algo,
  fluteWidth: params.fluteWidth,
  fluteStrength: params.fluteStrength,
  warp: +params.warp.toFixed(3),
  exposure: +params.exposure.toFixed(2),
  grain: +params.grain.toFixed(3),
  timeScale: +params.timeScale.toFixed(2),
}))

async function copyConfig() {
  try { await navigator.clipboard.writeText(configText.value) } catch { /* ignore */ }
  copied.value = true
  setTimeout(() => (copied.value = false), 1400)
}

// ── WebGL ────────────────────────────────────────────────────────────────────
const VS = `attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}`
const FS = `
precision highp float;
uniform float uTime,uWarpStrength,uFluteWidth,uFluteStrength,uToneMapExposure,uGrainStrength,uSeed,uAlgo;
uniform vec2 uResolution;
uniform vec3 uC1,uC2,uC3,uC4,uC5,uBase;
varying vec2 vUv;
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
 float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));
 return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*vnoise(p);p*=2.03;a*=0.5;}return v;}
float atanh_(float x){x=clamp(x,-0.9999,0.9999);return 0.5*log((1.0+x)/(1.0-x));}
vec2 rot(vec2 v,float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c)*v;}
vec2 warpN(vec2 uv){return vec2(fbm(uv*3.0+uSeed),fbm(uv*3.0+vec2(17.3,4.1)+uSeed));}
vec3 blobs(vec2 uv){
  float t=uTime*0.6+3.5+uSeed;
  vec2 p1=vec2(-0.28+sin(t*0.7+0.5)*0.15, 0.06+cos(t*0.5)*0.12);
  vec2 p2=vec2(-0.06+sin(t*0.4+1.2)*0.18, 0.16+cos(t*0.6)*0.15);
  vec2 p3=vec2( 0.07+sin(t*0.5+3.4)*0.2,  0.00+cos(t*0.4)*0.14);
  vec2 p4=vec2( 0.22+sin(t*0.3+2.3)*0.24,-0.10+cos(t*0.7)*0.14);
  vec2 p5=vec2( 0.30+sin(t*0.6+1.1)*0.18, 0.06+cos(t*0.4)*0.13);
  vec2 wn=warpN(vUv)*2.0-1.0; vec2 w=uv+wn*uWarpStrength;
  vec3 col=uBase;
  col+=uC1*exp(-dot(w-p1,w-p1)*12.0)*1.4;
  col+=uC2*exp(-dot(w-p2,w-p2)*20.0)*2.0;
  col+=uC3*exp(-dot(w-p3,w-p3)* 9.0)*1.6;
  col+=uC4*exp(-dot(w-p4,w-p4)*15.0)*1.3;
  col+=uC5*exp(-dot(w-p5,w-p5)*25.0)*0.8;
  return col;
}
vec3 ellipses(vec2 uv){
  float t=uTime*0.6+3.5+uSeed;
  vec2 p1=vec2(-0.32+sin(t*0.5+1.8)*0.20,-0.12+cos(t*0.8+0.3)*0.16);
  vec2 p2=vec2( 0.10+sin(t*0.6+2.5)*0.14, 0.24+cos(t*0.3+1.7)*0.18);
  vec2 p3=vec2(-0.15+sin(t*0.9+0.7)*0.22,-0.08+cos(t*0.5+2.9)*0.11);
  vec2 p4=vec2( 0.28+sin(t*0.4+3.1)*0.17, 0.18+cos(t*0.6+0.9)*0.20);
  vec2 p5=vec2(-0.05+sin(t*0.7+4.2)*0.13,-0.20+cos(t*0.9+1.5)*0.15);
  vec2 wn=warpN(vUv)*2.0-1.0; vec2 w=uv+vec2(wn.r*uWarpStrength,wn.g*uWarpStrength*0.2);
  vec2 r1=rot(w-p1,0.3),r2=rot(w-p2,-1.1),r3=rot(w-p3,0.8),r4=rot(w-p4,-0.5),r5=rot(w-p5,1.4);
  float e1=r1.x*r1.x*8.0+r1.y*r1.y*1.0, e2=r2.x*r2.x*25.0+r2.y*r2.y*12.0, e3=r3.x*r3.x*6.0+r3.y*r3.y*14.0, e4=r4.x*r4.x*20.0+r4.y*r4.y*8.0, e5=r5.x*r5.x*30.0+r5.y*r5.y*15.0;
  vec3 col=uBase;
  col+=uC1*exp(-e1)*1.4; col+=uC2*exp(-e2)*2.0; col+=uC3*exp(-e3)*1.6; col+=uC4*exp(-e4)*1.3; col+=uC5*exp(-e5)*0.8;
  return col;
}
void main(){
  vec2 frag=vUv*uResolution; vec2 mapped=frag-uResolution*0.5;
  vec2 scaled=mapped/uFluteWidth; vec2 fr=vec2(fract(scaled.x),scaled.y);
  float fx=uFluteStrength*(fr.x-0.5); float fy=-uFluteStrength*atanh_(pow(fr.x,6.0));
  vec2 fc=vec2(mapped.x+fx,mapped.y+fy); vec2 fuv=fc/uResolution.y;
  vec3 color=(uAlgo<0.5)?blobs(fuv):ellipses(fuv);
  color=1.0-exp(-color*uToneMapExposure);
  float g=hash21(vUv*uResolution+fract(uTime*0.5)*100.0)*2.0-1.0;
  color+=g*uGrainStrength*max(color.r,max(color.g,color.b));
  gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);
}`

let raf = 0
let gl: WebGLRenderingContext | null = null
let clock = 0
let last = 0

onMounted(() => {
  const cv = canvas.value!
  gl = cv.getContext('webgl', { antialias: true })
  if (!gl) return
  const compile = (type: number, src: string) => {
    const s = gl!.createShader(type)!; gl!.shaderSource(s, src); gl!.compileShader(s)
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) console.error(gl!.getShaderInfoLog(s))
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS))
  gl.linkProgram(prog); gl.useProgram(prog)
  const buf = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const U = (n: string) => gl!.getUniformLocation(prog, n)
  const u = {
    res: U('uResolution'), time: U('uTime'), warp: U('uWarpStrength'), fw: U('uFluteWidth'),
    fs: U('uFluteStrength'), exp: U('uToneMapExposure'), grain: U('uGrainStrength'),
    seed: U('uSeed'), algo: U('uAlgo'), base: U('uBase'),
    c: [U('uC1'), U('uC2'), U('uC3'), U('uC4'), U('uC5')],
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = cv.clientWidth, h = cv.clientHeight
    cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr)
    gl!.viewport(0, 0, cv.width, cv.height)
  }
  window.addEventListener('resize', resize)
  // observe the canvas box (phone frame toggling changes its size)
  const ro = new ResizeObserver(resize); ro.observe(cv)
  resize()

  last = performance.now()
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05); last = now
    if (!params.freeze) clock += dt * params.timeScale
    const g = gl!
    g.uniform2f(u.res, cv.width, cv.height)
    g.uniform1f(u.time, clock)
    g.uniform1f(u.warp, params.warp)
    g.uniform1f(u.fw, params.fluteWidth)
    g.uniform1f(u.fs, params.fluteStrength)
    g.uniform1f(u.exp, params.exposure)
    g.uniform1f(u.grain, params.grain)
    g.uniform1f(u.seed, seed)
    g.uniform1f(u.algo, params.algo)
    const b = baseFor(params.theme); g.uniform3f(u.base, b[0], b[1], b[2])
    for (let i = 0; i < 5; i++) g.uniform3f(u.c[i], colors[i][0], colors[i][1], colors[i][2])
    g.drawArrays(g.TRIANGLES, 0, 3)
  }
  raf = requestAnimationFrame(frame)

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    ro.disconnect()
  })
})
</script>

<template>
  <div class="lab" :class="params.theme">
    <div class="stage" :class="{ phone: params.phone }">
      <canvas ref="canvas" class="cv" />
    </div>

    <aside class="panel">
      <h1>Glass Lab</h1>
      <p class="hint">Tune freely. Colours are random — use Shuffle. Copy the config and paste it back to bake into the site.</p>

      <div class="row seg">
        <button :class="{ on: params.theme === 'dark' }"  @click="params.theme = 'dark'">Dark</button>
        <button :class="{ on: params.theme === 'light' }" @click="params.theme = 'light'">Light</button>
      </div>
      <div class="row seg">
        <button :class="{ on: params.algo === 0 }" @click="params.algo = 0">Blobs</button>
        <button :class="{ on: params.algo === 1 }" @click="params.algo = 1">Ellipses</button>
      </div>

      <label>Flute width <b>{{ params.fluteWidth }}</b>
        <input type="range" min="5" max="200" step="1" v-model.number="params.fluteWidth" />
      </label>
      <label>Flute strength <b>{{ params.fluteStrength }}</b>
        <input type="range" min="0" max="200" step="1" v-model.number="params.fluteStrength" />
      </label>
      <label>Warp <b>{{ params.warp.toFixed(3) }}</b>
        <input type="range" min="0" max="0.2" step="0.001" v-model.number="params.warp" />
      </label>
      <label>Exposure <b>{{ params.exposure.toFixed(2) }}</b>
        <input type="range" min="0.2" max="2" step="0.01" v-model.number="params.exposure" />
      </label>
      <label>Grain <b>{{ params.grain.toFixed(3) }}</b>
        <input type="range" min="0" max="0.3" step="0.001" v-model.number="params.grain" />
      </label>
      <label>Animation speed <b>{{ params.timeScale.toFixed(2) }}</b>
        <input type="range" min="0" max="2" step="0.01" v-model.number="params.timeScale" />
      </label>

      <div class="row checks">
        <label class="chk"><input type="checkbox" v-model="params.freeze" /> Freeze</label>
        <label class="chk"><input type="checkbox" v-model="params.phone" /> Phone frame</label>
      </div>

      <div class="row btns">
        <button @click="shuffleColours">Shuffle colours</button>
        <button @click="randomizeAll">Randomize all</button>
      </div>

      <div class="out">
        <textarea readonly rows="3" :value="configText" />
        <button class="copy" @click="copyConfig">{{ copied ? 'Copied ✓' : 'Copy config' }}</button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.lab { position: fixed; inset: 0; display: flex; background: #0b0b0d; color: #e9e9ee; font-family: var(--main-font, system-ui, sans-serif); }
.lab.light { background: #d7d6da; }
.stage { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.cv { width: 100%; height: 100%; display: block; }
.stage.phone .cv { width: auto; height: 92vh; aspect-ratio: 9 / 16; border-radius: 28px; box-shadow: 0 30px 80px -20px rgba(0,0,0,0.6); }

.panel {
  width: 320px; flex: 0 0 320px; height: 100%; overflow-y: auto;
  padding: 22px 20px; box-sizing: border-box;
  background: rgba(16,16,20,0.92); backdrop-filter: blur(8px);
  border-left: 1px solid rgba(255,255,255,0.08);
  display: flex; flex-direction: column; gap: 14px;
}
.panel h1 { font-size: 18px; margin: 0; font-weight: 700; letter-spacing: -0.02em; }
.hint { font-size: 12px; line-height: 1.5; opacity: 0.55; margin: 0; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; letter-spacing: 0.02em; opacity: 0.9; }
label b { font-weight: 600; color: #8ab4ff; font-variant-numeric: tabular-nums; }
input[type=range] { width: 100%; accent-color: #6f9bff; }
.row { display: flex; gap: 8px; }
.seg button { flex: 1; padding: 8px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: #e9e9ee; cursor: pointer; font-size: 12px; transition: background 0.15s, border-color 0.15s; }
.seg button.on { background: #6f9bff; border-color: #6f9bff; color: #08080c; font-weight: 600; }
.checks { font-size: 12px; }
.chk { flex-direction: row; align-items: center; gap: 6px; opacity: 0.85; }
.btns button { flex: 1; padding: 9px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color: #e9e9ee; cursor: pointer; font-size: 12px; }
.btns button:hover { background: rgba(255,255,255,0.1); }
.out { margin-top: 6px; display: flex; flex-direction: column; gap: 8px; }
textarea { width: 100%; box-sizing: border-box; resize: none; font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.5; padding: 10px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.12); background: #0d0d11; color: #b9c6ff; }
.copy { padding: 10px; border-radius: 9px; border: none; background: #6f9bff; color: #08080c; font-weight: 700; cursor: pointer; font-size: 13px; }
.copy:hover { background: #84acff; }

@media (max-width: 720px) {
  .lab { flex-direction: column-reverse; }
  .panel { width: 100%; flex-basis: auto; height: 50%; border-left: none; border-top: 1px solid rgba(255,255,255,0.08); }
  .stage.phone .cv { height: auto; width: 50vw; }
}
</style>

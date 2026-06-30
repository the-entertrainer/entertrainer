<script setup lang="ts">
// Hidden developer playground for tuning the fractal-glass backdrop live.
// Navigate to /glass-lab directly. Colours stay random (Shuffle); the "Copy
// config" button emits the non-colour settings to paste back so the live
// Backdrop can be tuned to match. Matches the arkon.digital demo's controls.
definePageMeta({ layout: false })
useHead({ title: 'Glass Lab' })

const canvas = ref<HTMLCanvasElement | null>(null)
const copied = ref(false)
const showPanel = ref(true)

const params = reactive({
  theme: 'dark' as 'dark' | 'light',
  algo: 0,                 // 0 = blobs, 1 = ellipses
  noiseScale1: 0.35,
  noiseScale2: 0.55,
  warp: 0.05,
  warpSpeed: 0.10,
  flowSpeed: 1.0,
  grain: 0.02,
  fluteWidth: 70,
  fluteStrength: 140,
  brightness: 1.0,
  freeze: false,
  phone: true,
})

// Vivid palettes (shared by both themes — the colour model differs, not hues).
const PALETTES: number[][][] = [
  [[1.0,0.15,0.60],[0.15,0.90,1.00],[0.30,0.30,1.00],[0.70,0.20,1.00],[1.00,0.40,0.85]],
  [[1.0,0.50,0.15],[1.00,0.20,0.25],[1.00,0.78,0.20],[0.90,0.20,0.60],[0.50,0.15,0.65]],
  [[0.2,1.00,0.60],[0.10,0.80,0.95],[0.20,0.50,1.00],[0.50,1.00,0.80],[0.55,0.30,1.00]],
  [[1.0,0.30,0.10],[1.00,0.62,0.12],[1.00,0.85,0.30],[0.95,0.20,0.35],[0.60,0.10,0.25]],
  [[0.6,0.20,1.00],[1.00,0.20,0.80],[0.20,0.65,1.00],[0.95,0.45,1.00],[0.30,0.95,1.00]],
]
const baseFor = (theme: 'dark' | 'light') =>
  theme === 'dark' ? [0.005, 0.010, 0.055] : [0.98, 0.97, 0.96]

let colors = PALETTES[0]
let seed = Math.random() * 10

function shuffleColours() { colors = PALETTES[Math.floor(Math.random() * PALETTES.length)] }
function randomizeAll() {
  params.algo = Math.random() < 0.5 ? 0 : 1
  params.noiseScale1 = +(0.25 + Math.random() * 0.35).toFixed(2)
  params.noiseScale2 = +(0.40 + Math.random() * 0.40).toFixed(2)
  params.warp = +(0.03 + Math.random() * 0.07).toFixed(3)
  params.warpSpeed = +(0.06 + Math.random() * 0.10).toFixed(2)
  params.flowSpeed = +(0.7 + Math.random() * 0.5).toFixed(2)
  params.grain = +((params.theme === 'dark' ? 0.015 : 0.012) + Math.random() * 0.015).toFixed(3)
  params.fluteWidth = Math.round(42 + Math.random() * 70)
  params.fluteStrength = Math.round(80 + Math.random() * 80)
  params.brightness = +(params.theme === 'dark' ? 0.9 + Math.random() * 0.35 : 0.66 + Math.random() * 0.22).toFixed(2)
  seed = Math.random() * 10
  shuffleColours()
}
watch(() => params.theme, (th) => {
  shuffleColours()
  params.brightness = th === 'dark' ? 1.0 : 0.78   // sensible starting point per mode
})

const configText = computed(() => JSON.stringify({
  theme: params.theme,
  algo: params.algo,
  noiseScale1: +params.noiseScale1.toFixed(2),
  noiseScale2: +params.noiseScale2.toFixed(2),
  warp: +params.warp.toFixed(3),
  warpSpeed: +params.warpSpeed.toFixed(2),
  flowSpeed: +params.flowSpeed.toFixed(2),
  grain: +params.grain.toFixed(3),
  fluteWidth: params.fluteWidth,
  fluteStrength: params.fluteStrength,
  brightness: +params.brightness.toFixed(2),
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
uniform float uTime,uWarpStrength,uWarpSpeed,uNoiseScaleX,uNoiseScaleY,uFlowSpeed;
uniform float uFluteWidth,uFluteStrength,uBrightness,uGrainStrength,uSeed,uAlgo,uLight;
uniform vec2 uResolution,uPointer;
uniform vec3 uC1,uC2,uC3,uC4,uC5,uBase;
varying vec2 vUv;
vec3 permute(vec3 x){return mod((x*34.0+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);
}
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float atanh_(float x){x=clamp(x,-0.9999,0.9999);return 0.5*log((1.0+x)/(1.0-x));}
vec2 rot(vec2 v,float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c)*v;}
vec2 warpVec(vec2 p){float t=uTime*uWarpSpeed;vec2 sc=vec2(uNoiseScaleX,uNoiseScaleY)*4.0;return vec2(snoise(p*sc+t*0.5),snoise(p*sc*0.93-t*0.3));}
vec4 field(vec2 uv){
  float t=uTime*0.6*uFlowSpeed+3.5+uSeed;
  if(uAlgo<0.5){
    vec2 p1=vec2(-0.28+sin(t*0.7+0.5)*0.15,0.06+cos(t*0.5)*0.12),p2=vec2(-0.06+sin(t*0.4+1.2)*0.18,0.16+cos(t*0.6)*0.15),p3=vec2(0.07+sin(t*0.5+3.4)*0.2,0.00+cos(t*0.4)*0.14),p4=vec2(0.22+sin(t*0.3+2.3)*0.24,-0.10+cos(t*0.7)*0.14),p5=vec2(0.30+sin(t*0.6+1.1)*0.18,0.06+cos(t*0.4)*0.13);
    float g1=exp(-dot(uv-p1,uv-p1)*12.0)*1.4,g2=exp(-dot(uv-p2,uv-p2)*20.0)*2.0,g3=exp(-dot(uv-p3,uv-p3)*9.0)*1.6,g4=exp(-dot(uv-p4,uv-p4)*15.0)*1.3,g5=exp(-dot(uv-p5,uv-p5)*25.0)*0.8;
    return vec4(uC1*g1+uC2*g2+uC3*g3+uC4*g4+uC5*g5,g1+g2+g3+g4+g5);
  } else {
    vec2 p1=vec2(-0.32+sin(t*0.5+1.8)*0.20,-0.12+cos(t*0.8+0.3)*0.16),p2=vec2(0.10+sin(t*0.6+2.5)*0.14,0.24+cos(t*0.3+1.7)*0.18),p3=vec2(-0.15+sin(t*0.9+0.7)*0.22,-0.08+cos(t*0.5+2.9)*0.11),p4=vec2(0.28+sin(t*0.4+3.1)*0.17,0.18+cos(t*0.6+0.9)*0.20),p5=vec2(-0.05+sin(t*0.7+4.2)*0.13,-0.20+cos(t*0.9+1.5)*0.15);
    vec2 r1=rot(uv-p1,0.3),r2=rot(uv-p2,-1.1),r3=rot(uv-p3,0.8),r4=rot(uv-p4,-0.5),r5=rot(uv-p5,1.4);
    float g1=exp(-(r1.x*r1.x*8.0+r1.y*r1.y*1.0))*1.4,g2=exp(-(r2.x*r2.x*25.0+r2.y*r2.y*12.0))*2.0,g3=exp(-(r3.x*r3.x*6.0+r3.y*r3.y*14.0))*1.6,g4=exp(-(r4.x*r4.x*20.0+r4.y*r4.y*8.0))*1.3,g5=exp(-(r5.x*r5.x*30.0+r5.y*r5.y*15.0))*0.8;
    return vec4(uC1*g1+uC2*g2+uC3*g3+uC4*g4+uC5*g5,g1+g2+g3+g4+g5);
  }
}
void main(){
  vec2 ar=vec2(uResolution.x/uResolution.y,1.0);
  vec2 frag=vUv*uResolution;vec2 mapped=frag-uResolution*0.5;
  vec2 scaled=mapped/uFluteWidth;vec2 fr=vec2(fract(scaled.x),scaled.y);
  float fx=uFluteStrength*(fr.x-0.5);float fy=-uFluteStrength*atanh_(pow(fr.x,6.0));
  vec2 fc=vec2(mapped.x+fx,mapped.y+fy);vec2 fuv=fc/uResolution.y+uPointer*0.01;
  vec2 warp=warpVec(vUv*ar)*uWarpStrength;
  vec4 fld=field(fuv+warp);vec3 glow=fld.rgb;float totalG=fld.a;
  vec3 col;
  if(uLight>0.5){vec3 ink=(vec3(totalG)-glow)*uBrightness;col=uBase-ink;}
  else{col=uBase+glow;col=1.0-exp(-col*uBrightness);}
  float gr=hash21(vUv*uResolution+fract(uTime*0.5)*100.0)*2.0-1.0;
  col+=gr*uGrainStrength*max(col.r,max(col.g,col.b));
  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`

let raf = 0
let clock = 0
let last = 0

onMounted(() => {
  const cv = canvas.value!
  const gl = cv.getContext('webgl', { antialias: true })
  if (!gl) return
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s))
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
  const U = (n: string) => gl.getUniformLocation(prog, n)
  const u = {
    res: U('uResolution'), time: U('uTime'), warp: U('uWarpStrength'), wspeed: U('uWarpSpeed'),
    nsx: U('uNoiseScaleX'), nsy: U('uNoiseScaleY'), flow: U('uFlowSpeed'),
    fw: U('uFluteWidth'), fs: U('uFluteStrength'), bright: U('uBrightness'), grain: U('uGrainStrength'),
    seed: U('uSeed'), algo: U('uAlgo'), light: U('uLight'), base: U('uBase'),
    c: [U('uC1'), U('uC2'), U('uC3'), U('uC4'), U('uC5')],
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = Math.floor(cv.clientWidth * dpr); cv.height = Math.floor(cv.clientHeight * dpr)
    gl.viewport(0, 0, cv.width, cv.height)
  }
  window.addEventListener('resize', resize)
  const ro = new ResizeObserver(resize); ro.observe(cv)
  resize()

  last = performance.now()
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05); last = now
    if (!params.freeze) clock += dt
    gl.uniform2f(u.res, cv.width, cv.height)
    gl.uniform1f(u.time, clock)
    gl.uniform1f(u.warp, params.warp)
    gl.uniform1f(u.wspeed, params.warpSpeed)
    gl.uniform1f(u.nsx, params.noiseScale1)
    gl.uniform1f(u.nsy, params.noiseScale2)
    gl.uniform1f(u.flow, params.flowSpeed)
    gl.uniform1f(u.fw, params.fluteWidth)
    gl.uniform1f(u.fs, params.fluteStrength)
    gl.uniform1f(u.bright, params.brightness)
    gl.uniform1f(u.grain, params.grain)
    gl.uniform1f(u.seed, seed)
    gl.uniform1f(u.algo, params.algo)
    gl.uniform1f(u.light, params.theme === 'light' ? 1 : 0)
    const b = baseFor(params.theme); gl.uniform3f(u.base, b[0], b[1], b[2])
    for (let i = 0; i < 5; i++) gl.uniform3f(u.c[i], colors[i][0], colors[i][1], colors[i][2])
    gl.drawArrays(gl.TRIANGLES, 0, 3)
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

    <button class="glass-btn glass-btn--ghost fab" style="position:fixed; bottom:20rem; right:20rem; z-index:100;" @click="showPanel = !showPanel">{{ showPanel ? 'Hide ▾' : 'Tune ▴' }}</button>

    <aside class="glass-panel panel" :class="{ open: showPanel }">
      <h1>Glass Lab</h1>
      <p class="hint">Tune freely. Colours are random — use Shuffle. Copy the config and paste it back to bake into the site.</p>

      <div class="row seg">
        <button class="glass-chip" :class="{ active: params.theme === 'dark' }"  @click="params.theme = 'dark'">Dark</button>
        <button class="glass-chip" :class="{ active: params.theme === 'light' }" @click="params.theme = 'light'">Light</button>
      </div>
      <div class="row seg">
        <button class="glass-chip" :class="{ active: params.algo === 0 }" @click="params.algo = 0">Blobs</button>
        <button class="glass-chip" :class="{ active: params.algo === 1 }" @click="params.algo = 1">Ellipses</button>
      </div>

      <label>Noise scale 1 <b>{{ params.noiseScale1.toFixed(2) }}</b>
        <input type="range" min="0.05" max="2" step="0.01" v-model.number="params.noiseScale1" />
      </label>
      <label>Noise scale 2 <b>{{ params.noiseScale2.toFixed(2) }}</b>
        <input type="range" min="0.05" max="2" step="0.01" v-model.number="params.noiseScale2" />
      </label>
      <label>Warp strength <b>{{ params.warp.toFixed(3) }}</b>
        <input type="range" min="0" max="0.3" step="0.001" v-model.number="params.warp" />
      </label>
      <label>Warp speed <b>{{ params.warpSpeed.toFixed(2) }}</b>
        <input type="range" min="0" max="1" step="0.01" v-model.number="params.warpSpeed" />
      </label>
      <label>Flow speed <b>{{ params.flowSpeed.toFixed(2) }}</b>
        <input type="range" min="0" max="2" step="0.01" v-model.number="params.flowSpeed" />
      </label>
      <label>Film grain <b>{{ params.grain.toFixed(3) }}</b>
        <input type="range" min="0" max="0.3" step="0.001" v-model.number="params.grain" />
      </label>
      <label>Flute width <b>{{ params.fluteWidth }}</b>
        <input type="range" min="5" max="200" step="1" v-model.number="params.fluteWidth" />
      </label>
      <label>Flute refraction <b>{{ params.fluteStrength }}</b>
        <input type="range" min="0" max="200" step="1" v-model.number="params.fluteStrength" />
      </label>
      <label>Brightness <b>{{ params.brightness.toFixed(2) }}</b>
        <input type="range" min="0.2" max="2" step="0.01" v-model.number="params.brightness" />
      </label>

      <div class="row checks">
        <label class="chk"><input type="checkbox" v-model="params.freeze" /> Freeze</label>
        <label class="chk"><input type="checkbox" v-model="params.phone" /> Phone frame</label>
      </div>

      <div class="row btns">
        <button class="glass-btn glass-btn--ghost" style="font-size:12rem;" @click="shuffleColours">Shuffle colours</button>
        <button class="glass-btn glass-btn--ghost" style="font-size:12rem;" @click="randomizeAll">Randomize all</button>
      </div>

      <div class="out">
        <textarea readonly rows="4" class="glass-field" :value="configText" />
        <button class="glass-chip" @click="copyConfig">{{ copied ? 'Copied ✓' : 'Copy config' }}</button>
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
  display: flex; flex-direction: column; gap: 13px;
}
.panel h1 { font-size: 18px; margin: 0; font-weight: 700; letter-spacing: -0.02em; }
.hint { font-size: 12px; line-height: 1.5; opacity: 0.55; margin: 0; }
label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; letter-spacing: 0.02em; opacity: 0.9; }
label b { font-weight: 600; color: #8ab4ff; font-variant-numeric: tabular-nums; }
input[type=range] { width: 100%; accent-color: #6f9bff; }
.row { display: flex; gap: 8px; }
.seg button { flex: 1; padding: 8px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: #e9e9ee; cursor: pointer; font-size: 12px; transition: background 0.15s, border-color 0.15s; }
.seg button.on { background: #6f9bff; border-color: #6f9bff; color: #08080c; font-weight: 600; }
.checks { font-size: 12px; }
.chk { flex-direction: row; align-items: center; gap: 6px; opacity: 0.85; }
.btns button { flex: 1; padding: 9px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color: #e9e9ee; cursor: pointer; font-size: 12px; }
.btns button:hover { background: rgba(255,255,255,0.1); }
.out { margin-top: 4px; display: flex; flex-direction: column; gap: 8px; }
textarea { width: 100%; box-sizing: border-box; resize: none; font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.5; padding: 10px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.12); background: #0d0d11; color: #b9c6ff; }
.copy { padding: 10px; border-radius: 9px; border: none; background: #6f9bff; color: #08080c; font-weight: 700; cursor: pointer; font-size: 13px; }
.copy:hover { background: #84acff; }

.fab { display: none; }

@media (max-width: 720px) {
  .lab { display: block; }
  .stage { position: fixed; inset: 0; }
  .stage.phone .cv { width: 100%; height: 100%; aspect-ratio: auto; border-radius: 0; box-shadow: none; }

  .fab {
    display: inline-flex; align-items: center; gap: 6px;
    position: fixed; z-index: 3;
    top: calc(12px + env(safe-area-inset-top)); right: 14px;
    padding: 10px 16px; border-radius: 999px; border: none;
    background: #6f9bff; color: #08080c; font-weight: 700; font-size: 13px;
    box-shadow: 0 8px 24px -6px rgba(0,0,0,0.5); cursor: pointer;
  }

  .panel {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 2;
    width: 100%; flex-basis: auto; height: auto; max-height: 78vh;
    border-left: none; border-top: 1px solid rgba(255,255,255,0.1);
    border-radius: 18px 18px 0 0;
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
    transform: translateY(100%); transition: transform 0.32s cubic-bezier(0.22,1,0.36,1);
    -webkit-overflow-scrolling: touch;
  }
  .panel.open { transform: translateY(0); }
  .panel h1 { display: none; }

  input[type=range] { height: 32px; }
  .seg button, .btns button { padding: 13px; font-size: 13px; }
  .chk { padding: 4px 0; }
  .copy { padding: 14px; font-size: 14px; }
}
</style>

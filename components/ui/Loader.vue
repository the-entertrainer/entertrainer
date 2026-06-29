<script setup lang="ts">
import gsap from 'gsap'
import { useExperienceStore } from '~/stores/experience'
import { useThemeStore } from '~/stores/theme'

const emit = defineEmits<{ (e: 'entered'): void }>()

const experienceStore = useExperienceStore()
const themeStore       = useThemeStore()
const isReady          = computed(() => experienceStore.isReady)

const loaderEl = ref<HTMLElement | null>(null)
const textEl   = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

const reduceMotion = import.meta.client &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let introDone = false, pendingExit = false, exitQueued = false, exiting = false
let rafId = 0, glClock = 0, glLast = 0
let stopGlass: (() => void) | null = null

// ── Fractal-glass background (same effect as the site backdrop) ──────────────
const PALETTES = [
  [[1.0,0.15,0.60],[0.15,0.90,1.00],[0.30,0.30,1.00],[0.70,0.20,1.00],[1.00,0.40,0.85]],
  [[1.0,0.50,0.15],[1.00,0.20,0.25],[1.00,0.78,0.20],[0.90,0.20,0.60],[0.50,0.15,0.65]],
  [[0.2,1.00,0.60],[0.10,0.80,0.95],[0.20,0.50,1.00],[0.50,1.00,0.80],[0.55,0.30,1.00]],
  [[1.0,0.30,0.10],[1.00,0.62,0.12],[1.00,0.85,0.30],[0.95,0.20,0.35],[0.60,0.10,0.25]],
  [[0.6,0.20,1.00],[1.00,0.20,0.80],[0.20,0.65,1.00],[0.95,0.45,1.00],[0.30,0.95,1.00]],
]
const FS = `
precision highp float;
uniform float uTime,uWarp,uWSpeed,uNSX,uNSY,uFlute,uRefr,uBright,uGrain,uSeed,uAlgo,uLight;
uniform vec2 uRes; uniform vec3 uC1,uC2,uC3,uC4,uC5,uBase; varying vec2 vUv;
vec3 permute(vec3 x){return mod((x*34.0+1.0)*x,289.0);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
 vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
 vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
 vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
 vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
 vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
 m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
 vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float atanh_(float x){x=clamp(x,-0.9999,0.9999);return 0.5*log((1.0+x)/(1.0-x));}
vec2 rot(vec2 v,float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c)*v;}
vec2 warpVec(vec2 p){float t=uTime*uWSpeed;vec2 sc=vec2(uNSX,uNSY)*4.0;return vec2(snoise(p*sc+t*0.5),snoise(p*sc*0.93-t*0.3));}
vec4 field(vec2 uv){float t=uTime*1.2+3.5+uSeed;
 if(uAlgo<0.5){vec2 p1=vec2(-0.28+sin(t*0.7+0.5)*0.15,0.06+cos(t*0.5)*0.12),p2=vec2(-0.06+sin(t*0.4+1.2)*0.18,0.16+cos(t*0.6)*0.15),p3=vec2(0.07+sin(t*0.5+3.4)*0.2,0.0+cos(t*0.4)*0.14),p4=vec2(0.22+sin(t*0.3+2.3)*0.24,-0.1+cos(t*0.7)*0.14),p5=vec2(0.3+sin(t*0.6+1.1)*0.18,0.06+cos(t*0.4)*0.13);
  float g1=exp(-dot(uv-p1,uv-p1)*12.0)*1.4,g2=exp(-dot(uv-p2,uv-p2)*20.0)*2.0,g3=exp(-dot(uv-p3,uv-p3)*9.0)*1.6,g4=exp(-dot(uv-p4,uv-p4)*15.0)*1.3,g5=exp(-dot(uv-p5,uv-p5)*25.0)*0.8;
  return vec4(uC1*g1+uC2*g2+uC3*g3+uC4*g4+uC5*g5,g1+g2+g3+g4+g5);}
 vec2 p1=vec2(-0.32+sin(t*0.5+1.8)*0.2,-0.12+cos(t*0.8+0.3)*0.16),p2=vec2(0.1+sin(t*0.6+2.5)*0.14,0.24+cos(t*0.3+1.7)*0.18),p3=vec2(-0.15+sin(t*0.9+0.7)*0.22,-0.08+cos(t*0.5+2.9)*0.11),p4=vec2(0.28+sin(t*0.4+3.1)*0.17,0.18+cos(t*0.6+0.9)*0.2),p5=vec2(-0.05+sin(t*0.7+4.2)*0.13,-0.2+cos(t*0.9+1.5)*0.15);
 vec2 r1=rot(uv-p1,0.3),r2=rot(uv-p2,-1.1),r3=rot(uv-p3,0.8),r4=rot(uv-p4,-0.5),r5=rot(uv-p5,1.4);
 float g1=exp(-(r1.x*r1.x*8.0+r1.y*r1.y))*1.4,g2=exp(-(r2.x*r2.x*25.0+r2.y*r2.y*12.0))*2.0,g3=exp(-(r3.x*r3.x*6.0+r3.y*r3.y*14.0))*1.6,g4=exp(-(r4.x*r4.x*20.0+r4.y*r4.y*8.0))*1.3,g5=exp(-(r5.x*r5.x*30.0+r5.y*r5.y*15.0))*0.8;
 return vec4(uC1*g1+uC2*g2+uC3*g3+uC4*g4+uC5*g5,g1+g2+g3+g4+g5);}
void main(){vec2 ar=vec2(uRes.x/uRes.y,1.0);vec2 frag=vUv*uRes;vec2 mapped=frag-uRes*0.5;
 vec2 sc=mapped/uFlute;vec2 fr=vec2(fract(sc.x),sc.y);
 float fx=uRefr*(fr.x-0.5);float fy=-uRefr*atanh_(pow(fr.x,6.0));
 vec2 fuv=vec2(mapped.x+fx,mapped.y+fy)/uRes.y;
 vec2 warp=warpVec(vUv*ar)*uWarp;vec4 fld=field(fuv+warp);vec3 glow=fld.rgb;float tot=fld.a;
 vec3 col;if(uLight>0.5){col=uBase-(vec3(tot)-glow)*uBright;}else{col=uBase+glow;col=1.0-exp(-col*uBright);}
 float gr=hash21(vUv*uRes+fract(uTime*0.5)*100.0)*2.0-1.0;col+=gr*uGrain*max(col.r,max(col.g,col.b));
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);}`

function startGlass() {
  const cv = canvasEl.value
  if (!cv) return
  const gl = cv.getContext('webgl', { antialias: true })
  if (!gl) return
  const vs = `attribute vec2 a;varying vec2 vUv;void main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}`
  const mk = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o }
  const pr = gl.createProgram()!; gl.attachShader(pr, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr)
  const b = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW)
  const la = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0)
  const U = (n: string) => gl.getUniformLocation(pr, n)
  const dark = themeStore.isDark
  const pal = PALETTES[Math.floor(Math.random() * PALETTES.length)]
  const r = Math.random
  gl.uniform1f(U('uWarp'), 0.03 + r() * 0.06); gl.uniform1f(U('uWSpeed'), 0.08 + r() * 0.08)
  gl.uniform1f(U('uNSX'), 0.3 + r() * 0.3); gl.uniform1f(U('uNSY'), 0.45 + r() * 0.35)
  gl.uniform1f(U('uFlute'), 100); gl.uniform1f(U('uRefr'), 90 + r() * 70)
  gl.uniform1f(U('uBright'), dark ? 1.1 : 0.2); gl.uniform1f(U('uGrain'), 0.07)
  gl.uniform1f(U('uSeed'), r() * 10); gl.uniform1f(U('uAlgo'), r() < 0.5 ? 0 : 1); gl.uniform1f(U('uLight'), dark ? 0 : 1)
  gl.uniform3f(U('uBase'), ...(dark ? [0.005, 0.01, 0.055] : [0.98, 0.97, 0.96]) as [number, number, number])
  ;[U('uC1'), U('uC2'), U('uC3'), U('uC4'), U('uC5')].forEach((l, i) => gl.uniform3f(l, pal[i][0], pal[i][1], pal[i][2]))

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = Math.floor(window.innerWidth * dpr); cv.height = Math.floor(window.innerHeight * dpr)
    gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('uRes'), cv.width, cv.height)
  }
  window.addEventListener('resize', resize); resize()
  glLast = performance.now()
  const frame = (now: number) => {
    rafId = requestAnimationFrame(frame)
    glClock += Math.min((now - glLast) / 1000, 0.05); glLast = now
    gl.uniform1f(U('uTime'), glClock); gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  rafId = requestAnimationFrame(frame)
  stopGlass = () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize) }
}

onMounted(async () => {
  if (import.meta.client && (document as any).fonts?.ready) { try { await (document as any).fonts.ready } catch {} }
  await nextTick()
  startGlass()
  startIntro()
})
onUnmounted(() => stopGlass?.())

function startIntro() {
  if (!textEl.value) return
  if (reduceMotion) {
    gsap.set(textEl.value, { opacity: 1, y: 0 }); introDone = true
    if (pendingExit) queueExit(); return
  }
  gsap.fromTo(textEl.value,
    { opacity: 0, y: 18, filter: 'blur(8px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', delay: 0.25,
      onComplete: () => { introDone = true; if (pendingExit) queueExit() } })
}

watch(isReady, (ready) => { if (ready) queueExit() })

function queueExit() {
  if (exitQueued || exiting) return
  if (!introDone) { pendingExit = true; return }
  exitQueued = true
  setTimeout(runExit, 900)
}

// Netflix-style banded reveal: the loader splits into vertical bands that open
// from their centres in a left-to-right stagger, unveiling the spiral behind.
function runExit() {
  if (exiting || !loaderEl.value) return
  exiting = true
  const el = loaderEl.value

  if (reduceMotion) {
    experienceStore.setHasEntered()
    gsap.to(el, { opacity: 0, duration: 0.4, onComplete: () => emit('entered') })
    return
  }

  const N = 14
  const bandW = window.innerWidth / N
  const setMask = (open: number[]) => {
    // For each band, an opaque core of width (bandW - gap) centred in the band.
    const stops = open.map((g, i) => {
      const x0 = i * bandW, half = g * 0.5
      const a = (x0 + half).toFixed(1), bnd = (x0 + bandW - half).toFixed(1)
      return `transparent ${x0}px, transparent ${a}px, #000 ${a}px, #000 ${bnd}px, transparent ${bnd}px`
    }).join(', ')
    const grad = `linear-gradient(90deg, ${stops})`
    el.style.webkitMaskImage = grad; el.style.maskImage = grad
  }

  const gaps = new Array(N).fill(0)
  const tl = gsap.timeline({ onComplete: () => emit('entered') })

  // wordmark lifts away first
  tl.to(textEl.value, { opacity: 0, y: -24, filter: 'blur(6px)', duration: 0.4, ease: 'power2.in' }, 0)
    .add(() => experienceStore.setHasEntered(), 0.25)

  // bands split open, staggered left → right
  gaps.forEach((_, i) => {
    tl.to(gaps, {
      [i]: bandW, duration: 0.7, ease: 'power3.inOut',
      onUpdate: () => setMask(gaps),
    }, 0.3 + i * 0.035)
  })
}
</script>

<template>
  <div ref="loaderEl" class="eloader">
    <canvas ref="canvasEl" class="eloader-glass" />
    <div class="wm" :class="{ 'wm-onlight': !themeStore.isDark }">
      <span ref="textEl" class="wm-text"><em>enter</em><b>trainer</b></span>
    </div>
  </div>
</template>

<style scoped>
.eloader {
  position: fixed;
  inset: 0;
  z-index: var(--z-loader);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}
.eloader-glass {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.wm {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: baseline;
  font-size: clamp(40px, 11vw, 84px);
  font-weight: 400;
  letter-spacing: -0.045em;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.5);
}
.wm.wm-onlight {
  color: #0d0c0a;
  text-shadow: 0 2px 30px rgba(255, 255, 255, 0.6), 0 1px 2px rgba(255, 255, 255, 0.7);
}
.wm-text { display: inline-block; }
.wm-text em { font-style: italic; font-weight: 400; }
.wm-text b  { font-style: normal; font-weight: 700; }
</style>

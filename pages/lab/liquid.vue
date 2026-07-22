<script setup lang="ts">
import * as THREE from 'three'
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Liquid Displacement — Lab', robots: 'noindex' })

const cv = ref<HTMLCanvasElement | null>(null)
const idx = ref(0)
const router = useRouter()
let renderer: THREE.WebGLRenderer, scene: THREE.Scene, cam: THREE.OrthographicCamera
let mat: THREE.ShaderMaterial, raf = 0, transitioning = false
const textures: THREE.Texture[] = []
const mouse = new THREE.Vector2(0.5, 0.5)
const mouseT = new THREE.Vector2(0.5, 0.5)

const frag = /* glsl */`
precision highp float;
uniform sampler2D t0,t1; uniform float prog,uTime,a0,a1,scr; uniform vec2 uMouse; varying vec2 vUv;
vec3 permute(vec3 x){return mod((x*34.0+1.0)*x,289.0);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865,0.366025403,-0.577350269,0.024390243);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a=x-ox;m*=1.79284291-0.85373472*(a*a+h*h);vec3 g;g.x=a.x*x0.x+h.x*x0.y;g.yz=a.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}
vec2 cover(vec2 uv,float ia){float r=ia/scr;vec2 s=r>1.0?vec2(r,1.0):vec2(1.0,1.0/r);return (uv-0.5)*s+0.5;}
void main(){
  float n=snoise(vUv*2.5+uTime*0.15);
  float md=distance(vUv,uMouse); float ripple=smoothstep(0.35,0.0,md)*0.06;
  vec2 disp=vec2(n)*(0.16)+ripple;
  float p=smoothstep(0.0,1.0,prog);
  vec4 c0=texture2D(t0,cover(vUv+disp*p,a0));
  vec4 c1=texture2D(t1,cover(vUv-disp*(1.0-p),a1));
  float edge=smoothstep(0.35,0.65,p+n*0.18);
  gl_FragColor=mix(c0,c1,edge);
}`
const vert = `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.0,1.0);}`

function next() {
  if (transitioning) return
  transitioning = true
  const from = idx.value, to = (idx.value + 1) % LAB_NAV.length
  mat.uniforms.t0.value = textures[from]; mat.uniforms.a0.value = aspect(textures[from])
  mat.uniforms.t1.value = textures[to];   mat.uniforms.a1.value = aspect(textures[to])
  const o = { p: 0 }
  const start = performance.now()
  const dur = 1100
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / dur)
    mat.uniforms.prog.value = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    if (t < 1) requestAnimationFrame(step)
    else { idx.value = to; mat.uniforms.t0.value = textures[to]; mat.uniforms.a0.value = aspect(textures[to]); mat.uniforms.prog.value = 0; transitioning = false }
  }
  requestAnimationFrame(step)
}
function aspect(t: THREE.Texture) { const im = t.image as HTMLImageElement; return im && im.width ? im.width / im.height : 1 }

let downX = 0, moved = false
function onDown(e: PointerEvent) { downX = e.clientX; moved = false }
function onMove(e: PointerEvent) { mouseT.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight); if (Math.abs(e.clientX - downX) > 6) moved = true }
function onUp() { if (moved) next() }

onMounted(() => {
  const loader = new THREE.TextureLoader()
  LAB_NAV.forEach((it) => { const t = loader.load(it.img); t.minFilter = THREE.LinearFilter; textures.push(t) })
  renderer = new THREE.WebGLRenderer({ canvas: cv.value!, antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  scene = new THREE.Scene()
  cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: {
    t0: { value: textures[0] }, t1: { value: textures[1] }, prog: { value: 0 }, uTime: { value: 0 },
    a0: { value: 1 }, a1: { value: 1 }, scr: { value: 1 }, uMouse: { value: mouse } } })
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))
  const resize = () => { renderer.setSize(innerWidth, innerHeight); mat.uniforms.scr.value = innerWidth / innerHeight }
  resize(); addEventListener('resize', resize)
  const loop = (t: number) => { mouse.lerp(mouseT, 0.08); mat.uniforms.uTime.value = t / 1000; mat.uniforms.a0.value = aspect(textures[idx.value]); renderer.render(scene, cam); raf = requestAnimationFrame(loop) }
  raf = requestAnimationFrame(loop)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); renderer?.dispose() })
</script>

<template>
  <LabFrame n="01" name="Liquid Displacement" hint="drag to flow">
    <canvas ref="cv" class="lq__cv" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" />
    <div class="lq__ui">
      <Transition name="lq" mode="out-in">
        <div :key="idx" class="lq__cap">
          <span class="lq__n">{{ LAB_NAV[idx].n }}</span>
          <button class="lq__label" @click="router.push(LAB_NAV[idx].href)">{{ LAB_NAV[idx].label }} <span aria-hidden="true">→</span></button>
          <p class="lq__desc">{{ LAB_NAV[idx].desc }}</p>
        </div>
      </Transition>
    </div>
  </LabFrame>
</template>

<style scoped>
.lq__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
.lq__cv:active { cursor: grabbing; }
.lq__ui { position: absolute; left: clamp(24rem, 6vw, 90rem); bottom: clamp(60rem, 12vh, 120rem); pointer-events: none; color: #fff; text-shadow: 0 2rem 30rem rgba(0,0,0,0.6); }
.lq__n { font-family: var(--serif); font-size: 15rem; opacity: 0.8; }
.lq__label { display: block; pointer-events: auto; background: none; border: 0; color: #fff; font-family: var(--serif); font-weight: 400; font-size: clamp(44rem, 8vw, 108rem); line-height: 1; letter-spacing: -0.02em; cursor: pointer; text-align: left; margin: 4rem 0; }
.lq__desc { font-size: 15rem; max-width: 40ch; opacity: 0.9; }
.lq-enter-active, .lq-leave-active { transition: opacity 0.4s ease, transform 0.5s cubic-bezier(.19,1,.22,1); }
.lq-enter-from { opacity: 0; transform: translateY(20rem); }
.lq-leave-to { opacity: 0; transform: translateY(-12rem); }
</style>

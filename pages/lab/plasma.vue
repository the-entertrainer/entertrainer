<script setup lang="ts">
import { Renderer, Geometry, Program, Mesh } from 'ogl'
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Plasma Shader — Theme Lab', robots: 'noindex' })
const cv = ref<HTMLCanvasElement | null>(null)
let raf = 0, renderer: any, program: any, mesh: any
const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
const vertex = `attribute vec2 position; void main(){ gl_Position = vec4(position,0.,1.); }`
const fragment = `
precision highp float;
uniform float uTime; uniform vec2 uRes, uPtr;
mat2 rot(float a){ float s=sin(a),c=cos(a); return mat2(c,-s,s,c); }
float noise(vec2 p){ return sin(p.x)*sin(p.y); }
void main(){
  vec2 uv=(gl_FragCoord.xy - 0.5*uRes)/uRes.y;
  uv += (uPtr-0.5)*0.6;
  float t=uTime*0.25; vec3 col=vec3(0.0);
  for(float i=1.0;i<6.0;i++){
    uv=rot(t*0.2+i)*uv;
    uv+=0.35*sin(uv.yx*3.0*i + t + i*1.7)/i;
    col += 0.5+0.5*cos(vec3(0.0,2.1,4.2)+ length(uv)*2.0 + t + i);
  }
  col/=5.0;
  col=mix(col, vec3(0.02,0.03,0.09), 0.35);       // deepen
  col=pow(col, vec3(1.4));
  gl_FragColor=vec4(col,1.0);
}`
function tick(t: number){ ptr.x+=(ptr.tx-ptr.x)*0.06; ptr.y+=(ptr.ty-ptr.y)*0.06; const u=program.uniforms; u.uTime.value=t/1000; u.uPtr.value[0]=ptr.x; u.uPtr.value[1]=ptr.y; renderer.render({scene:mesh}); raf=requestAnimationFrame(tick) }
function onMove(e:PointerEvent){ ptr.tx=e.clientX/innerWidth; ptr.ty=1-e.clientY/innerHeight }
onMounted(()=>{ renderer=new Renderer({canvas:cv.value!,dpr:Math.min(devicePixelRatio,2)}); const gl=renderer.gl
  const geometry=new Geometry(gl,{position:{size:2,data:new Float32Array([-1,-1,3,-1,-1,3])}})
  program=new Program(gl,{vertex,fragment,uniforms:{uTime:{value:0},uRes:{value:[innerWidth,innerHeight]},uPtr:{value:[0.5,0.5]}}})
  mesh=new Mesh(gl,{geometry,program})
  const rz=()=>{renderer.setSize(innerWidth,innerHeight);program.uniforms.uRes.value=[gl.canvas.width,gl.canvas.height]}; rz(); addEventListener('resize',rz)
  raf=requestAnimationFrame(tick) })
onBeforeUnmount(()=>cancelAnimationFrame(raf))
</script>

<template>
  <div class="pl" @pointermove="onMove">
    <canvas ref="cv" class="pl__cv" />
    <NuxtLink to="/lab" class="pl__lab">◂ lab</NuxtLink>
    <main class="pl__ui">
      <p class="pl__eyebrow">Naveen Jose · Instructional Designer</p>
      <h1 class="pl__name">Made to<br><em>move</em> you</h1>
      <nav class="pl__nav"><NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="pl__pill">{{ it.label }}</NuxtLink></nav>
    </main>
  </div>
</template>

<style scoped>
.pl { position: fixed; inset: 0; overflow: hidden; }
.pl__cv { position: absolute; inset: 0; width: 100%; height: 100%; }
.pl__lab { position: fixed; top: 16rem; left: 20rem; z-index: 10; color: #fff; text-decoration: none; font-family: 'Space Mono',monospace; font-size: 12rem; mix-blend-mode: overlay; }
.pl__ui { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #fff; pointer-events: none; padding: 24rem; text-shadow: 0 2rem 40rem rgba(0,0,0,0.5); }
.pl__eyebrow { font-family: 'Space Mono',monospace; font-size: 12rem; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.85; }
.pl__name { font-family: 'Fraunces',serif; font-weight: 400; font-size: clamp(48rem,9vw,120rem); line-height: 0.95; margin: 16rem 0 30rem; }
.pl__name em { font-style: italic; }
.pl__nav { display: flex; flex-wrap: wrap; gap: 10rem; justify-content: center; pointer-events: auto; }
.pl__pill { font-family: 'Space Mono',monospace; font-size: 13rem; color: #fff; text-decoration: none; padding: 11rem 20rem; border-radius: 999rem; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.12); backdrop-filter: blur(8px); transition: background 0.2s, transform 0.2s; }
.pl__pill:hover { background: rgba(255,255,255,0.28); transform: translateY(-3rem); }
.pl__pill:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
</style>

<script setup lang="ts">
import { Renderer, Geometry, Program, Mesh } from 'ogl'
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Mesh Gradient — Theme Lab', robots: 'noindex' })

const cv = ref<HTMLCanvasElement | null>(null)
let raf = 0, renderer: any, program: any, mesh: any
const vertex = `attribute vec2 position; void main(){ gl_Position = vec4(position,0.,1.); }`
const fragment = `
precision highp float;
uniform float uTime; uniform vec2 uRes;
vec3 palette(float t){
  return 0.5 + 0.5*cos(6.2831*(vec3(1.0,1.0,1.0)*t + vec3(0.0,0.33,0.67)));
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uTime*0.18;
  vec2 p = uv;
  // four drifting colour anchors
  vec2 a = vec2(0.25+0.18*sin(t*1.1), 0.30+0.16*cos(t*0.9));
  vec2 b = vec2(0.78+0.15*sin(t*0.7+2.0), 0.24+0.18*cos(t*1.3));
  vec2 c = vec2(0.30+0.16*sin(t*0.8+4.0), 0.78+0.15*cos(t*0.6+1.0));
  vec2 d = vec2(0.74+0.17*sin(t*1.2+1.5), 0.76+0.16*cos(t*0.9+3.0));
  float wa = 1.0/(0.02+distance(p,a));
  float wb = 1.0/(0.02+distance(p,b));
  float wc = 1.0/(0.02+distance(p,c));
  float wd = 1.0/(0.02+distance(p,d));
  float sum = wa+wb+wc+wd;
  vec3 col = (wa*vec3(0.36,0.31,0.94) + wb*vec3(0.98,0.36,0.62) + wc*vec3(0.20,0.78,0.94) + wd*vec3(0.99,0.68,0.31)) / sum;
  // film grain
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453 + uTime);
  col += (g-0.5)*0.05;
  gl_FragColor = vec4(col, 1.0);
}`
function tick(t: number){ program.uniforms.uTime.value = t/1000; renderer.render({ scene: mesh }); raf = requestAnimationFrame(tick) }
onMounted(() => {
  renderer = new Renderer({ canvas: cv.value!, dpr: Math.min(devicePixelRatio, 2) })
  const gl = renderer.gl
  const geometry = new Geometry(gl, { position: { size: 2, data: new Float32Array([-1,-1,3,-1,-1,3]) } })
  program = new Program(gl, { vertex, fragment, uniforms: { uTime: { value: 0 }, uRes: { value: [innerWidth, innerHeight] } } })
  mesh = new Mesh(gl, { geometry, program })
  const rz = () => { renderer.setSize(innerWidth, innerHeight); program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height] }
  rz(); addEventListener('resize', rz)
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="ms">
    <canvas ref="cv" class="ms__cv" />
    <NuxtLink to="/lab" class="ms__lab">◂ lab</NuxtLink>
    <main class="ms__ui">
      <p class="ms__eyebrow">Naveen Jose · Instructional Designer</p>
      <h1 class="ms__title">Learning that<br><em>feels alive.</em></h1>
      <p class="ms__sub">Strategy, story, and code — blended until the edges disappear.</p>
      <nav class="ms__nav">
        <NuxtLink v-for="it in LAB_NAV" :key="it.href" :to="it.href" class="ms__link">{{ it.label }} <span>↗</span></NuxtLink>
      </nav>
    </main>
  </div>
</template>

<style scoped>
.ms { position: fixed; inset: 0; overflow: hidden; background: #14121c; }
.ms__cv { position: absolute; inset: 0; width: 100%; height: 100%; }
.ms__lab { position: fixed; top: 16rem; left: 20rem; z-index: 10; color: #fff; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 12rem; mix-blend-mode: overlay; }
.ms__ui { position: absolute; inset: 0; z-index: 3; display: flex; flex-direction: column; justify-content: center; padding: clamp(28rem, 8vw, 120rem); max-width: 1000rem; }
.ms__eyebrow { color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13rem; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.9; margin: 0 0 16rem; }
.ms__title { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(52rem, 10vw, 148rem); line-height: 0.98; color: #fff; margin: 0; text-shadow: 0 4rem 60rem rgba(0,0,0,0.35); }
.ms__title em { font-style: italic; }
.ms__sub { font-family: 'DM Sans', sans-serif; font-size: clamp(15rem, 2vw, 20rem); color: rgba(255,255,255,0.92); max-width: 42ch; margin: 24rem 0 34rem; }
.ms__nav { display: flex; flex-wrap: wrap; gap: 12rem; }
.ms__link { font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14rem; color: #14121c; text-decoration: none; padding: 12rem 20rem; border-radius: 999rem; background: rgba(255,255,255,0.88); backdrop-filter: blur(6px); transition: transform 0.2s, background 0.2s; }
.ms__link span { opacity: 0.5; }
.ms__link:hover { transform: translateY(-3rem); background: #fff; }
.ms__link:focus-visible { outline: 2rem solid #fff; outline-offset: 3rem; }
</style>

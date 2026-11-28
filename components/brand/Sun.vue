<script setup lang="ts">
/**
 * The Entertrainer sun. A small WebGL shader: a sacred-yellow disc whose rim
 * breathes with slow noise, warm bands drifting across it like heat haze, and
 * paper grain. Falls back to a CSS disc when WebGL is missing; renders one still
 * frame when motion is off; pauses off screen.
 */
const props = withDefaults(defineProps<{ intensity?: number }>(), { intensity: 1 })
const wrap = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const gl_ok = ref(true)
let raf = 0
let io: IntersectionObserver | null = null
let visible = true
let pointer = { x: 0.5, y: 0.5 }
let cleanup: (() => void) | null = null

const FRAG = `
precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 p; uniform float k;
float h(vec2 v){return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 v){vec2 i=floor(v),f=fract(v);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 v){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(v);v*=2.03;a*=.5;}return s;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  vec2 q=uv+(p-.5)*.04;
  float ang=atan(q.y,q.x);
  float d=length(q);
  float rim=.40+.003*k*sin(ang*5.+t*.8)+.008*k*(fbm(vec2(cos(ang),sin(ang))*1.6+t*.2)-.5);
  float disc=smoothstep(rim+.003,rim-.003,d);
  float bands=fbm(vec2(q.x*3.,q.y*9.-t*.15));
  vec3 sun=vec3(1.,.831,.231);
  vec3 deep=vec3(.98,.66,.12);
  vec3 col=mix(sun,deep,smoothstep(.15,.9,bands)*.45+smoothstep(.0,.42,-q.y)*.18);
  col+=vec3(.08,.05,0.)*smoothstep(rim,.0,d);
  float glow=exp(-max(d-rim,0.)*16.)*(1.-disc)*.3*smoothstep(.5,.44,d);
  float g=h(gl_FragCoord.xy+fract(t))*.06-.03;
  float a=clamp(disc+glow,0.,1.);
  gl_FragColor=vec4((col+g)*a,a);
}`
const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'

onMounted(() => {
  const c = canvas.value!
  const gl = c.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true })
  if (!gl) { gl_ok.value = false; return }
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl_ok.value = false; return }
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'a')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uP = gl.getUniformLocation(prog, 'p'), uK = gl.getUniformLocation(prog, 'k')
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const b = c.getBoundingClientRect()
    c.width = Math.max(2, Math.round(b.width * dpr)); c.height = Math.max(2, Math.round(b.height * dpr))
    gl.viewport(0, 0, c.width, c.height)
  }
  size()
  const ro = new ResizeObserver(size); ro.observe(c)
  const still = motionLevel() === 'off'
  const t0 = performance.now()
  const frame = (now: number) => {
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform2f(uR, c.width, c.height)
    gl.uniform1f(uT, still ? 4 : (now - t0) / 1000)
    gl.uniform2f(uP, pointer.x, pointer.y)
    gl.uniform1f(uK, props.intensity)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (!still && visible) raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
  io = new IntersectionObserver(([e]) => {
    const was = visible; visible = !!e?.isIntersecting
    if (visible && !was && !still) raf = requestAnimationFrame(frame)
  })
  io.observe(c)
  const mv = (e: PointerEvent) => { pointer = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight } }
  window.addEventListener('pointermove', mv, { passive: true })
  cleanup = () => { ro.disconnect(); window.removeEventListener('pointermove', mv) }
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); io?.disconnect(); cleanup?.() })
</script>

<template>
  <div ref="wrap" class="br-sun" :class="{ 'br-sun--css': !gl_ok }" aria-hidden="true">
    <canvas ref="canvas" class="br-sun__gl" />
  </div>
</template>

<style scoped>
.br-sun { position: relative; aspect-ratio: 1; }
.br-sun::before {
  content: ''; position: absolute; inset: 10%; border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #FFDD55, #FFD43B 45%, #F9B530 100%);
  box-shadow: 0 0 120px 10px color-mix(in srgb, #FFD43B 35%, transparent);
}
.br-sun__gl { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.br-sun:not(.br-sun--css)::before { opacity: 0; transition: opacity .6s .2s; }
.br-sun--css .br-sun__gl { display: none; }
</style>

<script setup lang="ts">
import Matter from 'matter-js'
import { LAB_NAV } from '~/utils/labNav'
definePageMeta({ layout: false })
useSeoMeta({ title: 'Physics Toybox — Theme Lab', robots: 'noindex' })
const wrap = ref<HTMLElement | null>(null)
const chipEls = ref<HTMLElement[]>([])
const router = useRouter()
const COLORS = ['#ff5d73', '#3dd6c4', '#6b8cff', '#ffc24b']
let raf = 0, engine: Matter.Engine, bodies: Matter.Body[] = []

function build() {
  const { Engine, World, Bodies, Runner, Mouse, MouseConstraint } = Matter
  const w = innerWidth, h = innerHeight, th = 400
  engine = Engine.create(); engine.gravity.y = 1.1
  const walls = [
    Bodies.rectangle(w / 2, h + th / 2, w * 2, th, { isStatic: true }),
    Bodies.rectangle(-th / 2, h / 2, th, h * 3, { isStatic: true }),
    Bodies.rectangle(w + th / 2, h / 2, th, h * 3, { isStatic: true })
  ]
  const CW = Math.min(200, w * 0.5), CH = 66
  bodies = LAB_NAV.map((_, i) => Bodies.rectangle(w * (0.3 + i * 0.13), -120 - i * 90, CW, CH, { restitution: 0.55, friction: 0.4, chamfer: { radius: 16 } }))
  chipEls.value.forEach(el => { if (el) { el.style.width = CW + 'px'; el.style.height = CH + 'px' } })
  World.add(engine.world, [...walls, ...bodies])
  const mouse = Mouse.create(wrap.value!)
  const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.15, render: { visible: false } } })
  World.add(engine.world, mc)
  Runner.run(Runner.create(), engine)
  const sync = () => {
    bodies.forEach((b, i) => { const el = chipEls.value[i]; if (el) el.style.transform = `translate(${b.position.x - CW / 2}px, ${b.position.y - CH / 2}px) rotate(${b.angle}rad)` })
    raf = requestAnimationFrame(sync)
  }
  sync()
}
function drop() { const { Body } = Matter; bodies.forEach((b, i) => { Body.setPosition(b, { x: innerWidth * (0.3 + i * 0.13), y: -120 - i * 90 }); Body.setVelocity(b, { x: 0, y: 0 }); Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.3) }) }
onMounted(() => build())
onBeforeUnmount(() => { cancelAnimationFrame(raf); if (engine) Matter.World.clear(engine.world, false), Matter.Engine.clear(engine) })
</script>

<template>
  <div ref="wrap" class="ph">
    <NuxtLink to="/lab" class="ph__lab">◂ lab</NuxtLink>
    <div class="ph__head">
      <h1>Naveen Jose</h1>
      <p>instructional designer · <button class="ph__drop" @click="drop">drop the toys ↺</button></p>
      <span class="ph__hint">drag &amp; throw the chips · double-click to open</span>
    </div>
    <a v-for="(it, i) in LAB_NAV" :key="it.href" class="ph__chip" :style="{ '--c': COLORS[i % 4] }" ref="chipEls" @dblclick="router.push(it.href)">{{ it.label }}</a>
  </div>
</template>

<style scoped>
.ph { position: fixed; inset: 0; overflow: hidden; background: #14141a; color: #fff; font-family: 'Space Mono', monospace; }
.ph__lab { position: fixed; top: 16rem; right: 20rem; z-index: 20; color: #fff; text-decoration: none; font-size: 12rem; opacity: 0.7; }
.ph__head { position: absolute; top: clamp(80rem,16vh,160rem); left: 50%; translate: -50% 0; text-align: center; z-index: 1; pointer-events: none; }
.ph__head h1 { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(44rem,8vw,92rem); margin: 0; }
.ph__head p { margin: 10rem 0 0; opacity: 0.7; font-size: 14rem; }
.ph__drop { pointer-events: auto; background: none; border: 0; color: #ffc24b; cursor: pointer; font: inherit; text-decoration: underline; }
.ph__hint { display: block; margin-top: 10rem; font-size: 11rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.4; }
.ph__chip { position: absolute; top: 0; left: 0; display: grid; place-items: center; border-radius: 16rem; background: var(--c); color: #14141a; font-weight: 700; font-size: clamp(13rem,1.5vw,16rem); text-transform: uppercase; text-decoration: none; cursor: grab; user-select: none; box-shadow: 0 10rem 24rem rgba(0,0,0,0.4); will-change: transform; }
.ph__chip:active { cursor: grabbing; }
</style>

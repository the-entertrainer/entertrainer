<script setup lang="ts">
/**
 * The hero title: a Vedic verse, headline-size, sitting on the sun. Every
 * 5 seconds it lifts off in heat haze and the next one rises through the glow.
 *
 * - Two stacked layers, so old and new overlap during the change. A hidden
 *   sizer holds every verse, so the box is always as tall as the longest and
 *   nothing below ever moves.
 * - The haze is one SVG feTurbulence + feDisplacementMap filter, switched on
 *   only while a change plays (desktop). Phones get rise + blur instead.
 * - Server and first paint always show quote 0. Order is randomised after
 *   mount, as a shuffled bag, so a verse never repeats back to back.
 * - Pauses when the tab is hidden, when the hero is off screen and on demand.
 *   Reduced motion: a plain cross-fade, no travel.
 * - Screen readers get one quiet, non-live copy; the visible layers are hidden
 *   from them so nothing is announced every 5 seconds.
 */
import { VEDIC_QUOTES, type VedicQuote } from '~/utils/vedicQuotes'

const INTERVAL = 5000
const uid = useId().replace(/[^a-z0-9]/gi, '')
const filterId = `sqh-${uid}`
const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const layerEls = ref<(HTMLElement | null)[]>([null, null])
const turb = ref<SVGElement | null>(null)
const disp = ref<SVGElement | null>(null)

const layers = reactive<{ q: VedicQuote | null }[]>([{ q: VEDIC_QUOTES[0]! }, { q: null }])
const cur = ref(0)
const paused = ref(false)
const shown = computed(() => layers[cur.value]!.q!)
const split = (t: string) => t.split(' ')

let bag: number[] = []
let last = 0
let timer: ReturnType<typeof setTimeout> | undefined
let lastStart = 0
let inView = false
let busy = false
let tl: gsap.core.Timeline | null = null
let io: IntersectionObserver | null = null

function nextIndex() {
  if (!bag.length) {
    bag = VEDIC_QUOTES.map((_, i) => i)
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j]!, bag[i]!] }
    if (bag[0] === last) bag.push(bag.shift()!)
  }
  last = bag.shift()!
  return last
}

function clearTimer() { if (timer) { clearTimeout(timer); timer = undefined } }
function schedule(ms = INTERVAL) {
  clearTimer()
  if (paused.value || document.hidden || !inView) return
  timer = setTimeout(tick, ms)
}
function tick() {
  lastStart = performance.now()
  schedule(INTERVAL)
  void swap()
}

const cheap = () => window.matchMedia('(max-width: 860px), (pointer: coarse)').matches

async function swap() {
  if (busy) return
  busy = true
  const from = cur.value
  const to = 1 - from
  layers[to]!.q = VEDIC_QUOTES[nextIndex()]!
  await nextTick()
  const kit = await getMotionKit()
  const A = layerEls.value[from]!, B = layerEls.value[to]!
  if (!kit || !A || !B || !stage.value) {
    cur.value = to // CSS cross-fade
    busy = false
    return
  }
  const { gsap } = kit
  const parts = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>('.sq__w, .sq__aux'))
  const outP = parts(A), inP = parts(B)
  const haze = !cheap() && !!turb.value && !!disp.value
  const blur = cheap() ? 6 : 10
  const rise = (cheap() ? 34 : 54) * kit.d
  const st = stage.value
  const p = { s: 0, f: 0 }
  st.classList.add('is-anim')
  gsap.set(inP, { opacity: 0, y: rise, filter: `blur(${blur}px)` })
  B.classList.add('is-on')
  cur.value = to
  tl = gsap.timeline({
    onComplete() {
      A.classList.remove('is-on')
      gsap.set([...outP, ...inP], { clearProps: 'opacity,transform,filter' })
      st.classList.remove('is-anim', 'is-haze')
      disp.value?.setAttribute('scale', '0')
      busy = false
    }
  })
  // Out: lift, blur, dissolve. A beat later, in: rise from below, resolve sharp.
  tl.to(outP, { y: -rise, opacity: 0, filter: `blur(${blur}px)`, duration: 0.95 * kit.k, ease: 'power2.in', stagger: 0.03 * kit.k }, 0)
  tl.to(inP, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.35 * kit.k, ease: 'ink', stagger: 0.04 * kit.k }, 0.55 * kit.k)
  if (haze) {
    st.classList.add('is-haze')
    tl.to(p, {
      s: 46, f: 1, duration: 1 * kit.k, ease: 'sine.inOut',
      onUpdate() { disp.value?.setAttribute('scale', String(p.s)); turb.value?.setAttribute('baseFrequency', `${0.011 + p.f * 0.008} ${0.05 + p.f * 0.05}`) }
    }, 0)
    tl.to(p, {
      s: 0, f: 0.4, duration: 1.5 * kit.k, ease: 'sine.out',
      onUpdate() { disp.value?.setAttribute('scale', String(p.s)); turb.value?.setAttribute('baseFrequency', `${0.011 + p.f * 0.008} ${0.05 + p.f * 0.05}`) }
    }, 1 * kit.k)
  }
}

function toggle() {
  paused.value = !paused.value
  if (paused.value) clearTimer()
  else schedule(Math.max(700, INTERVAL - (performance.now() - lastStart)))
}

function onVis() { document.hidden ? clearTimer() : schedule(Math.max(700, INTERVAL - (performance.now() - lastStart))) }

onMounted(() => {
  lastStart = performance.now()
  void getMotionKit() // warm GSAP; null when motion is off
  io = new IntersectionObserver(([e]) => {
    inView = !!e?.isIntersecting
    inView ? schedule(Math.max(700, INTERVAL - (performance.now() - lastStart))) : clearTimer()
  }, { threshold: 0.05 })
  if (root.value) io.observe(root.value)
  document.addEventListener('visibilitychange', onVis)
})
onBeforeUnmount(() => {
  clearTimer()
  io?.disconnect()
  tl?.kill()
  document.removeEventListener('visibilitychange', onVis)
})
</script>

<template>
  <figure ref="root" class="sq" aria-label="A verse from the Vedas">
    <svg class="sq__defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter :id="filterId" x="-10%" y="-60%" width="120%" height="220%" color-interpolation-filters="sRGB">
        <feTurbulence ref="turb" type="fractalNoise" baseFrequency="0.011 0.05" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap ref="disp" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
    <div ref="stage" class="sq__stage" :style="{ '--sq-haze': `url(#${filterId})` }">
      <div class="sq__sizer" aria-hidden="true">
        <div v-for="q in VEDIC_QUOTES" :key="q.src" class="sq__layer is-measure">
          <p class="sq__t">{{ q.en }}</p>
          <p class="sq__sa">{{ q.sa }}</p>
          <p class="sq__src br-meta">{{ q.src }}</p>
        </div>
      </div>
      <div
        v-for="(l, i) in layers"
        :key="i"
        :ref="(el) => { layerEls[i] = el as HTMLElement | null }"
        class="sq__layer"
        :class="{ 'is-on': cur === i }"
        aria-hidden="true"
      >
        <template v-if="l.q">
          <p class="sq__t"><span v-for="(w, n) in split(l.q.en)" :key="n" class="sq__w">{{ w }}</span></p>
          <p class="sq__sa sq__aux" lang="sa-Latn">{{ l.q.sa }}</p>
          <p class="sq__src sq__aux br-meta">{{ l.q.src }}</p>
        </template>
      </div>
    </div>
    <blockquote class="sr-only">
      <p>{{ shown.en }}</p>
      <footer>{{ shown.src }}</footer>
    </blockquote>
    <button type="button" class="sq__pause" :aria-pressed="paused" :aria-label="paused ? 'Resume changing verses' : 'Pause changing verses'" data-cursor="" @click="toggle">
      <i :class="paused ? 'is-play' : 'is-pause'" aria-hidden="true" />
    </button>
  </figure>
</template>

<style scoped>
.sq { position: relative; margin: 0; min-width: 0; width: 100%; text-align: center; color: var(--br-ink); padding-bottom: 36px; }
.sq__defs { position: absolute; width: 0; height: 0; overflow: hidden; }
.sq__stage { position: relative; display: grid; justify-items: stretch; align-items: center; }
.sq__sizer { grid-area: 1 / 1; display: grid; visibility: hidden; pointer-events: none; align-self: stretch; }
.sq__sizer .sq__layer { position: relative; grid-area: 1 / 1; opacity: 1; visibility: hidden; }
.sq__stage.is-haze { filter: var(--sq-haze); }
.sq__layer { grid-area: 1 / 1; opacity: 0; transition: opacity .8s ease; pointer-events: none; }
.sq__layer.is-on { opacity: 1; pointer-events: auto; }
.sq__stage.is-anim .sq__layer { transition: none; }
.sq__stage.is-anim .sq__w, .sq__stage.is-anim .sq__aux { will-change: transform, opacity, filter; }
/* Headline type, tight, balanced. A paper halo keeps ink letters sharp on the sun. */
.sq__t {
  margin: 0;
  font: 400 clamp(30px, 4.6vw, 68px)/1.05 var(--font-display);
  font-variation-settings: "opsz" 144, "SOFT" 30, "WONK" 1;
  letter-spacing: -.035em;
  text-wrap: balance;
  color: var(--br-ink);
  text-shadow:
    0 0 16px var(--br-paper),
    0 0 36px var(--br-paper),
    0 0 64px color-mix(in srgb, var(--br-paper) 80%, transparent);
}
.sq__w { display: inline-block; margin-right: .22em; }
.sq__w:last-child { margin-right: 0; }
.sq__sa {
  margin: 14px 0 0;
  font: italic 400 clamp(13px, 1.15vw, 16px)/1.4 var(--font-ui);
  color: var(--br-ink);
  opacity: .78;
  text-shadow: 0 0 16px var(--br-paper), 0 0 28px var(--br-paper);
}
.sq__src {
  margin: 8px 0 0;
  color: var(--br-ink);
  opacity: .72;
  text-shadow: 0 0 16px var(--br-paper);
}
.sq__pause {
  position: absolute; left: 50%; bottom: 0; width: 44px; height: 44px; border: 0; background: none; padding: 0;
  display: grid; place-items: center; cursor: pointer; color: var(--br-ink); opacity: .5; transition: opacity .2s;
  translate: -50% 0;
}
.sq__pause:hover, .sq__pause:focus-visible { opacity: 1; }
.sq__pause i { width: 10px; height: 12px; display: block; }
.sq__pause .is-pause { border-inline: 3px solid currentColor; }
.sq__pause .is-play { width: 0; height: 0; border-block: 6px solid transparent; border-left: 10px solid currentColor; }
@media (max-width: 760px) {
  .sq__t { font-size: clamp(28px, 8.2vw, 36px); letter-spacing: -.03em; line-height: 1.08; }
  .sq__sa { font-size: 13px; margin-top: 12px; }
}
@media (prefers-reduced-motion: reduce) { .sq__layer { transition: opacity .6s ease; } }
</style>

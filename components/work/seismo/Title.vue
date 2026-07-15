<script setup lang="ts">
import gsap from 'gsap'
import Seismogram from './Seismogram.vue'
import { P_ARRIVAL_S, TRACE_WINDOW_S } from '~/utils/seismo/model'

const emit = defineEmits<{ start: [] }>()

const traceWrap = ref<HTMLElement | null>(null)
const heading = ref<HTMLElement | null>(null)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const line = traceWrap.value?.querySelector('.sg-trace__line') as SVGPathElement | null
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
  if (line) {
    const len = line.getTotalLength()
    // the seismograph "records" the trace left to right on arrival
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
    tl.to(line, { strokeDashoffset: 0, duration: 1.5, ease: 'none' }, 0)
  }
  if (heading.value) tl.from(heading.value.children, { y: 16, opacity: 0, stagger: 0.09, duration: 0.6 }, 0.5)
})
</script>

<template>
  <section class="sg-screen sg-title">
    <div ref="heading" class="sg-title__head">
      <p class="sg-eyebrow">Seismology · locate an earthquake</p>
      <h1 class="sg-h1 sg-title__word">Triangulate</h1>
      <p class="sg-title__dek">
        An earthquake sends out two waves at once. The gap between them, read off three
        seismograms, is enough to pin the epicentre on a map. You will do exactly that.
      </p>
      <button type="button" class="sg-btn sg-btn--primary sg-title__cta" @click="emit('start')">
        Start recording
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </button>
    </div>

    <figure ref="traceWrap" class="sg-title__trace">
      <div class="sg-title__trace-head">
        <span class="sg-title__station">STATION HLM · vertical component</span>
        <span class="sg-title__stamp">M 5.2 · regional network</span>
      </div>
      <Seismogram :seed="4821" :window-s="TRACE_WINDOW_S" :p-arrival-s="P_ARRIVAL_S" :s-arrival-s="38" :height="150" show-p show-s />
      <figcaption class="sg-title__axis">
        <span>0s</span><span>16s</span><span>32s</span><span>48s</span><span>64s</span>
      </figcaption>
    </figure>
  </section>
</template>

<style scoped>
.sg-title {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 40rem;
  padding-top: 30rem;
}
.sg-title__word {
  font-size: clamp(46rem, 9vw, 92rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 6rem 0 0;
}
.sg-title__dek {
  margin-top: 20rem;
  font-size: 17rem;
  line-height: 1.6;
  color: var(--sg-muted-strong);
  max-width: 52ch;
}
.sg-title__cta { margin-top: 30rem; }

.sg-title__trace {
  margin: 0;
  background: var(--sg-panel);
  border: 1px solid var(--sg-line);
  border-radius: 12rem;
  padding: 16rem 18rem 12rem;
  box-shadow: 0 24rem 46rem -34rem rgba(22, 36, 43, 0.5);
}
.sg-title__trace-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10rem;
  font-family: var(--sg-mono);
  font-size: 11.5rem;
  color: var(--sg-muted-strong);
  letter-spacing: 0.02em;
}
.sg-title__station { color: var(--sg-ink); }
.sg-title__axis {
  display: flex;
  justify-content: space-between;
  margin-top: 6rem;
  font-family: var(--sg-mono);
  font-size: 10.5rem;
  color: var(--sg-muted);
}
</style>

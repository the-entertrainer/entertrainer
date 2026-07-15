<script setup lang="ts">
import type { SgView } from '~/types/seismo'
const store = useSeismoStore()
const emit = defineEmits<{ open: [view: SgView] }>()

const panels = computed(() => [
  {
    id: 'lesson' as SgView,
    num: '01',
    title: 'Lesson',
    line: 'Meet the two waves, and see why their gap is a distance.',
    done: store.progress.lesson,
    glyph: 'wave'
  },
  {
    id: 'hands-on' as SgView,
    num: '02',
    title: 'Hands on',
    line: 'Measure three seismograms and cross the circles to a point.',
    done: store.progress.handsOn,
    glyph: 'map'
  },
  {
    id: 'assessment' as SgView,
    num: '03',
    title: 'Assessment',
    line: 'Five questions on what you read and measured. 80 percent to pass.',
    done: store.progress.assessment,
    glyph: 'check'
  }
])
</script>

<template>
  <section class="sg-screen sg-menu">
    <div class="sg-menu__head">
      <div>
        <p class="sg-eyebrow">Station log</p>
        <h2 class="sg-h2">Three sections. Work them in order, or jump.</h2>
      </div>
      <div class="sg-menu__count" role="img" :aria-label="`${store.completedCount} of 3 complete`">
        <span class="sg-menu__count-num">{{ store.completedCount }}<span>/3</span></span>
        <span class="sg-menu__count-label">complete</span>
      </div>
    </div>

    <div class="sg-menu__grid">
      <button
        v-for="panel in panels"
        :key="panel.id"
        type="button"
        class="sg-menu__panel"
        :class="{ 'is-done': panel.done }"
        @click="emit('open', panel.id)"
      >
        <span class="sg-menu__glyph" aria-hidden="true">
          <svg v-if="panel.glyph === 'wave'" viewBox="0 0 60 40" width="60" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h9l3-11 6 22 4-15 3 7 4-4h22" /></svg>
          <svg v-else-if="panel.glyph === 'map'" viewBox="0 0 60 40" width="60" height="40" fill="none" stroke="currentColor" stroke-width="2"><circle cx="30" cy="20" r="13" /><circle cx="20" cy="26" r="13" /><circle cx="40" cy="27" r="13" /><path d="M30 20l3-2" stroke-linecap="round" /></svg>
          <svg v-else viewBox="0 0 60 40" width="60" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20l5 5 10-12" /><path d="M34 14h18M34 22h18M34 30h12" /></svg>
        </span>
        <span class="sg-menu__num">{{ panel.num }}</span>
        <span class="sg-menu__title">{{ panel.title }}</span>
        <span class="sg-menu__line">{{ panel.line }}</span>
        <span class="sg-menu__status">{{ panel.done ? 'Complete' : 'Not started' }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.sg-menu { padding-top: 40rem; }
.sg-menu__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20rem; margin-bottom: 30rem; }
.sg-menu__count { text-align: right; flex-shrink: 0; }
.sg-menu__count-num { font-family: var(--sg-display); font-size: 30rem; font-weight: 700; color: var(--sg-ink); line-height: 1; }
.sg-menu__count-num span { font-size: 17rem; color: var(--sg-muted); }
.sg-menu__count-label { display: block; font-family: var(--sg-mono); font-size: 11rem; color: var(--sg-muted-strong); margin-top: 3rem; }

.sg-menu__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rem; }
.sg-menu__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 22rem 20rem 20rem;
  background: var(--sg-panel);
  border: 1.5px solid var(--sg-line);
  border-radius: 12rem;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
@media (hover: hover) {
  .sg-menu__panel:hover {
    transform: translateY(-3rem);
    border-color: var(--sg-ink);
    box-shadow: 0 24rem 44rem -30rem rgba(22, 36, 43, 0.55);
  }
}
.sg-menu__panel:focus-visible { outline: 2px solid var(--sg-ink); outline-offset: 2px; }
.sg-menu__glyph { color: var(--sg-p); margin-bottom: 16rem; }
.sg-menu__panel.is-done .sg-menu__glyph { color: var(--sg-epi); }
.sg-menu__num {
  position: absolute;
  top: 20rem;
  right: 20rem;
  font-family: var(--sg-mono);
  font-size: 12rem;
  color: var(--sg-muted);
}
.sg-menu__title { font-family: var(--sg-display); font-size: 22rem; font-weight: 600; color: var(--sg-ink); margin-bottom: 8rem; }
.sg-menu__line { font-size: 14rem; line-height: 1.55; color: var(--sg-muted-strong); flex: 1; margin-bottom: 16rem; }
.sg-menu__status {
  font-family: var(--sg-mono);
  font-size: 11.5rem;
  letter-spacing: 0.03em;
  color: var(--sg-muted-strong);
  padding-top: 12rem;
  border-top: 1px solid var(--sg-line);
}
.sg-menu__panel.is-done .sg-menu__status { color: var(--sg-epi); }

@media (max-width: 720px) {
  .sg-menu__grid { grid-template-columns: 1fr; }
  .sg-menu__head { flex-direction: column; align-items: flex-start; }
  .sg-menu__count { text-align: left; }
}
</style>

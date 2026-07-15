<script setup lang="ts">
import type { StView } from '~/types/strong'
const store = useStrongStore()
const emit = defineEmits<{ open: [view: StView] }>()

const panels = computed(() => [
  { id: 'lesson' as StView, num: '01', title: 'Lesson', line: 'Where the strength number comes from, and why length beats symbols.', done: store.progress.lesson, glyph: 'formula' },
  { id: 'hands-on' as StView, num: '02', title: 'Password lab', line: 'Build a password and watch three attackers race to crack it.', done: store.progress.handsOn, glyph: 'lab' },
  { id: 'assessment' as StView, num: '03', title: 'Assessment', line: 'Five questions on entropy, crack time, and guessability.', done: store.progress.assessment, glyph: 'check' }
])
</script>

<template>
  <section class="st-screen st-menu">
    <div class="st-menu__head">
      <div>
        <p class="st-eyebrow">Menu</p>
        <h2 class="st-h2">Three sections. Go in order, or jump.</h2>
      </div>
      <div class="st-menu__count" role="img" :aria-label="`${store.completedCount} of 3 complete`">
        <span class="st-menu__count-num st-num">{{ store.completedCount }}<span>/3</span></span>
        <span class="st-menu__count-label">complete</span>
      </div>
    </div>

    <div class="st-menu__grid">
      <button v-for="p in panels" :key="p.id" type="button" class="st-menu__panel" :class="{ 'is-done': p.done }" @click="emit('open', p.id)">
        <span class="st-menu__glyph" aria-hidden="true">
          <svg v-if="p.glyph === 'formula'" viewBox="0 0 60 34" width="60" height="34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 25c6 0 6-16 12-16s6 16 12 16"/><path d="M34 12h22M34 22h22"/></svg>
          <svg v-else-if="p.glyph === 'lab'" viewBox="0 0 60 34" width="60" height="34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 4v9L14 27a3 3 0 0 0 3 4h13a3 3 0 0 0 3-4L26 13V4"/><path d="M21 4h8"/><path d="M19 22h12"/></svg>
          <svg v-else viewBox="0 0 60 34" width="60" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17l5 5 9-11"/><path d="M30 12h24M30 22h16"/></svg>
        </span>
        <span class="st-menu__num st-num">{{ p.num }}</span>
        <span class="st-menu__title">{{ p.title }}</span>
        <span class="st-menu__line">{{ p.line }}</span>
        <span class="st-menu__status">{{ p.done ? 'Complete' : 'Not started' }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.st-menu { padding-top: 40rem; }
.st-menu__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20rem; margin-bottom: 30rem; }
.st-menu__count { text-align: right; flex-shrink: 0; }
.st-menu__count-num { font-family: var(--st-display); font-weight: 700; font-size: 30rem; line-height: 1; }
.st-menu__count-num span { font-size: 17rem; color: var(--st-muted); }
.st-menu__count-label { display: block; font-family: var(--st-mono); font-size: 11rem; color: var(--st-muted); margin-top: 3rem; }

.st-menu__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rem; }
.st-menu__panel {
  position: relative; display: flex; flex-direction: column; text-align: left;
  padding: 22rem 20rem 20rem; background: var(--st-panel);
  border: 1px solid var(--st-line); border-radius: 14rem;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
@media (hover: hover) { .st-menu__panel:hover { transform: translateY(-3rem); border-color: var(--st-accent); box-shadow: 0 24rem 46rem -30rem #000; } }
.st-menu__panel:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-menu__glyph { color: var(--st-accent); margin-bottom: 16rem; opacity: 0.85; }
.st-menu__num { position: absolute; top: 20rem; right: 20rem; font-size: 12rem; color: var(--st-muted); }
.st-menu__title { font-family: var(--st-display); font-weight: 600; font-size: 22rem; margin-bottom: 8rem; }
.st-menu__line { font-size: 14rem; line-height: 1.55; color: var(--st-muted); flex: 1; margin-bottom: 16rem; }
.st-menu__status { font-family: var(--st-mono); font-size: 11.5rem; color: var(--st-muted); padding-top: 12rem; border-top: 1px solid var(--st-line); }
.st-menu__panel.is-done .st-menu__status { color: var(--st-accent); }

@media (max-width: 720px) {
  .st-menu__grid { grid-template-columns: 1fr; }
  .st-menu__head { flex-direction: column; align-items: flex-start; }
  .st-menu__count { text-align: left; }
}
</style>

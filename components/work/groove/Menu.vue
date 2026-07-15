<script setup lang="ts">
import type { GvView } from '~/types/groove'
const store = useGrooveStore()
const emit = defineEmits<{ open: [view: GvView] }>()

const panels = computed(() => [
  { id: 'lesson' as GvView, num: '01', title: 'Lesson', line: 'Where the kick, snare, and hats go, and why it grooves.', done: store.progress.lesson, glyph: 'wave' },
  { id: 'hands-on' as GvView, num: '02', title: 'Hands on', line: 'Recreate a target groove on a full step sequencer.', done: store.progress.handsOn, glyph: 'grid' },
  { id: 'assessment' as GvView, num: '03', title: 'Assessment', line: 'Five questions on beats, backbeats, and placement.', done: store.progress.assessment, glyph: 'check' }
])
</script>

<template>
  <section class="gv-screen gv-menu">
    <div class="gv-menu__head">
      <div>
        <p class="gv-eyebrow">Menu</p>
        <h2 class="gv-h2">Three sections. Play them in order, or jump.</h2>
      </div>
      <div class="gv-menu__count" role="img" :aria-label="`${store.completedCount} of 3 complete`">
        <span class="gv-menu__count-num">{{ store.completedCount }}<span>/3</span></span>
        <span class="gv-menu__count-label">complete</span>
      </div>
    </div>

    <div class="gv-menu__grid">
      <button v-for="p in panels" :key="p.id" type="button" class="gv-menu__panel" :class="{ 'is-done': p.done }" @click="emit('open', p.id)">
        <span class="gv-menu__glyph" aria-hidden="true">
          <svg v-if="p.glyph === 'wave'" viewBox="0 0 60 34" width="60" height="34"><g fill="currentColor"><rect x="2" y="8" width="8" height="8" rx="2"/><rect x="14" y="8" width="8" height="8" rx="2" opacity="0.35"/><rect x="26" y="8" width="8" height="8" rx="2"/><rect x="38" y="8" width="8" height="8" rx="2" opacity="0.35"/><rect x="50" y="8" width="8" height="8" rx="2"/></g></svg>
          <svg v-else-if="p.glyph === 'grid'" viewBox="0 0 60 34" width="60" height="34"><g fill="currentColor"><rect x="2" y="4" width="7" height="7" rx="2"/><rect x="27" y="4" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="39" y="14" width="7" height="7" rx="2"/><rect x="2" y="24" width="7" height="7" rx="2"/><rect x="51" y="24" width="7" height="7" rx="2"/></g></svg>
          <svg v-else viewBox="0 0 60 34" width="60" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17l5 5 9-11"/><path d="M30 12h24M30 22h16"/></svg>
        </span>
        <span class="gv-menu__num">{{ p.num }}</span>
        <span class="gv-menu__title">{{ p.title }}</span>
        <span class="gv-menu__line">{{ p.line }}</span>
        <span class="gv-menu__status">{{ p.done ? 'Complete' : 'Not started' }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.gv-menu { padding-top: 40rem; }
.gv-menu__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20rem; margin-bottom: 30rem; }
.gv-menu__count { text-align: right; flex-shrink: 0; }
.gv-menu__count-num { font-family: var(--gv-display); font-weight: 900; font-size: 30rem; line-height: 1; }
.gv-menu__count-num span { font-size: 17rem; color: var(--gv-muted); }
.gv-menu__count-label { display: block; font-family: var(--gv-mono); font-size: 11rem; color: var(--gv-muted); margin-top: 3rem; }

.gv-menu__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16rem; }
.gv-menu__panel {
  position: relative; display: flex; flex-direction: column; text-align: left;
  padding: 22rem 20rem 20rem; background: var(--gv-panel);
  border: 1px solid var(--gv-line); border-radius: 16rem;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
@media (hover: hover) { .gv-menu__panel:hover { transform: translateY(-3rem); border-color: var(--gv-accent); box-shadow: 0 24rem 46rem -30rem #000; } }
.gv-menu__panel:focus-visible { outline: 2px solid var(--gv-text); outline-offset: 2px; }
.gv-menu__glyph { color: var(--gv-hat); margin-bottom: 16rem; }
.gv-menu__panel.is-done .gv-menu__glyph { color: var(--gv-accent); }
.gv-menu__num { position: absolute; top: 20rem; right: 20rem; font-family: var(--gv-mono); font-size: 12rem; color: var(--gv-muted); }
.gv-menu__title { font-family: var(--gv-display); font-weight: 800; font-size: 22rem; margin-bottom: 8rem; }
.gv-menu__line { font-size: 14rem; line-height: 1.55; color: var(--gv-muted); flex: 1; margin-bottom: 16rem; }
.gv-menu__status { font-family: var(--gv-mono); font-size: 11.5rem; color: var(--gv-muted); padding-top: 12rem; border-top: 1px solid var(--gv-line); }
.gv-menu__panel.is-done .gv-menu__status { color: var(--gv-accent); }

@media (max-width: 720px) {
  .gv-menu__grid { grid-template-columns: 1fr; }
  .gv-menu__head { flex-direction: column; align-items: flex-start; }
  .gv-menu__count { text-align: left; }
}
</style>

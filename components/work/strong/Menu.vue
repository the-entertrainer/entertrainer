<script setup lang="ts">
interface Slide { id: string; section: string; label: string }
const props = defineProps<{ slides: Slide[]; index: number; furthest: number }>()
const emit = defineEmits<{ jump: [i: number]; close: [] }>()

// Group consecutive slides by section, keeping each slide's real deck index.
const groups = computed(() => {
  const out: { section: string; items: { label: string; i: number }[] }[] = []
  props.slides.forEach((s, i) => {
    const last = out[out.length - 1]
    if (last && last.section === s.section) last.items.push({ label: s.label, i })
    else out.push({ section: s.section, items: [{ label: s.label, i }] })
  })
  return out
})
</script>

<template>
  <div class="st-outline">
    <div class="st-outline__scrim" @click="emit('close')" />
    <aside class="st-outline__panel" role="dialog" aria-label="Course menu">
      <div class="st-outline__head">
        <span class="st-outline__title">Menu</span>
        <button type="button" class="st-outline__x" aria-label="Close menu" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <nav class="st-outline__nav">
        <div v-for="g in groups" :key="g.section" class="st-outline__group">
          <p class="st-outline__section">{{ g.section }}</p>
          <button
            v-for="it in g.items" :key="it.i" type="button"
            class="st-outline__item"
            :class="{ 'is-current': it.i === index, 'is-done': it.i < furthest, 'is-locked': it.i > furthest }"
            :disabled="it.i > furthest"
            :aria-current="it.i === index ? 'step' : undefined"
            @click="emit('jump', it.i)"
          >
            <span class="st-outline__dot" aria-hidden="true">
              <svg v-if="it.i < furthest" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg>
              <svg v-else-if="it.i > furthest" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
            </span>
            <span class="st-outline__label">{{ it.label }}</span>
          </button>
        </div>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
.st-outline { position: fixed; inset: 0; z-index: 40; }
.st-outline__scrim { position: absolute; inset: 0; background: rgba(6, 12, 18, 0.55); backdrop-filter: blur(2px); animation: st-fadein 0.2s ease; }
.st-outline__panel {
  position: absolute; top: 0; right: 0; bottom: 0; width: min(340rem, 86vw);
  background: color-mix(in srgb, var(--st-panel) 96%, #000);
  border-left: 1px solid var(--st-line-strong);
  padding: calc(20rem + var(--safe-top)) 0 calc(20rem + var(--safe-bottom));
  display: flex; flex-direction: column;
  box-shadow: -30rem 0 80rem -40rem #000;
  animation: st-slidein 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes st-fadein { from { opacity: 0; } }
@keyframes st-slidein { from { transform: translateX(100%); } }
.st-outline__head { display: flex; align-items: center; justify-content: space-between; padding: 0 22rem 16rem; }
.st-outline__title { font-family: var(--st-display); font-weight: 600; font-size: 17rem; }
.st-outline__x { width: 34rem; height: 34rem; display: flex; align-items: center; justify-content: center; border-radius: 8rem; color: var(--st-muted); }
@media (hover: hover) { .st-outline__x:hover { color: var(--st-text); background: var(--st-slot-hover); } }
.st-outline__x:focus-visible { outline: 2px solid var(--st-text); outline-offset: 2px; }
.st-outline__nav { flex: 1; overflow-y: auto; padding: 4rem 14rem; }
.st-outline__group { margin-bottom: 14rem; }
.st-outline__section { font-family: var(--st-mono); font-size: 10.5rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--st-muted); padding: 8rem 10rem 6rem; }
.st-outline__item {
  display: flex; align-items: center; gap: 12rem; width: 100%; text-align: left;
  padding: 11rem 10rem; border-radius: 9rem; color: var(--st-muted-strong); font-size: 14.5rem;
  transition: background 0.14s ease, color 0.14s ease;
}
@media (hover: hover) { .st-outline__item:not(:disabled):hover { background: var(--st-slot-hover); color: var(--st-text); } }
.st-outline__item.is-current { background: color-mix(in srgb, var(--st-accent) 14%, transparent); color: var(--st-text); }
.st-outline__item.is-locked { opacity: 0.45; cursor: not-allowed; }
.st-outline__item:focus-visible { outline: 2px solid var(--st-text); outline-offset: -2px; }
.st-outline__dot { width: 20rem; height: 20rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid var(--st-line-strong); color: var(--st-accent); }
.st-outline__item.is-current .st-outline__dot { border-color: var(--st-accent); background: color-mix(in srgb, var(--st-accent) 20%, transparent); }
.st-outline__item.is-done .st-outline__dot { border-color: var(--st-accent); }
.st-outline__label { line-height: 1.3; }
@media (prefers-reduced-motion: reduce) { .st-outline__scrim, .st-outline__panel { animation: none; } }
</style>

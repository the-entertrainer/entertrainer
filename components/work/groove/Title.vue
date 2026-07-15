<script setup lang="ts">
import Sequencer from './Sequencer.vue'
import { GROOVES, clonePattern } from '~/utils/groove/patterns'

const emit = defineEmits<{ start: [] }>()
const demo = ref(clonePattern(GROOVES.house))
</script>

<template>
  <section class="gv-screen gv-title">
    <div class="gv-title__head">
      <p class="gv-eyebrow">Rhythm · make a beat</p>
      <h1 class="gv-h1">DOWN<br>BEAT</h1>
      <p class="gv-title__dek">
        A drum groove is just three sounds placed on a grid. Learn where the kick, snare, and hats
        go, and you can build a beat that makes people move. Hit play to hear one.
      </p>
      <button type="button" class="gv-btn gv-btn--primary gv-title__cta" @click="emit('start')">
        Start the module
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </button>
    </div>

    <div class="gv-title__box">
      <p class="gv-title__box-label">A finished groove: four-on-the-floor</p>
      <Sequencer v-model="demo" :editable="false" :bpm="120" label="press play" />
    </div>
  </section>
</template>

<style scoped>
.gv-title {
  min-height: 100%;
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 44rem;
  align-items: center;
}
.gv-title__head { max-width: 460rem; }
.gv-h1 { margin: 4rem 0 0; }
.gv-title__dek { margin-top: 22rem; font-size: 17rem; line-height: 1.6; color: var(--gv-muted-strong); max-width: 42ch; }
.gv-title__cta { margin-top: 30rem; }
.gv-title__box {
  background: var(--gv-panel);
  border: 1px solid var(--gv-line);
  border-radius: 16rem;
  padding: 22rem 22rem 24rem;
  box-shadow: 0 30rem 60rem -40rem #000;
}
.gv-title__box-label { font-family: var(--gv-mono); font-size: 11.5rem; color: var(--gv-muted); margin-bottom: 16rem; }

@media (max-width: 860px) {
  .gv-title { grid-template-columns: 1fr; gap: 30rem; }
}
</style>

<script setup lang="ts">
import GaugeDial from './GaugeDial.vue'

const props = defineProps<{
  lessonStatus: string
  handsOnStatus: string
  assessmentStatus: string
  gaugeValue: number | null
}>()

const emit = defineEmits<{ open: [panel: 'lesson' | 'hands-on' | 'assessment'] }>()
</script>

<template>
  <section class="ct-menu">
    <p class="ct-menu__kicker">Menu</p>
    <h2 class="ct-menu__heading">The Confidence Trap</h2>

    <div class="ct-menu__grid">
      <button type="button" class="ct-menu__panel" @click="emit('open', 'lesson')">
        <span class="ct-menu__panel-title">Lesson</span>
        <span class="ct-menu__panel-desc">Why your brain lies to you about you.</span>
        <span class="ct-menu__panel-status">{{ lessonStatus }}</span>
      </button>

      <button type="button" class="ct-menu__panel" @click="emit('open', 'hands-on')">
        <span class="ct-menu__panel-title">Hands On</span>
        <span class="ct-menu__panel-desc">The Confidence Gauntlet. Five questions in an unfamiliar subject.</span>
        <span class="ct-menu__panel-status">{{ handsOnStatus }}</span>
      </button>

      <button type="button" class="ct-menu__panel" @click="emit('open', 'assessment')">
        <span class="ct-menu__panel-title">Assessment</span>
        <span class="ct-menu__panel-desc">Five questions on the actual mechanism. Minimum 80% to pass.</span>
        <span class="ct-menu__panel-status">{{ assessmentStatus }}</span>
      </button>

      <div class="ct-menu__gauge-wrap">
        <GaugeDial :value="gaugeValue" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ct-menu { padding: 90rem 0 60rem; }
.ct-menu__kicker {
  font-family: var(--ct-sans);
  font-size: 13rem;
  color: var(--ct-secondary);
  margin-bottom: 14rem;
}
.ct-menu__heading {
  font-family: var(--ct-serif);
  font-size: clamp(28rem, 4vw, 36rem);
  font-weight: 600;
  color: var(--ct-graphite);
  margin-bottom: 40rem;
}
.ct-menu__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) 200rem;
  gap: 16rem;
  align-items: stretch;
}
.ct-menu__panel {
  text-align: left;
  padding: 26rem 22rem;
  background: var(--ct-sand);
  border: 1px solid var(--ct-border);
  border-radius: 4rem;
  display: flex;
  flex-direction: column;
  gap: 10rem;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
@media (hover: hover) {
  .ct-menu__panel:hover { border-color: var(--ct-secondary); transform: translateY(-2rem); }
}
.ct-menu__panel:focus-visible { outline: 2px solid var(--ct-graphite); outline-offset: 2px; }
.ct-menu__panel-title {
  font-family: var(--ct-serif);
  font-size: 20rem;
  font-weight: 600;
  color: var(--ct-graphite);
}
.ct-menu__panel-desc {
  font-family: var(--ct-sans);
  font-size: 14rem;
  line-height: 1.55;
  color: var(--ct-secondary-on-card);
  flex: 1;
}
.ct-menu__panel-status {
  font-family: var(--ct-sans);
  font-size: 12.5rem;
  color: var(--ct-secondary-on-card);
  border-top: 1px solid var(--ct-border);
  padding-top: 10rem;
}
.ct-menu__gauge-wrap {
  background: var(--ct-sand);
  border: 1px solid var(--ct-border);
  border-radius: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 900px) {
  .ct-menu__grid { grid-template-columns: 1fr 1fr; }
  .ct-menu__gauge-wrap { grid-column: 1 / -1; }
}
@media (max-width: 560px) {
  .ct-menu__grid { grid-template-columns: 1fr; }
}
</style>

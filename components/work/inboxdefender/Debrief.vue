<script setup lang="ts">
import { useInboxDefenderStore } from '~/stores/inboxDefender'
import { ROUND_SIZE } from '~/utils/inboxdefender/items'

// Round cleared. Report the teaching metric (triage accuracy) and, where the
// learner slipped, name the exact tell to watch next time.
const emit = defineEmits<{ (e: 'replay'): void; (e: 'exit'): void }>()
const store = useInboxDefenderStore()
const seconds = computed(() => Math.max(1, Math.round(store.elapsedMs / 1000)))
</script>

<template>
  <div class="id-debrief">
    <div class="id-debrief__scan" aria-hidden="true" />
    <div class="id-debrief__inner">
      <p class="id-debrief__eyebrow">ROUND CLEARED</p>
      <h1 class="id-debrief__title">INBOX HELD</h1>
      <p class="id-debrief__sub">You triaged {{ ROUND_SIZE }} messages and kept the inbox standing.</p>

      <div class="id-debrief__stats">
        <div class="id-stat"><span class="id-stat__n">{{ store.accuracyPct }}%</span><span class="id-stat__l">Accuracy</span></div>
        <div class="id-stat"><span class="id-stat__n">{{ store.threatsStopped }}</span><span class="id-stat__l">Threats stopped</span></div>
        <div class="id-stat"><span class="id-stat__n">{{ store.score }}</span><span class="id-stat__l">Score</span></div>
      </div>

      <template v-if="store.missed.length">
        <h2 class="id-debrief__h2">Watch these next time</h2>
        <ul class="id-recap">
          <li v-for="m in store.missed" :key="m.category">
            <span class="id-recap__tag">{{ m.category }}</span>
            <span class="id-recap__text">{{ m.detail }}</span>
          </li>
        </ul>
      </template>
      <p v-else class="id-debrief__perfect">Flawless triage — you read every cue correctly.</p>

      <div class="id-debrief__actions">
        <button class="id-debrief__btn id-debrief__btn--go" type="button" @click="emit('replay')">PLAY AGAIN</button>
        <button class="id-debrief__btn" type="button" @click="emit('exit')">TITLE</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.id-debrief {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: radial-gradient(120% 90% at 50% 20%, #0f2418 0%, #0a0f14 55%, #05060b 100%);
  color: #e8ecf5;
  overflow: hidden;
}
.id-debrief__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.22) 3px);
  mix-blend-mode: multiply;
}
.id-debrief__inner {
  position: relative;
  z-index: 1;
  width: min(560px, 100%);
  text-align: center;
}
.id-debrief__eyebrow {
  margin: 0 0 12px;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.3em;
  color: #39ff88;
}
.id-debrief__title {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(24px, 6vw, 42px);
  letter-spacing: 0.03em;
  color: #ffb627;
  text-shadow: 3px 3px 0 #39ff88, 6px 6px 0 rgba(0, 0, 0, 0.4);
}
.id-debrief__sub {
  margin: 20px 0 24px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  color: #a7b0c6;
}
.id-debrief__stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 26px;
}
.id-stat {
  flex: 1;
  max-width: 150px;
  padding: 15px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(124, 77, 255, 0.3);
  border-radius: 6px;
}
.id-stat__n {
  display: block;
  font-family: 'Press Start 2P', monospace;
  font-size: 17px;
  color: #39ff88;
}
.id-stat__l {
  display: block;
  margin-top: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8792ab;
}
.id-debrief__h2 {
  margin: 0 0 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b79dff;
}
.id-recap {
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  text-align: left;
}
.id-recap li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 9px 0;
  border-bottom: 1px solid rgba(135, 146, 171, 0.14);
}
.id-recap__tag {
  flex: 0 0 auto;
  margin-top: 1px;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  line-height: 1.5;
  padding: 4px 6px;
  border-radius: 3px;
  color: #ff9db0;
  background: rgba(255, 59, 92, 0.12);
  max-width: 120px;
}
.id-recap__text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #b9c2d6;
}
.id-debrief__perfect {
  margin: 0 0 28px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  color: #39ff88;
}
.id-debrief__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.id-debrief__btn {
  padding: 14px 22px;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  border-radius: 5px;
  border: 1px solid rgba(135, 146, 171, 0.35);
  background: transparent;
  color: #c3cadb;
  cursor: pointer;
}
.id-debrief__btn--go {
  border-color: #39ff88;
  background: rgba(57, 255, 136, 0.12);
  color: #d6ffe7;
}
</style>

<script setup lang="ts">
import { useDoomboxStore } from '~/stores/doombox'
import { SPECIMENS } from '~/utils/doombox/emails'

// The takeaway layer. Server secured → recap all ten tells (the curriculum),
// report the teaching metric (puzzle accuracy, not trigger accuracy), and
// offer a replay.
const emit = defineEmits<{ (e: 'replay'): void; (e: 'exit'): void }>()
const store = useDoomboxStore()

const seconds = computed(() => Math.max(1, Math.round(store.elapsedMs / 1000)))
const accuracyPct = computed(() => Math.round(store.accuracy * 100))
</script>

<template>
  <div class="db-debrief">
    <div class="db-debrief__scan" aria-hidden="true" />
    <div class="db-debrief__inner">
      <p class="db-debrief__eyebrow">MODULE COMPLETE</p>
      <h1 class="db-debrief__title">SERVER SECURED</h1>
      <p class="db-debrief__sub">All 10 threats neutralised. Learning objectives met.</p>

      <div class="db-debrief__stats">
        <div class="db-stat"><span class="db-stat__n">10</span><span class="db-stat__l">Neutralised</span></div>
        <div class="db-stat"><span class="db-stat__n">{{ accuracyPct }}%</span><span class="db-stat__l">Puzzle accuracy</span></div>
        <div class="db-stat"><span class="db-stat__n">{{ seconds }}s</span><span class="db-stat__l">Time in server</span></div>
      </div>

      <h2 class="db-debrief__h2">The ten tells you cleared</h2>
      <ul class="db-recap">
        <li v-for="s in SPECIMENS" :key="s.id">
          <span class="db-recap__tag" :class="`db-recap__tag--${s.kind}`">{{ s.kind === 'virus' ? 'VIR' : 'SPM' }}</span>
          <span class="db-recap__text">{{ s.giveaway }}</span>
        </li>
      </ul>

      <div class="db-debrief__actions">
        <button class="db-debrief__btn db-debrief__btn--go" type="button" @click="emit('replay')">PLAY AGAIN</button>
        <button class="db-debrief__btn" type="button" @click="emit('exit')">BACK TO TITLE</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.db-debrief {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  background: radial-gradient(120% 90% at 50% 20%, #0f2418 0%, #0a0f14 55%, #05060b 100%);
  color: #e8ecf5;
  overflow: hidden;
}
.db-debrief__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.22) 3px);
  mix-blend-mode: multiply;
}
.db-debrief__inner {
  position: relative;
  z-index: 1;
  width: min(640px, 100%);
  text-align: center;
}
.db-debrief__eyebrow {
  margin: 0 0 12px;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.3em;
  color: #39ff88;
}
.db-debrief__title {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(24px, 6vw, 46px);
  letter-spacing: 0.03em;
  color: #ffb627;
  text-shadow: 3px 3px 0 #39ff88, 6px 6px 0 rgba(0, 0, 0, 0.4);
}
.db-debrief__sub {
  margin: 20px 0 26px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px;
  color: #a7b0c6;
}
.db-debrief__stats {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 30px;
}
.db-stat {
  flex: 1;
  max-width: 150px;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(124, 77, 255, 0.3);
  border-radius: 6px;
}
.db-stat__n {
  display: block;
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: #39ff88;
}
.db-stat__l {
  display: block;
  margin-top: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8792ab;
}
.db-debrief__h2 {
  margin: 0 0 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b79dff;
}
.db-recap {
  list-style: none;
  margin: 0 0 30px;
  padding: 0;
  text-align: left;
}
.db-recap li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 9px 0;
  border-bottom: 1px solid rgba(135, 146, 171, 0.14);
}
.db-recap__tag {
  flex: 0 0 auto;
  margin-top: 1px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 4px 5px;
  border-radius: 3px;
}
.db-recap__tag--spam {
  color: #39ff88;
  background: rgba(57, 255, 136, 0.12);
}
.db-recap__tag--virus {
  color: #ff3b5c;
  background: rgba(255, 59, 92, 0.12);
}
.db-recap__text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13.5px;
  line-height: 1.5;
  color: #b9c2d6;
}
.db-debrief__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.db-debrief__btn {
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
.db-debrief__btn--go {
  border-color: #39ff88;
  background: rgba(57, 255, 136, 0.12);
  color: #d6ffe7;
}
</style>

<script setup lang="ts">
import { useInboxDefenderStore } from '~/stores/inboxDefender'

// Integrity hit zero — too many threats landed (or too much real mail shot).
// Shown on the LCD in virus-red, with an immediate retry.
const emit = defineEmits<{ (e: 'retry'): void; (e: 'exit'): void }>()
const store = useInboxDefenderStore()
</script>

<template>
  <div class="id-over">
    <div class="id-over__scan" aria-hidden="true" />
    <div class="id-over__inner">
      <p class="id-over__eyebrow">INTEGRITY LOST</p>
      <h1 class="id-over__title">INBOX<br />BREACHED</h1>
      <p class="id-over__sub">
        Too much slipped through. You held <b>{{ store.accuracyPct }}%</b> accuracy over {{ store.handled }} messages.
      </p>
      <div class="id-over__actions">
        <button class="id-over__btn id-over__btn--go" type="button" @click="emit('retry')">RETRY</button>
        <button class="id-over__btn" type="button" @click="emit('exit')">TITLE</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.id-over {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  text-align: center;
  background: radial-gradient(120% 90% at 50% 30%, #2a0d14 0%, #12060a 55%, #05060b 100%);
  color: #ffd6dd;
  overflow-y: auto;
}
.id-over__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.28) 3px);
  mix-blend-mode: multiply;
}
.id-over__inner { position: relative; z-index: 1; }
.id-over__eyebrow {
  margin: 0 0 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  letter-spacing: 0.28em;
  color: #ff3b5c;
}
.id-over__title {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(20px, 6vw, 30px);
  line-height: 1.3;
  color: #ff3b5c;
  text-shadow: 3px 3px 0 #7c4dff, 6px 6px 0 rgba(0, 0, 0, 0.5);
}
.id-over__sub {
  margin: 16px 0 20px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12.5px;
  color: #d6a3ad;
}
.id-over__sub b { color: #fff; }
.id-over__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.id-over__btn {
  padding: 12px 18px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  border-radius: 5px;
  border: 1px solid rgba(255, 214, 221, 0.4);
  background: transparent;
  color: #ffd6dd;
  cursor: pointer;
}
.id-over__btn--go {
  border-color: #ff3b5c;
  background: rgba(255, 59, 92, 0.16);
  color: #fff;
}
</style>

<script setup lang="ts">
import { useDoomboxStore, TOTAL_THREATS } from '~/stores/doombox'

// The officer went down. Shown on the console LCD, styled to match the title
// but in virus-red. Offers an immediate retry.
const emit = defineEmits<{ (e: 'retry'): void; (e: 'exit'): void }>()
const store = useDoomboxStore()
</script>

<template>
  <div class="db-over">
    <div class="db-over__scan" aria-hidden="true" />
    <div class="db-over__inner">
      <p class="db-over__eyebrow">CONNECTION LOST</p>
      <h1 class="db-over__title">SYSTEM<br />COMPROMISED</h1>
      <p class="db-over__sub">
        The threats overran you with <b>{{ store.neutralised }} / {{ TOTAL_THREATS }}</b> neutralised.
      </p>
      <div class="db-over__actions">
        <button class="db-over__btn db-over__btn--go" type="button" @click="emit('retry')">RETRY</button>
        <button class="db-over__btn" type="button" @click="emit('exit')">TITLE</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.db-over {
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
.db-over__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.28) 3px);
  mix-blend-mode: multiply;
}
.db-over__inner {
  position: relative;
  z-index: 1;
}
.db-over__eyebrow {
  margin: 0 0 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  letter-spacing: 0.28em;
  color: #ff3b5c;
}
.db-over__title {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(16px, 5.4vw, 26px);
  line-height: 1.3;
  color: #ff3b5c;
  text-shadow: 3px 3px 0 #7c4dff, 6px 6px 0 rgba(0, 0, 0, 0.5);
}
.db-over__sub {
  margin: 16px 0 20px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12.5px;
  color: #d6a3ad;
}
.db-over__sub b {
  color: #fff;
}
.db-over__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.db-over__btn {
  padding: 12px 18px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  border-radius: 5px;
  border: 1px solid rgba(255, 214, 221, 0.4);
  background: transparent;
  color: #ffd6dd;
  cursor: pointer;
}
.db-over__btn--go {
  border-color: #ff3b5c;
  background: rgba(255, 59, 92, 0.16);
  color: #fff;
}
</style>

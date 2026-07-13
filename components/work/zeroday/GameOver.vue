<script setup lang="ts">
import { useZeroDayStore } from '~/stores/zeroday'
const emit = defineEmits<{ (e: 'retry'): void; (e: 'exit'): void }>()
const store = useZeroDayStore()
</script>

<template>
  <div class="zd-end zd-end--lose">
    <div class="zd-end__scan" aria-hidden="true" />
    <div class="zd-end__inner">
      <p class="zd-end__eyebrow">RESPONDER DOWN</p>
      <h1 class="zd-end__title zd-end__title--lose">FLATLINED</h1>
      <p class="zd-end__takeaway">
        The malware overran you after <b>{{ store.kills }}</b> kills, {{ store.progressPct }}% to the patch node.
      </p>
      <div class="zd-end__actions">
        <button class="zd-end__btn zd-end__btn--go" type="button" @click="emit('retry')">RETRY</button>
        <button class="zd-end__btn" type="button" @click="emit('exit')">TITLE</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.zd-end {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  text-align: center;
  overflow-y: auto;
  color: #ffd6dd;
}
.zd-end--lose { background: radial-gradient(120% 90% at 50% 26%, #2a0d14 0%, #12060a 55%, #05060b 100%); }
.zd-end__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.3) 3px);
  mix-blend-mode: multiply;
}
.zd-end__inner { position: relative; z-index: 1; width: 100%; max-width: 300px; }
.zd-end__eyebrow {
  margin: 0 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  letter-spacing: 0.2em;
  color: #ff3b5c;
}
.zd-end__title {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(20px, 9vw, 30px);
  line-height: 1.2;
}
.zd-end__title--lose { color: #ff3b5c; text-shadow: 2px 2px 0 #7c4dff, 4px 4px 0 rgba(0, 0, 0, 0.5); }
.zd-end__takeaway {
  margin: 14px 0 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  line-height: 1.5;
  color: #d6a3ad;
}
.zd-end__takeaway b { color: #fff; }
.zd-end__actions { display: flex; gap: 8px; justify-content: center; }
.zd-end__btn {
  padding: 10px 14px;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  border-radius: 5px;
  border: 1px solid rgba(255, 214, 221, 0.4);
  background: transparent;
  color: #ffd6dd;
  cursor: pointer;
}
.zd-end__btn--go { border-color: #ff3b5c; background: rgba(255, 59, 92, 0.16); color: #fff; }
</style>

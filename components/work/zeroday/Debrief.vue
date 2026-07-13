<script setup lang="ts">
import { useZeroDayStore } from '~/stores/zeroday'
const emit = defineEmits<{ (e: 'replay'): void; (e: 'exit'): void }>()
const store = useZeroDayStore()
const seconds = computed(() => Math.max(1, Math.round(store.elapsedMs / 1000)))
</script>

<template>
  <div class="zd-end zd-end--win">
    <div class="zd-end__scan" aria-hidden="true" />
    <div class="zd-end__inner">
      <p class="zd-end__eyebrow">PATCH DEPLOYED</p>
      <h1 class="zd-end__title zd-end__title--win">SUBNET<br />SECURED</h1>
      <div class="zd-end__stats">
        <span><b>{{ store.kills }}</b> threats</span>
        <span><b>{{ seconds }}s</b> run</span>
      </div>
      <p class="zd-end__takeaway">
        A zero-day is a flaw with no fix yet — defence in depth (patching, firewalls, MFA) buys the time to respond.
      </p>
      <div class="zd-end__actions">
        <button class="zd-end__btn zd-end__btn--go" type="button" @click="emit('replay')">REDEPLOY</button>
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
  color: #d8f0e2;
}
.zd-end--win { background: radial-gradient(120% 90% at 50% 20%, #0f2418 0%, #0a0f14 55%, #05060b 100%); }
.zd-end__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.28) 3px);
  mix-blend-mode: multiply;
}
.zd-end__inner { position: relative; z-index: 1; width: 100%; max-width: 300px; }
.zd-end__eyebrow {
  margin: 0 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  letter-spacing: 0.2em;
  color: #39ff88;
}
.zd-end__title {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(18px, 8vw, 28px);
  line-height: 1.25;
}
.zd-end__title--win { color: #ffb627; text-shadow: 2px 2px 0 #39ff88, 4px 4px 0 rgba(0, 0, 0, 0.4); }
.zd-end__stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 14px 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  color: #9fb0a6;
}
.zd-end__stats b { color: #39ff88; font-family: 'Press Start 2P', monospace; font-size: 12px; }
.zd-end__takeaway {
  margin: 0 0 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11.5px;
  line-height: 1.5;
  color: #9fb0a6;
}
.zd-end__actions { display: flex; gap: 8px; justify-content: center; }
.zd-end__btn {
  padding: 10px 14px;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  border-radius: 5px;
  border: 1px solid rgba(135, 146, 171, 0.35);
  background: transparent;
  color: #c3cadb;
  cursor: pointer;
}
.zd-end__btn--go { border-color: #39ff88; background: rgba(57, 255, 136, 0.12); color: #d6ffe7; }
</style>

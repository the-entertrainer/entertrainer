<script setup lang="ts">
import { useZeroDayStore, MAX_HP } from '~/stores/zeroday'
const store = useZeroDayStore()
</script>

<template>
  <div class="zh">
    <div class="zh__top">
      <div class="zh__hp">
        <span
          v-for="i in MAX_HP"
          :key="i"
          class="zh__pip"
          :class="{ 'zh__pip--on': i <= store.hp }"
        />
      </div>
      <div class="zh__right">
        <span v-if="store.shield > 0" class="zh__shield">⛊{{ Math.ceil(store.shield) }}</span>
        <span class="zh__kills">✖ {{ store.kills }}</span>
        <button class="zh__exit" type="button" @click="store.goTitle()">▸</button>
      </div>
    </div>
    <div class="zh__bar"><span class="zh__fill" :style="{ width: store.progressPct + '%' }" /></div>
  </div>
</template>

<style scoped>
.zh {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: 'Press Start 2P', monospace;
}
.zh__top {
  position: absolute;
  top: 4px;
  left: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.zh__hp {
  display: flex;
  gap: 3px;
}
.zh__pip {
  width: 8px;
  height: 8px;
  border: 1px solid rgba(255, 59, 92, 0.6);
  background: transparent;
}
.zh__pip--on {
  background: #ff3b5c;
  box-shadow: 0 0 4px #ff3b5c;
}
.zh__right {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 8px;
}
.zh__shield {
  color: #4db8ff;
}
.zh__kills {
  color: #ffb627;
}
.zh__exit {
  pointer-events: auto;
  font-family: inherit;
  font-size: 9px;
  color: #ff3b5c;
  background: transparent;
  border: 1px solid rgba(255, 59, 92, 0.5);
  border-radius: 3px;
  padding: 2px 5px;
  cursor: pointer;
}
.zh__bar {
  position: absolute;
  top: 18px;
  left: 5px;
  right: 5px;
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  overflow: hidden;
}
.zh__fill {
  display: block;
  height: 100%;
  background: #39ff88;
  transition: width 0.2s ease;
}
</style>

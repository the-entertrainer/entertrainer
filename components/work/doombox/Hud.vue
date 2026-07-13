<script setup lang="ts">
import { useDoomboxStore, TOTAL_THREATS } from '~/stores/doombox'

// The CRT status bar: threats cleared, officer health, and an exit. Sits
// above the canvas; pointer-events pass through except on its own controls.
const store = useDoomboxStore()

// health bar tint shifts red as it drains
const healthColor = computed(() =>
  store.healthPct > 55 ? '#39ff88' : store.healthPct > 25 ? '#ffb627' : '#ff3b5c'
)
</script>

<template>
  <div class="db-hud">
    <div class="db-hud__bar">
      <div class="db-hud__cell">
        <span class="db-hud__k">ARMOUR</span>
        <span class="db-hud__health">
          <span class="db-hud__health-fill" :style="{ width: store.healthPct + '%', background: healthColor }" />
        </span>
      </div>
      <div class="db-hud__cell db-hud__cell--mid">
        <span class="db-hud__k">THREATS NEUTRALISED</span>
        <span class="db-hud__v db-hud__v--big">{{ store.neutralised }} / {{ TOTAL_THREATS }}</span>
      </div>
      <div class="db-hud__cell db-hud__cell--right">
        <button class="db-hud__exit" type="button" @click="store.goTitle()">EXIT ▸</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.db-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: 'Press Start 2P', 'Space Grotesk', monospace;
}
.db-hud__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: linear-gradient(180deg, rgba(5, 6, 11, 0.9), rgba(5, 6, 11, 0));
}
.db-hud__cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.db-hud__cell--mid {
  align-items: center;
}
.db-hud__cell--right {
  pointer-events: auto;
}
.db-hud__k {
  font-size: 8px;
  letter-spacing: 0.14em;
  color: #8a6410;
}
.db-hud__v {
  font-size: 11px;
  color: #ffb627;
  letter-spacing: 0.06em;
}
.db-hud__v--big {
  font-size: 15px;
  color: #39ff88;
}
.db-hud__health {
  display: block;
  width: 92px;
  height: 9px;
  border: 1px solid rgba(255, 182, 39, 0.5);
  border-radius: 2px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
}
.db-hud__health-fill {
  display: block;
  height: 100%;
  transition: width 0.18s ease, background 0.3s ease;
}
.db-hud__exit {
  font-family: inherit;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: #ff3b5c;
  background: transparent;
  border: 1px solid rgba(255, 59, 92, 0.5);
  border-radius: 3px;
  padding: 7px 10px;
  cursor: pointer;
}
.db-hud__exit:hover {
  background: rgba(255, 59, 92, 0.12);
}
</style>

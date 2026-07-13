<script setup lang="ts">
import { useInboxDefenderStore } from '~/stores/inboxDefender'

// CRT status bar: inbox integrity, score, and an exit. Sits over the canvas.
const store = useInboxDefenderStore()
const integrityColor = computed(() =>
  store.integrityPct > 55 ? '#39ff88' : store.integrityPct > 25 ? '#ffb627' : '#ff3b5c'
)
</script>

<template>
  <div class="id-hud">
    <div class="id-hud__bar">
      <div class="id-hud__cell">
        <span class="id-hud__k">INBOX INTEGRITY</span>
        <span class="id-hud__meter">
          <span class="id-hud__fill" :style="{ width: store.integrityPct + '%', background: integrityColor }" />
        </span>
      </div>
      <div class="id-hud__cell id-hud__cell--mid">
        <span class="id-hud__k">SCORE</span>
        <span class="id-hud__score">{{ store.score }}</span>
      </div>
      <div class="id-hud__cell id-hud__cell--right">
        <button class="id-hud__exit" type="button" @click="store.goTitle()">EXIT ▸</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.id-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  font-family: 'Press Start 2P', monospace;
}
.id-hud__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 14px;
  background: linear-gradient(180deg, rgba(5, 6, 11, 0.9), rgba(5, 6, 11, 0));
}
.id-hud__cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.id-hud__cell--mid { align-items: center; }
.id-hud__cell--right { pointer-events: auto; }
.id-hud__k {
  font-size: 7.5px;
  letter-spacing: 0.12em;
  color: #8a6410;
}
.id-hud__meter {
  display: block;
  width: 108px;
  height: 9px;
  border: 1px solid rgba(255, 182, 39, 0.5);
  border-radius: 2px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
}
.id-hud__fill {
  display: block;
  height: 100%;
  transition: width 0.18s ease, background 0.3s ease;
}
.id-hud__score {
  font-size: 13px;
  color: #39ff88;
}
.id-hud__exit {
  font-family: inherit;
  font-size: 8px;
  letter-spacing: 0.12em;
  color: #ff3b5c;
  background: transparent;
  border: 1px solid rgba(255, 59, 92, 0.5);
  border-radius: 3px;
  padding: 6px 8px;
  cursor: pointer;
}
.id-hud__exit:hover { background: rgba(255, 59, 92, 0.12); }
</style>

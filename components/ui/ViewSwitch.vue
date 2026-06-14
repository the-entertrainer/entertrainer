<script setup lang="ts">
import { useHomeViewStore } from '~/stores/homeview'

const homeViewStore = useHomeViewStore()
const mode = computed(() => homeViewStore.mode)
</script>

<template>
  <div class="view-switch">
    <button
      class="btn"
      :class="{ active: mode === 'spiral' }"
      @click="homeViewStore.setMode('spiral')"
    >
      <span>spiral</span>
      <span>spiral</span>
    </button>
    <button
      class="btn"
      :class="{ active: mode === 'list' }"
      @click="homeViewStore.setMode('list')"
    >
      <span>list</span>
      <span>list</span>
    </button>
  </div>
</template>

<style scoped>
.view-switch {
  display: flex;
  gap: 8rem;
}
.btn {
  position: relative;
  overflow: hidden;
  background: none;
  border: 1px solid var(--color-white20);
  border-radius: var(--radius-full);
  color: var(--color-white);
  font-family: var(--main-font);
  font-size: 14rem;
  font-weight: 500;
  letter-spacing: -0.04em;
  padding: 8rem 16rem;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.3s ease, border-color 0.3s ease;
}
.btn.active {
  opacity: 1;
  border-color: var(--color-white);
}
.btn span {
  display: block;
  transition: transform 0.3s var(--ease-spring), opacity 0.3s ease;
}
.btn span:nth-child(2) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% - 100%));
  opacity: 0;
}
.btn:hover span:first-child,
.btn.active span:first-child {
  transform: translateY(100%);
  opacity: 0;
}
.btn:hover span:nth-child(2),
.btn.active span:nth-child(2) {
  transform: translate(-50%, -50%);
  opacity: 1;
}
</style>

<script setup lang="ts">
import { useHomeViewStore } from '~/stores/homeview'

const homeViewStore = useHomeViewStore()
const isList = computed(() => homeViewStore.mode === 'list')
</script>

<template>
  <button
    class="view-pill"
    :aria-label="isList ? 'Switch to spiral view' : 'Switch to list view'"
    @click="homeViewStore.toggle()"
  >
    <span class="view-pill__inner" :class="{ flipped: isList }">
      <span class="face face--front">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M11 12a1 1 0 1 1 2 0 2 2 0 1 1-4 0 3 3 0 1 1 6 0 4 4 0 1 1-8 0"/>
        </svg>
        <span>Spiral</span>
      </span>
      <span class="face face--back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" aria-hidden="true">
          <line x1="4" y1="7"  x2="20" y2="7"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="17" x2="20" y2="17"/>
        </svg>
        <span>List</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.view-pill {
  position: relative;
  width: 116rem;
  height: 40rem;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--main-font);
  perspective: 600rem;
}
.view-pill__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.55s var(--ease-spring);
}
.view-pill__inner.flipped {
  transform: rotateX(180deg);
}
.face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rem;
  border-radius: var(--radius-full);
  background: var(--color-white);
  color: var(--color-black);
  font-size: 14rem;
  font-weight: 500;
  letter-spacing: -0.04em;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.face--back {
  transform: rotateX(180deg);
}
.face svg {
  width: 16rem;
  height: 16rem;
}
</style>

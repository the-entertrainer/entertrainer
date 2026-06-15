<script setup lang="ts">
// Logo — 5-dot "E" brand mark; navigates home on click.
</script>

<template>
  <NuxtLink to="/" class="logo-wrapper" aria-label="Entertrainer — home">
    <div class="logo">
      <svg class="logo-mark" viewBox="0 0 24 24" aria-hidden="true">
        <!-- Left spine -->
        <circle cx="7"  cy="6"  r="2.6" />
        <circle cx="7"  cy="12" r="2.6" />
        <circle cx="7"  cy="18" r="2.6" />
        <!-- Arms -->
        <circle cx="17" cy="6"  r="2.6" />
        <circle cx="17" cy="18" r="2.6" />
      </svg>
    </div>
  </NuxtLink>
</template>

<style scoped>
.logo-wrapper {
  position: fixed;
  left: calc(30rem + var(--safe-left));
  top: calc(38rem + var(--safe-top));
  width: 48rem;
  height: 48rem;
  z-index: 30;
  cursor: pointer;
}
.logo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-white);
  transition: transform 0.2s ease;
}
.logo-mark {
  width: 24rem;
  height: 24rem;
}
.logo-mark circle {
  fill: var(--color-black);
}
.logo:active {
  transform: scale(0.9);
}
</style>

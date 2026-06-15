<script setup lang="ts">
// Logo — navigates home on click.
</script>

<template>
  <NuxtLink to="/" class="logo-wrapper" aria-label="Entertrainer — home">
    <div class="logo">E</div>
  </NuxtLink>
</template>

<style scoped>
.logo-wrapper {
  position: fixed;
  left: calc(30rem + var(--safe-left));
  top: calc(30rem + var(--safe-top));
  width: 64rem;
  height: 64rem;
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
  color: var(--color-black);
  font-size: 24rem;
  font-weight: 700;
  transition: transform 0.2s ease;
}
.logo:active {
  transform: scale(0.9);
}
</style>

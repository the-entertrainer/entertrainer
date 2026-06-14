<script setup lang="ts">
// Logo — Section 7.11. Navigates home on click.
</script>

<template>
  <NuxtLink to="/" class="logo-wrapper">
    <div class="logo">P</div>
    <div class="logo-tag-wrapper">back to works</div>
  </NuxtLink>
</template>

<style scoped>
.logo-wrapper {
  position: fixed;
  left: 30rem;
  top: 30rem;
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
.logo-tag-wrapper {
  position: absolute;
  left: 72rem;
  top: 50%;
  white-space: nowrap;
  padding: 6rem 14rem;
  border-radius: var(--radius-full);
  background: var(--color-pop-green);
  color: var(--color-black);
  font-size: 14rem;
  font-weight: 600;
  opacity: 0;
  transform: scale(0.5) translate(-10%);
  transform-origin: left center;
  transition: opacity 0.2s ease-out, transform 0.5s var(--ease-spring);
}
.logo-wrapper:hover .logo-tag-wrapper {
  opacity: 1;
  transform: scale(1) rotate(-5deg) translateY(-12rem);
}
</style>

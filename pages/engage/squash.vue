<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Fever Dream · Engage',
  description: 'A banana hits the floor. Squeeze the brown roaches. The green ones want the wires.',
  ogUrl: 'https://entertrainer.in/engage/squash'
})
</script>

<template>
  <div class="ng">
    <NuxtLink to="/engage" class="ng__back" aria-label="Back to Engage">←</NuxtLink>
    <iframe
      class="ng__frame"
      src="/fever/index.html"
      title="Fever Dream"
      allow="fullscreen"
    />
  </div>
</template>

<style scoped>
.ng {
  position: relative;
  height: 100svh;
  height: 100dvh;
  background: #140e0c;
}
.ng__back {
  position: absolute;
  z-index: 4;
  top: max(10rem, env(safe-area-inset-top));
  left: max(10rem, env(safe-area-inset-left));
  width: 42rem;
  height: 42rem;
  display: grid;
  place-items: center;
  border-radius: 12rem;
  background: #ffffff08;
  border: 1px solid #42423c;
  color: #f7f1e4;
  text-decoration: none;
  font-size: 18rem;
}
.ng__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #140e0c;
}
</style>

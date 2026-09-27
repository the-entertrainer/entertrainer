<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'NETAGIRI · Five years. One chair. · Entertrainer',
  description: 'Govern through 260 weekly decisions, build your record, and win a second mandate in Entertrainer’s political satire game.',
  ogUrl: 'https://www.entertrainer.in/engage/netagiri'
})
</script>

<template>
  <!-- Isolate the game viewport, styles and state from the publication shell. -->
  <iframe
    class="netagiri-game"
    src="/netagiri/five-years/index.html"
    title="Netagiri: The Second Mandate"
    allow="fullscreen"
    allowfullscreen
  />
</template>

<style scoped>
.netagiri-game {
  position: fixed;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  height: 100dvh;
  border: 0;
  background: #0b0b0c;
  z-index: 20;
}
</style>

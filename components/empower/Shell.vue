<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  deck: string
  statusText: string
  wide?: boolean
  busy?: boolean
}>(), {
  wide: false,
  busy: false,
})
</script>

<template>
  <article class="em-tool" :class="{ 'em-tool--wide': wide }" :aria-busy="busy ? 'true' : 'false'">
    <header class="em-tool__head">
      <NuxtLink to="/empower" class="em-back">Back to Empower</NuxtLink>
      <h1 class="em-h1">{{ title }}</h1>
      <p class="em-deck">{{ deck }}</p>
    </header>
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ statusText }}</p>
    <slot />
  </article>
</template>

<script setup lang="ts">
defineProps<{ title: string; standfirst?: string }>()
</script>

<template>
  <div class="w-hero">
    <h1 class="w-hero-main">{{ title }}</h1>
    <p v-if="standfirst" class="w-hero-sub">{{ standfirst }}</p>
  </div>
</template>

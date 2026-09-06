<template>
  <div class="app" style="padding:24px">
    <header class="topbar">
      <button type="button" class="icon-btn" aria-label="Back" @click="navigateTo('/dialogue')">←</button>
      <h1>Library</h1>
    </header>
    <p class="muted">Photos, stickers, balloons, and fonts live on this phone.</p>
    <p class="muted">Soon: browse imported assets here.</p>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'dialogue' })
useSeoMeta({ title: 'Dialogue — Library' })
</script>

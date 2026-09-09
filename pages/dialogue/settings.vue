<template>
  <div>
    <div class="topbar">
      <button type="button" class="icon-btn u-icon-btn u-icon-btn--idle" aria-label="Back" @click="navigateTo('/dialogue')">←</button>
      <h1>Settings</h1>
      <span style="width:56px" />
    </div>
    <DialogueSettingsPanel />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dialogue' })
</script>

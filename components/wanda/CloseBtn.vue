<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
  <button class="w-close w-link" type="button">
    {{ label || '(×) Close' }}
  </button>
</template>

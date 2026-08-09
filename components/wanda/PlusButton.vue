<script setup lang="ts">
defineProps<{ open?: boolean }>()
</script>

<template>
  <button
    class="w-plus"
    type="button"
    :class="{ 'is-open': open }"
    :aria-expanded="open ? 'true' : 'false'"
    :aria-label="open ? 'Close index' : 'Open index'"
  >
    <span class="w-plus-glyph" aria-hidden="true" />
  </button>
</template>

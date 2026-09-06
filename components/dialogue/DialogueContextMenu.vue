<template>
  <div class="ctx-menu" :class="{ open }" role="menu">
    <button type="button" @click="$emit('duplicate')">Duplicate</button>
    <button type="button" @click="$emit('rename')">Rename</button>
    <button type="button" @click="$emit('delete')">Delete</button>
    <button type="button" @click="$emit('export')">Export</button>
    <button type="button" @click="$emit('close')">Close</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits(['duplicate', 'rename', 'delete', 'export', 'close'])
</script>

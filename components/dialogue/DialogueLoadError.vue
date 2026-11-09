<template>
  <div class="dlg-load-error" role="alert">
    <p>Dialogue couldn't load its drawing tools. Nothing was saved. Try again.</p>
    <button type="button" class="dlg-load-error__retry" @click="$emit('retry')">Retry</button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ retry: [] }>()
</script>

<style scoped>
.dlg-load-error {
  margin: 1.5rem;
  padding: 1.125rem;
  border: 0.125rem solid #12110f;
  border-radius: 0.75rem;
  background: #f6f1e8;
  color: #12110f;
  font: 1rem/1.4 Inter, system-ui, sans-serif;
}
.dlg-load-error p { margin: 0 0 0.875rem; }
.dlg-load-error__retry {
  min-height: 2.75rem;
  padding: 0 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #ffd43b;
  color: #12110f;
  font: 700 0.9375rem/1 Inter, system-ui, sans-serif;
  cursor: pointer;
}
</style>

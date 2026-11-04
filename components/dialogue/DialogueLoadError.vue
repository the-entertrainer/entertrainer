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
  margin: 24rem;
  padding: 18rem;
  border: 2rem solid #12110f;
  border-radius: 12rem;
  background: #f6f1e8;
  color: #12110f;
  font: 16rem/1.4 Inter, system-ui, sans-serif;
}
.dlg-load-error p { margin: 0 0 14rem; }
.dlg-load-error__retry {
  min-height: 44rem;
  padding: 0 16rem;
  border: 0;
  border-radius: 8rem;
  background: #ffd43b;
  color: #12110f;
  font: 700 15rem/1 Inter, system-ui, sans-serif;
  cursor: pointer;
}
</style>

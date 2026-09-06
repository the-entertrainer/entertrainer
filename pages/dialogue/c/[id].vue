<template>
  <div class="editor-page">
    <ClientOnly>
      <DialogueEditorShell :project-id="id" />
      <template #fallback>
        <p style="padding:24px">Loading editor…</p>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dialogue' })
const route = useRoute()
const id = computed(() => String(route.params.id))
</script>

<style scoped>
.editor-page { min-height: 100dvh; display: flex; flex-direction: column; }
</style>

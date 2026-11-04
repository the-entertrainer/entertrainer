<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Satya Space — Lab',
  robots: 'noindex, nofollow',
})

useHead({
  bodyAttrs: { class: 'satya-lock' },
})

const WorldStage = defineAsyncComponent({
  loader: () => import('~/components/world/WorldStage.vue'),
  suspensible: false,
})
</script>

<template>
  <ClientOnly>
    <WorldStage />
    <template #fallback>
      <div class="satya-boot" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>

<style>
body.satya-lock { overflow: hidden; }

.satya-boot {
  position: fixed;
  inset: 0;
  background: #07070A;
}
</style>

<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
const contentStore = useContentStore()
</script>

<template>
  <SpiralView
    :items="contentStore.toolsNav"
    back-href="/"
    title="Tools"
  />
</template>

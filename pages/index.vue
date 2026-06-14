<script setup lang="ts">
import { useContentStore } from '~/stores/content'

definePageMeta({ layout: 'default' })
const contentStore = useContentStore()
</script>

<template>
  <SpiralView
    :items="contentStore.homeNav"
    :show-loader="true"
    :show-view-switch="true"
    title="Select a section"
  />
</template>

<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Snap-to-Text · Empower',
  description: 'Photo to text. Leaves your device.',
  ogUrl: absoluteUrl('/empower/snap-to-text'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerSnapToText />
  </EmpowerFrame>
</template>

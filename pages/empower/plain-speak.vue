<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Plain-Speak Meter · Empower',
  description: 'Paste a draft. We’ll mark the fog.',
  ogUrl: absoluteUrl('/empower/plain-speak'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerPlainSpeak />
  </EmpowerFrame>
</template>

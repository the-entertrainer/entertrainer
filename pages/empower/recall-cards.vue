<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Recall Cards · Empower',
  description: 'Paste notes. Remember them later.',
  ogUrl: absoluteUrl('/empower/recall-cards'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerRecallCards />
  </EmpowerFrame>
</template>

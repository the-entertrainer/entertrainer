<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'PDF Kit · Empower',
  description: 'PDFs that never go to a server.',
  ogUrl: absoluteUrl('/empower/pdf-kit'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerPdfKit />
  </EmpowerFrame>
</template>

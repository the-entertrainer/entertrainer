<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Empower · Everyday tools by Entertrainer',
  description: 'Everyday tools for clearer thinking and work. They run in your browser — private, and available offline once loaded.',
  ogUrl: absoluteUrl('/empower'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerHub />
  </EmpowerFrame>
</template>

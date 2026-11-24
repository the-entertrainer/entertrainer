<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Access Check · Empower',
  description: 'A first pass before the formal audit.',
  ogUrl: absoluteUrl('/empower/access-check'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerAccessCheck />
  </EmpowerFrame>
</template>

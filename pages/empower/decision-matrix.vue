<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Decision Matrix · Empower',
  description: 'Name the options. Weight what matters. See what wins.',
  ogUrl: absoluteUrl('/empower/decision-matrix'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerDecisionMatrix />
  </EmpowerFrame>
</template>

<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Goal Shaper · Empower',
  description: 'What are you trying to make true?',
  ogUrl: absoluteUrl('/empower/goal-shaper'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerGoalShaper />
  </EmpowerFrame>
</template>

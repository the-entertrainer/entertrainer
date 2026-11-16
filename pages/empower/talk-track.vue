<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Talk Track · Empower',
  description: 'Drop a deck. Get words you’d actually say.',
  ogUrl: absoluteUrl('/empower/talk-track'),
})
</script>

<template>
  <EmpowerFrame>
    <EmpowerTalkTrack />
  </EmpowerFrame>
</template>

<script setup lang="ts">
const route = useRoute()
await navigateTo(`/elevate/${route.params.slug}`, { redirectCode: 301 })
</script>

<template><div /></template>

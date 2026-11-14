<script setup lang="ts">
import matrix from '~/content/redirects.json'

const route = useRoute()
const from = `/blogs/${route.params.slug}`
const row = matrix.exact.find((item) => item.from === from)
if (!row) throw createError({ statusCode: 404, statusMessage: 'Not found' })
await navigateTo(row.to, { redirectCode: 301 })
</script>

<template><div /></template>

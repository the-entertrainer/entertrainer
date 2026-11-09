<script setup lang="ts">
// Unknown /dialogue/<path> used to render the legacy app frame with status 200.
// Real dialogue pages live beside this file. Anything else is a 404.
throw createError({
  statusCode: 404,
  statusMessage: 'Page not found',
  fatal: true,
})
</script>

<template>
  <div />
</template>

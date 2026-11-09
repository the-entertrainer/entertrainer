<script setup lang="ts">
import '~/assets/css/empower.css'

/**
 * Default-layout wrapper for Empower.
 * PageMeta on main only allows `layout` (the Dialogue layout). There is no
 * `world` field, so pages do not set `definePageMeta({ world: { anchor: 'empower' } })`.
 * When that field exists, add the meta in this file once.
 * When a Reading Mode layout exists, change the root element below — one line.
 */
</script>

<template>
  <div class="empower-frame">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { APP_GLYPHS, SQUIRCLE, APP_ICON_YELLOW, APP_ICON_INK, type AppIconId } from '~/utils/appIcons'
const props = defineProps<{ app: AppIconId }>()
const glyph = computed(() => APP_GLYPHS[props.app])
</script>

<template>
  <svg class="app-icon" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <path :d="SQUIRCLE" :fill="APP_ICON_YELLOW" />
    <g :fill="APP_ICON_INK" v-html="glyph" />
  </svg>
</template>

<style scoped>
.app-icon { display: block; width: 100%; height: 100%; overflow: visible; }
</style>

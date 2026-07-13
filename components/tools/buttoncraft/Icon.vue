<script setup lang="ts">
import { BUTTON_ICON_MARKUP } from '~/utils/buttonIconMarkup'

// ButtonCraft's icon set — Feather-style inline SVG, no external dep. The
// markup itself lives in utils/buttonIconMarkup.ts so the offscreen PNG
// exporter can serialize the exact same paths, guaranteeing exported
// artwork matches whatever this component previews.
export type ButtonCraftIconName =
  | 'close' | 'chevron-down' | 'chevron-right' | 'plus' | 'trash' | 'duplicate'
  | 'download' | 'check' | 'arrow-right' | 'arrow-left' | 'play' | 'lock' | 'star'

const props = withDefaults(defineProps<{ name: ButtonCraftIconName; size?: number }>(), { size: 16 })
const markup = computed(() => BUTTON_ICON_MARKUP[props.name])
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" class="bc-icon" aria-hidden="true" focusable="false" v-html="markup" />
</template>

<style scoped>
.bc-icon { display: block; flex-shrink: 0; }
</style>

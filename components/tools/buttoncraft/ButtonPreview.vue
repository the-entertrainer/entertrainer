<script setup lang="ts">
import type { ButtonConfig, ButtonState } from '~/types/buttoncraft'
import { buildButtonStyle } from '~/utils/buttonStyle'
import ButtonCraftIcon from './Icon.vue'
import type { ButtonCraftIconName } from './Icon.vue'

// Dual-mode on purpose: with no props it's the live, store-bound editor
// preview (real hover/press react to the mouse when Normal is selected).
// With `config` + `state` passed explicitly it's a pure, prop-driven render
// — that's what the offscreen export mounts, so exported PNGs are pixel
// -identical to whatever the editor showed.
const props = defineProps<{ config?: ButtonConfig; state?: ButtonState }>()

const store = props.config ? null : useButtonCraftStore()

const activeConfig = computed<ButtonConfig | undefined>(() => props.config ?? store?.buttonConfig)

const isHovering = ref(false)
const isPressed = ref(false)

const effectiveState = computed<ButtonState>(() => {
  if (props.state) return props.state
  const selected = store?.selectedState ?? 'normal'
  if (selected === 'normal') {
    if (isPressed.value) return 'down'
    if (isHovering.value) return 'hover'
  }
  return selected
})

const computedStyle = computed(() => {
  if (!activeConfig.value) return { style: {}, disabled: false, showCheckIcon: false }
  return buildButtonStyle(activeConfig.value, effectiveState.value)
})

function onEnter() { isHovering.value = true }
function onLeave() { isHovering.value = false; isPressed.value = false }
function onDown() { isPressed.value = true }
function onUp() { isPressed.value = false }
</script>

<template>
  <button
    v-if="activeConfig"
    class="bc-preview-btn"
    :style="computedStyle.style"
    :disabled="computedStyle.disabled"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @pointerdown="onDown"
    @pointerup="onUp"
  >
    <ButtonCraftIcon
      v-if="activeConfig.icon && activeConfig.iconPosition !== 'right'"
      :name="(activeConfig.icon as ButtonCraftIconName)"
      :size="Math.round(activeConfig.typography.fontSize * 1.1)"
    />
    <span v-if="activeConfig.iconPosition !== 'only'" class="bc-preview-label">{{ activeConfig.label }}</span>
    <ButtonCraftIcon
      v-if="activeConfig.icon && activeConfig.iconPosition === 'right'"
      :name="(activeConfig.icon as ButtonCraftIconName)"
      :size="Math.round(activeConfig.typography.fontSize * 1.1)"
    />
    <span v-if="computedStyle.showCheckIcon" class="bc-check-badge">
      <ButtonCraftIcon name="check" :size="11" />
    </span>
  </button>
</template>

<style scoped>
.bc-preview-btn {
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
}
.bc-preview-btn:disabled { pointer-events: none; }
.bc-preview-label { line-height: 1; }
.bc-check-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #14B8A6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}
</style>

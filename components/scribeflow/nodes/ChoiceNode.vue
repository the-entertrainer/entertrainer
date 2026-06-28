<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  id: string
  data: { content: string; choices?: Array<{ id: string; text: string }> }
  selected?: boolean
}>()
</script>

<template>
  <div :class="['cn', { selected }]">
    <Handle type="target" :position="Position.Top" class="cn-handle" />
    <div class="cn-head">
      <svg class="cn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      <span class="cn-label">Decision</span>
    </div>
    <div v-if="data.choices?.length" class="cn-choices">
      <div v-for="(c, i) in data.choices" :key="c.id" class="cn-choice">
        <span class="cn-dot" />
        <span class="cn-choice-text">{{ c.text }}</span>
        <Handle
          type="source"
          :position="Position.Right"
          :id="c.id"
          class="cn-handle cn-handle-choice"
          :style="{ top: `${44 + i * 32}px` }"
        />
      </div>
    </div>
    <div v-else class="cn-empty">No choices yet</div>
    <Handle type="source" :position="Position.Bottom" class="cn-handle" />
  </div>
</template>

<style scoped>
.cn {
  width: 220rem; padding: 14rem 16rem;
  background: var(--color-bg); border: 1.5px solid color-mix(in srgb, #6D8A40 40%, var(--color-glass-border));
  border-radius: var(--radius-m); color: var(--color-text);
  box-shadow: 0 4rem 14rem rgba(0,0,0,0.08);
  transition: border-color 0.15s, box-shadow 0.15s;
  cursor: grab; position: relative;
}
.cn:hover { border-color: #6D8A40; }
.cn.selected { border-color: #6D8A40; box-shadow: 0 0 0 3rem rgba(109,138,64,0.15), 0 4rem 14rem rgba(0,0,0,0.08); }

.cn-head { display: flex; align-items: center; gap: 6rem; margin-bottom: 10rem; }
.cn-icon { opacity: 0.4; flex-shrink: 0; color: #6D8A40; }
.cn-label { font-size: 12rem; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; opacity: 0.5; }

.cn-choices { display: flex; flex-direction: column; gap: 6rem; }
.cn-choice { display: flex; align-items: center; gap: 8rem; }
.cn-dot { width: 6rem; height: 6rem; border-radius: 50%; background: #6D8A40; opacity: 0.5; flex-shrink: 0; }
.cn-choice-text { font-size: 13rem; line-height: 1.4; opacity: 0.8; }

.cn-empty { font-size: 13rem; opacity: 0.35; font-style: italic; }

.cn-handle {
  width: 10rem !important; height: 10rem !important;
  background: #6D8A40 !important; border: 2px solid var(--color-bg) !important;
  border-radius: 50% !important;
}
.cn-handle-choice { right: -5rem !important; }
</style>

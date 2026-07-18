<script setup lang="ts">
import type { LuminaAuditIssue } from '~/types/lumina'

// The gatekeeper's report card, shown whenever an export finds problems.
// Errors hold the door shut; warnings can be consciously waved through.
// Every row can jump straight to the offending block on the canvas.
const props = defineProps<{
  issues: LuminaAuditIssue[]
  // What the user was trying to do — shown on the override button.
  exportLabel: string
}>()
const emit = defineEmits<{
  close: []
  jump: [issue: LuminaAuditIssue]
  proceed: []
}>()

const errors = computed(() => props.issues.filter(i => i.level === 'error'))
const warnings = computed(() => props.issues.filter(i => i.level === 'warning'))
const blocked = computed(() => errors.value.length > 0)
</script>

<template>
  <div class="laud-overlay" @click.self="emit('close')">
    <div class="laud glass-panel" data-lenis-prevent role="alertdialog" aria-label="Course check results">
      <div class="laud__head">
        <ToolsLuminaIcon name="shield" :size="18" class="laud__shield" :class="{ 'laud__shield--ok': !issues.length }" />
        <div>
          <strong>Course check</strong>
          <p v-if="!issues.length">All clear — no issues found.</p>
          <p v-else-if="blocked">{{ errors.length }} blocking issue{{ errors.length === 1 ? '' : 's' }}{{ warnings.length ? ` · ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : '' }}</p>
          <p v-else>{{ warnings.length }} warning{{ warnings.length === 1 ? '' : 's' }} — worth a look before shipping.</p>
        </div>
        <button class="laud__close" aria-label="Close" @click="emit('close')"><ToolsLuminaIcon name="close" :size="14" /></button>
      </div>

      <div v-if="issues.length" class="laud__list">
        <button
          v-for="(issue, i) in issues" :key="i"
          class="laud__item" :class="`laud__item--${issue.level}`"
          @click="emit('jump', issue)"
        >
          <span class="laud__badge">{{ issue.level === 'error' ? 'Fix' : 'Check' }}</span>
          <span class="laud__text">
            <strong>{{ issue.message }}</strong>
            <small>{{ issue.fix }}</small>
          </span>
        </button>
      </div>

      <div class="laud__foot">
        <p v-if="blocked" class="laud__verdict">Fix the blocking issues to unlock the export — tap any row to jump to it.</p>
        <template v-else>
          <button class="glass-btn" @click="emit('proceed')">{{ exportLabel }}</button>
          <p v-if="warnings.length" class="laud__verdict">Warnings won't block you — but they're how courses quietly get worse.</p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.laud-overlay {
  position: fixed;
  inset: 0;
  z-index: 32;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rem;
}
.laud {
  width: min(560rem, 100%);
  max-height: min(78dvh, 640rem);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
.laud__head {
  display: flex;
  align-items: center;
  gap: 13rem;
  padding: 18rem 18rem 14rem;
  border-bottom: 1px solid var(--color-divider);
}
.laud__shield { color: #ff8d8d; flex-shrink: 0; }
.laud__shield--ok { color: #3fbf6f; }
.laud__head strong { font-size: 15.5rem; letter-spacing: -0.01em; }
.laud__head p { font-size: 12rem; opacity: 0.6; margin-top: 3rem; line-height: 1.4; }
.laud__head > div { margin-right: auto; }
.laud__close {
  width: 28rem; height: 28rem;
  display: grid; place-items: center;
  border-radius: 9rem;
  border: 1px solid var(--color-glass-border);
  color: var(--color-text);
  flex-shrink: 0;
}
.laud__list {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 12rem 14rem;
  display: flex;
  flex-direction: column;
  gap: 8rem;
}
.laud__item {
  display: flex;
  align-items: flex-start;
  gap: 11rem;
  text-align: left;
  padding: 11rem 12rem;
  border-radius: 12rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
  color: var(--color-text);
  transition: border-color 0.15s ease, background 0.15s ease;
}
.laud__item:disabled { cursor: default; }
@media (hover: hover) {
  .laud__item:not(:disabled):hover { background: color-mix(in srgb, var(--color-bg) 60%, transparent); border-color: var(--color-glass-border-hover); }
}
.laud__badge {
  flex-shrink: 0;
  margin-top: 1rem;
  font-size: 9.5rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3rem 8rem;
  border-radius: 999px;
  color: #fff;
}
.laud__item--error .laud__badge { background: #d64550; }
.laud__item--warning .laud__badge { background: #c98a1b; }
.laud__text { display: flex; flex-direction: column; gap: 3rem; min-width: 0; }
.laud__text strong { font-size: 13rem; line-height: 1.4; letter-spacing: -0.01em; }
.laud__text small { font-size: 11.5rem; line-height: 1.45; opacity: 0.6; }
.laud__foot {
  padding: 14rem 18rem calc(16rem + var(--safe-bottom));
  border-top: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  gap: 10rem;
}
.laud__verdict { font-size: 11.5rem; line-height: 1.5; opacity: 0.6; }
@media (max-width: 640px) {
  .laud-overlay { padding: 0; align-items: flex-end; }
  .laud { width: 100%; max-height: 84dvh; border-radius: 22rem 22rem 0 0; }
}
</style>

<script setup lang="ts">
import type { LuminaCourse } from '~/types/lumina'
import type { LuminaSuggestion } from '~/utils/luminaAiSuggest'
import { LUMINA_KINDS } from '~/utils/luminaBlocks'
import { blockPreview } from '~/utils/luminaBlocks'

// The review surface for AI interactivity suggestions. Nothing is applied
// until the author picks it: every suggestion starts checked, shows its
// eLearning rationale and a preview of what would be added, and can be
// turned off. This keeps the tool's promise that every block is the
// author's, never the machine's.
const props = defineProps<{
  state: 'loading' | 'ready' | 'empty' | 'error'
  suggestions: LuminaSuggestion[]
  errorMessage?: string
  course: LuminaCourse
}>()
const emit = defineEmits<{ close: []; apply: [picks: LuminaSuggestion[]]; retry: [] }>()

const picked = ref<Record<string, boolean>>({})
watch(() => props.suggestions, (list) => {
  const next: Record<string, boolean> = {}
  for (const s of list) next[s.id] = picked.value[s.id] ?? true
  picked.value = next
}, { immediate: true })

const chosen = computed(() => props.suggestions.filter(s => picked.value[s.id]))
function lessonTitle(n: number) {
  return props.course.lessons[n - 1]?.title || `Lesson ${n}`
}
</script>

<template>
  <div class="lai-overlay" @click.self="emit('close')">
    <div class="lai glass-panel" data-lenis-prevent role="dialog" aria-label="AI interactivity suggestions">
      <div class="lai__head">
        <span class="lai__spark"><ToolsLuminaIcon name="sparkle" :size="16" /></span>
        <div>
          <strong>Make it interactive</strong>
          <p v-if="state === 'loading'">Reading the course for good places to add practice…</p>
          <p v-else-if="state === 'ready'">{{ suggestions.length }} idea{{ suggestions.length === 1 ? '' : 's' }}, grounded in your content. Keep the ones you like.</p>
          <p v-else-if="state === 'empty'">The course already interleaves practice well. Nothing to add.</p>
          <p v-else-if="state === 'error'">{{ errorMessage || 'The suggestion could not be generated.' }}</p>
        </div>
        <button class="lai__close" aria-label="Close" @click="emit('close')"><ToolsLuminaIcon name="close" :size="14" /></button>
      </div>

      <div v-if="state === 'loading'" class="lai__loading">
        <ToolsLuminaIcon name="spinner" :size="26" />
        <span>Thinking through the lessons…</span>
      </div>

      <div v-else-if="state === 'ready'" class="lai__list">
        <label
          v-for="s in suggestions" :key="s.id"
          class="lai__item" :class="{ 'lai__item--off': !picked[s.id] }"
        >
          <input type="checkbox" :checked="picked[s.id]" @change="picked[s.id] = ($event.target as HTMLInputElement).checked">
          <span class="lai__item-main">
            <span class="lai__item-top">
              <span class="lai__kind" :style="{ background: LUMINA_KINDS[s.kind].color }">{{ LUMINA_KINDS[s.kind].label }}</span>
              <span class="lai__where">{{ lessonTitle(s.lesson) }}</span>
            </span>
            <strong class="lai__title">{{ blockPreview(s.block) || LUMINA_KINDS[s.kind].label }}</strong>
            <span class="lai__reason">{{ s.reason }}</span>
          </span>
        </label>
      </div>

      <div v-else-if="state === 'error'" class="lai__empty">
        <p>Groq did not return usable suggestions. This happens sometimes.</p>
      </div>

      <div class="lai__foot">
        <template v-if="state === 'ready'">
          <button class="glass-btn" :disabled="!chosen.length" @click="emit('apply', chosen)">
            Add {{ chosen.length }} block{{ chosen.length === 1 ? '' : 's' }}
          </button>
          <p class="lai__note">Added blocks drop into place. Every one is yours to edit or delete.</p>
        </template>
        <button v-else-if="state === 'error'" class="glass-btn glass-btn--ghost" @click="emit('retry')">Try again</button>
        <button v-else-if="state === 'empty'" class="glass-btn glass-btn--ghost" @click="emit('close')">Got it</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lai-overlay {
  position: fixed;
  inset: 0;
  z-index: 33;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rem;
}
.lai {
  width: min(560rem, 100%);
  max-height: min(80dvh, 680rem);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
.lai__head {
  display: flex;
  align-items: flex-start;
  gap: 13rem;
  padding: 18rem 18rem 14rem;
  border-bottom: 1px solid var(--color-divider);
}
.lai__spark {
  width: 32rem; height: 32rem;
  display: grid; place-items: center;
  border-radius: 10rem;
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient(135deg, #A78BFA, #E15B8F);
}
.lai__head strong { font-size: 15.5rem; letter-spacing: -0.01em; }
.lai__head p { font-size: 12.5rem; opacity: 0.62; margin-top: 3rem; line-height: 1.45; }
.lai__head > div { margin-right: auto; }
.lai__close {
  width: 28rem; height: 28rem;
  display: grid; place-items: center;
  border-radius: 9rem;
  border: 1px solid var(--color-glass-border);
  color: var(--color-text);
  flex-shrink: 0;
}
.lai__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rem;
  padding: 48rem 24rem;
  font-size: 13rem;
  opacity: 0.65;
}
.lai__list {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 12rem 14rem;
  display: flex;
  flex-direction: column;
  gap: 8rem;
}
.lai__item {
  display: flex;
  align-items: flex-start;
  gap: 11rem;
  padding: 12rem 13rem;
  border-radius: 12rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 40%, transparent);
  cursor: pointer;
  transition: border-color 0.15s ease, opacity 0.15s ease;
}
.lai__item:hover { border-color: var(--color-glass-border-hover); }
.lai__item--off { opacity: 0.5; }
.lai__item input { width: 17rem; height: 17rem; margin-top: 2rem; accent-color: #A78BFA; flex-shrink: 0; }
.lai__item-main { display: flex; flex-direction: column; gap: 4rem; min-width: 0; }
.lai__item-top { display: flex; align-items: center; gap: 8rem; }
.lai__kind {
  font-size: 9.5rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3rem 8rem;
  border-radius: 999px;
  color: #fff;
}
.lai__where { font-size: 11rem; opacity: 0.55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lai__title { font-size: 13.5rem; letter-spacing: -0.01em; line-height: 1.35; }
.lai__reason { font-size: 12rem; opacity: 0.62; line-height: 1.5; }
.lai__empty { padding: 30rem 24rem; text-align: center; font-size: 13rem; opacity: 0.6; }
.lai__foot {
  padding: 14rem 18rem calc(16rem + var(--safe-bottom));
  border-top: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  gap: 9rem;
}
.lai__foot .glass-btn { align-self: flex-start; }
.lai__note { font-size: 11.5rem; opacity: 0.55; line-height: 1.5; }
@media (max-width: 640px) {
  .lai-overlay { padding: 0; align-items: flex-end; }
  .lai { width: 100%; max-height: 86dvh; border-radius: 22rem 22rem 0 0; }
  .lai__foot .glass-btn { align-self: stretch; text-align: center; justify-content: center; }
}
</style>

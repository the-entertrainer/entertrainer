<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { LESSON_SCHEMA_VERSION } from '~/types/lesson'
import { blockLabel } from '~/utils/elearn/document'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { lesson, selected, selectedId, setMinutes } = useCourseStudio()
const tab = ref<'block' | 'lesson'>('block')

watch(selectedId, (id) => {
  tab.value = id ? 'block' : 'lesson'
})

const headingLevel = computed({
  get: () => selected.value?.type === 'heading' && selected.value.level === 3 ? 3 : 2,
  set: (level: number) => {
    if (selected.value?.type === 'heading') selected.value.level = level === 3 ? 3 : 2
  },
})

const statementStyle = computed({
  get: () => selected.value?.type === 'statement' ? (selected.value.style || 'insight') : 'insight',
  set: (style: 'callout' | 'warning' | 'insight') => {
    if (selected.value?.type === 'statement') selected.value.style = style
  },
})

function onMinutes(event: Event) {
  setMinutes((event.target as HTMLInputElement).value)
}
</script>

<template>
  <aside id="cs-settings" class="cs-settings" :class="{ 'is-open': open }">
    <div class="cs-pane-head">
      <h2>Settings</h2>
      <button type="button" class="cs-drawer-close" @click="emit('close')">Close</button>
    </div>
    <div class="cs-tabs" role="tablist" aria-label="Settings">
      <button type="button" role="tab" :aria-selected="tab === 'block'" @click="tab = 'block'">Block</button>
      <button type="button" role="tab" :aria-selected="tab === 'lesson'" @click="tab = 'lesson'">Lesson</button>
    </div>

    <div v-if="tab === 'lesson'" role="tabpanel">
      <div class="cs-row">
        <label class="cs-label" for="lesson-category">Category</label>
        <input id="lesson-category" v-model="lesson.category" class="cs-input" type="text" data-lesson-field>
      </div>
      <div class="cs-row">
        <label class="cs-label" for="lesson-minutes">Minutes</label>
        <input id="lesson-minutes" class="cs-input" type="number" min="0" step="1" :value="lesson.minutes" data-lesson-field @input="onMinutes">
      </div>
      <div class="cs-row">
        <label class="cs-label" for="lesson-slug">Slug</label>
        <input id="lesson-slug" v-model="lesson.slug" class="cs-input" type="text" spellcheck="false" data-lesson-field>
      </div>
      <div class="cs-row">
        <label class="cs-label" for="lesson-hero">Hero image address</label>
        <input id="lesson-hero" v-model="lesson.hero" class="cs-input" type="text" spellcheck="false" data-lesson-field>
      </div>
      <div class="cs-row">
        <label class="cs-label" for="lesson-hero-alt">Hero alt text</label>
        <input id="lesson-hero-alt" v-model="lesson.heroAlt" class="cs-input" type="text" data-lesson-field>
      </div>
      <p class="cs-note">Export writes JSON, schema version {{ LESSON_SCHEMA_VERSION }}. SCORM and xAPI packages are not in this version.</p>
    </div>

    <div v-else role="tabpanel">
      <p v-if="!selected" class="cs-note">Select a block to edit its settings. Lesson title, objective, and summary are on the canvas.</p>
      <template v-else>
        <h3>{{ blockLabel(selected.type) }}</h3>

        <template v-if="selected.type === 'heading'">
          <div class="cs-row">
            <label class="cs-label" for="heading-level">Level</label>
            <select id="heading-level" v-model.number="headingLevel" class="cs-select">
              <option :value="2">Heading 2</option>
              <option :value="3">Heading 3</option>
            </select>
          </div>
        </template>

        <template v-else-if="selected.type === 'text'">
          <label class="cs-check">
            <input v-model="selected.lead" type="checkbox">
            Drop cap on the first letter
          </label>
        </template>

        <template v-else-if="selected.type === 'statement'">
          <div class="cs-row">
            <label class="cs-label" for="statement-style">Style</label>
            <select id="statement-style" v-model="statementStyle" class="cs-select">
              <option value="insight">Insight</option>
              <option value="callout">Callout</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </template>

        <template v-else-if="selected.type === 'process'">
          <p class="cs-note">Step text is on the block. Mark the step where the sequence breaks.</p>
          <fieldset v-for="(step, index) in selected.steps" :key="index">
            <legend>Step {{ index + 1 }}<span v-if="step.label">: {{ step.label }}</span></legend>
            <label class="cs-check">
              <input v-model="step.bad" type="checkbox">
              This step is the break
            </label>
            <div class="cs-row">
              <label class="cs-label" :for="`step-note-${index}`">Note</label>
              <textarea :id="`step-note-${index}`" v-model="step.note" class="cs-area" rows="2" />
            </div>
          </fieldset>
          <p v-if="!selected.steps.length" class="cs-note">No steps yet. Add them on the block.</p>
        </template>

        <template v-else-if="selected.type === 'knowledgeCheck'">
          <fieldset>
            <legend>Correct option</legend>
            <label v-for="(option, index) in selected.options" :key="option.id" class="cs-radio">
              <input v-model="selected.correctId" type="radio" :name="`correct-${selected.id}`" :value="option.id">
              <span>{{ option.text.trim() || `Option ${index + 1}` }}</span>
            </label>
            <p v-if="!selected.options.length" class="cs-note">Add options on the block.</p>
          </fieldset>
          <div class="cs-row">
            <label class="cs-label" :for="`feedback-correct-${selected.id}`">Feedback when correct</label>
            <textarea :id="`feedback-correct-${selected.id}`" v-model="selected.feedback.correct" class="cs-area" rows="3" />
          </div>
          <div class="cs-row">
            <label class="cs-label" :for="`feedback-incorrect-${selected.id}`">Feedback when incorrect</label>
            <textarea :id="`feedback-incorrect-${selected.id}`" v-model="selected.feedback.incorrect" class="cs-area" rows="3" />
          </div>
        </template>

        <template v-else-if="selected.type === 'reflection'">
          <div class="cs-row">
            <label class="cs-label" for="reflection-placeholder">Writing box placeholder</label>
            <input id="reflection-placeholder" v-model="selected.placeholder" class="cs-input" type="text">
          </div>
        </template>

        <template v-else-if="selected.type === 'flashcards'">
          <p class="cs-note">{{ selected.cards.length === 1 ? '1 card' : `${selected.cards.length} cards` }}. Front and back are edited on the block.</p>
        </template>

        <template v-else-if="selected.type === 'image'">
          <p class="cs-note">Image address, alt text, caption, and credit are edited on the block.</p>
        </template>

        <template v-else-if="selected.type === 'quote'">
          <p class="cs-note">The quotation and attribution are edited on the block.</p>
        </template>

        <template v-else-if="selected.type === 'accordion'">
          <p class="cs-note">{{ selected.items.length === 1 ? '1 item' : `${selected.items.length} items` }}. Titles and bodies are edited on the block.</p>
        </template>

        <template v-else-if="selected.type === 'sources'">
          <p class="cs-note">{{ selected.items.length === 1 ? '1 source' : `${selected.items.length} sources` }}. Titles, details, and links are edited on the block.</p>
        </template>
      </template>
    </div>
  </aside>
</template>

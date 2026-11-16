<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  block: {
    title?: string
    cards: { id: string; front: string; back: string }[]
  }
}>()
const emit = defineEmits<{ complete: [] }>()

const index = ref(0)
const flipped = ref(false)
const seen = ref<number[]>([])
const done = ref(false)
const card = computed(() => props.block.cards[index.value])
const face = computed(() => {
  if (!card.value) return ''
  const value = flipped.value ? card.value.back : card.value.front
  return value.trim() ? value : 'This side is empty.'
})

function mark() {
  if (!flipped.value || seen.value.includes(index.value)) return
  seen.value = [...seen.value, index.value]
  if (!done.value && props.block.cards.length > 0 && seen.value.length >= props.block.cards.length) {
    done.value = true
    emit('complete')
  }
}

function flip() {
  flipped.value = !flipped.value
  mark()
}

function go(next: number) {
  index.value = next
  flipped.value = false
}
</script>

<template>
  <section class="elearn-cards" :aria-label="block.title || 'Flashcards'">
    <h3 v-if="block.title">{{ block.title }}</h3>
    <p v-if="!block.cards.length" class="empty">No cards in this deck.</p>
    <template v-else>
      <p class="count">{{ index + 1 }} of {{ block.cards.length }}</p>
      <button type="button" class="card" :aria-pressed="flipped" @click="flip">
        <span class="face-label">{{ flipped ? 'Back' : 'Front' }}</span>
        <span class="face">{{ face }}</span>
      </button>
      <div class="nav">
        <button type="button" :disabled="index === 0" @click="go(index - 1)">Previous card</button>
        <button type="button" :disabled="index >= block.cards.length - 1" @click="go(index + 1)">Next card</button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.elearn-cards {
  --cs-yellow: #FFD43B;
  --cs-on-yellow: #0B0B0C;
  border: 1px solid var(--ink);
  border-radius: 0.5rem;
  padding: 1.25rem;
  background: var(--paper);
  color: var(--ink);
}
h3 { margin: 0 0 0.75rem; font: 500 1.25rem/1.2 var(--font-display); }
.count { margin: 0 0 0.75rem; font: 500 0.75rem/1 var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; }
.card {
  width: 100%;
  min-height: 9rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
  padding: 1rem;
  border: 1px solid var(--ink);
  border-radius: 0.25rem;
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
}
.face-label {
  font: 600 0.75rem/1 var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--cs-yellow);
  color: var(--cs-on-yellow);
  padding: 0.25rem 0.5rem;
}
.face { font: 500 1.125rem/1.4 var(--font-display); }
.nav { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
.nav button, .card {
  font: 600 0.875rem/1.2 var(--font-ui);
}
.nav button {
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ink);
  border-radius: 999px;
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
}
.nav button:disabled { opacity: 0.45; cursor: not-allowed; }
.empty { margin: 0; }
</style>

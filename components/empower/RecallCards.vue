<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEmpowerVisit } from '~/composables/empower/visit'
import { idbAll, idbByIndex, idbDelete, idbPut } from '~/utils/empower/db'
import { saveText } from '~/utils/empower/download'
import { uid } from '~/utils/empower/id'
import {
  cardsFromJson,
  cardsFromNotes,
  cardsToCsv,
  cardsToJson,
  dueCards,
  freshCard,
  gradeCard,
  type RecallCard,
  type RecallDeck,
} from '~/utils/empower/recall'

useEmpowerVisit('recall-cards')

const notes = ref('')
const delimiter = ref('')
const error = ref('')
const notice = ref('')
const decks = ref<RecallDeck[]>([])
const cards = ref<RecallCard[]>([])
const selected = ref('')
const studying = ref(false)
const revealed = ref(false)
const queue = ref<RecallCard[]>([])
const reviewed = ref(0)
const repeats = ref<Record<string, number>>({})

const deckCards = computed(() => cards.value.filter(card => card.deckId === selected.value))
const due = computed(() => dueCards(deckCards.value))
const current = computed(() => queue.value[0] ?? null)
const statusText = computed(() => {
  if (error.value) return error.value
  if (studying.value && !current.value) return `Session done. Reviewed ${reviewed.value}.`
  if (studying.value && current.value) return revealed.value ? 'Answer showing.' : 'Question showing. Reveal the answer when you are ready.'
  if (!decks.value.length) return 'Paste notes. Remember them later.'
  return `${deckCards.value.length} cards. ${due.value.length} due.`
})

async function reload() {
  decks.value = (await idbAll<RecallDeck>('decks')).sort((a, b) => b.createdAt - a.createdAt)
  if (selected.value) cards.value = await idbByIndex<RecallCard>('cards', 'deckId', selected.value)
  else cards.value = []
}

onMounted(reload)

async function selectDeck(id: string) {
  selected.value = id
  studying.value = false
  await reload()
}

async function makeDeck(title: string, pairs: { front: string; back: string }[]) {
  const deck: RecallDeck = { id: uid('deck'), title, createdAt: Date.now() }
  await idbPut('decks', deck)
  for (const pair of pairs) await idbPut('cards', freshCard(deck.id, pair))
  selected.value = deck.id
  studying.value = false
  await reload()
  notice.value = pairs.length === 1 ? 'Made 1 card.' : `Made ${pairs.length} cards.`
}

async function makeFromNotes() {
  error.value = ''
  const pairs = cardsFromNotes(notes.value, delimiter.value)
  if (!pairs.length) {
    error.value = 'Paste at least one card. Use a line like Term: meaning, or a blank line between cards.'
    return
  }
  const title = pairs[0].front.slice(0, 48) || 'Notes'
  await makeDeck(title, pairs)
  notes.value = ''
}

async function onJson(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const parsed = cardsFromJson(await file.text())
  if ('error' in parsed) {
    error.value = parsed.error
    return
  }
  error.value = ''
  await makeDeck(parsed.title, parsed.cards)
}

function begin(all: boolean) {
  const source = all || !due.value.length ? deckCards.value : due.value
  queue.value = source.map(card => ({ ...card }))
  repeats.value = {}
  reviewed.value = 0
  revealed.value = false
  studying.value = true
}

async function grade(quality: number) {
  const card = current.value
  if (!card) return
  const next = gradeCard(card, quality)
  await idbPut('cards', next)
  const rest = queue.value.slice(1)
  if (quality < 3 && (repeats.value[card.id] || 0) < 2) {
    repeats.value = { ...repeats.value, [card.id]: (repeats.value[card.id] || 0) + 1 }
    rest.push(next)
  } else if (quality >= 3) reviewed.value += 1
  queue.value = rest
  revealed.value = false
  await reload()
}

async function download(kind: 'json' | 'csv') {
  const deck = decks.value.find(item => item.id === selected.value)
  const pairs = deckCards.value.map(card => ({ front: card.front, back: card.back }))
  if (!pairs.length) return
  if (kind === 'json') await saveText('recall.json', cardsToJson(deck?.title || 'Deck', pairs))
  else await saveText('recall.csv', cardsToCsv(pairs))
  notice.value = kind === 'json' ? 'Downloaded recall.json.' : 'Downloaded recall.csv.'
}

async function removeDeck(id: string) {
  const rows = await idbByIndex<RecallCard>('cards', 'deckId', id)
  for (const card of rows) await idbDelete('cards', card.id)
  await idbDelete('decks', id)
  if (selected.value === id) {
    selected.value = ''
    studying.value = false
  }
  await reload()
}
</script>

<template>
  <EmpowerShell title="Recall Cards" deck="Paste notes. Remember them later." :status-text="statusText" wide>
    <div class="em-recall em-stack">
      <section class="em-stack" aria-label="Decks">
        <h2 class="em-h2">Decks</h2>
        <p v-if="!decks.length" class="em-note">No decks yet. Paste notes to make the first one.</p>
        <div v-else class="em-links">
          <button v-for="deck in decks" :key="deck.id" type="button" class="em-btn" :aria-current="deck.id === selected ? 'true' : undefined" @click="selectDeck(deck.id)">
            {{ deck.title }}
          </button>
        </div>
      </section>

      <div class="em-stack">
        <div class="em-field">
          <label for="recall-notes">Notes</label>
          <textarea id="recall-notes" v-model="notes" class="em-textarea" spellcheck="true" placeholder="Mitochondria: the part of the cell that makes energy" />
        </div>
        <div class="em-field">
          <label for="recall-delimiter">Delimiter (optional)</label>
          <input id="recall-delimiter" v-model="delimiter" class="em-input" type="text" autocomplete="off">
        </div>
        <div class="em-row-actions">
          <button type="button" class="em-btn em-btn--primary" @click="makeFromNotes">Make cards</button>
        </div>
        <div class="em-field">
          <label for="recall-json">Import JSON</label>
          <input id="recall-json" class="em-file" type="file" accept="application/json,.json" @change="onJson">
        </div>
        <p v-if="error" class="em-error">{{ error }}</p>
        <p v-if="notice" class="em-status" role="status">{{ notice }}</p>

        <section v-if="selected" class="em-stack" aria-label="Deck">
          <p>{{ deckCards.length }} cards. {{ due.length }} due.</p>
          <div class="em-row-actions">
            <button type="button" class="em-btn em-btn--primary" :disabled="!deckCards.length" @click="begin(false)">Study</button>
            <button type="button" class="em-btn" :disabled="!deckCards.length" @click="begin(true)">Practise the whole deck</button>
            <button type="button" class="em-btn" :disabled="!deckCards.length" @click="download('json')">Export JSON</button>
            <button type="button" class="em-btn" :disabled="!deckCards.length" @click="download('csv')">Export CSV</button>
            <button type="button" class="em-btn" @click="removeDeck(selected)">Delete deck</button>
          </div>
        </section>

        <section v-if="studying" class="em-study" aria-label="Study session">
          <template v-if="current">
            <p>{{ current.front }}</p>
            <p v-if="revealed">{{ current.back }}</p>
            <button v-if="!revealed" type="button" class="em-btn em-btn--primary" @click="revealed = true">Reveal</button>
            <div v-else class="em-row-actions">
              <button type="button" class="em-btn" @click="grade(1)">Again</button>
              <button type="button" class="em-btn" @click="grade(3)">Hard</button>
              <button type="button" class="em-btn em-btn--primary" @click="grade(4)">Good</button>
              <button type="button" class="em-btn" @click="grade(5)">Easy</button>
            </div>
          </template>
          <p v-else>Nothing left in this sitting. Reviewed {{ reviewed }}.</p>
          <p>Still in this sitting: {{ queue.length }}.</p>
        </section>
      </div>
    </div>
  </EmpowerShell>
</template>

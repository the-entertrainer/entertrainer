<script setup lang="ts">
/**
 * Word of the Day — arrange scrambled letter tiles into answer slots.
 * Clue + locked letter hints from the start → tap/place → auto-check → meaning.
 */
import type { WotdDefinition } from '~/composables/useDailyWord'

interface LetterTile {
  id: string
  ch: string
  /** Pre-filled answer letter — locked in place for the puzzle. */
  locked?: boolean
}

const {
  open,
  word,
  scrambled,
  clue,
  hintIndices,
  entry,
  markSolved,
  markSkipped,
  markRevealed,
  close,
  fetchWotdDefinition,
  refresh
} = useDailyWord()

const feedback = ref<'idle' | 'wrong' | 'ok' | 'revealed'>('idle')
const failCount = ref(0)
const meaning = ref<WotdDefinition | null>(null)
const meaningLoading = ref(false)
const slots = ref<(LetterTile | null)[]>([])
const tray = ref<LetterTile[]>([])
const boardEl = ref<HTMLElement | null>(null)
const shake = ref(false)

const showReveal = computed(() => failCount.value >= 1 && feedback.value !== 'ok' && feedback.value !== 'revealed')
const showMeaning = computed(() => feedback.value === 'ok' || feedback.value === 'revealed')
const slotsFull = computed(() => slots.value.length > 0 && slots.value.every(Boolean))
const placedCount = computed(() => slots.value.filter(Boolean).length)

/** Size answer + tray tiles so each row stays one line on phone-width cards. */
const slotStyle = computed(() => {
  const n = Math.max(word.length, 1)
  const trayN = Math.max(tray.value.length, 1)
  const max = n <= 6 ? 48 : n <= 8 ? 42 : n <= 9 ? 34 : n <= 10 ? 30 : n <= 12 ? 26 : n <= 13 ? 22 : 20
  const gap = n <= 6 ? 8 : n <= 8 ? 6 : n <= 9 ? 5 : n <= 10 ? 4 : n <= 12 ? 3 : 2
  const fsMax = n <= 6 ? 22 : n <= 8 ? 20 : n <= 9 ? 17 : n <= 10 ? 15 : n <= 12 ? 13 : 11
  const trayMax = trayN <= 6 ? 52 : trayN <= 8 ? 46 : trayN <= 10 ? 40 : trayN <= 12 ? 34 : 28
  const trayGap = trayN <= 6 ? 10 : trayN <= 8 ? 8 : trayN <= 10 ? 6 : trayN <= 12 ? 4 : 3
  const trayFs = trayN <= 6 ? 24 : trayN <= 8 ? 20 : trayN <= 10 ? 17 : trayN <= 12 ? 15 : 13
  return {
    '--slot-count': String(n),
    '--slot-gap': `${gap}rem`,
    '--slot-max': `${max}rem`,
    '--slot-fs-max': `${fsMax}rem`,
    '--tray-count': String(trayN),
    '--tray-gap': `${trayGap}rem`,
    '--tray-max': `${trayMax}rem`,
    '--tray-fs-max': `${trayFs}rem`,
  }
})

function buildBoard() {
  const letters = scrambled.split('')
  const trayTiles: LetterTile[] = letters.map((ch, i) => ({ id: `t${i}-${ch}`, ch }))
  const nextSlots: (LetterTile | null)[] = Array.from({ length: word.length }, () => null)

  for (const idx of hintIndices) {
    if (idx < 0 || idx >= word.length) continue
    const ch = word[idx]!
    const ti = trayTiles.findIndex((t) => t.ch === ch)
    if (ti < 0) continue
    trayTiles.splice(ti, 1)
    nextSlots[idx] = { id: `hint-${idx}-${ch}`, ch, locked: true }
  }

  tray.value = trayTiles
  slots.value = nextSlots
  feedback.value = 'idle'
  failCount.value = 0
  meaning.value = null
  meaningLoading.value = false
  shake.value = false
}

watch(open, async (v) => {
  if (!v) return
  refresh()
  buildBoard()
  await nextTick()
  boardEl.value?.focus()
})

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z]/g, '')
}

async function loadMeaning() {
  meaningLoading.value = true
  try {
    meaning.value = await fetchWotdDefinition(entry)
  } finally {
    meaningLoading.value = false
  }
}

function guessFromSlots() {
  return slots.value.map((t) => t?.ch ?? '').join('')
}

async function checkAnswer() {
  if (showMeaning.value) return
  if (!slotsFull.value) return
  const g = normalize(guessFromSlots())
  if (!g) return
  if (g === word) {
    feedback.value = 'ok'
    markSolved()
    await loadMeaning()
    return
  }
  feedback.value = 'wrong'
  failCount.value += 1
  shake.value = true
  window.setTimeout(() => { shake.value = false }, 420)
}

async function maybeAutoCheck() {
  if (slotsFull.value) await checkAnswer()
}

function placeTile(tile: LetterTile) {
  if (showMeaning.value) return
  const empty = slots.value.findIndex((s) => !s)
  if (empty < 0) return
  const ti = tray.value.findIndex((t) => t.id === tile.id)
  if (ti < 0) return
  tray.value = tray.value.filter((t) => t.id !== tile.id)
  const next = slots.value.slice()
  next[empty] = tile
  slots.value = next
  if (feedback.value === 'wrong') feedback.value = 'idle'
  void maybeAutoCheck()
}

function returnSlot(index: number) {
  if (showMeaning.value) return
  const tile = slots.value[index]
  if (!tile || tile.locked) return
  const next = slots.value.slice()
  next[index] = null
  slots.value = next
  tray.value = [...tray.value, tile]
  if (feedback.value === 'wrong') feedback.value = 'idle'
}

/** Compact tray: move trailing empties by packing — already packed array. */
function onTrayActivate(tile: LetterTile) {
  placeTile(tile)
}

function onSlotActivate(index: number) {
  returnSlot(index)
}

async function revealAnswer() {
  if (!showReveal.value) return
  feedback.value = 'revealed'
  // Place correct letters into slots; clear tray
  const chars = word.split('')
  slots.value = chars.map((ch, i) => ({ id: `reveal-${i}`, ch }))
  tray.value = []
  markRevealed()
  await loadMeaning()
}

function dismiss() {
  if (feedback.value === 'idle' || feedback.value === 'wrong') {
    markSkipped()
  } else {
    close()
  }
}

function onKey(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    dismiss()
    return
  }
  if (showMeaning.value) return

  if (e.key === 'Backspace') {
    e.preventDefault()
    for (let i = slots.value.length - 1; i >= 0; i--) {
      const t = slots.value[i]
      if (t && !t.locked) {
        returnSlot(i)
        break
      }
    }
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    void checkAnswer()
    return
  }

  const ch = e.key.toLowerCase()
  if (ch.length === 1 && ch >= 'a' && ch <= 'z') {
    e.preventDefault()
    const tile = tray.value.find((t) => t.ch === ch)
    if (tile) placeTile(tile)
  }
}

onMounted(() => {
  refresh()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="wotd"
      role="presentation"
      @click.self="dismiss()"
    >
      <div
        ref="boardEl"
        class="wotd__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wotd-title"
        :aria-describedby="showMeaning ? undefined : 'wotd-hint wotd-clue-text'"
        tabindex="-1"
      >
        <header class="wotd__head">
          <h2 id="wotd-title" class="wotd__title">
            <template v-if="feedback === 'ok'">Got it!</template>
            <template v-else-if="feedback === 'revealed'">Here’s the word</template>
            <template v-else>Arrange the letters</template>
          </h2>
          <p v-if="!showMeaning" id="wotd-hint" class="wotd__hint">
            Some answer letters are given. Tap to place; tap a filled slot to undo.
          </p>
        </header>

        <p v-if="!showMeaning" class="wotd__clue" role="note">
          <span class="wotd__clue-label">Clue</span>
          <span id="wotd-clue-text" class="wotd__clue-text">{{ clue }}</span>
        </p>

        <!-- Answer slots / grid -->
        <div
          class="wotd__slots"
          :class="{
            'wotd__slots--shake': shake,
            'wotd__slots--ok': feedback === 'ok' || feedback === 'revealed',
            'wotd__slots--wrong': feedback === 'wrong'
          }"
          :style="slotStyle"
          role="group"
          :aria-label="showMeaning ? `Today's word: ${word}` : `Answer slots, ${placedCount} of ${word.length} filled`"
        >
          <button
            v-for="(slot, i) in slots"
            :key="`slot-${i}`"
            type="button"
            class="wotd__slot"
            :class="{
              'wotd__slot--filled': !!slot && !slot.locked,
              'wotd__slot--given': !!slot?.locked,
              'wotd__slot--empty': !slot
            }"
            :disabled="showMeaning || !slot || !!slot.locked"
            :aria-label="slot
              ? (slot.locked
                ? `Slot ${i + 1}: ${slot.ch.toUpperCase()}, given`
                : `Slot ${i + 1}: ${slot.ch.toUpperCase()}. Activate to remove.`)
              : `Empty slot ${i + 1}`"
            @click="onSlotActivate(i)"
          >
            <span v-if="slot" aria-hidden="true">{{ slot.ch }}</span>
          </button>
        </div>

        <!-- Scrambled tray -->
        <div
          v-if="!showMeaning"
          class="wotd__tray"
          :style="slotStyle"
          role="group"
          aria-label="Scrambled letters"
        >
          <button
            v-for="tile in tray"
            :key="tile.id"
            type="button"
            class="wotd__tile"
            :aria-label="`Place letter ${tile.ch.toUpperCase()}`"
            @click="onTrayActivate(tile)"
          >
            <span aria-hidden="true">{{ tile.ch }}</span>
          </button>
          <p v-if="!tray.length && !slotsFull" class="wotd__tray-empty">All placed</p>
        </div>

        <p
          v-if="feedback === 'wrong'"
          id="wotd-feedback"
          class="wotd__feedback wotd__feedback--wrong"
          role="status"
        >
          Not quite — rearrange
        </p>

        <div v-if="showMeaning" class="wotd__meaning" aria-live="polite">
          <p v-if="meaningLoading" class="wotd__meaning-loading">Loading meaning…</p>
          <template v-else-if="meaning">
            <p class="wotd__meaning-pos">{{ meaning.pos }}</p>
            <p class="wotd__meaning-def">{{ meaning.definition }}</p>
            <p v-if="meaning.example" class="wotd__meaning-ex">“{{ meaning.example }}”</p>
            <p class="wotd__meaning-src">Meaning</p>
          </template>
        </div>

        <div class="wotd__actions">
          <button
            v-if="showReveal"
            type="button"
            class="wotd__reveal"
            @click="revealAnswer()"
          >
            Peek
          </button>
          <button
            v-if="!showMeaning && slotsFull"
            type="button"
            class="wotd__check"
            @click="checkAnswer()"
          >
            Check
          </button>
          <button
            v-if="!showMeaning"
            type="button"
            class="wotd__skip"
            @click="markSkipped()"
          >
            Skip
          </button>
          <button
            v-else
            type="button"
            class="wotd__done"
            @click="close()"
          >
            Played
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.wotd {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-overlay) + 30);
  display: grid;
  place-items: end center;
  padding: max(16rem, var(--safe-top)) 16rem max(16rem, var(--safe-bottom));
  background: color-mix(in srgb, var(--ink) 34%, transparent);
}
@media (min-width: 560px) {
  .wotd { place-items: center; }
}
.wotd__panel {
  width: min(460rem, 100%);
  padding: 28rem 22rem 22rem;
  background: var(--paper);
  color: var(--ink);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l) var(--radius-l) var(--radius-m) var(--radius-m);
  box-shadow: 8rem 8rem 0 var(--accent);
  animation: wotd-in 280ms var(--ease-out) both;
}
@media (min-width: 560px) {
  .wotd__panel { border-radius: var(--radius-l); padding: 30rem 26rem 24rem; }
}
@keyframes wotd-in {
  from { opacity: 0; transform: translateY(16rem) scale(.98); }
  to { opacity: 1; transform: none; }
}
.wotd__title {
  margin: 0 0 6rem;
  font: 600 clamp(26rem, 5vw, 34rem)/1.05 var(--font-display);
  letter-spacing: -.03em;
}
.wotd__hint {
  margin: 0 0 18rem;
  font: 400 14rem/1.4 var(--font-ui);
  color: var(--ink-soft);
}
.wotd__clue {
  display: grid;
  gap: 4rem;
  margin: 0 0 20rem;
  padding: 14rem 16rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-s);
  background: color-mix(in srgb, var(--accent) 14%, var(--paper));
}
.wotd__clue-label {
  font: 700 10rem/1.2 var(--font-mono);
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--muted);
}
.wotd__clue-text {
  font: 500 15rem/1.4 var(--font-ui);
  color: var(--ink);
}

/* Answer slots — always one horizontal line; tiles scale with word length */
.wotd__slots {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: var(--slot-gap, 6rem);
  margin: 0 0 22rem;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  container-type: inline-size;
  container-name: wotd-slots;
}
.wotd__slots--ok .wotd__slot {
  background: var(--accent);
  border-color: var(--ink);
  box-shadow: 3rem 3rem 0 var(--ink);
}
.wotd__slots--wrong .wotd__slot--filled {
  border-color: var(--ink);
  background: color-mix(in srgb, var(--paper) 88%, #c44);
}
.wotd__slots--shake {
  animation: wotd-shake 400ms var(--ease-out);
}
@keyframes wotd-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6rem); }
  40% { transform: translateX(6rem); }
  60% { transform: translateX(-4rem); }
  80% { transform: translateX(3rem); }
}
.wotd__slot {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  flex: 1 1 0;
  min-width: 0;
  max-width: var(--slot-max, 48rem);
  width: auto;
  aspect-ratio: 5 / 6;
  height: auto;
  padding: 0;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: color-mix(in srgb, var(--paper) 92%, var(--ink));
  color: var(--ink);
  font: 700 clamp(10rem, calc(52cqw / var(--slot-count, 8)), var(--slot-fs-max, 22rem))/1 var(--font-ui);
  letter-spacing: 0;
  text-transform: uppercase;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 140ms ease, transform 120ms ease, box-shadow 120ms ease;
}
.wotd__slot--empty {
  background: var(--paper);
  border-style: dashed;
  border-color: color-mix(in srgb, var(--ink) 35%, var(--line));
  cursor: default;
}
.wotd__slot--given {
  background: var(--accent);
  border-style: solid;
  border-color: var(--ink);
  box-shadow: 2rem 2rem 0 color-mix(in srgb, var(--ink) 28%, transparent);
  cursor: default;
}
.wotd__slots--wrong .wotd__slot--given {
  background: var(--accent);
  border-color: var(--ink);
}
.wotd__slot--filled:not(:disabled):hover {
  transform: translateY(-1rem);
  background: color-mix(in srgb, var(--accent) 28%, var(--paper));
}
.wotd__slot--filled:not(:disabled):active {
  transform: translateY(1rem);
}
.wotd__slot:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
}
.wotd__slot:disabled {
  cursor: default;
}

/* Scrambled tray tiles — single row; tiles shrink for long words */
.wotd__tray {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: var(--tray-gap, 10rem);
  margin: 0 0 16rem;
  padding: 14rem 10rem;
  min-height: 64rem;
  width: 100%;
  overflow: hidden;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-s);
  background: color-mix(in srgb, var(--accent) 10%, var(--paper));
  container-type: inline-size;
  container-name: wotd-tray;
}
.wotd__tile {
  box-sizing: border-box;
  display: grid;
  place-items: center;
  flex: 1 1 0;
  min-width: 0;
  max-width: var(--tray-max, 52rem);
  width: auto;
  aspect-ratio: 5 / 6;
  height: auto;
  padding: 0;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--accent);
  color: var(--ink);
  font: 700 clamp(11rem, calc(48cqw / var(--tray-count, 8)), var(--tray-fs-max, 24rem))/1 var(--font-ui);
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 3rem 3rem 0 var(--ink);
  -webkit-tap-highlight-color: transparent;
  transition: transform 120ms ease, box-shadow 120ms ease, background 140ms ease;
}
.wotd__tile:hover {
  background: var(--signal-field, color-mix(in srgb, var(--accent) 70%, #fff));
  transform: translate(-1rem, -1rem);
  box-shadow: 4rem 4rem 0 var(--ink);
}
.wotd__tile:active {
  transform: translate(1rem, 1rem);
  box-shadow: 2rem 2rem 0 var(--ink);
}
.wotd__tile:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
}
.wotd__tray-empty {
  margin: auto;
  font: 500 13rem/1.3 var(--font-ui);
  color: var(--muted);
}

.wotd__feedback {
  margin: 0 0 12rem;
  min-height: 1.2em;
  font: 650 13rem/1.3 var(--font-ui);
}
.wotd__feedback--wrong { color: var(--ink); }
.wotd__feedback--ok { color: var(--ink); }
.wotd__meaning {
  margin: 0 0 14rem;
  padding: 16rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper-2, var(--paper));
}
.wotd__meaning-pos {
  margin: 0 0 6rem;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
}
.wotd__meaning-def {
  margin: 0 0 8rem;
  font: 500 15rem/1.45 var(--font-ui);
}
.wotd__meaning-ex {
  margin: 0 0 8rem;
  font: italic 400 13rem/1.4 var(--font-ui);
  color: var(--ink-soft);
}
.wotd__meaning-src,
.wotd__meaning-loading {
  margin: 0;
  font: 400 11rem/1.3 var(--font-mono);
  color: var(--muted);
}
.wotd__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10rem;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rem;
  padding-top: 16rem;
  border-top: var(--stroke) solid var(--line);
}
.wotd__check,
.wotd__done,
.wotd__reveal {
  flex: none;
  min-height: 48rem;
  padding: 0 18rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--accent);
  color: var(--ink);
  font: 700 14rem/1 var(--font-ui);
  box-shadow: 3rem 3rem 0 var(--ink);
  cursor: pointer;
}
.wotd__check:hover,
.wotd__done:hover,
.wotd__reveal:hover { background: var(--signal-field, color-mix(in srgb, var(--accent) 70%, #fff)); }
.wotd__check:active,
.wotd__done:active,
.wotd__reveal:active { transform: translate(1rem, 1rem); box-shadow: 2rem 2rem 0 var(--ink); }
.wotd__check:focus-visible,
.wotd__done:focus-visible,
.wotd__reveal:focus-visible { outline: 3rem solid var(--ink); outline-offset: 2rem; }
.wotd__skip {
  min-height: 40rem;
  padding: 0 12rem;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font: 650 13rem/1 var(--font-ui);
  text-decoration: underline;
  text-underline-offset: 3rem;
  cursor: pointer;
}
.wotd__skip:hover { color: var(--ink); }
.wotd__skip:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
  border-radius: var(--radius-s);
}
.wotd__reveal { margin-right: auto; }
.wotd__check { margin-left: auto; }
.wotd__done { margin-left: auto; width: 100%; }
@media (min-width: 420px) {
  .wotd__done { width: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .wotd__panel,
  .wotd__slots--shake { animation: none; }
  .wotd__tile,
  .wotd__slot { transition: none; }
}
:global(html[data-reduce-motion="on"]) .wotd__panel,
:global(html[data-reduce-motion="on"]) .wotd__slots--shake { animation: none; }
</style>

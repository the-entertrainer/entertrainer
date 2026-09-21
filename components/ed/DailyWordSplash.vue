<script setup lang="ts">
/**
 * Word of the Day — scramble tiles into answer slots.
 * Clue + locked hints → place → auto-check → meaning.
 */
import type { WotdDefinition } from '~/composables/useDailyWord'

interface LetterTile {
  id: string
  ch: string
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

/** One-line tiles on phone-width cards — scale by letter count. */
const slotStyle = computed(() => {
  const n = Math.max(word.length, 1)
  const trayN = Math.max(tray.value.length, 1)
  const max = n <= 5 ? 52 : n <= 7 ? 44 : n <= 9 ? 36 : n <= 11 ? 30 : n <= 13 ? 24 : 20
  const gap = n <= 5 ? 8 : n <= 7 ? 6 : n <= 9 ? 5 : n <= 11 ? 4 : 3
  const fsMax = n <= 5 ? 24 : n <= 7 ? 20 : n <= 9 ? 17 : n <= 11 ? 14 : 12
  const trayMax = trayN <= 5 ? 54 : trayN <= 7 ? 46 : trayN <= 9 ? 38 : trayN <= 11 ? 32 : 26
  const trayGap = trayN <= 5 ? 10 : trayN <= 7 ? 8 : trayN <= 9 ? 6 : 4
  const trayFs = trayN <= 5 ? 24 : trayN <= 7 ? 20 : trayN <= 9 ? 16 : 13
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

function onTrayActivate(tile: LetterTile) {
  placeTile(tile)
}

function onSlotActivate(index: number) {
  returnSlot(index)
}

async function revealAnswer() {
  if (!showReveal.value) return
  feedback.value = 'revealed'
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
        :aria-describedby="showMeaning ? undefined : 'wotd-clue-text'"
        tabindex="-1"
      >
        <header class="wotd__head">
          <div class="wotd__brand" aria-hidden="true">
            <span class="wotd__brand-tile">W</span>
            <span class="wotd__brand-tile wotd__brand-tile--paper">O</span>
            <span class="wotd__brand-tile">D</span>
          </div>
          <h2 id="wotd-title" class="wotd__title">Word of the day</h2>
          <button
            type="button"
            class="wotd__close u-icon-btn u-icon-btn--idle"
            aria-label="Close"
            @click="dismiss()"
          >
            <EdSignalIcon name="close" />
          </button>
        </header>

        <p v-if="!showMeaning" id="wotd-clue-text" class="wotd__clue">{{ clue }}</p>

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

        <div
          v-if="!showMeaning && tray.length"
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
        </div>

        <p
          v-if="feedback === 'wrong'"
          id="wotd-feedback"
          class="wotd__feedback"
          role="status"
        >
          Not quite — try again
        </p>

        <button
          v-if="showReveal"
          type="button"
          class="wotd__show-answer"
          @click="revealAnswer()"
        >
          Show answer
        </button>

        <div v-if="showMeaning" class="wotd__meaning" aria-live="polite">
          <p class="wotd__word">{{ word }}</p>
          <p v-if="meaningLoading" class="wotd__meaning-loading">Loading…</p>
          <template v-else-if="meaning">
            <p v-if="meaning.pos" class="wotd__meaning-pos">{{ meaning.pos }}</p>
            <p class="wotd__meaning-def">{{ meaning.definition }}</p>
            <p v-if="meaning.example" class="wotd__meaning-ex">“{{ meaning.example }}”</p>
          </template>
          <button
            type="button"
            class="wotd__done"
            @click="close()"
          >
            Nice — close
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
  padding: max(12rem, var(--safe-top)) 12rem max(12rem, var(--safe-bottom));
  background: color-mix(in srgb, var(--ink) 55%, transparent);
  backdrop-filter: blur(3px);
}
@media (min-width: 560px) {
  .wotd { place-items: center; }
}
.wotd__panel {
  position: relative;
  isolation: isolate;
  width: min(420rem, 100%);
  padding: 16rem 16rem 14rem;
  background: var(--paper);
  color: var(--ink);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l) var(--radius-l) var(--radius-m) var(--radius-m);
  box-shadow: 5rem 5rem 0 color-mix(in srgb, var(--ink) 88%, transparent);
  animation: wotd-in 240ms var(--ease-out) both;
  opacity: 1;
}
@media (min-width: 560px) {
  .wotd__panel { border-radius: var(--radius-l); padding: 20rem 22rem 18rem; }
}
@keyframes wotd-in {
  from { opacity: 0; transform: translateY(14rem) scale(.98); }
  to { opacity: 1; transform: none; }
}

.wotd__head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10rem;
  margin: 0 0 12rem;
}
.wotd__brand {
  position: relative;
  width: 28rem;
  height: 22rem;
}
.wotd__brand-tile {
  position: absolute;
  display: grid;
  place-items: center;
  width: 14rem;
  height: 15rem;
  border: 1.5rem solid var(--ink);
  border-radius: 2.5rem;
  background: var(--accent);
  color: var(--accent-ink);
  font: 900 9rem/1 var(--font-mono);
  box-shadow: 1rem 1rem 0 color-mix(in srgb, var(--ink) 22%, transparent);
}
.wotd__brand-tile:nth-child(1) { left: 0; top: 0; }
.wotd__brand-tile--paper { left: 7rem; top: 3rem; background: var(--paper); color: var(--ink); }
.wotd__brand-tile:nth-child(3) { left: 14rem; top: 6rem; }
.wotd__title {
  margin: 0;
  font: 600 clamp(18rem, 3.8vw, 22rem)/1.1 var(--font-display);
  letter-spacing: -.02em;
}
.wotd__close {
  flex: none;
  margin: -2rem -4rem 0 0;
  color: var(--ink-soft);
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}
.wotd__close:hover {
  color: var(--ink);
  background: transparent;
  border-color: transparent;
}

.wotd__clue {
  margin: 0 0 14rem;
  font: 500 15rem/1.4 var(--font-ui);
  color: var(--ink);
}

.wotd__slots {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: var(--slot-gap, 6rem);
  margin: 0 0 12rem;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  container-type: inline-size;
}
.wotd__slots--ok .wotd__slot {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--ink);
  box-shadow: 2rem 2rem 0 var(--ink);
  animation: wotd-pop 320ms var(--ease-out) both;
}
.wotd__slots--ok .wotd__slot:nth-child(2) { animation-delay: 40ms; }
.wotd__slots--ok .wotd__slot:nth-child(3) { animation-delay: 80ms; }
.wotd__slots--ok .wotd__slot:nth-child(4) { animation-delay: 120ms; }
.wotd__slots--ok .wotd__slot:nth-child(5) { animation-delay: 160ms; }
.wotd__slots--ok .wotd__slot:nth-child(n+6) { animation-delay: 200ms; }
@keyframes wotd-pop {
  from { transform: scale(.86); }
  60% { transform: scale(1.06); }
  to { transform: none; }
}
.wotd__slots--wrong .wotd__slot--filled {
  border-color: var(--ink);
  background: color-mix(in srgb, var(--paper) 88%, #c44);
}
.wotd__slots--shake {
  animation: wotd-shake 380ms var(--ease-out);
}
@keyframes wotd-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5rem); }
  40% { transform: translateX(5rem); }
  60% { transform: translateX(-3rem); }
  80% { transform: translateX(2rem); }
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
  transition: background 140ms ease, transform 120ms ease, box-shadow 120ms ease, color 140ms ease;
}
.wotd__slot--empty {
  background: var(--paper);
  border-style: dashed;
  border-color: color-mix(in srgb, var(--ink) 35%, var(--line));
  cursor: default;
}
.wotd__slot--given {
  background: var(--accent);
  color: var(--accent-ink);
  border-style: solid;
  border-color: var(--ink);
  box-shadow: 2rem 2rem 0 color-mix(in srgb, var(--ink) 28%, transparent);
  cursor: default;
}
.wotd__slots--wrong .wotd__slot--given {
  background: var(--accent);
  color: var(--accent-ink);
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
.wotd__slot:disabled { cursor: default; }

.wotd__tray {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: var(--tray-gap, 10rem);
  margin: 0 0 10rem;
  padding: 8rem 6rem;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-s);
  background: color-mix(in srgb, var(--accent) 14%, var(--paper));
  container-type: inline-size;
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
  color: var(--accent-ink);
  font: 700 clamp(11rem, calc(48cqw / var(--tray-count, 8)), var(--tray-fs-max, 24rem))/1 var(--font-ui);
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 2rem 2rem 0 var(--ink);
  -webkit-tap-highlight-color: transparent;
  transition: transform 120ms var(--ease-out), box-shadow 120ms ease, background 140ms ease;
}
.wotd__tile:hover {
  background: var(--accent-soft);
  color: var(--accent-ink);
  transform: translate(-1rem, -1rem);
  box-shadow: 3rem 3rem 0 var(--ink);
}
.wotd__tile:active {
  transform: translate(1rem, 1rem);
  box-shadow: 1rem 1rem 0 var(--ink);
}
.wotd__tile:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
}

.wotd__feedback {
  margin: 0 0 8rem;
  font: 650 13rem/1.3 var(--font-ui);
  color: var(--ink);
  text-align: center;
}

.wotd__show-answer {
  display: block;
  margin: 0 auto 2rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  font: 650 13rem/1 var(--font-ui);
  text-decoration: underline;
  text-underline-offset: 3rem;
  cursor: pointer;
}
.wotd__show-answer:hover { color: var(--ink); }
.wotd__show-answer:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
  border-radius: var(--radius-s);
}

.wotd__meaning {
  margin: 4rem 0 0;
  padding: 0;
  text-align: center;
}
.wotd__word {
  margin: 0 0 8rem;
  font: 600 clamp(28rem, 6vw, 36rem)/1 var(--font-display);
  letter-spacing: -.03em;
  text-transform: lowercase;
}
.wotd__meaning-pos {
  margin: 0 0 4rem;
  font: 700 10rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
}
.wotd__meaning-def {
  margin: 0 auto 8rem;
  max-width: 34ch;
  font: 500 15rem/1.4 var(--font-ui);
}
.wotd__meaning-ex {
  margin: 0 auto 14rem;
  max-width: 34ch;
  font: italic 400 13rem/1.35 var(--font-ui);
  color: var(--ink-soft);
}
.wotd__meaning-loading {
  margin: 0 0 12rem;
  font: 400 13rem/1.3 var(--font-ui);
  color: var(--muted);
}
.wotd__done {
  display: block;
  width: 100%;
  min-height: 48rem;
  margin-top: 2rem;
  padding: 0 18rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--accent);
  color: var(--accent-ink);
  font: 700 14rem/1 var(--font-ui);
  box-shadow: 3rem 3rem 0 var(--ink);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, background 140ms ease;
}
.wotd__done:hover {
  background: var(--accent-soft);
  color: var(--accent-ink);
}
.wotd__done:active {
  transform: translate(1rem, 1rem);
  box-shadow: 2rem 2rem 0 var(--ink);
}
.wotd__done:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
}

@media (prefers-reduced-motion: reduce) {
  .wotd__panel,
  .wotd__slots--shake,
  .wotd__slots--ok .wotd__slot { animation: none; }
  .wotd__tile,
  .wotd__slot,
  .wotd__done { transition: none; }
}
:global(html[data-reduce-motion="on"]) .wotd__panel,
:global(html[data-reduce-motion="on"]) .wotd__slots--shake,
:global(html[data-reduce-motion="on"]) .wotd__slots--ok .wotd__slot { animation: none; }
:global(html[data-reduce-motion="on"]) .wotd__tile,
:global(html[data-reduce-motion="on"]) .wotd__slot,
:global(html[data-reduce-motion="on"]) .wotd__done { transition: none; }
</style>

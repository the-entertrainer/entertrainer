<script setup lang="ts">
import { MUST_LETTERS, type ElevateCategory } from '~/content/elevate-categories'

const props = withDefaults(
  defineProps<{
    /** `panel` = full yellow card (article footers). `bubble` = corner orb. `inline` = quiet Elevate subscribe. */
    variant?: 'panel' | 'bubble' | 'inline'
    /** Active MUST category when used as Elevate hero bubble (for pressed state). */
    activeCategory?: ElevateCategory | 'all' | string
  }>(),
  { variant: 'panel', activeCategory: 'all' }
)

const emit = defineEmits<{
  'select-category': [category: ElevateCategory]
}>()

const email = ref('')
const status = ref('')
const failed = ref(false)
const submitting = ref(false)
const form = ref<HTMLFormElement | null>(null)
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const triggerBtn = ref<HTMLButtonElement | null>(null)

const titleId = computed(() => {
  if (props.variant === 'bubble') return 'newsletter-bubble-title'
  if (props.variant === 'inline') return 'newsletter-inline-title'
  return 'newsletter-title'
})
const emailId = computed(() => {
  if (props.variant === 'bubble') return 'newsletter-bubble-email'
  if (props.variant === 'inline') return 'newsletter-inline-email'
  return 'newsletter-email'
})

const inlineOpen = ref(false)
let inlineCollapseTimer: ReturnType<typeof setTimeout> | undefined

function openInline() {
  inlineOpen.value = true
  nextTick(() => {
    const input = root.value?.querySelector<HTMLInputElement>('input[type="email"]')
    input?.focus()
  })
}

function closeInline() {
  inlineOpen.value = false
  if (inlineCollapseTimer) {
    clearTimeout(inlineCollapseTimer)
    inlineCollapseTimer = undefined
  }
}

function subscribeByMailto() {
  const subject = encodeURIComponent('Entertrainer weekly')
  const body = encodeURIComponent(`Please add ${email.value.trim()} to the Entertrainer list.`)
  status.value = 'Opening your email app with a short subscribe note. Send it, and you are on the list.'
  failed.value = false
  window.location.href = `mailto:mail@entertrainer.in?subject=${subject}&body=${body}`
}

async function subscribe() {
  if (!form.value?.reportValidity() || submitting.value) return

  submitting.value = true
  try {
    const result = await $fetch<{ ok: boolean; configured: boolean; message: string }>('/api/newsletter-subscribe', {
      method: 'POST',
      body: { email: email.value.trim() }
    })
    if (result.ok) {
      status.value = props.variant === 'inline'
        ? 'You’re in. See you Friday.'
        : `${result.message} If a welcome mail shows up in spam, blame the filters — not you.`
      failed.value = false
      email.value = ''
      if (props.variant === 'inline') {
        if (inlineCollapseTimer) clearTimeout(inlineCollapseTimer)
        inlineCollapseTimer = setTimeout(() => {
          inlineOpen.value = false
          status.value = ''
          inlineCollapseTimer = undefined
        }, 2200)
      }
    } else if (!result.configured) {
      subscribeByMailto()
    } else {
      status.value = result.message
      failed.value = true
    }
  } catch {
    subscribeByMailto()
  } finally {
    submitting.value = false
  }
}

function openBubble() {
  open.value = true
}

function closeBubble() {
  open.value = false
  nextTick(() => triggerBtn.value?.focus())
}

function toggleBubble() {
  if (open.value) closeBubble()
  else openBubble()
}

function onMust(cat: ElevateCategory) {
  emit('select-category', cat)
}

function onDocPointer(e: PointerEvent) {
  if (!open.value || props.variant !== 'bubble') return
  const t = e.target as Node | null
  if (root.value && t && !root.value.contains(t)) closeBubble()
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (props.variant === 'bubble' && open.value) {
    e.preventDefault()
    closeBubble()
    return
  }
  if (props.variant === 'inline' && inlineOpen.value) {
    e.preventDefault()
    closeInline()
  }
}

watch(open, async (isOpen) => {
  if (!import.meta.client || props.variant !== 'bubble') return
  if (isOpen) {
    await nextTick()
    // Prefer focusing the MUST row first so discovery leads; email stays one tab away.
    const firstMust = panelEl.value?.querySelector<HTMLButtonElement>('.nl-bubble__must-tile')
    firstMust?.focus()
  }
})

onMounted(() => {
  if (props.variant === 'bubble') {
    document.addEventListener('pointerdown', onDocPointer)
    window.addEventListener('keydown', onKey)
  } else if (props.variant === 'inline') {
    window.addEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer)
  window.removeEventListener('keydown', onKey)
  if (inlineCollapseTimer) clearTimeout(inlineCollapseTimer)
})
</script>

<template>
  <!-- Quiet Elevate subscribe — button expands to email, no MUST tiles -->
  <div
    v-if="variant === 'inline'"
    ref="root"
    class="nl-inline"
    :class="{ 'is-open': inlineOpen }"
  >
    <button
      v-if="!inlineOpen"
      type="button"
      class="nl-inline__trigger"
      aria-expanded="false"
      aria-controls="newsletter-inline-panel"
      @click="openInline"
    >
      Subscribe to our Friday Newsletter
    </button>

    <div
      v-else
      id="newsletter-inline-panel"
      class="nl-inline__panel"
      role="region"
      :aria-labelledby="titleId"
    >
      <div class="nl-inline__head">
        <p :id="titleId" class="nl-inline__title">Friday Newsletter</p>
        <button type="button" class="nl-inline__close u-icon-btn u-icon-btn--idle" aria-label="Close subscribe form" @click="closeInline">×</button>
      </div>
      <form ref="form" class="nl-inline__form" @submit.prevent="subscribe">
        <label :for="emailId">Email address</label>
        <div class="nl-inline__field">
          <input
            :id="emailId"
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            :disabled="submitting"
          >
          <button type="submit" :disabled="submitting">{{ submitting ? 'Sending…' : 'Subscribe' }}</button>
        </div>
        <p class="nl-inline__fine">Occasional. No spam. One click to leave.</p>
        <p v-if="status" class="nl-inline__status" :class="{ 'is-error': failed }" role="status">{{ status }}</p>
      </form>
    </div>
  </div>

  <!-- Compact corner orb — expands into MUST + subscribe -->
  <div
    v-else-if="variant === 'bubble'"
    ref="root"
    class="nl-bubble"
    :class="{ 'is-open': open }"
  >
    <button
      ref="triggerBtn"
      type="button"
      class="nl-bubble__orb"
      :aria-expanded="open"
      aria-controls="newsletter-bubble-panel"
      :aria-label="open ? 'Close Friday Notes' : 'you MUST tap this! Open Friday Notes and MUST categories'"
      @click="toggleBubble"
    >
      <span class="nl-bubble__orb-glow" aria-hidden="true" />
      <span class="nl-bubble__orb-mark" aria-hidden="true">!</span>
      <span class="nl-bubble__orb-copy">
        <span class="nl-bubble__orb-line">you <em>MUST</em></span>
        <span class="nl-bubble__orb-line nl-bubble__orb-line--tap">tap this!</span>
      </span>
    </button>

    <div
      v-show="open"
      id="newsletter-bubble-panel"
      ref="panelEl"
      class="nl-bubble__panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="nl-bubble__panel-head">
        <div>
          <p class="nl-bubble__kicker">Friday notes</p>
          <h2 :id="titleId">Spell it once.</h2>
        </div>
        <button type="button" class="nl-bubble__close u-icon-btn u-icon-btn--idle" aria-label="Close" @click="closeBubble">×</button>
      </div>

      <div class="nl-bubble__must" aria-label="MUST categories: Mind, Universe, Science, Technology">
        <ul class="nl-bubble__must-row">
          <li v-for="item in MUST_LETTERS" :key="item.letter">
            <button
              type="button"
              class="nl-bubble__must-tile"
              :aria-pressed="activeCategory === item.category"
              :aria-label="`${item.letter} is for ${item.category}`"
              @click="onMust(item.category)"
            >
              <span class="nl-bubble__must-letter">{{ item.letter }}</span>
              <span class="nl-bubble__must-name">{{ item.category }}</span>
            </button>
          </li>
        </ul>
        <p class="nl-bubble__must-spell" aria-hidden="true">
          <span>M</span><span>U</span><span>S</span><span>T</span>
        </p>
      </div>

      <p class="nl-bubble__dek">Get the next question by email.</p>
      <form ref="form" class="nl-bubble__form" @submit.prevent="subscribe">
        <label :for="emailId">Email address</label>
        <div class="nl-bubble__field">
          <input
            :id="emailId"
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            :disabled="submitting"
          >
          <button type="submit" :disabled="submitting">{{ submitting ? 'Sending…' : 'Subscribe' }}</button>
        </div>
        <p class="nl-bubble__fine">No spam. No selling your address. One click to leave.</p>
        <p v-if="status" class="nl-bubble__status" :class="{ 'is-error': failed }" role="status">{{ status }}</p>
      </form>
    </div>
  </div>

  <!-- Full yellow panel (article footers, etc.) -->
  <section v-else class="newsletter" aria-labelledby="newsletter-title">
    <div class="newsletter__mark" aria-hidden="true"><EdWordmark variant="mark" :size="54" /></div>
    <div class="newsletter__copy">
      <p class="newsletter__kicker">Friday notes</p>
      <h2 id="newsletter-title">Get the next question by email.</h2>
    </div>
    <form ref="form" class="newsletter__form" @submit.prevent="subscribe">
      <label for="newsletter-email">Email address</label>
      <div class="newsletter__field">
        <input id="newsletter-email" v-model="email" type="email" inputmode="email" autocomplete="email" required placeholder="you@example.com" :disabled="submitting">
        <button type="submit" :disabled="submitting">{{ submitting ? 'Sending…' : 'Subscribe' }}</button>
      </div>
      <p class="newsletter__fine">No spam. No selling your address. One click to leave.</p>
      <p v-if="status" class="newsletter__status" :class="{ 'is-error': failed }" role="status">{{ status }}</p>
    </form>
  </section>
</template>

<style scoped>
/* —— Quiet inline subscribe (Elevate hero) —— */
.nl-inline {
  width: max-content;
  max-width: min(100%, 420rem);
  margin-top: 18rem;
}
.nl-inline__trigger {
  display: inline-flex;
  align-items: center;
  min-height: 40rem;
  padding: 8rem 16rem;
  border: var(--stroke) solid color-mix(in srgb, var(--ink) 42%, transparent);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--ink);
  font: 600 13rem/1.2 var(--font-ui);
  letter-spacing: -.01em;
  cursor: pointer;
  transition:
    background var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-spring);
}
@media (hover: hover) {
  .nl-inline__trigger:hover {
    background: color-mix(in srgb, var(--accent) 28%, var(--paper));
    border-color: var(--ink);
  }
}
.nl-inline__trigger:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 3rem;
}
.nl-inline__panel {
  width: min(380rem, calc(100vw - 28rem));
  padding: 14rem 14rem 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper);
  box-shadow: 4rem 4rem 0 color-mix(in srgb, var(--ink) 12%, transparent);
  animation: nl-inline-in 220ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1));
}
.nl-inline__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rem;
  margin-bottom: 10rem;
}
.nl-inline__title {
  margin: 0;
  font: 700 12rem/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.nl-inline__close {
  flex: none;
  width: 28rem;
  height: 28rem;
  border: var(--stroke) solid var(--line);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  font: 700 16rem/1 var(--font-ui);
  cursor: pointer;
}
.nl-inline__form > label {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.nl-inline__field {
  display: flex;
  gap: 6rem;
  padding: 4rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: color-mix(in srgb, var(--accent) 10%, var(--paper));
}
.nl-inline__field input {
  width: 100%;
  min-width: 0;
  padding: 10rem;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font: 500 15rem/1.2 var(--font-ui);
}
.nl-inline__field button {
  flex: none;
  padding: 10rem 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--accent);
  color: var(--accent-ink);
  font: 800 13rem/1 var(--font-ui);
  cursor: pointer;
}
.nl-inline__field input:disabled,
.nl-inline__field button:disabled { opacity: .6; cursor: default; }
.nl-inline__fine,
.nl-inline__status {
  margin: 8rem 0 0;
  font: 400 12rem/1.35 var(--font-body);
}
.nl-inline__fine { color: var(--ink-soft); }
.nl-inline__status {
  padding: 8rem 10rem;
  background: color-mix(in srgb, var(--accent) 12%, var(--paper));
  border-radius: var(--radius-s);
}
.nl-inline__status.is-error {
  background: color-mix(in srgb, #d64545 14%, var(--paper));
  color: var(--danger);
}
@keyframes nl-inline-in {
  from { opacity: 0; transform: translateY(-4rem); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .nl-inline__panel { animation: none; }
}
:global(html[data-reduce-motion="on"]) .nl-inline__panel { animation: none; }

/* —— Bubble orb + popover —— */
.nl-bubble {
  position: relative;
  z-index: 5;
  width: max-content;
  max-width: min(100%, 420rem);
}

.nl-bubble__orb {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10rem;
  min-height: 58rem;
  padding: 8rem 18rem 8rem 8rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--accent);
  color: var(--accent-ink);
  cursor: pointer;
  box-shadow:
    4rem 4rem 0 color-mix(in srgb, var(--ink) 18%, transparent),
    0 0 0 0 transparent;
  transition:
    transform var(--dur-fast) var(--ease-spring),
    box-shadow var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out);
}

.nl-bubble__orb-glow {
  position: absolute;
  inset: -7rem;
  border-radius: inherit;
  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 60%, transparent), transparent 72%);
  opacity: .55;
  pointer-events: none;
  animation: nl-bubble-pulse 2.8s var(--ease-out, ease) infinite;
}

.nl-bubble__orb-mark {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 42rem;
  height: 42rem;
  border-radius: 50%;
  border: var(--stroke) solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font: 800 18rem/1 var(--font-display);
  letter-spacing: -.04em;
  flex: none;
}

.nl-bubble__orb-copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 2rem;
  text-align: left;
  line-height: 1.05;
}

.nl-bubble__orb-line {
  font: 700 13rem/1.05 var(--font-ui);
  letter-spacing: -.01em;
}

.nl-bubble__orb-line em {
  font-style: normal;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
  background: var(--paper);
  color: var(--ink);
  padding: 1rem 5rem;
  border-radius: 4rem;
  border: 1.5rem solid var(--ink);
  margin: 0 2rem;
}

.nl-bubble__orb-line--tap {
  font-size: 12rem;
  letter-spacing: .04em;
  text-transform: lowercase;
  opacity: .85;
}

@media (hover: hover) {
  .nl-bubble__orb:hover {
    transform: translate(-2rem, -2rem);
    box-shadow: 6rem 6rem 0 color-mix(in srgb, var(--ink) 22%, transparent);
    background: var(--accent-strong, var(--accent));
  }
}

.nl-bubble__orb:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 3rem;
}

.nl-bubble.is-open .nl-bubble__orb {
  background: var(--paper);
  box-shadow: 3rem 3rem 0 var(--ink);
}

.nl-bubble.is-open .nl-bubble__orb-glow { display: none; }

.nl-bubble__panel {
  position: absolute;
  top: calc(100% + 12rem);
  right: 0;
  width: min(380rem, calc(100vw - 28rem));
  padding: 18rem 18rem 16rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-l);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 8rem 8rem 0 color-mix(in srgb, var(--accent) 55%, transparent);
  animation: nl-bubble-in 240ms var(--ease-spring, cubic-bezier(.2, .9, .2, 1));
}

.nl-bubble__panel-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12rem;
}

.nl-bubble__kicker {
  margin: 0 0 6rem;
  color: var(--ink-soft);
  font: 700 10rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.nl-bubble__panel h2 {
  margin: 0;
  max-width: 14ch;
  font: 500 clamp(24rem, 3.2vw, 32rem)/1 var(--font-display);
  letter-spacing: -.04em;
}

.nl-bubble__close {
  flex: none;
  width: 32rem;
  height: 32rem;
  border: var(--stroke) solid var(--ink);
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-ink);
  font: 700 18rem/1 var(--font-ui);
  cursor: pointer;
}

/* MUST discovery — only visible inside expand */
.nl-bubble__must {
  margin-top: 16rem;
}

.nl-bubble__must-row {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6rem;
}

.nl-bubble__must-tile {
  display: grid;
  gap: 4rem;
  width: 100%;
  min-height: 64rem;
  padding: 10rem 6rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: color-mix(in srgb, var(--accent) 14%, var(--paper));
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring), box-shadow var(--dur-fast) var(--ease-out);
}

.nl-bubble__must-tile[aria-pressed="true"] {
  background: var(--accent);
  color: var(--accent-ink);
  box-shadow: 3rem 3rem 0 var(--ink);
}

.nl-bubble__must-letter {
  font: 800 22rem/1 var(--font-display);
  letter-spacing: -.04em;
}

.nl-bubble__must-name {
  font: 700 8rem/1.15 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  opacity: .78;
}

@media (hover: hover) {
  .nl-bubble__must-tile:hover {
    background: var(--accent);
    transform: translate(-1rem, -1rem);
    box-shadow: 3rem 3rem 0 var(--ink);
  }
}

.nl-bubble__must-tile:focus-visible {
  outline: 3rem solid var(--ink);
  outline-offset: 2rem;
}

.nl-bubble__must-spell {
  display: flex;
  gap: 2rem;
  margin: 10rem 0 0;
  font: 800 11rem/1 var(--font-mono);
  letter-spacing: .4em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink) 28%, transparent);
}

.nl-bubble__must-spell span {
  display: inline-grid;
  place-items: center;
  width: 1.35em;
}

.nl-bubble__dek {
  margin: 16rem 0 0;
  font-size: 14rem;
  line-height: 1.4;
  color: var(--ink-soft);
}

.nl-bubble__form { margin-top: 12rem; min-width: 0; }
.nl-bubble__form > label {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.nl-bubble__field {
  display: flex;
  gap: 6rem;
  padding: 5rem;
  background: color-mix(in srgb, var(--accent) 16%, var(--paper));
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
}

.nl-bubble__field input {
  width: 100%;
  min-width: 0;
  padding: 10rem 10rem;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font: 500 15rem/1.2 var(--font-ui);
}

.nl-bubble__field button {
  flex: none;
  padding: 10rem 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  color: var(--accent-ink);
  background: var(--accent);
  font: 800 13rem/1 var(--font-ui);
  cursor: pointer;
}

.nl-bubble__field input:disabled,
.nl-bubble__field button:disabled { opacity: .6; cursor: default; }

.nl-bubble__fine,
.nl-bubble__status {
  margin: 10rem 0 0;
  font: 400 12rem/1.35 var(--font-body);
}

.nl-bubble__fine { color: var(--ink-soft); }
.nl-bubble__status {
  padding: 8rem 10rem;
  background: color-mix(in srgb, var(--accent) 12%, var(--paper));
  border-radius: var(--radius-s);
}
.nl-bubble__status.is-error {
  background: color-mix(in srgb, #d64545 14%, var(--paper));
  color: var(--danger);
}

@keyframes nl-bubble-pulse {
  0%, 100% { opacity: .35; transform: scale(1); }
  50% { opacity: .7; transform: scale(1.04); }
}

@keyframes nl-bubble-in {
  from { opacity: 0; transform: translateY(-6rem) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 420px) {
  .nl-bubble__must-tile { min-height: 58rem; padding: 8rem 4rem; }
  .nl-bubble__must-letter { font-size: 18rem; }
  .nl-bubble__must-name { font-size: 7rem; }
}

@media (prefers-reduced-motion: reduce) {
  .nl-bubble__orb-glow,
  .nl-bubble__panel { animation: none; }
  .nl-bubble__orb,
  .nl-bubble__must-tile { transition: none; }
}
:global(html[data-reduce-motion="on"]) .nl-bubble__orb-glow,
:global(html[data-reduce-motion="on"]) .nl-bubble__panel { animation: none; }

/* —— Full panel (article footers) —— */
.newsletter { position: relative; display: grid; grid-template-columns: auto minmax(0, .8fr) minmax(360rem, 1.05fr); gap: clamp(20rem, 3.4vw, 48rem); align-items: center; padding: clamp(24rem, 4.5vw, 52rem); overflow: hidden; color: var(--ink); background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); }
.newsletter::after { content: ''; position: absolute; width: 440rem; height: 440rem; right: -200rem; top: 50%; border: 58rem solid color-mix(in srgb, var(--accent) 35%, transparent); border-radius: 50%; transform: translateY(-50%); pointer-events: none; }
.newsletter > * { position: relative; z-index: 1; }
.newsletter__mark { display: grid; width: 82rem; height: 82rem; place-items: center; background: var(--paper); border: var(--stroke) solid var(--ink); border-radius: 50%; box-shadow: 5rem 5rem 0 var(--ink); }
.newsletter__kicker { margin: 0 0 10rem; color: var(--ink-soft); font: 700 11rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.newsletter h2 { margin: 0; max-width: 410rem; font: 500 clamp(29rem, 3.2vw, 44rem)/.96 var(--font-display); letter-spacing: -.045em; }
.newsletter__copy > p:last-child { max-width: 440rem; margin: 14rem 0 0; font-size: 16rem; line-height: 1.45; }
.newsletter__form { min-width: 0; }
.newsletter__form > label { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.newsletter__field { display: flex; gap: 8rem; padding: 7rem; background: var(--paper); border: var(--stroke) solid var(--ink); border-radius: var(--radius-m); box-shadow: 5rem 5rem 0 color-mix(in srgb, var(--ink) 18%, transparent); }
.newsletter input { width: 100%; min-width: 0; padding: 11rem 12rem; color: var(--ink); border: 0; outline: 0; background: transparent; font: 500 16rem/1.2 var(--font-ui); }
.newsletter input::placeholder { color: var(--ink-soft); opacity: .8; }
.newsletter button { flex: none; padding: 11rem 15rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); color: var(--accent-ink); background: var(--accent); font: 800 14rem/1 var(--font-ui); transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out); }
.newsletter button:hover { transform: translateY(-2rem); background: var(--accent-strong); }
.newsletter button:active { transform: translateY(1rem) scale(.97); }
.newsletter input:disabled, .newsletter button:disabled { opacity: .6; cursor: default; }
.newsletter button:disabled:hover { transform: none; background: var(--accent); }
.newsletter__fine, .newsletter__status { margin: 10rem 0 0; font: 400 12rem/1.35 var(--font-body); }
.newsletter__fine { color: var(--ink-soft); }
.newsletter__status { padding: 8rem 10rem; background: var(--paper); border-radius: var(--radius-s); }
.newsletter__status.is-error { background: color-mix(in srgb, #d64545 14%, var(--paper)); color: var(--danger); }
@media (max-width: 1000px) { .newsletter { grid-template-columns: auto 1fr; } .newsletter__form { grid-column: 1 / -1; } }
@media (max-width: 580px) { .newsletter { grid-template-columns: 1fr; gap: 16rem; padding: 25rem; } .newsletter__mark { width: 64rem; height: 64rem; box-shadow: 4rem 4rem 0 var(--ink); } .newsletter__field { display: grid; } .newsletter button { min-height: 46rem; } .newsletter::after { right: -310rem; } }
</style>

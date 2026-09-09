<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** `panel` = full yellow card (article footers). `inline` = quiet Elevate subscribe. */
    variant?: 'panel' | 'inline'
  }>(),
  { variant: 'panel' }
)

const email = ref('')
const status = ref('')
const failed = ref(false)
const submitting = ref(false)
const form = ref<HTMLFormElement | null>(null)
const root = ref<HTMLElement | null>(null)

const titleId = computed(() => (
  props.variant === 'inline' ? 'newsletter-inline-title' : 'newsletter-title'
))
const emailId = computed(() => (
  props.variant === 'inline' ? 'newsletter-inline-email' : 'newsletter-email'
))

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

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (props.variant === 'inline' && inlineOpen.value) {
    e.preventDefault()
    closeInline()
  }
}

onMounted(() => {
  if (props.variant === 'inline') {
    window.addEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (inlineCollapseTimer) clearTimeout(inlineCollapseTimer)
})
</script>

<template>
  <!-- Quiet Elevate subscribe — button expands to email -->
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
      <span>Friday newsletter</span>
      <span class="nl-inline__bell" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
          <path d="M8 1.6c-1.7 0-3.1 1.3-3.1 3v1.4c0 .9-.3 1.7-.8 2.4l-.5.7c-.2.3 0 .8.4.8h8c.4 0 .6-.5.4-.8l-.5-.7c-.5-.7-.8-1.5-.8-2.4V4.6c0-1.7-1.4-3-3.1-3Z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/>
          <path d="M6.4 12.2a1.7 1.7 0 0 0 3.2 0" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
        </svg>
      </span>
    </button>

    <div
      v-else
      id="newsletter-inline-panel"
      class="nl-inline__panel"
      role="region"
      :aria-labelledby="titleId"
    >
      <div class="nl-inline__head">
        <p :id="titleId" class="nl-inline__title">Friday notes</p>
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

  <!-- Full yellow panel (article footers, etc.) -->
  <section v-else class="newsletter" aria-labelledby="newsletter-title">
    <div class="newsletter__mark" aria-hidden="true"><EdWordmark variant="mark" :size="54" /></div>
    <div class="newsletter__copy">
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
.newsletter button:hover { transform: translateY(-2rem); background: var(--accent-strong); color: var(--accent-ink); }
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

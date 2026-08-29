<script setup lang="ts">
const email = ref('')
const status = ref('')
const failed = ref(false)
const submitting = ref(false)
const form = ref<HTMLFormElement | null>(null)

function subscribeByMailto() {
  const subject = encodeURIComponent('Entertrainer Blogs subscription')
  const body = encodeURIComponent(`Please add ${email.value.trim()} to The Entertrainer Blogs list.`)
  status.value = 'Your email app is opening with a prepared subscription message. Send it to join the list.'
  failed.value = false
  window.location.href = `mailto:iamnaveenjose@outlook.com?subject=${subject}&body=${body}`
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
      status.value = result.message
      failed.value = false
      email.value = ''
    } else if (!result.configured) {
      // No provider configured server-side yet — fall back to the mailto flow.
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
</script>

<template>
  <section class="newsletter" aria-labelledby="newsletter-title">
    <div class="newsletter__mark" aria-hidden="true"><EdWordmark variant="mark" :size="54" /></div>
    <div class="newsletter__copy">
      <p class="newsletter__kicker">Newsletter</p>
      <h2 id="newsletter-title">Get new posts by email.</h2>
      <p>Occasional updates when a new post is published.</p>
    </div>
    <form ref="form" class="newsletter__form" @submit.prevent="subscribe">
      <label for="newsletter-email">Email address</label>
      <div class="newsletter__field">
        <input id="newsletter-email" v-model="email" type="email" inputmode="email" autocomplete="email" required placeholder="you@example.com" :disabled="submitting">
        <button type="submit" :disabled="submitting">{{ submitting ? 'Sending…' : 'Subscribe' }}</button>
      </div>
      <p class="newsletter__fine">No spam, no selling your address. Unsubscribe with one click, any time.</p>
      <p v-if="status" class="newsletter__status" :class="{ 'is-error': failed }" role="status">{{ status }}</p>
    </form>
  </section>
</template>

<style scoped>
/* Newsletter widget: concentric-logo warmth, editorial typography, modest radii, and no fake provider claim. */
.newsletter { position: relative; display: grid; grid-template-columns: auto minmax(0, .8fr) minmax(360rem, 1.05fr); gap: clamp(20rem, 3.4vw, 48rem); align-items: center; padding: clamp(24rem, 4.5vw, 52rem); overflow: hidden; color: var(--ink); background: var(--signal-field); border: var(--stroke) solid var(--ink); border-radius: var(--radius-l); }
.newsletter::after { content: ''; position: absolute; width: 440rem; height: 440rem; right: -200rem; top: 50%; border: 58rem solid color-mix(in srgb, var(--signal-cobalt) 35%, transparent); border-radius: 50%; transform: translateY(-50%); pointer-events: none; }
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
.newsletter button { flex: none; padding: 11rem 15rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-s); color: var(--ink); background: var(--signal-cobalt); font: 800 14rem/1 var(--font-ui); transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out); }
.newsletter button:hover { transform: translateY(-2rem); background: color-mix(in srgb, var(--signal-cobalt) 78%, white); }
.newsletter button:active { transform: translateY(1rem) scale(.97); }
.newsletter input:disabled, .newsletter button:disabled { opacity: .6; cursor: default; }
.newsletter button:disabled:hover { transform: none; background: var(--signal-cobalt); }
.newsletter__fine, .newsletter__status { margin: 10rem 0 0; font: 400 12rem/1.35 var(--font-body); }
.newsletter__fine { color: var(--ink-soft); }
.newsletter__status { padding: 8rem 10rem; background: var(--paper); border-radius: var(--radius-s); }
.newsletter__status.is-error { background: color-mix(in srgb, #d64545 14%, var(--paper)); color: #9a2f2f; }
@media (max-width: 1000px) { .newsletter { grid-template-columns: auto 1fr; } .newsletter__form { grid-column: 1 / -1; } }
@media (max-width: 580px) { .newsletter { grid-template-columns: 1fr; gap: 16rem; padding: 25rem; } .newsletter__mark { width: 64rem; height: 64rem; box-shadow: 4rem 4rem 0 var(--ink); } .newsletter__field { display: grid; } .newsletter button { min-height: 46rem; } .newsletter::after { right: -310rem; } }
</style>

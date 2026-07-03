<script setup lang="ts">
// Bring-your-own-key AI setup: explains what turns on, walks through
// getting a free Groq key, validates it against Groq before enabling, and
// stores it only in this browser.
const emit = defineEmits<{ close: [] }>()

const { settings, aiReady, validateAndEnable, disable, reenable } = useAiSettings()

const keyInput = ref(settings.value.key)
const busy = ref(false)
const error = ref('')

async function submit() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  const problem = await validateAndEnable(keyInput.value)
  busy.value = false
  if (problem) { error.value = problem; return }
  emit('close')
}

function turnOff() {
  disable(false)
  emit('close')
}
function forget() {
  disable(true)
  keyInput.value = ''
}
function turnOn() {
  reenable()
  emit('close')
}
</script>

<template>
  <div class="ai-overlay" @click.self="emit('close')">
    <div class="ai glass-panel" data-lenis-prevent>
      <header class="ai__head">
        <div>
          <h2>✨ AI features</h2>
          <p>Optional, off by default — the storyboard tool works fully without them.</p>
        </div>
        <button class="ai__close" aria-label="Close" @click="emit('close')">✕</button>
      </header>

      <div class="ai__what">
        <p><strong>What turns on:</strong> build a storyboard from your own documents (PDF, Word, text…), rewrite any screen's text, draft MCQ options, and generate knowledge checks from your content.</p>
        <p class="ai__privacy"><strong>Privacy:</strong> your key is stored only in this browser and every request goes straight from your browser to Groq. Nothing passes through this site's servers.</p>
      </div>

      <template v-if="!aiReady">
        <ol class="ai__steps">
          <li>Create a free Groq account at <a href="https://console.groq.com" target="_blank" rel="noopener">console.groq.com</a> (no card needed).</li>
          <li>Open <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a> and press <em>Create API Key</em>.</li>
          <li>Copy the key (it starts with <code>gsk_</code>) and paste it below.</li>
        </ol>

        <label class="glass-label" for="ai-key">Your Groq API key</label>
        <input
          id="ai-key" v-model="keyInput" class="glass-field ai__key"
          type="password" placeholder="gsk_…" autocomplete="off" spellcheck="false"
          @keydown.enter="submit"
        >
        <p v-if="error" class="ai__error">{{ error }}</p>

        <div class="ai__actions">
          <button class="glass-btn" :disabled="busy || !keyInput.trim()" @click="submit">
            {{ busy ? 'Validating…' : 'Validate & enable' }}
          </button>
          <button v-if="settings.key && settings.validatedAt" class="ai__ghost" @click="turnOn">Re-enable saved key</button>
        </div>
      </template>

      <template v-else>
        <p class="ai__status">✅ AI is enabled with your Groq key <code>…{{ settings.key.slice(-4) }}</code>.</p>
        <div class="ai__actions">
          <button class="glass-btn" @click="emit('close')">Done</button>
          <button class="ai__ghost" @click="turnOff">Turn off (keep key)</button>
          <button class="ai__ghost ai__ghost--danger" @click="forget">Remove key from this browser</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ai-overlay {
  position: fixed;
  inset: 0;
  z-index: 33;
  background: rgba(0, 0, 0, 0.42);
  display: grid;
  place-items: center;
  padding: 16rem;
}
.ai {
  width: min(560rem, 100%);
  max-height: calc(100dvh - 48rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14rem;
}
.ai__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12rem; }
.ai__head h2 { font-size: 21rem; letter-spacing: -0.03em; margin-bottom: 6rem; }
.ai__head p { font-size: 13rem; opacity: 0.65; line-height: 1.5; }
.ai__close {
  width: 28rem; height: 28rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  border: 1px solid var(--color-glass-border);
  font-size: 11rem;
  flex-shrink: 0;
}
.ai__what { display: flex; flex-direction: column; gap: 8rem; }
.ai__what p { font-size: 13rem; line-height: 1.55; opacity: 0.8; }
.ai__privacy {
  padding: 10rem 13rem;
  border-radius: 10rem;
  background: color-mix(in srgb, #34D399 10%, transparent);
  border-left: 3rem solid #34D399;
}
.ai__steps {
  padding-left: 20rem;
  display: flex;
  flex-direction: column;
  gap: 7rem;
  font-size: 13.5rem;
  line-height: 1.5;
}
.ai__steps a { text-decoration: underline; text-underline-offset: 3rem; font-weight: 600; }
.ai__steps code, .ai__status code {
  font-size: 12rem;
  padding: 1rem 5rem;
  border-radius: 5rem;
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
}
.ai__key { font-family: ui-monospace, monospace; letter-spacing: 0.04em; }
.ai__error {
  font-size: 12.5rem;
  line-height: 1.5;
  color: #ff8d8d;
  padding: 9rem 12rem;
  border-radius: 10rem;
  background: color-mix(in srgb, #ff6b6b 10%, transparent);
}
.ai__status { font-size: 13.5rem; line-height: 1.5; }
.ai__actions { display: flex; align-items: center; gap: 12rem; flex-wrap: wrap; }
.ai__ghost { font-size: 12.5rem; font-weight: 600; opacity: 0.65; text-decoration: underline; text-underline-offset: 3rem; color: var(--color-text); }
.ai__ghost:hover { opacity: 0.95; }
.ai__ghost--danger { color: #ff8d8d; }

@media (max-width: 640px) {
  .ai-overlay { padding: 10rem; align-items: end; display: flex; }
  .ai { border-radius: 22rem 22rem 0 0; width: 100%; max-height: 86dvh; }
  .ai__key { font-size: 16px; }
}
</style>

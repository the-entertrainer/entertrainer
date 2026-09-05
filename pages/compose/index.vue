<script setup lang="ts">
import {
  emptyComposedPost,
  newBlockId,
  slugifyTitle,
  type ComposedBlock,
  type ComposedBlockType,
  type ComposedPost
} from '~/types/composed'

useSeoMeta({
  title: 'Compose',
  robots: 'noindex, nofollow'
})

const GATE_KEY = 'iamguru'
const GATE_STORAGE = 'et-compose-unlocked'
const DRAFT_STORAGE = 'et-compose-working'
const PROVIDER_STORAGE = 'et-compose-provider'
const IMAGE_SOURCE_STORAGE = 'et-compose-image-source'

type ComposeProvider = 'groq' | 'gemini'
type ComposeImageSource = 'commons' | 'gemini' | 'gamma'

const unlocked = ref(false)
const gateInput = ref('')
const gateError = ref('')
const statusMessage = ref('')
const saving = ref(false)
const library = ref<ComposedPost[]>([])
const activeSlug = ref<string | null>(null)

const aiTopic = ref('')
const aiNotes = ref('')
const aiProvider = ref<ComposeProvider>('groq')
const aiImageSource = ref<ComposeImageSource>('commons')
const aiLoading = ref(false)
const aiError = ref('')

const draft = ref<ComposedPost>(emptyComposedPost())

const blockTypes: { type: ComposedBlockType; label: string }[] = [
  { type: 'lead', label: 'Lead' },
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'heading', label: 'Heading' },
  { type: 'blockquote', label: 'Quote' },
  { type: 'callout', label: 'Callout' },
  { type: 'figure', label: 'Figure' },
  { type: 'list', label: 'List' },
  { type: 'closing', label: 'Closing' }
]

onMounted(() => {
  try {
    if (sessionStorage.getItem(GATE_STORAGE) === '1') unlocked.value = true
    const cached = localStorage.getItem(DRAFT_STORAGE)
    if (cached) draft.value = JSON.parse(cached) as ComposedPost
    const savedProvider = localStorage.getItem(PROVIDER_STORAGE)
    if (savedProvider === 'groq' || savedProvider === 'gemini') aiProvider.value = savedProvider
    const savedImageSource = localStorage.getItem(IMAGE_SOURCE_STORAGE)
    if (savedImageSource === 'commons' || savedImageSource === 'gemini' || savedImageSource === 'gamma') {
      aiImageSource.value = savedImageSource
    }
  } catch { /* ignore */ }
  if (unlocked.value) void loadLibrary()
})

watch(aiProvider, (value) => {
  try { localStorage.setItem(PROVIDER_STORAGE, value) } catch { /* ignore */ }
})

watch(aiImageSource, (value) => {
  try { localStorage.setItem(IMAGE_SOURCE_STORAGE, value) } catch { /* ignore */ }
})

function draftForLocalStorage(value: ComposedPost): ComposedPost {
  // Gemini image drafts may embed data: URLs — too large for localStorage.
  const copy = structuredClone(value)
  if (typeof copy.hero === 'string' && copy.hero.startsWith('data:image/')) copy.hero = ''
  for (const block of copy.blocks || []) {
    if (block.type === 'figure' && typeof block.src === 'string' && block.src.startsWith('data:image/')) {
      block.src = ''
    }
  }
  return copy
}

watch(draft, (value) => {
  try { localStorage.setItem(DRAFT_STORAGE, JSON.stringify(draftForLocalStorage(value))) } catch { /* ignore */ }
}, { deep: true })

function tryUnlock() {
  if (gateInput.value.trim() === GATE_KEY) {
    unlocked.value = true
    gateError.value = ''
    try { sessionStorage.setItem(GATE_STORAGE, '1') } catch { /* ignore */ }
    void loadLibrary()
  } else {
    gateError.value = 'Still locked.'
    unlocked.value = false
  }
}

function lockAgain() {
  unlocked.value = false
  gateInput.value = ''
  try { sessionStorage.removeItem(GATE_STORAGE) } catch { /* ignore */ }
}

async function loadLibrary() {
  try {
    const res = await $fetch<{ posts: ComposedPost[] }>('/api/composed', { query: { includeDrafts: '1' } })
    library.value = res.posts ?? []
  } catch {
    library.value = []
  }
}

function startNew() {
  draft.value = emptyComposedPost()
  activeSlug.value = null
  statusMessage.value = 'New draft.'
}

function loadPost(post: ComposedPost) {
  const copy = structuredClone(post)
  if (!copy.marginNote) copy.marginNote = { label: 'One useful idea.', body: '' }
  if (!copy.blocks) copy.blocks = []
  if (!copy.references) copy.references = []
  draft.value = copy
  activeSlug.value = post.slug
  statusMessage.value = `Loaded “${post.title || post.slug}”.`
}

function ensureSlug() {
  if (!draft.value.slug && draft.value.title) {
    draft.value.slug = slugifyTitle(draft.value.title)
  }
  draft.value.slug = slugifyTitle(draft.value.slug || draft.value.title || 'untitled')
}

function addBlock(type: ComposedBlockType) {
  const block: ComposedBlock = { id: newBlockId(), type, text: '' }
  if (type === 'list') block.items = ['']
  if (type === 'callout') block.label = 'Note'
  if (type === 'figure') {
    block.src = ''
    block.alt = ''
    block.caption = ''
  }
  draft.value.blocks.push(block)
}

function removeBlock(id: string) {
  draft.value.blocks = draft.value.blocks.filter((block) => block.id !== id)
}

function moveBlock(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= draft.value.blocks.length) return
  const copy = [...draft.value.blocks]
  const [item] = copy.splice(index, 1)
  copy.splice(target, 0, item)
  draft.value.blocks = copy
}

function listText(block: ComposedBlock) {
  return (block.items || []).join('\n')
}

function setListText(block: ComposedBlock, value: string) {
  block.items = value.split('\n')
}

async function persist(status: 'draft' | 'published') {
  ensureSlug()
  if (!draft.value.title.trim()) {
    statusMessage.value = 'Add a title first.'
    return
  }

  saving.value = true
  statusMessage.value = status === 'published' ? 'Publishing…' : 'Saving draft…'
  draft.value.status = status
  draft.value.updatedAt = new Date().toISOString()
  if (status === 'published') {
    draft.value.publishedAt = new Date().toISOString()
  }

  try {
    const res = await $fetch<{
      post: ComposedPost
      committed?: boolean
      commitUrl?: string
      imagesCommitted?: number
      imageWarnings?: string[]
    }>('/api/composed', {
      method: 'POST',
      body: draft.value
    })
    draft.value = res.post
    activeSlug.value = res.post.slug
    await loadLibrary()
    const imgBit = typeof res.imagesCommitted === 'number' && res.imagesCommitted > 0
      ? ` Images committed to public/blog/${res.post.slug}/ (${res.imagesCommitted}).`
      : ''
    const warnBit = res.imageWarnings?.length ? ` Note: ${res.imageWarnings.join(' ')}` : ''
    if (status === 'published') {
      statusMessage.value = res.committed
        ? `Published — post JSON + images committed to GitHub; Vercel will redeploy in a minute.${imgBit} View live may 404 until then: /elevate/${res.post.slug}${warnBit}`
        : `Published locally as ${res.post.slug}.${imgBit} Add COMPOSE_GITHUB_TOKEN (or GITHUB_TOKEN) on Vercel so publishes persist and redeploy.${warnBit}`
    } else {
      statusMessage.value = res.committed
        ? `Draft saved + committed to GitHub as ${res.post.slug}.${imgBit}${warnBit}`
        : `Draft saved locally as ${res.post.slug}.${imgBit}${warnBit}`
    }
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message || 'error'
    const missingToken = /COMPOSE_GITHUB_TOKEN|GITHUB_TOKEN/i.test(String(msg))
    statusMessage.value = missingToken
      ? `Publish needs COMPOSE_GITHUB_TOKEN (or GITHUB_TOKEN) with repo contents:write. Set it on Vercel, redeploy, then try again. (${msg}) Local backup kept in this browser.`
      : `Could not write to the store (${msg}). Kept a local backup in this browser.`
  } finally {
    saving.value = false
  }
}

async function removePost(slug: string) {
  if (!confirm(`Delete “${slug}”?`)) return
  try {
    await $fetch(`/api/composed/${slug}`, { method: 'DELETE' })
    if (activeSlug.value === slug) startNew()
    await loadLibrary()
    statusMessage.value = 'Deleted.'
  } catch (err: any) {
    statusMessage.value = err?.statusMessage || 'Delete failed.'
  }
}


async function generateDraft() {
  const topic = aiTopic.value.trim()
  if (!topic) {
    aiError.value = 'Add a topic first.'
    return
  }

  const provider = aiProvider.value
  const providerLabel = provider === 'groq' ? 'Groq' : 'Gemini'
  const imageSource = aiImageSource.value
  const imageLabel =
    imageSource === 'gemini' ? 'Gemini images' : imageSource === 'gamma' ? 'Gamma images' : 'Commons / Openverse'
  aiLoading.value = true
  aiError.value = ''
  statusMessage.value = `Generating Elevate draft with ${providerLabel} + ${imageLabel}…`

  try {
    const res = await $fetch<{
      post: ComposedPost
      provider?: string
      model?: string
      imageSource?: string
      imageWarning?: string
    }>('/api/compose/generate', {
      method: 'POST',
      body: {
        topic,
        notes: aiNotes.value.trim() || undefined,
        provider,
        imageSource
      }
    })
    const copy = structuredClone(res.post)
    if (!copy.marginNote) copy.marginNote = { label: 'One useful idea.', body: '' }
    if (!copy.blocks) copy.blocks = []
    if (!copy.references) copy.references = []
    draft.value = copy
    activeSlug.value = null
    const usedProvider = res.provider || provider
    const usedModel = res.model || (usedProvider === 'groq' ? 'groq/compound' : 'gemini-3.5-flash-lite')
    const usedImages = res.imageSource || imageSource
    const warn = res.imageWarning ? ` Warning: ${res.imageWarning}` : ''
    statusMessage.value = `AI draft ready via ${usedProvider} (${usedModel}), images: ${usedImages} — polish then Save draft / Publish.${warn}`
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Generation failed.'
    aiError.value = msg
    statusMessage.value = `AI draft failed: ${msg}`
  } finally {
    aiLoading.value = false
  }
}

const previewHref = computed(() => draft.value.slug ? `/elevate/${draft.value.slug}` : null)
</script>

<template>
  <main id="main" class="compose">
    <div v-if="!unlocked" class="compose__gate">
      <p class="compose__eyebrow">Private</p>
      <h1>Compose</h1>
      <p class="compose__gate-copy">Enter the keyword to unlock the Elevate composer.</p>
      <form class="compose__gate-form" @submit.prevent="tryUnlock">
        <label class="sr-only" for="compose-keyword">Keyword</label>
        <input
          id="compose-keyword"
          v-model="gateInput"
          type="password"
          autocomplete="off"
          placeholder="Keyword"
          class="compose__input"
        >
        <button type="submit" class="compose__btn compose__btn--signal">Unlock</button>
      </form>
      <p v-if="gateError" class="compose__error" role="alert">{{ gateError }}</p>
    </div>

    <div v-else class="compose__studio">
      <header class="compose__top">
        <div>
          <p class="compose__eyebrow">Elevate composer</p>
          <h1>Write</h1>
        </div>
        <div class="compose__top-actions">
          <button type="button" class="compose__btn" :disabled="saving" @click="persist('draft')">Save draft</button>
          <button type="button" class="compose__btn compose__btn--signal" :disabled="saving" @click="persist('published')">Publish</button>
          <button type="button" class="compose__btn compose__btn--ghost" @click="lockAgain">Lock</button>
        </div>
      </header>

      <p v-if="statusMessage" class="compose__status" role="status">{{ statusMessage }}</p>

      <section class="compose__ai" aria-label="AI draft">
        <div class="compose__ai-head">
          <p class="compose__eyebrow">AI draft</p>
          <h2 class="compose__ai-title">One-click Elevate draft</h2>
          <p class="compose__ai-copy">Type a topic. Pick a <strong>text</strong> provider (Groq / Gemini) and an <strong>image</strong> source (Commons, Gemini, or Gamma). Draft lands here for polish; Publish downloads images into <code>public/blog/&lt;slug&gt;/</code> and commits them with the post JSON.</p>
        </div>
        <div class="compose__ai-form">
          <fieldset class="compose__provider compose__span-2" :disabled="aiLoading">
            <legend>Text provider</legend>
            <div class="compose__provider-seg" role="radiogroup" aria-label="AI text provider">
              <label class="compose__provider-opt" :class="{ 'is-active': aiProvider === 'groq' }">
                <input v-model="aiProvider" type="radio" name="compose-provider" value="groq">
                <span>Groq</span>
              </label>
              <label class="compose__provider-opt" :class="{ 'is-active': aiProvider === 'gemini' }">
                <input v-model="aiProvider" type="radio" name="compose-provider" value="gemini">
                <span>Gemini</span>
              </label>
            </div>
          </fieldset>
          <fieldset class="compose__provider compose__span-2" :disabled="aiLoading">
            <legend>Images</legend>
            <div class="compose__provider-seg compose__provider-seg--wrap" role="radiogroup" aria-label="Image source">
              <label class="compose__provider-opt" :class="{ 'is-active': aiImageSource === 'commons' }">
                <input v-model="aiImageSource" type="radio" name="compose-image-source" value="commons">
                <span>Commons</span>
              </label>
              <label class="compose__provider-opt" :class="{ 'is-active': aiImageSource === 'gemini' }">
                <input v-model="aiImageSource" type="radio" name="compose-image-source" value="gemini">
                <span>Gemini</span>
              </label>
              <label class="compose__provider-opt" :class="{ 'is-active': aiImageSource === 'gamma' }">
                <input v-model="aiImageSource" type="radio" name="compose-image-source" value="gamma">
                <span>Gamma</span>
              </label>
            </div>
          </fieldset>
          <label class="compose__span-2">
            <span>Topic</span>
            <input
              v-model="aiTopic"
              class="compose__input"
              type="text"
              maxlength="300"
              placeholder="e.g. Why déjà vu feels like a glitch in time"
              :disabled="aiLoading"
              @keydown.enter.prevent="generateDraft"
            >
          </label>
          <label class="compose__span-2">
            <span>Notes (optional)</span>
            <textarea
              v-model="aiNotes"
              class="compose__input compose__textarea"
              rows="3"
              placeholder="Angle, audience, claims to include or avoid…"
              :disabled="aiLoading"
            ></textarea>
          </label>
          <div class="compose__ai-actions">
            <button
              type="button"
              class="compose__btn compose__btn--signal"
              :disabled="aiLoading || !aiTopic.trim()"
              @click="generateDraft"
            >{{ aiLoading ? 'Generating…' : 'Generate draft' }}</button>
          </div>
          <p v-if="aiError" class="compose__error" role="alert">{{ aiError }}</p>
        </div>
      </section>

      <div class="compose__layout">
        <aside class="compose__library" aria-label="Saved posts">
          <div class="compose__library-head">
            <h2>Library</h2>
            <button type="button" class="compose__btn compose__btn--small" @click="startNew">New</button>
          </div>
          <ul v-if="library.length" class="compose__library-list">
            <li v-for="post in library" :key="post.slug">
              <button type="button" class="compose__library-item" :class="{ 'is-active': activeSlug === post.slug }" @click="loadPost(post)">
                <span class="compose__library-title">{{ post.title || post.slug }}</span>
                <span class="compose__library-meta">{{ post.status }}</span>
              </button>
              <button type="button" class="compose__icon-btn" :aria-label="`Delete ${post.slug}`" @click="removePost(post.slug)">×</button>
            </li>
          </ul>
          <p v-else class="compose__empty">No composed posts yet.</p>
        </aside>

        <section class="compose__editor" aria-label="Post editor">
          <div class="compose__meta-grid">
            <label>
              <span>Title</span>
              <input v-model="draft.title" class="compose__input" @blur="ensureSlug">
            </label>
            <label>
              <span>Slug</span>
              <input v-model="draft.slug" class="compose__input" placeholder="auto-from-title">
            </label>
            <label class="compose__span-2">
              <span>Dek</span>
              <textarea v-model="draft.dek" class="compose__input compose__textarea" rows="2"></textarea>
            </label>
            <label>
              <span>Category</span>
              <input v-model="draft.category" class="compose__input">
            </label>
            <label>
              <span>Minutes</span>
              <input v-model.number="draft.minutes" type="number" min="1" class="compose__input">
            </label>
            <label>
              <span>Hero path</span>
              <input v-model="draft.hero" class="compose__input" placeholder="/blog/slug/hero.jpg">
            </label>
            <label>
              <span>Hero alt</span>
              <input v-model="draft.heroAlt" class="compose__input">
            </label>
            <label>
              <span>Margin note label</span>
              <input v-model="draft.marginNote!.label" class="compose__input">
            </label>
            <label>
              <span>Margin note body</span>
              <textarea v-model="draft.marginNote!.body" class="compose__input compose__textarea" rows="3"></textarea>
            </label>
          </div>

          <div class="compose__blocks-toolbar">
            <p class="compose__eyebrow">Blocks</p>
            <div class="compose__block-add">
              <button
                v-for="item in blockTypes"
                :key="item.type"
                type="button"
                class="compose__chip"
                @click="addBlock(item.type)"
              >{{ item.label }}</button>
            </div>
          </div>

          <ul class="compose__blocks">
            <li v-for="(block, index) in draft.blocks" :key="block.id" class="compose__block">
              <div class="compose__block-bar">
                <span class="compose__block-type">{{ block.type }}</span>
                <div class="compose__block-moves">
                  <button type="button" class="compose__icon-btn" :disabled="index === 0" @click="moveBlock(index, -1)">↑</button>
                  <button type="button" class="compose__icon-btn" :disabled="index === draft.blocks.length - 1" @click="moveBlock(index, 1)">↓</button>
                  <button type="button" class="compose__icon-btn" @click="removeBlock(block.id)">×</button>
                </div>
              </div>

              <input
                v-if="block.type === 'callout'"
                v-model="block.label"
                class="compose__input"
                placeholder="Callout label"
              >

              <textarea
                v-if="['lead', 'paragraph', 'heading', 'blockquote', 'callout', 'closing'].includes(block.type)"
                v-model="block.text"
                class="compose__input compose__textarea"
                :rows="block.type === 'heading' ? 2 : 4"
                :placeholder="block.type"
              ></textarea>

              <template v-else-if="block.type === 'figure'">
                <input v-model="block.src" class="compose__input" placeholder="Image src">
                <input v-model="block.alt" class="compose__input" placeholder="Alt text">
                <input v-model="block.caption" class="compose__input" placeholder="Caption">
              </template>

              <textarea
                v-else-if="block.type === 'list'"
                class="compose__input compose__textarea"
                rows="4"
                placeholder="One item per line"
                :value="listText(block)"
                @input="setListText(block, ($event.target as HTMLTextAreaElement).value)"
              ></textarea>
            </li>
          </ul>

          <div class="compose__footer-actions">
            <button type="button" class="compose__btn" :disabled="saving" @click="persist('draft')">Save draft</button>
            <button type="button" class="compose__btn compose__btn--signal" :disabled="saving" @click="persist('published')">Publish</button>
            <NuxtLink v-if="previewHref && draft.status === 'published'" :to="previewHref" class="compose__btn">View live</NuxtLink>
            <p v-if="draft.status === 'published'" class="compose__hint">View live may 404 until the Vercel redeploy finishes.</p>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.compose {
  max-width: 1100rem;
  margin: 0 auto;
  padding: clamp(22rem, 4vw, 48rem) var(--shell-gutter) 90rem;
}
.compose__eyebrow {
  margin: 0 0 8rem;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--signal-cobalt);
}
.compose h1 {
  margin: 0;
  font: 500 clamp(42rem, 8vw, 84rem)/.92 var(--font-display);
  letter-spacing: -.05em;
}
.compose__gate {
  max-width: 420rem;
  margin: 12vh auto 0;
  padding: 28rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
}
.compose__gate-copy { margin: 14rem 0 22rem; font-size: 16rem; line-height: 1.45; color: var(--ink-soft); }
.compose__gate-form { display: grid; gap: 12rem; }
.compose__input {
  width: 100%;
  box-sizing: border-box;
  margin-top: 6rem;
  padding: 12rem 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper);
  color: var(--ink);
  font: 400 16rem/1.4 var(--font-body);
}
.compose__textarea { resize: vertical; min-height: 72rem; }
.compose__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11rem 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper);
  color: var(--ink);
  font: 700 13rem/1 var(--font-mono);
  letter-spacing: .04em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
}
.compose__btn:disabled { opacity: .5; cursor: wait; }
.compose__btn--signal { background: var(--signal-cobalt); color: var(--paper); border-color: var(--ink); }
.compose__btn--ghost { background: transparent; }
.compose__btn--small { padding: 8rem 10rem; font-size: 11rem; }
.compose__error { margin: 12rem 0 0; color: #b00020; font: 700 13rem/1.3 var(--font-mono); }
.compose__status {
  margin: 18rem 0;
  padding: 12rem 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--signal-field);
  font-size: 14rem;
  line-height: 1.4;
}
.compose__top {
  display: flex;
  flex-wrap: wrap;
  gap: 16rem;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 18rem;
  border-bottom: var(--stroke) solid var(--ink);
}
.compose__top-actions, .compose__footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
}
.compose__layout {
  display: grid;
  grid-template-columns: minmax(180rem, 240rem) minmax(0, 1fr);
  gap: 22rem;
  margin-top: 22rem;
}
.compose__library {
  padding: 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
  align-self: start;
}
.compose__library-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rem;
  margin-bottom: 12rem;
}
.compose__library h2 {
  margin: 0;
  font: 700 12rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
}
.compose__library-list { list-style: none; margin: 0; padding: 0; }
.compose__library-list li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4rem;
  align-items: stretch;
  margin-bottom: 8rem;
}
.compose__library-item {
  text-align: left;
  padding: 10rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-s);
  background: var(--paper);
  cursor: pointer;
}
.compose__library-item.is-active { border-color: var(--ink); background: var(--signal-field); }
.compose__library-title { display: block; font-size: 14rem; line-height: 1.3; }
.compose__library-meta {
  display: block;
  margin-top: 4rem;
  font: 700 10rem/1 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.compose__empty { margin: 0; font-size: 13rem; color: var(--ink-soft); }
.compose__meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rem;
}
.compose__meta-grid label {
  display: flex;
  flex-direction: column;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.compose__span-2 { grid-column: 1 / -1; }
.compose__blocks-toolbar { margin: 28rem 0 12rem; }
.compose__block-add { display: flex; flex-wrap: wrap; gap: 8rem; }
.compose__chip {
  padding: 8rem 10rem;
  border: var(--stroke) solid var(--ink);
  border-radius: 999rem;
  background: var(--paper);
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .05em;
  text-transform: uppercase;
  cursor: pointer;
}
.compose__blocks { list-style: none; margin: 0; padding: 0; display: grid; gap: 12rem; }
.compose__block {
  padding: 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
  display: grid;
  gap: 8rem;
}
.compose__block-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rem;
}
.compose__block-type {
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--signal-cobalt);
}
.compose__block-moves { display: flex; gap: 4rem; }
.compose__icon-btn {
  width: 32rem;
  height: 32rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper);
  cursor: pointer;
  font-size: 16rem;
  line-height: 1;
}
.compose__icon-btn:disabled { opacity: .35; cursor: default; }
.compose__footer-actions { margin-top: 24rem; }
.compose__hint {
  flex: 1 1 100%;
  margin: 4rem 0 0;
  font-size: 13rem;
  line-height: 1.4;
  color: var(--ink-soft);
}


.compose__ai {
  margin: 22rem 0 0;
  padding: 18rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
}
.compose__ai-title {
  margin: 0;
  font: 500 clamp(24rem, 4vw, 36rem)/1.05 var(--font-display);
  letter-spacing: -.04em;
}
.compose__ai-copy {
  margin: 10rem 0 0;
  max-width: 62ch;
  font-size: 15rem;
  line-height: 1.45;
  color: var(--ink-soft);
}
.compose__ai-copy code {
  font: 700 12rem/1.2 var(--font-mono);
  letter-spacing: .02em;
}
.compose__ai-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rem;
  margin-top: 16rem;
}
.compose__ai-form label {
  display: flex;
  flex-direction: column;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.compose__ai-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  align-items: center;
}
.compose__provider {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.compose__provider legend {
  padding: 0;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.compose__provider-seg {
  display: inline-flex;
  margin-top: 8rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  overflow: hidden;
  background: var(--paper);
}
.compose__provider-opt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 10rem 16rem;
  border-right: var(--stroke) solid var(--ink);
  cursor: pointer;
  font: 700 12rem/1 var(--font-mono);
  letter-spacing: .05em;
  text-transform: uppercase;
  color: var(--ink-soft);
  background: transparent;
}
.compose__provider-opt:last-child { border-right: 0; }
.compose__provider-opt input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.compose__provider-opt.is-active {
  background: var(--signal-cobalt);
  color: var(--paper);
}
.compose__provider:disabled .compose__provider-opt { opacity: .55; cursor: wait; }
.compose__provider-seg--wrap {
  flex-wrap: wrap;
}
.compose__provider-seg--wrap .compose__provider-opt {
  border-bottom: var(--stroke) solid var(--ink);
}

@media (max-width: 760px) {
  .compose__layout { grid-template-columns: 1fr; }
  .compose__meta-grid { grid-template-columns: 1fr; }
  .compose__ai-form { grid-template-columns: 1fr; }
  .compose__top-actions { width: 100%; }
  .compose__btn { flex: 1 1 auto; }
}
</style>

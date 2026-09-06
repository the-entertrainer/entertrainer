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
const DRAFT_SESSION = 'et-compose-working-session'
const PROVIDER_STORAGE = 'et-compose-provider'
const IMAGE_SOURCE_STORAGE = 'et-compose-image-source'
const MODE_STORAGE = 'et-compose-mode'

type ComposeProvider = 'groq' | 'gemini'
type ComposeImageSource = 'commons' | 'gemini' | 'gamma'
type EditorMode = 'canvas' | 'fields'

const unlocked = ref(false)
const gateInput = ref('')
const gateError = ref('')
const statusMessage = ref('')
const saving = ref(false)
const library = ref<ComposedPost[]>([])
const activeSlug = ref<string | null>(null)
const editorMode = ref<EditorMode>('canvas')
const selectedFigureId = ref<string | null>(null)
const heroBusy = ref(false)
const coverBusy = ref(false)
const figureBusyId = ref<string | null>(null)
const figureBusySource = ref<ComposeImageSource | null>(null)
const coverBusySource = ref<ComposeImageSource | null>(null)

const aiTopic = ref('')
const aiNotes = ref('')
const aiProvider = ref<ComposeProvider>('groq')
const aiImageSource = ref<ComposeImageSource>('commons')
const aiLoading = ref(false)
const aiError = ref('')

type GithubPublishStatus = {
  githubConfigured: boolean
  githubOk?: boolean
  repo: string
  branch: string
  detail?: string
}
const githubStatus = ref<GithubPublishStatus | null>(null)
const githubStatusLabel = computed(() => {
  const s = githubStatus.value
  if (!s) return 'GitHub publish: checking…'
  if (!s.githubConfigured) return 'GitHub publish: not configured'
  if (s.githubOk === false) {
    const detail = s.detail ? ` (${s.detail})` : ''
    return `GitHub publish: token invalid — update COMPOSE_GITHUB_TOKEN on Vercel${detail}`
  }
  if (s.githubOk === true) return `GitHub publish: ready (${s.repo} @ ${s.branch})`
  return `GitHub publish: configured (${s.repo} @ ${s.branch})`
})
const githubStatusTone = computed(() => {
  const s = githubStatus.value
  if (!s) return 'pending'
  if (!s.githubConfigured || s.githubOk === false) return 'bad'
  if (s.githubOk === true) return 'good'
  return 'pending'
})

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
    const sessionCached = sessionStorage.getItem(DRAFT_SESSION)
    const cached = sessionCached || localStorage.getItem(DRAFT_STORAGE)
    if (cached) draft.value = JSON.parse(cached) as ComposedPost
    const savedProvider = localStorage.getItem(PROVIDER_STORAGE)
    if (savedProvider === 'groq' || savedProvider === 'gemini') aiProvider.value = savedProvider
    const savedImageSource = localStorage.getItem(IMAGE_SOURCE_STORAGE)
    if (savedImageSource === 'commons' || savedImageSource === 'gemini' || savedImageSource === 'gamma') {
      aiImageSource.value = savedImageSource
    }
    const savedMode = localStorage.getItem(MODE_STORAGE)
    if (savedMode === 'canvas' || savedMode === 'fields') editorMode.value = savedMode
  } catch { /* ignore */ }
  if (unlocked.value) {
    void loadLibrary()
    void loadGithubStatus()
  }
})

watch(aiProvider, (value) => {
  try { localStorage.setItem(PROVIDER_STORAGE, value) } catch { /* ignore */ }
})

watch(aiImageSource, (value) => {
  try { localStorage.setItem(IMAGE_SOURCE_STORAGE, value) } catch { /* ignore */ }
})

watch(editorMode, (value) => {
  try { localStorage.setItem(MODE_STORAGE, value) } catch { /* ignore */ }
})

function draftForLocalStorage(value: ComposedPost): ComposedPost {
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
  try { sessionStorage.setItem(DRAFT_SESSION, JSON.stringify(value)) } catch {
    try { sessionStorage.setItem(DRAFT_SESSION, JSON.stringify(draftForLocalStorage(value))) } catch { /* ignore */ }
  }
}, { deep: true })

function tryUnlock() {
  if (gateInput.value.trim() === GATE_KEY) {
    unlocked.value = true
    gateError.value = ''
    try { sessionStorage.setItem(GATE_STORAGE, '1') } catch { /* ignore */ }
    void loadLibrary()
    void loadGithubStatus()
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
    const res = await $fetch<{ posts: ComposedPost[] }>('/api/compose/posts', { query: { includeDrafts: '1' } })
    library.value = res.posts ?? []
  } catch {
    library.value = []
  }
}

async function loadGithubStatus() {
  try {
    githubStatus.value = await $fetch<GithubPublishStatus>('/api/compose/status')
  } catch {
    githubStatus.value = {
      githubConfigured: false,
      repo: 'the-entertrainer/entertrainer',
      branch: 'main',
      detail: 'status check failed'
    }
  }
}

function isPreviewableSrc(src?: string | null) {
  const value = String(src || '').trim()
  if (!value) return false
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/') ||
    value.startsWith('data:image/')
  )
}

function startNew() {
  draft.value = emptyComposedPost()
  activeSlug.value = null
  selectedFigureId.value = null
  statusMessage.value = 'New draft.'
}

function loadPost(post: ComposedPost) {
  const copy = structuredClone(post)
  if (!copy.marginNote) copy.marginNote = { label: 'One useful idea.', body: '' }
  if (!copy.blocks) copy.blocks = []
  if (!copy.references) copy.references = []
  draft.value = copy
  activeSlug.value = post.slug
  selectedFigureId.value = null
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
    selectedFigureId.value = block.id
  }
  draft.value.blocks.push(block)
}

function removeBlock(id: string) {
  draft.value.blocks = draft.value.blocks.filter((block) => block.id !== id)
  if (selectedFigureId.value === id) selectedFigureId.value = null
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

function findBlock(id: string) {
  return draft.value.blocks.find((b) => b.id === id)
}

async function persist(status: 'draft' | 'published') {
  ensureSlug()
  if (!draft.value.title.trim()) {
    statusMessage.value = 'Add a title first.'
    return
  }

  if (
    status === 'published' &&
    githubStatus.value?.githubConfigured &&
    githubStatus.value.githubOk === false
  ) {
    const ok = confirm(
      'GitHub publish token looks invalid. Publish will likely fail until COMPOSE_GITHUB_TOKEN is updated on Vercel. Continue anyway?'
    )
    if (!ok) return
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
    }>('/api/compose/posts', {
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
    const msg = err?.data?.detail || err?.data?.statusMessage || err?.statusMessage || err?.data?.message || err?.message || 'error'
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
      heroBrief?: { metaphor?: string; motif?: string }
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
    if (!String(copy.hero || '').trim()) {
      const fig = (copy.blocks || []).find((b) => b.type === 'figure' && isPreviewableSrc(b.src))
      if (fig?.src) {
        copy.hero = fig.src
        if (!copy.heroAlt) copy.heroAlt = fig.alt || fig.caption || 'Editorial hero illustration'
      }
    }
    draft.value = copy
    activeSlug.value = null
    selectedFigureId.value = null
    editorMode.value = 'canvas'
    const usedProvider = res.provider || provider
    const usedModel = res.model || (usedProvider === 'groq' ? 'groq/compound' : 'gemini-3.5-flash-lite')
    const usedImages = res.imageSource || imageSource
    const metaphor = res.heroBrief?.metaphor ? ` Hero metaphor: ${res.heroBrief.metaphor}.` : ''
    const warn = res.imageWarning ? ` Warning: ${res.imageWarning}` : ''
    statusMessage.value = `AI draft ready via ${usedProvider} (${usedModel}), images: ${usedImages}.${metaphor} Polish on the canvas, then Save / Publish.${warn}`
  } catch (err: any) {
    const status = Number(err?.statusCode || err?.status || err?.response?.status || 0)
    let msg = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Generation failed.'
    if (status === 504 || /\b504\b|gateway timeout|timeout/i.test(String(msg))) {
      msg =
        'The server timed out before finishing (often slow AI images). Try again with Images → Commons, or retry — drafts now budget image time and should return text even when images fall back.'
    }
    aiError.value = msg
    statusMessage.value = `AI draft failed: ${msg}`
  } finally {
    aiLoading.value = false
  }
}

async function regenerateHero() {
  ensureSlug()
  const topic = (aiTopic.value.trim() || draft.value.title || draft.value.slug || '').trim()
  if (!topic && !draft.value.title) {
    statusMessage.value = 'Add a title or AI topic before regenerating the hero.'
    return
  }
  heroBusy.value = true
  statusMessage.value = 'Regenerating conceptual Elevate hero…'
  try {
    const res = await $fetch<{
      hero: string
      heroAlt: string
      heroBrief?: { metaphor?: string; motif?: string; cobaltRole?: string }
    }>('/api/compose/generate', {
      method: 'POST',
      body: {
        heroOnly: true,
        topic,
        title: draft.value.title,
        dek: draft.value.dek,
        slug: draft.value.slug,
        seed: Date.now()
      }
    })
    draft.value.hero = res.hero
    draft.value.heroAlt = res.heroAlt || draft.value.heroAlt
    const meta = res.heroBrief?.metaphor
      ? ` Metaphor: ${res.heroBrief.metaphor}${res.heroBrief.motif ? ` (${res.heroBrief.motif})` : ''}.`
      : ''
    statusMessage.value = `Hero regenerated.${meta}`
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Hero regen failed.'
    statusMessage.value = `Hero regen failed: ${msg}`
  } finally {
    heroBusy.value = false
  }
}


function imageSourceLabel(source: ComposeImageSource) {
  return source === 'gemini' ? 'Gemini' : source === 'gamma' ? 'Gamma' : 'Commons'
}

async function requestComposeImage(opts: {
  role: 'figure' | 'hero'
  imageSource: ComposeImageSource
  hint?: string
}) {
  const topic = (aiTopic.value.trim() || draft.value.title || draft.value.slug || '').trim()
  const title = draft.value.title.trim()
  const hint = String(opts.hint || '').trim()
  if (!topic && !title && !hint) {
    throw new Error('Add a title, AI topic, or figure caption/hint first.')
  }
  const res = await $fetch<{
    image: { src: string; credit?: string; title?: string; license?: string }
    sourceUsed?: ComposeImageSource
    warning?: string
  }>('/api/compose/image', {
    method: 'POST',
    body: {
      topic: topic || title,
      title: title || undefined,
      hint: hint || undefined,
      imageSource: opts.imageSource,
      role: opts.role
    }
  })
  return res
}

async function generateFigureImage(block: ComposedBlock, source?: ComposeImageSource) {
  const imageSource = source || aiImageSource.value
  if (figureBusyId.value) return
  figureBusyId.value = block.id
  figureBusySource.value = imageSource
  statusMessage.value = `Generating figure via ${imageSourceLabel(imageSource)}…`
  try {
    const hint = (block.caption || block.alt || '').trim()
    const res = await requestComposeImage({ role: 'figure', imageSource, hint })
    const hit = res.image
    block.src = hit.src
    const baseCaption = (block.caption || block.alt || hit.title || 'Illustration').trim()
    if (/—|credit|wikimedia|openverse|gemini|gamma/i.test(baseCaption)) {
      block.caption = baseCaption
    } else {
      block.caption = `${baseCaption} — ${hit.credit || imageSourceLabel(res.sourceUsed || imageSource)}`
    }
    if (!block.alt) block.alt = hit.title || baseCaption
    selectedFigureId.value = block.id
    const warn = res.warning ? ` Warning: ${res.warning}` : ''
    statusMessage.value = `Figure image set via ${res.sourceUsed || imageSource}.${warn}`
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Figure image failed.'
    statusMessage.value = `Figure image failed: ${msg}`
  } finally {
    figureBusyId.value = null
    figureBusySource.value = null
  }
}

async function generateCoverImage(source?: ComposeImageSource) {
  const imageSource = source || aiImageSource.value
  if (coverBusy.value || heroBusy.value) return
  coverBusy.value = true
  coverBusySource.value = imageSource
  statusMessage.value = `Generating cover via ${imageSourceLabel(imageSource)}…`
  try {
    const res = await requestComposeImage({
      role: 'hero',
      imageSource,
      hint: draft.value.dek || draft.value.title
    })
    draft.value.hero = res.image.src
    if (!String(draft.value.heroAlt || '').trim()) {
      draft.value.heroAlt = res.image.title || draft.value.title || 'Editorial hero illustration'
    }
    const warn = res.warning ? ` Warning: ${res.warning}` : ''
    statusMessage.value = `Cover image set via ${res.sourceUsed || imageSource}.${warn}`
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Cover image failed.'
    statusMessage.value = `Cover image failed: ${msg}`
  } finally {
    coverBusy.value = false
    coverBusySource.value = null
  }
}

function clearFigure(block: ComposedBlock) {
  block.src = ''
  block.alt = block.alt || ''
  block.caption = block.caption || ''
}

function pasteFigureUrl(block: ComposedBlock) {
  const url = window.prompt('Paste image URL (https://… or /blog/…)', block.src || '')
  if (url == null) return
  const trimmed = url.trim()
  if (!trimmed) return
  block.src = trimmed
}

const previewHref = computed(() => draft.value.slug ? `/elevate/${draft.value.slug}` : null)
const selectedFigure = computed(() =>
  selectedFigureId.value ? findBlock(selectedFigureId.value) || null : null
)
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
          <div class="compose__mode" role="group" aria-label="Editor mode">
            <button
              type="button"
              class="compose__mode-btn"
              :class="{ 'is-active': editorMode === 'canvas' }"
              @click="editorMode = 'canvas'"
            >Canvas</button>
            <button
              type="button"
              class="compose__mode-btn"
              :class="{ 'is-active': editorMode === 'fields' }"
              @click="editorMode = 'fields'"
            >Fields</button>
          </div>
          <button type="button" class="compose__btn" :disabled="saving" @click="persist('draft')">Save draft</button>
          <button type="button" class="compose__btn compose__btn--signal" :disabled="saving" @click="persist('published')">Publish</button>
          <button type="button" class="compose__btn compose__btn--ghost" @click="lockAgain">Lock</button>
        </div>
      </header>

      <p v-if="statusMessage" class="compose__status" role="status">{{ statusMessage }}</p>
      <p
        class="compose__gh-status"
        :class="{
          'is-good': githubStatusTone === 'good',
          'is-bad': githubStatusTone === 'bad'
        }"
        role="status"
      >{{ githubStatusLabel }}</p>

      <section class="compose__ai" aria-label="AI draft">
        <div class="compose__ai-head">
          <p class="compose__eyebrow">AI draft</p>
          <h2 class="compose__ai-title">One-click Elevate draft</h2>
          <p class="compose__ai-copy">
            Topic → structured blocks + <strong>conceptual hero</strong> (cream/ink/cobalt metaphor) + figure images.
            Canvas mode shows the article as readers will see it. Publish commits JSON + images to <code>public/blog/&lt;slug&gt;/</code>.
          </p>
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
            <legend>Figure images</legend>
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
            <p class="compose__image-note">Default for draft figures. Heroes stay procedural (Regenerate hero); optional cover from Commons / Gemini / Gamma below.</p>
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

          <div class="compose__blocks-toolbar compose__blocks-toolbar--side">
            <p class="compose__eyebrow">Add block</p>
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
        </aside>

        <!-- ═══ WYSIWYG CANVAS (default) ═══ -->
        <section v-if="editorMode === 'canvas'" class="compose__canvas" aria-label="Article canvas">
          <div class="compose__canvas-meta">
            <label>
              <span>Category</span>
              <input v-model="draft.category" class="compose__input compose__input--inline">
            </label>
            <label>
              <span>Minutes</span>
              <input v-model.number="draft.minutes" type="number" min="1" class="compose__input compose__input--inline">
            </label>
            <label>
              <span>Slug</span>
              <input v-model="draft.slug" class="compose__input compose__input--inline" placeholder="auto-from-title" @blur="ensureSlug">
            </label>
          </div>

          <!-- Hero -->
          <figure class="compose__hero">
            <div v-if="isPreviewableSrc(draft.hero)" class="compose__hero-frame">
              <EdEditorialImage :key="draft.hero" :src="draft.hero" :alt="draft.heroAlt || draft.title || 'Hero'" />
            </div>
            <div v-else class="compose__hero-empty">
              <p>No hero yet — Generate draft or Regenerate hero.</p>
            </div>
            <div class="compose__hero-controls">
              <button type="button" class="compose__btn compose__btn--small" :disabled="heroBusy || coverBusy" @click="regenerateHero">
                {{ heroBusy ? 'Regenerating…' : 'Regenerate hero' }}
              </button>
              <span class="compose__gen-label">Generate cover</span>
              <button
                type="button"
                class="compose__btn compose__btn--small"
                :disabled="heroBusy || coverBusy"
                @click="generateCoverImage('commons')"
              >{{ coverBusy && coverBusySource === 'commons' ? 'Commons…' : 'Commons' }}</button>
              <button
                type="button"
                class="compose__btn compose__btn--small"
                :disabled="heroBusy || coverBusy"
                @click="generateCoverImage('gemini')"
              >{{ coverBusy && coverBusySource === 'gemini' ? 'Gemini…' : 'Gemini' }}</button>
              <button
                type="button"
                class="compose__btn compose__btn--small"
                :disabled="heroBusy || coverBusy"
                @click="generateCoverImage('gamma')"
              >{{ coverBusy && coverBusySource === 'gamma' ? 'Gamma…' : 'Gamma' }}</button>
              <input
                v-model="draft.heroAlt"
                class="compose__input compose__input--inline"
                placeholder="Hero alt text"
                aria-label="Hero alt"
              >
            </div>
          </figure>

          <!-- Title / dek as inline fields -->
          <header class="compose__canvas-head">
            <input
              v-model="draft.title"
              class="compose__title-input"
              placeholder="Title"
              @blur="ensureSlug"
            >
            <textarea
              v-model="draft.dek"
              class="compose__dek-input"
              rows="2"
              placeholder="Dek — one or two sentences that open the curiosity gap"
            ></textarea>
          </header>

          <div class="compose__article-grid">
            <aside class="compose__margin" aria-label="Margin note">
              <input v-model="draft.marginNote!.label" class="compose__margin-label" placeholder="One useful idea.">
              <textarea v-model="draft.marginNote!.body" class="compose__margin-body" rows="4" placeholder="Crisp takeaway…"></textarea>
            </aside>

            <div class="compose__prose">
              <div
                v-for="(block, index) in draft.blocks"
                :key="block.id"
                class="compose__canvas-block"
                :class="{ 'is-figure-selected': block.type === 'figure' && selectedFigureId === block.id }"
              >
                <div class="compose__canvas-block-bar">
                  <span>{{ block.type }}</span>
                  <div class="compose__block-moves">
                    <button type="button" class="compose__icon-btn" :disabled="index === 0" @click="moveBlock(index, -1)">↑</button>
                    <button type="button" class="compose__icon-btn" :disabled="index === draft.blocks.length - 1" @click="moveBlock(index, 1)">↓</button>
                    <button type="button" class="compose__icon-btn" @click="removeBlock(block.id)">×</button>
                  </div>
                </div>

                <textarea
                  v-if="block.type === 'lead'"
                  v-model="block.text"
                  class="compose__lead-input"
                  rows="4"
                  placeholder="Lead paragraph…"
                ></textarea>

                <textarea
                  v-else-if="block.type === 'heading'"
                  v-model="block.text"
                  class="compose__heading-input"
                  rows="2"
                  placeholder="Section heading"
                ></textarea>

                <textarea
                  v-else-if="block.type === 'blockquote'"
                  v-model="block.text"
                  class="compose__quote-input"
                  rows="3"
                  placeholder="Pull quote"
                ></textarea>

                <div v-else-if="block.type === 'callout'" class="compose__callout-edit">
                  <input v-model="block.label" class="compose__input compose__input--inline" placeholder="Callout label">
                  <textarea v-model="block.text" class="compose__input compose__textarea" rows="3" placeholder="Callout body"></textarea>
                </div>

                <div
                  v-else-if="block.type === 'figure'"
                  class="compose__figure-edit"
                  @click="selectedFigureId = block.id"
                >
                  <div v-if="isPreviewableSrc(block.src)" class="compose__figure-frame">
                    <EdEditorialImage :key="block.src" :src="block.src!" :alt="block.alt || block.caption || 'Figure'" />
                  </div>
                  <div v-else class="compose__figure-empty">Drop a URL or paste below — figure shows inline here.</div>
                  <input
                    v-model="block.caption"
                    class="compose__caption-input"
                    placeholder="Caption (editable in place)"
                  >
                  <div class="compose__figure-tools">
                    <input v-model="block.src" class="compose__input compose__input--inline" placeholder="Image src / URL">
                    <input v-model="block.alt" class="compose__input compose__input--inline" placeholder="Alt">
                    <button type="button" class="compose__btn compose__btn--small" @click.stop="pasteFigureUrl(block)">Paste URL</button>
                    <span class="compose__gen-label">Generate</span>
                    <button
                      type="button"
                      class="compose__btn compose__btn--small"
                      :disabled="!!figureBusyId"
                      @click.stop="generateFigureImage(block, 'commons')"
                    >{{ figureBusyId === block.id && figureBusySource === 'commons' ? 'Commons…' : 'Commons' }}</button>
                    <button
                      type="button"
                      class="compose__btn compose__btn--small"
                      :disabled="!!figureBusyId"
                      @click.stop="generateFigureImage(block, 'gemini')"
                    >{{ figureBusyId === block.id && figureBusySource === 'gemini' ? 'Gemini…' : 'Gemini' }}</button>
                    <button
                      type="button"
                      class="compose__btn compose__btn--small"
                      :disabled="!!figureBusyId"
                      @click.stop="generateFigureImage(block, 'gamma')"
                    >{{ figureBusyId === block.id && figureBusySource === 'gamma' ? 'Gamma…' : 'Gamma' }}</button>
                    <button type="button" class="compose__btn compose__btn--small" @click.stop="clearFigure(block)">Remove image</button>
                  </div>
                </div>

                <textarea
                  v-else-if="block.type === 'list'"
                  class="compose__list-input"
                  rows="4"
                  placeholder="One item per line"
                  :value="listText(block)"
                  @input="setListText(block, ($event.target as HTMLTextAreaElement).value)"
                ></textarea>

                <textarea
                  v-else-if="block.type === 'closing'"
                  v-model="block.text"
                  class="compose__closing-input"
                  rows="3"
                  placeholder="Closing beat"
                ></textarea>

                <textarea
                  v-else
                  v-model="block.text"
                  class="compose__body-input"
                  rows="4"
                  placeholder="Paragraph"
                ></textarea>
              </div>
            </div>
          </div>

          <div v-if="selectedFigure" class="compose__inspector" aria-label="Selected figure">
            <p class="compose__eyebrow">Figure inspector</p>
            <input v-model="selectedFigure.src" class="compose__input" placeholder="src">
            <input v-model="selectedFigure.alt" class="compose__input" placeholder="alt">
            <input v-model="selectedFigure.caption" class="compose__input" placeholder="caption">
          </div>

          <div class="compose__footer-actions">
            <button type="button" class="compose__btn" :disabled="saving" @click="persist('draft')">Save draft</button>
            <button type="button" class="compose__btn compose__btn--signal" :disabled="saving" @click="persist('published')">Publish</button>
            <NuxtLink v-if="previewHref && draft.status === 'published'" :to="previewHref" class="compose__btn">View live</NuxtLink>
            <p v-if="draft.status === 'published'" class="compose__hint">View live may 404 until the Vercel redeploy finishes.</p>
          </div>
        </section>

        <!-- ═══ FIELDS MODE (power edit) ═══ -->
        <section v-else class="compose__editor" aria-label="Post editor fields">
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
              <input v-model="draft.hero" class="compose__input" placeholder="/blog/slug/hero.jpg or https://…">
            </label>
            <label>
              <span>Hero alt</span>
              <input v-model="draft.heroAlt" class="compose__input">
            </label>
            <div class="compose__preview compose__span-2">
              <p class="compose__preview-label">Hero</p>
              <div v-if="isPreviewableSrc(draft.hero)" class="compose__preview-frame compose__preview-frame--hero">
                <EdEditorialImage :key="draft.hero" :src="draft.hero" :alt="draft.heroAlt || 'Hero preview'" />
              </div>
              <div class="compose__hero-controls">
                <button type="button" class="compose__btn compose__btn--small" :disabled="heroBusy || coverBusy" @click="regenerateHero">
                  {{ heroBusy ? 'Regenerating…' : 'Regenerate hero' }}
                </button>
                <span class="compose__gen-label">Generate cover</span>
                <button type="button" class="compose__btn compose__btn--small" :disabled="heroBusy || coverBusy" @click="generateCoverImage('commons')">
                  {{ coverBusy && coverBusySource === 'commons' ? 'Commons…' : 'Commons' }}
                </button>
                <button type="button" class="compose__btn compose__btn--small" :disabled="heroBusy || coverBusy" @click="generateCoverImage('gemini')">
                  {{ coverBusy && coverBusySource === 'gemini' ? 'Gemini…' : 'Gemini' }}
                </button>
                <button type="button" class="compose__btn compose__btn--small" :disabled="heroBusy || coverBusy" @click="generateCoverImage('gamma')">
                  {{ coverBusy && coverBusySource === 'gamma' ? 'Gamma…' : 'Gamma' }}
                </button>
              </div>
            </div>
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
                <div v-if="isPreviewableSrc(block.src)" class="compose__preview">
                  <div class="compose__preview-frame">
                    <EdEditorialImage :key="block.src" :src="block.src!" :alt="block.alt || block.caption || 'Figure preview'" />
                  </div>
                </div>
                <input v-model="block.src" class="compose__input" placeholder="Image src">
                <input v-model="block.alt" class="compose__input" placeholder="Alt text">
                <input v-model="block.caption" class="compose__input" placeholder="Caption">
                <div class="compose__figure-tools">
                  <button type="button" class="compose__btn compose__btn--small" @click="pasteFigureUrl(block)">Paste URL</button>
                  <span class="compose__gen-label">Generate</span>
                  <button
                    type="button"
                    class="compose__btn compose__btn--small"
                    :disabled="!!figureBusyId"
                    @click="generateFigureImage(block, 'commons')"
                  >{{ figureBusyId === block.id && figureBusySource === 'commons' ? 'Commons…' : 'Commons' }}</button>
                  <button
                    type="button"
                    class="compose__btn compose__btn--small"
                    :disabled="!!figureBusyId"
                    @click="generateFigureImage(block, 'gemini')"
                  >{{ figureBusyId === block.id && figureBusySource === 'gemini' ? 'Gemini…' : 'Gemini' }}</button>
                  <button
                    type="button"
                    class="compose__btn compose__btn--small"
                    :disabled="!!figureBusyId"
                    @click="generateFigureImage(block, 'gamma')"
                  >{{ figureBusyId === block.id && figureBusySource === 'gamma' ? 'Gamma…' : 'Gamma' }}</button>
                  <button type="button" class="compose__btn compose__btn--small" @click="clearFigure(block)">Remove image</button>
                </div>
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
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.compose {
  max-width: 1200rem;
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
.compose__input--inline {
  margin-top: 0;
  padding: 8rem 10rem;
  font-size: 14rem;
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
.compose__gh-status {
  margin: 0 0 18rem;
  padding: 10rem 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper-2);
  font: 700 12rem/1.35 var(--font-mono);
  letter-spacing: .03em;
  color: var(--ink-soft);
}
.compose__gh-status.is-good {
  background: color-mix(in srgb, var(--signal-cobalt) 12%, var(--paper));
  color: var(--ink);
}
.compose__gh-status.is-bad {
  background: color-mix(in srgb, #b00020 10%, var(--paper));
  color: #7a0016;
}
.compose__mode {
  display: inline-flex;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  overflow: hidden;
}
.compose__mode-btn {
  padding: 10rem 12rem;
  border: 0;
  border-right: var(--stroke) solid var(--ink);
  background: var(--paper);
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .05em;
  text-transform: uppercase;
  cursor: pointer;
  color: var(--ink-soft);
}
.compose__mode-btn:last-child { border-right: 0; }
.compose__mode-btn.is-active {
  background: var(--signal-cobalt);
  color: var(--paper);
}
.compose__preview {
  display: grid;
  gap: 8rem;
  margin-top: 4rem;
}
.compose__preview-label {
  margin: 0;
  font: 700 10rem/1.2 var(--font-mono);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--signal-cobalt);
}
.compose__preview-frame {
  overflow: hidden;
  max-height: 180px;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: #F7F1E4;
  aspect-ratio: 4 / 3;
}
.compose__preview-frame--hero {
  max-height: 220px;
  aspect-ratio: 16 / 9;
}
.compose__preview-frame :deep(.ed-editorial-image),
.compose__preview-frame :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  max-height: inherit;
  object-fit: cover;
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
  align-items: center;
}
.compose__layout {
  display: grid;
  grid-template-columns: minmax(160rem, 220rem) minmax(0, 1fr);
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
.compose__blocks-toolbar--side { margin: 20rem 0 0; }
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
.compose__image-note {
  margin: 8rem 0 0;
  font-size: 12rem;
  line-height: 1.4;
  color: var(--ink-soft);
}
.compose__gen-label {
  font: 700 10rem/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

/* ── Canvas (WYSIWYG) ───────────────────────────────────────────────────── */
.compose__canvas {
  min-width: 0;
  padding-bottom: 40rem;
}
.compose__canvas-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10rem;
  margin-bottom: 14rem;
}
.compose__canvas-meta label {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  font: 700 10rem/1.2 var(--font-mono);
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--ink-soft);
  min-width: 120rem;
  flex: 1 1 140rem;
}
.compose__hero {
  margin: 0 0 22rem;
}
.compose__hero-frame {
  overflow: hidden;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: #F7F1E4;
  aspect-ratio: 16 / 8.5;
}
.compose__hero-frame :deep(.ed-editorial-image),
.compose__hero-frame :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.compose__hero-empty {
  display: grid;
  place-items: center;
  min-height: 180rem;
  padding: 24rem;
  border: var(--stroke) dashed var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
  color: var(--ink-soft);
  text-align: center;
}
.compose__hero-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  align-items: center;
  margin-top: 10rem;
}
.compose__canvas-head { margin: 0 0 28rem; }
.compose__title-input {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  border-bottom: var(--stroke) solid transparent;
  background: transparent;
  padding: 0 0 8rem;
  font: 500 clamp(32rem, 5.5vw, 64rem)/.95 var(--font-display);
  letter-spacing: -.05em;
  color: var(--ink);
}
.compose__title-input:focus {
  outline: none;
  border-bottom-color: var(--signal-cobalt);
}
.compose__dek-input {
  width: 100%;
  box-sizing: border-box;
  margin-top: 16rem;
  border: 0;
  background: transparent;
  padding: 0;
  resize: vertical;
  font: 400 clamp(17rem, 2vw, 22rem)/1.4 var(--font-body);
  color: var(--ink);
}
.compose__dek-input:focus { outline: none; }
.compose__article-grid {
  display: grid;
  grid-template-columns: minmax(0, 170rem) minmax(0, 1fr);
  gap: clamp(18rem, 4vw, 48rem);
}
.compose__margin {
  align-self: start;
  position: sticky;
  top: 88rem;
  padding: 14rem;
  background: var(--signal-field);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  display: grid;
  gap: 8rem;
}
.compose__margin-label {
  border: 0;
  background: transparent;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--ink);
  padding: 0;
}
.compose__margin-body {
  border: 0;
  background: transparent;
  resize: vertical;
  font: 400 14rem/1.45 var(--font-body);
  color: var(--ink);
  padding: 0;
  min-height: 80rem;
}
.compose__prose { min-width: 0; display: grid; gap: 18rem; }
.compose__canvas-block {
  position: relative;
  padding: 8rem 0 4rem;
  border-top: var(--stroke) solid color-mix(in srgb, var(--ink) 12%, transparent);
}
.compose__canvas-block.is-figure-selected {
  outline: 2px solid var(--signal-cobalt);
  outline-offset: 4px;
  border-radius: var(--radius-s);
}
.compose__canvas-block-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rem;
  font: 700 10rem/1 var(--font-mono);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--signal-cobalt);
  opacity: .85;
}
.compose__lead-input,
.compose__body-input,
.compose__heading-input,
.compose__quote-input,
.compose__closing-input,
.compose__list-input {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  background: transparent;
  resize: vertical;
  padding: 0;
  color: var(--ink);
}
.compose__lead-input,
.compose__body-input {
  font: 400 clamp(17rem, 1.8vw, 20rem)/1.62 var(--font-body);
  min-height: 96rem;
}
.compose__heading-input {
  font: 500 clamp(26rem, 3.2vw, 40rem)/1.05 var(--font-display);
  letter-spacing: -.04em;
  min-height: 56rem;
}
.compose__quote-input {
  padding: 18rem 20rem;
  border-left: 8rem solid var(--signal-cobalt);
  background: var(--paper-2);
  border-radius: 0 var(--radius-m) var(--radius-m) 0;
  font: 500 clamp(20rem, 2.4vw, 28rem)/1.15 var(--font-display);
  letter-spacing: -.03em;
  min-height: 88rem;
}
.compose__closing-input {
  margin-top: 8rem;
  padding-top: 20rem;
  border-top: var(--stroke) solid var(--ink);
  font: 500 clamp(20rem, 2.4vw, 30rem)/1.15 var(--font-display);
  letter-spacing: -.035em;
  min-height: 72rem;
}
.compose__list-input {
  font: 400 17rem/1.55 var(--font-body);
  padding-left: 1em;
  min-height: 88rem;
}
.compose__callout-edit {
  padding: 14rem;
  background: var(--signal-field);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  display: grid;
  gap: 8rem;
}
.compose__figure-edit {
  padding: 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
  display: grid;
  gap: 10rem;
  cursor: pointer;
}
.compose__figure-frame {
  overflow: hidden;
  border-radius: var(--radius-s);
  background: #F7F1E4;
  aspect-ratio: 16 / 9;
}
.compose__figure-frame :deep(.ed-editorial-image),
.compose__figure-frame :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.compose__figure-empty {
  display: grid;
  place-items: center;
  min-height: 140rem;
  padding: 16rem;
  border: var(--stroke) dashed var(--ink);
  border-radius: var(--radius-s);
  color: var(--ink-soft);
  text-align: center;
  font-size: 14rem;
}
.compose__caption-input {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  border-bottom: var(--stroke) solid var(--line);
  background: transparent;
  padding: 4rem 0;
  font: 400 13rem/1.35 var(--font-mono);
  color: var(--ink-soft);
}
.compose__figure-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8rem;
  align-items: center;
}
.compose__inspector {
  margin-top: 22rem;
  padding: 14rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-m);
  background: var(--paper-2);
  display: grid;
  gap: 8rem;
}

@media (max-width: 760px) {
  .compose__layout { grid-template-columns: 1fr; }
  .compose__meta-grid, .compose__ai-form { grid-template-columns: 1fr; }
  .compose__span-2 { grid-column: auto; }
  .compose__article-grid { grid-template-columns: 1fr; }
  .compose__margin { position: static; }
  .compose__hero-frame { aspect-ratio: 4 / 3; border-radius: 0; }
  .compose__title-input { font-size: clamp(28rem, 9vw, 42rem); }
}
</style>

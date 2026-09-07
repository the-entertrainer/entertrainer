<script setup lang="ts">
import type { ElevateSortPref, OpeningSoundId } from '~/composables/useSiteSettings'
import { OPENING_SOUND_OPTIONS, openingSoundSrc } from '~/composables/useSiteSettings'

/**
 * Visitor preferences: slide-over panel. Yellow/cream Elevate DNA, Escape to close,
 * focus returns to the opener. Changes apply immediately via useSiteSettings.
 */
const {
  settings,
  panelOpen,
  closePanel,
  setOpeningSound,
  setReduceMotion,
  setHideElevateExcerpts,
  setElevateSort,
  reset
} = useSiteSettings()

const dialog = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)
let previewAudio: HTMLAudioElement | null = null

watch(panelOpen, async (open) => {
  if (!import.meta.client) return
  if (open) {
    previouslyFocused.value = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('settings-panel-open')
    await nextTick()
    closeBtn.value?.focus()
  } else {
    document.documentElement.classList.remove('settings-panel-open')
    stopPreview()
    previouslyFocused.value?.focus?.()
    previouslyFocused.value = null
  }
})

function stopPreview() {
  if (!previewAudio) return
  try {
    previewAudio.pause()
    previewAudio.src = ''
  } catch { /* ignore */ }
  previewAudio = null
}

function previewIdent(id: OpeningSoundId) {
  if (!import.meta.client || id === 'off') return
  const src = openingSoundSrc(id)
  if (!src) return
  stopPreview()
  const audio = new Audio(src)
  audio.volume = 0.9
  previewAudio = audio
  void audio.play().catch(() => undefined)
}

function onKey(e: KeyboardEvent) {
  if (!panelOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closePanel()
    return
  }
  if (e.key !== 'Tab' || !dialog.value) return
  const focusable = dialog.value.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const list = [...focusable].filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
  if (list.length < 2) return
  const first = list[0]
  const last = list[list.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.documentElement.classList.remove('settings-panel-open')
  stopPreview()
})

const sortOptions: { value: ElevateSortPref; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'A to Z' }
]

const soundOptions = OPENING_SOUND_OPTIONS

function selectSound(id: OpeningSoundId) {
  setOpeningSound(id)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="panelOpen"
      class="sp"
      role="presentation"
      @click.self="closePanel()"
    >
      <div
        id="site-settings-panel"
        ref="dialog"
        class="sp__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sp-title"
      >
        <header class="sp__head">
          <div class="sp__head-copy">
            <p class="sp__eyebrow">Your preferences</p>
            <h2 id="sp-title" class="sp__title">Settings</h2>
          </div>
          <button
            ref="closeBtn"
            type="button"
            class="sp__close"
            aria-label="Close settings"
            @click="closePanel()"
          >
            <EdSignalIcon name="close" />
          </button>
        </header>

        <div class="sp__body">
          <div class="sp__row sp__row--stack" role="radiogroup" aria-labelledby="sp-sound-label">
            <span class="sp__row-copy">
              <span id="sp-sound-label" class="sp__row-label">Opening sound</span>
              <span class="sp__row-hint">A short welcome tone when you tap to enter</span>
            </span>
            <ul class="sp__sound-list" role="list">
              <li
                v-for="opt in soundOptions"
                :key="opt.id"
                class="sp__sound-item"
              >
                <button
                  type="button"
                  class="sp__sound-choice"
                  role="radio"
                  :aria-checked="settings.openingSound === opt.id"
                  :aria-label="`Opening sound: ${opt.label}`"
                  @click="selectSound(opt.id)"
                >
                  <span class="sp__sound-radio" aria-hidden="true" />
                  <span class="sp__sound-name">{{ opt.label }}</span>
                </button>
                <button
                  v-if="opt.id !== 'off'"
                  type="button"
                  class="sp__preview"
                  :aria-label="`Preview ${opt.label}`"
                  @click.stop="previewIdent(opt.id)"
                >
                  Preview
                </button>
              </li>
            </ul>
          </div>

          <label class="sp__row">
            <span class="sp__row-copy">
              <span class="sp__row-label">Calmer motion</span>
              <span class="sp__row-hint">Less movement on the home stage and logo</span>
            </span>
            <button
              type="button"
              class="sp__switch"
              role="switch"
              :aria-checked="settings.reduceMotion"
              :aria-label="`Calmer motion ${settings.reduceMotion ? 'on' : 'off'}`"
              @click="setReduceMotion(!settings.reduceMotion)"
            >
              <span class="sp__switch-knob" aria-hidden="true" />
              <span class="sp__switch-state" aria-hidden="true">{{ settings.reduceMotion ? 'On' : 'Off' }}</span>
            </button>
          </label>

          <label class="sp__row">
            <span class="sp__row-copy">
              <span class="sp__row-label">Hide article summaries</span>
              <span class="sp__row-hint">Shorter list — titles and details only</span>
            </span>
            <button
              type="button"
              class="sp__switch"
              role="switch"
              :aria-checked="settings.hideElevateExcerpts"
              :aria-label="`Hide article summaries ${settings.hideElevateExcerpts ? 'on' : 'off'}`"
              @click="setHideElevateExcerpts(!settings.hideElevateExcerpts)"
            >
              <span class="sp__switch-knob" aria-hidden="true" />
              <span class="sp__switch-state" aria-hidden="true">{{ settings.hideElevateExcerpts ? 'On' : 'Off' }}</span>
            </button>
          </label>

          <div class="sp__row sp__row--stack" role="group" aria-labelledby="sp-sort-label">
            <span class="sp__row-copy">
              <span id="sp-sort-label" class="sp__row-label">Article order</span>
              <span class="sp__row-hint">How articles appear when you open the list</span>
            </span>
            <div class="sp__segment" role="radiogroup" aria-label="Article order">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                type="button"
                class="sp__segment-btn"
                role="radio"
                :aria-checked="settings.elevateSort === opt.value"
                :aria-label="opt.label"
                @click="setElevateSort(opt.value)"
              >{{ opt.label }}</button>
            </div>
          </div>
        </div>

        <footer class="sp__foot">
          <button type="button" class="sp__reset" aria-label="Reset to defaults" @click="reset()">Reset to defaults</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sp {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-overlay) + 20);
  display: flex;
  justify-content: flex-end;
  background: color-mix(in srgb, var(--ink) 28%, transparent);
  padding: 0;
}

.sp__panel {
  display: flex;
  flex-direction: column;
  width: min(400rem, 100vw);
  height: 100%;
  max-height: 100dvh;
  background: var(--paper);
  color: var(--ink);
  border-left: var(--stroke) solid var(--ink);
  box-shadow: -18rem 0 0 color-mix(in srgb, var(--accent) 55%, transparent), var(--shadow-overlay);
  padding: calc(18rem + var(--safe-top)) 22rem calc(22rem + var(--safe-bottom));
  animation: sp-slide 280ms var(--ease-out) both;
}

@keyframes sp-slide {
  from { transform: translateX(18rem); opacity: 0; }
  to { transform: none; opacity: 1; }
}

.sp__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rem;
  margin-bottom: 22rem;
  padding-bottom: 16rem;
  border-bottom: var(--stroke) solid var(--line);
}

.sp__eyebrow {
  margin: 0 0 4rem;
  font: 700 11rem/1.2 var(--font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sp__title {
  margin: 0;
  font: 600 clamp(28rem, 4vw, 34rem)/1.05 var(--font-display);
  letter-spacing: -.03em;
}

.sp__close {
  width: 40rem;
  height: 40rem;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper);
  color: var(--ink);
}
.sp__close:hover { background: var(--signal-field); }
.sp__close:focus-visible { outline: 3rem solid var(--ink); outline-offset: 3rem; }

.sp__body {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.sp__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rem;
  padding: 14rem 0;
  border-bottom: var(--stroke) solid var(--line);
}

.sp__row--stack {
  flex-direction: column;
  align-items: stretch;
  gap: 12rem;
}

.sp__row-copy { min-width: 0; display: grid; gap: 4rem; }
.sp__row-label { font: 650 15rem/1.25 var(--font-ui); color: var(--ink); }
.sp__row-hint { font: 400 13rem/1.4 var(--font-ui); color: var(--ink-soft); }

.sp__sound-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6rem;
}

.sp__sound-item {
  display: flex;
  align-items: center;
  gap: 8rem;
}

.sp__sound-choice {
  flex: 1;
  min-width: 0;
  min-height: 40rem;
  display: inline-flex;
  align-items: center;
  gap: 10rem;
  padding: 0 12rem 0 10rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-s);
  background: var(--paper);
  color: var(--ink-soft);
  font: 650 14rem/1 var(--font-ui);
  text-align: left;
}
.sp__sound-choice[aria-checked="true"] {
  border-color: var(--ink);
  background: var(--accent);
  color: var(--ink);
}
.sp__sound-choice:hover { border-color: var(--ink); color: var(--ink); }
.sp__sound-choice:focus-visible { outline: 3rem solid var(--ink); outline-offset: 2rem; }

.sp__sound-radio {
  width: 14rem;
  height: 14rem;
  flex: none;
  border-radius: 50%;
  border: var(--stroke) solid currentColor;
  box-shadow: inset 0 0 0 2rem var(--paper);
}
.sp__sound-choice[aria-checked="true"] .sp__sound-radio {
  background: var(--ink);
  box-shadow: inset 0 0 0 3rem var(--accent);
}

.sp__sound-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sp__preview {
  flex: none;
  min-height: 36rem;
  padding: 0 12rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink);
  font: 650 12rem/1 var(--font-ui);
  box-shadow: 2rem 2rem 0 var(--accent);
}
.sp__preview:hover { background: var(--signal-field); }
.sp__preview:active { transform: translate(1rem, 1rem); box-shadow: 1rem 1rem 0 var(--accent); }
.sp__preview:focus-visible { outline: 3rem solid var(--ink); outline-offset: 2rem; }

.sp__switch {
  position: relative;
  flex: none;
  width: 72rem;
  height: 36rem;
  padding: 0 8rem 0 0;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-full);
  background: var(--paper-2);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  transition: background 180ms var(--ease-out);
}
.sp__switch[aria-checked="true"] {
  background: var(--accent);
  justify-content: flex-start;
  padding: 0 0 0 8rem;
}
.sp__switch-knob {
  position: absolute;
  top: 3rem;
  left: 3rem;
  width: 28rem;
  height: 28rem;
  border-radius: 50%;
  background: var(--ink);
  border: var(--stroke) solid var(--ink);
  transition: transform 180ms var(--ease-spring);
}
.sp__switch[aria-checked="true"] .sp__switch-knob {
  transform: translateX(36rem);
  background: var(--paper);
}
.sp__switch-state {
  font: 700 11rem/1 var(--font-mono);
  letter-spacing: .04em;
  text-transform: uppercase;
  pointer-events: none;
}
.sp__switch:focus-visible { outline: 3rem solid var(--ink); outline-offset: 3rem; }

.sp__segment {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6rem;
}
.sp__segment-btn {
  min-height: 36rem;
  padding: 0 12rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink-soft);
  font: 650 13rem/1 var(--font-ui);
}
.sp__segment-btn[aria-checked="true"] {
  border-color: var(--ink);
  background: var(--accent);
  color: var(--ink);
}
.sp__segment-btn:hover { border-color: var(--ink); color: var(--ink); }
.sp__segment-btn:focus-visible { outline: 3rem solid var(--ink); outline-offset: 2rem; }

.sp__foot {
  margin-top: 18rem;
  padding-top: 16rem;
  border-top: var(--stroke) solid var(--line);
}
.sp__reset {
  width: 100%;
  min-height: 44rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper);
  color: var(--ink);
  font: 650 14rem/1 var(--font-ui);
  box-shadow: 4rem 4rem 0 var(--accent);
}
.sp__reset:hover { background: var(--signal-field); }
.sp__reset:active { transform: translate(2rem, 2rem); box-shadow: 2rem 2rem 0 var(--accent); }
.sp__reset:focus-visible { outline: 3rem solid var(--ink); outline-offset: 3rem; }

@media (max-width: 480px) {
  .sp__panel {
    width: 100vw;
    border-left: 0;
    border-top: var(--stroke) solid var(--ink);
    height: auto;
    max-height: min(92dvh, 100%);
    align-self: flex-end;
    border-radius: var(--radius-l) var(--radius-l) 0 0;
    animation-name: sp-rise;
  }
  @keyframes sp-rise {
    from { transform: translateY(24rem); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .sp__panel { animation: none; }
  .sp__switch, .sp__switch-knob, .sp__reset, .sp__preview { transition: none; }
}
:global(html[data-reduce-motion="on"]) .sp__panel { animation: none; }
:global(html[data-reduce-motion="on"]) .sp__switch,
:global(html[data-reduce-motion="on"]) .sp__switch-knob,
:global(html[data-reduce-motion="on"]) .sp__reset,
:global(html[data-reduce-motion="on"]) .sp__preview { transition: none; }
</style>

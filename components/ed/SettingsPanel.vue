<script setup lang="ts">
/**
 * Visitor preferences: slide-over panel. Yellow/cream Elevate DNA, Escape to close,
 * focus returns to the opener. Changes apply immediately via useSiteSettings.
 */
const {
  settings,
  panelOpen,
  closePanel,
  setOpeningSound,
  setAstroclockGearSound,
  setWordOfTheDay,
  reset
} = useSiteSettings()

const dialog = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

watch(panelOpen, async (open) => {
  if (!import.meta.client) return
  if (open) {
    previouslyFocused.value = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('settings-panel-open')
    await nextTick()
    closeBtn.value?.focus()
  } else {
    document.documentElement.classList.remove('settings-panel-open')
    previouslyFocused.value?.focus?.()
    previouslyFocused.value = null
  }
})

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
})

const openingOn = computed(() => settings.value.openingSound === 'on')
function toggleOpeningSound() {
  setOpeningSound(openingOn.value ? 'off' : 'on')
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
            <h2 id="sp-title" class="sp__title">Settings</h2>
          </div>
          <button
            ref="closeBtn"
            type="button"
            class="sp__close u-icon-btn u-icon-btn--idle"
            aria-label="Close settings"
            @click="closePanel()"
          >
            <EdSignalIcon name="close" />
          </button>
        </header>

        <div class="sp__body">
          <label class="sp__row">
            <span class="sp__row-copy">
              <span class="sp__row-label">Opening sound</span>
            </span>
            <button
              type="button"
              class="sp__switch"
              role="switch"
              :aria-checked="openingOn"
              :aria-label="`Opening sound ${openingOn ? 'on' : 'off'}`"
              @click="toggleOpeningSound()"
            >
              <span class="sp__switch-knob" aria-hidden="true" />
              <span class="sp__switch-state" aria-hidden="true">{{ openingOn ? 'On' : 'Off' }}</span>
            </button>
          </label>


          <label class="sp__row">
            <span class="sp__row-copy">
              <span class="sp__row-label">AstroClock flip sound</span>
            </span>
            <button
              type="button"
              class="sp__switch"
              role="switch"
              :aria-checked="settings.astroclockGearSound"
              :aria-label="`AstroClock flip sound ${settings.astroclockGearSound ? 'on' : 'off'}`"
              @click="setAstroclockGearSound(!settings.astroclockGearSound)"
            >
              <span class="sp__switch-knob" aria-hidden="true" />
              <span class="sp__switch-state" aria-hidden="true">{{ settings.astroclockGearSound ? 'On' : 'Off' }}</span>
            </button>
          </label>
          <label class="sp__row">
            <span class="sp__row-copy">
              <span class="sp__row-label">Word of the Day</span>
            </span>
            <button
              type="button"
              class="sp__switch"
              role="switch"
              :aria-checked="settings.wordOfTheDay"
              :aria-label="`Word of the Day ${settings.wordOfTheDay ? 'on' : 'off'}`"
              @click="setWordOfTheDay(!settings.wordOfTheDay)"
            >
              <span class="sp__switch-knob" aria-hidden="true" />
              <span class="sp__switch-state" aria-hidden="true">{{ settings.wordOfTheDay ? 'On' : 'Off' }}</span>
            </button>
          </label>
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
  width: min(25rem, 100vw);
  height: 100%;
  max-height: 100dvh;
  background: var(--paper);
  color: var(--ink);
  border-left: var(--stroke) solid var(--ink);
  box-shadow: -1.125rem 0 0 color-mix(in srgb, var(--accent) 55%, transparent), var(--shadow-overlay);
  padding: calc(1.125rem + var(--safe-top)) 1.375rem calc(1.375rem + var(--safe-bottom));
  animation: sp-slide 280ms var(--ease-out) both;
}

@keyframes sp-slide {
  from { transform: translateX(1.125rem); opacity: 0; }
  to { transform: none; opacity: 1; }
}

.sp__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.375rem;
  padding-bottom: 1rem;
  border-bottom: var(--stroke) solid var(--line);
}

.sp__title {
  margin: 0;
  font: 600 clamp(1.75rem, 4vw, 2.125rem)/1.05 var(--font-display);
  letter-spacing: -.03em;
}

.sp__close {
  width: 2.5rem;
  height: 2.5rem;
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
.sp__close:focus-visible { outline: 0.1875rem solid var(--ink); outline-offset: 0.1875rem; }

.sp__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.sp__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 0;
  border-bottom: var(--stroke) solid var(--line);
}

.sp__row--stack {
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
}

.sp__row-copy { min-width: 0; display: grid; gap: 0.25rem; }
.sp__row-label { font: 650 0.9375rem/1.25 var(--font-ui); color: var(--ink); }

.sp__switch {
  position: relative;
  flex: none;
  width: 4.5rem;
  height: 2.25rem;
  padding: 0 0.5rem 0 0;
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
  color: var(--accent-ink);
  justify-content: flex-start;
  padding: 0 0 0 0.5rem;
}
.sp__switch-knob {
  position: absolute;
  top: 0.1875rem;
  left: 0.1875rem;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--ink);
  border: var(--stroke) solid var(--ink);
  transition: transform 180ms var(--ease-spring);
}
.sp__switch[aria-checked="true"] .sp__switch-knob {
  transform: translateX(2.25rem);
  background: var(--paper);
}
.sp__switch-state {
  font: 700 0.75rem/1 var(--font-mono);
  letter-spacing: .04em;
  text-transform: uppercase;
  pointer-events: none;
}
.sp__switch:focus-visible { outline: 0.1875rem solid var(--ink); outline-offset: 0.1875rem; }

.sp__segment {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.sp__segment-btn {
  min-height: 2.25rem;
  padding: 0 0.75rem;
  border: var(--stroke) solid var(--line);
  border-radius: var(--radius-full);
  background: var(--paper);
  color: var(--ink-soft);
  font: 650 0.8125rem/1 var(--font-ui);
}
.sp__segment-btn[aria-checked="true"] {
  border-color: var(--ink);
  background: var(--accent);
  color: var(--accent-ink);
}
.sp__segment-btn:hover { border-color: var(--ink); color: var(--ink); }
.sp__segment-btn[aria-checked="true"]:hover { background: var(--accent); color: var(--accent-ink); }
.sp__segment-btn:focus-visible { outline: 0.1875rem solid var(--ink); outline-offset: 0.125rem; }

.sp__foot {
  margin-top: 1.125rem;
  padding-top: 1rem;
  border-top: var(--stroke) solid var(--line);
}
.sp__reset {
  width: 100%;
  min-height: 2.75rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-s);
  background: var(--paper);
  color: var(--ink);
  font: 650 0.875rem/1 var(--font-ui);
  box-shadow: 0.25rem 0.25rem 0 var(--accent);
}
.sp__reset:hover { background: var(--signal-field); }
.sp__reset:active { transform: translate(0.125rem, 0.125rem); box-shadow: 0.125rem 0.125rem 0 var(--accent); }
.sp__reset:focus-visible { outline: 0.1875rem solid var(--ink); outline-offset: 0.1875rem; }

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
    from { transform: translateY(1.5rem); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
}

@media (prefers-reduced-motion: reduce) {
  .sp__panel { animation: none; }
  .sp__switch, .sp__switch-knob, .sp__reset { transition: none; }
}
:global(html[data-reduce-motion="on"]) .sp__panel { animation: none; }
:global(html[data-reduce-motion="on"]) .sp__switch,
:global(html[data-reduce-motion="on"]) .sp__switch-knob,
:global(html[data-reduce-motion="on"]) .sp__reset { transition: none; }
</style>

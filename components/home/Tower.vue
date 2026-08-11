<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
import { createGlassStage } from '~/utils/glassKit'
import { glassThemeFor, cssVarsFor, FONT_HREF, type HomeTheme } from '~/utils/homeThemes'
import { useExperienceStore } from '~/stores/experience'

const props = defineProps<{ theme: HomeTheme }>()

// Display faces load per-theme; Fraunces + DM Sans are already global.
useHead({ link: [{ rel: 'stylesheet', href: FONT_HREF }] })

const canvas = ref<HTMLCanvasElement | null>(null)
const topEl = ref<HTMLElement | null>(null)
const botEl = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const ready = ref(false)
const router = useRouter()
// The preloader holds the door until the stage has actually drawn something.
// Without this it either guesses with a timer or lets you through to an empty
// black frame while WebGL is still compiling.
const experienceStore = useExperienceStore()
let stage: ReturnType<typeof createGlassStage> | null = null

const active = computed(() => LAB_NAV[activeIndex.value % LAB_NAV.length])
const vars = computed(() => ({
  ...cssVarsFor(props.theme),
  '--top-h': `${topH.value}px`,
  '--bot-h': `${botH.value}px`
}))

function go(d: number) { stage?.go(d) }
function goToItem(i: number) { stage?.goToItem(i) }
function open(href: string) { router.push(href) }

// The camera frames the cards into whatever band the chrome leaves behind, so
// the two chrome zones have to report their real measured heights rather than
// the stage guessing at them. A guess is what put the top card underneath the
// wordmark on a phone, and the bottom one behind the caption.
let ro: ResizeObserver | null = null
const topH = ref(0)
const botH = ref(0)
function measure() {
  topH.value = topEl.value?.getBoundingClientRect().height ?? 0
  botH.value = botEl.value?.getBoundingClientRect().height ?? 0
  // Air between the chrome and the nearest card edge — enough that the focused
  // card clears the point where the scrim starts to bite, not just the chrome
  // box itself, so it is never delivered half-veiled.
  stage?.setInsets(topH.value + 26, botH.value + 36)
}

onMounted(() => {
  if (!canvas.value) return
  stage = createGlassStage({
    canvas: canvas.value,
    layout: 'column',
    theme: glassThemeFor(props.theme),
    items: LAB_NAV,
    count: 8,
    onActive: (i) => (activeIndex.value = i),
    onPick: open
  })
  stage.onReady(() => {
    ready.value = true
    experienceStore.setReady()
  })

  ro = new ResizeObserver(measure)
  if (topEl.value) ro.observe(topEl.value)
  if (botEl.value) ro.observe(botEl.value)
  // The caption swaps text as cards change, and mobile browsers resize the
  // visual viewport when the URL bar collapses — re-measure on both.
  visualViewport?.addEventListener('resize', measure)
  nextTick(measure)
})
onBeforeUnmount(() => {
  ro?.disconnect(); ro = null
  visualViewport?.removeEventListener('resize', measure)
  stage?.dispose(); stage = null
})

defineExpose({ go, goToItem, active, activeIndex })
</script>

<template>
  <div class="tw" :style="vars" :class="{ 'tw--dark': theme.dark, 'tw--ready': ready }">
    <!-- The canvas is decoration as far as assistive tech is concerned; the
         real, operable version of this navigation lives in the bottom zone. -->
    <canvas ref="canvas" class="tw__cv" aria-hidden="true" />

    <!-- Scrims are sized from the measured chrome, not from guessed percentages,
         so the copy always sits on a fully opaque ground and the fade ends
         exactly where the cards begin. -->
    <div class="tw__scrim tw__scrim--top" aria-hidden="true" />
    <div class="tw__scrim tw__scrim--bot" aria-hidden="true" />

    <header ref="topEl" class="tw__top">
      <slot name="top" :active="active" :index="activeIndex" />
    </header>

    <div ref="botEl" class="tw__bot">
      <slot name="bottom" :active="active" :index="activeIndex" :go="go" :goToItem="goToItem" :open="open" :items="LAB_NAV" />
    </div>

    <slot :active="active" :index="activeIndex" :go="go" :goToItem="goToItem" :open="open" :ready="ready" :items="LAB_NAV" />
  </div>
</template>

<style scoped>
.tw { position: fixed; inset: 0; overflow: hidden; background: var(--bg); color: var(--ink); }
.tw__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
.tw__cv:active { cursor: grabbing; }

/* Chrome zones. Both are measured, both carry the device safe areas, and both
   pass pointer events through except where a real control sits — so the whole
   uncovered middle of the screen stays draggable. */
.tw__top {
  position: absolute; top: 0; left: 0; right: 0; z-index: 20;
  padding: calc(14rem + env(safe-area-inset-top)) calc(20rem + env(safe-area-inset-right)) 14rem calc(20rem + env(safe-area-inset-left));
  pointer-events: none;
}
.tw__bot {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 20;
  padding: 18rem calc(20rem + env(safe-area-inset-right)) calc(18rem + env(safe-area-inset-bottom)) calc(20rem + env(safe-area-inset-left));
  pointer-events: none;
}
.tw__top :deep(a), .tw__top :deep(button),
.tw__bot :deep(a), .tw__bot :deep(button) { pointer-events: auto; }

/* Solid exactly as far as the chrome reaches, then a long fade. Percentage
   stops used to put the fade wherever the chrome happened to end up, which over
   a high-contrast card looked like a torn, dirty edge; pinning the stops to the
   measured height keeps the copy on solid ground and gives the cards a gradual
   exit instead of a smear. */
.tw__scrim { position: absolute; left: 0; right: 0; z-index: 2; pointer-events: none; }
.tw__scrim--top {
  top: 0; height: calc(var(--top-h, 0px) + 110rem);
  background: linear-gradient(to bottom,
    var(--bg) 0, var(--bg) var(--top-h, 0px),
    var(--bg-90) calc(var(--top-h, 0px) + 26rem),
    var(--bg-60) calc(var(--top-h, 0px) + 64rem),
    var(--bg-0) 100%);
}
/* The bottom fade runs long. Now that the focused card fills the frame the card
   behind it emerges right where the caption sits, and a short fade left it
   sharp and competing with the title; this veils it into the page instead. */
.tw__scrim--bot {
  bottom: 0; height: calc(var(--bot-h, 0px) + 230rem);
  background: linear-gradient(to top,
    var(--bg) 0, var(--bg) var(--bot-h, 0px),
    var(--bg-90) calc(var(--bot-h, 0px) + 54rem),
    var(--bg-60) calc(var(--bot-h, 0px) + 132rem),
    var(--bg-0) 100%);
}

/* Fade the whole stage up once the first frame has rendered, so there's never
   a flash of empty background before the cards exist. */
.tw__cv { opacity: 0; transition: opacity var(--dur-slow) var(--ease-out); }
.tw--ready .tw__cv { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .tw__cv { transition: none; } }
</style>

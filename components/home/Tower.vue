<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
import { createGlassStage } from '~/utils/glassKit'
import { glassThemeFor, cssVarsFor, FONT_HREF, type HomeTheme } from '~/utils/homeThemes'

const props = defineProps<{ theme: HomeTheme }>()

// Display faces load per-theme; Fraunces + DM Sans are already global.
useHead({ link: [{ rel: 'stylesheet', href: FONT_HREF }] })

const canvas = ref<HTMLCanvasElement | null>(null)
const activeIndex = ref(0)
const ready = ref(false)
const router = useRouter()
let stage: ReturnType<typeof createGlassStage> | null = null

const active = computed(() => LAB_NAV[activeIndex.value % LAB_NAV.length])
const vars = computed(() => cssVarsFor(props.theme))

function go(d: number) { stage?.go(d) }
function open(href: string) { router.push(href) }

onMounted(() => {
  if (!canvas.value) return
  stage = createGlassStage({
    canvas: canvas.value,
    layout: 'column',
    theme: glassThemeFor(props.theme),
    items: LAB_NAV,
    count: 8,
    // Rides the stack high so the lower third stays clear for the caption —
    // without this the copy lands on top of a card and is unreadable.
    lift: 0.85,
    onActive: (i) => (activeIndex.value = i),
    onPick: open
  })
  stage.onReady(() => (ready.value = true))
})
onBeforeUnmount(() => { stage?.dispose(); stage = null })

defineExpose({ go, active, activeIndex })
</script>

<template>
  <div class="tw" :style="vars" :class="{ 'tw--dark': theme.dark, 'tw--ready': ready }">
    <canvas ref="canvas" class="tw__cv" />
    <!-- Scrims: guarantee the caption and wordmark read over whatever card
         happens to drift behind them as the tower scrolls. -->
    <div class="tw__scrim" aria-hidden="true" />
    <div class="tw__scrim tw__scrim--top" aria-hidden="true" />
    <slot :active="active" :index="activeIndex" :go="go" :open="open" :ready="ready" :items="LAB_NAV" />
  </div>
</template>

<style scoped>
.tw { position: fixed; inset: 0; overflow: hidden; background: var(--bg); color: var(--ink); }
.tw__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
.tw__cv:active { cursor: grabbing; }
.tw__scrim {
  position: absolute; left: 0; right: 0; bottom: 0; height: 52%;
  z-index: 2; pointer-events: none;
  background: linear-gradient(to top, var(--bg) 0%, var(--bg) 32%, var(--bg-90) 52%, var(--bg-60) 74%, var(--bg-0) 100%);
}
.tw__scrim--top {
  top: 0; bottom: auto; height: 15%;
  background: linear-gradient(to bottom, var(--bg-90) 0%, var(--bg-60) 45%, var(--bg-0) 100%);
}
/* Fade the whole stage up once the first frame has rendered, so there's never
   a flash of empty background before the cards exist. */
.tw__cv { opacity: 0; transition: opacity 0.7s ease; }
.tw--ready .tw__cv { opacity: 1; }
</style>

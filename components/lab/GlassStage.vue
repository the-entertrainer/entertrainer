<script setup lang="ts">
import { LAB_NAV } from '~/utils/labNav'
import { createGlassStage, PAPER, DUSK, type GlassTheme, type LayoutName } from '~/utils/glassKit'

const props = withDefaults(defineProps<{
  layout: LayoutName
  theme?: 'paper' | 'dusk' | GlassTheme
  count?: number
  /** Ground plane height — enables contact shadows when set. */
  ground?: number
}>(), { theme: 'paper' })

const emit = defineEmits<{ ready: []; active: [i: number] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const activeIndex = ref(0)
const router = useRouter()
let stage: ReturnType<typeof createGlassStage> | null = null

const active = computed(() => LAB_NAV[activeIndex.value % LAB_NAV.length])

function resolveTheme(): GlassTheme {
  const base = props.theme === 'dusk' ? DUSK : props.theme === 'paper' ? PAPER : props.theme
  return props.ground !== undefined ? { ...base, ground: props.ground } : base
}

onMounted(() => {
  if (!canvas.value) return
  stage = createGlassStage({
    canvas: canvas.value,
    layout: props.layout,
    theme: resolveTheme(),
    items: LAB_NAV,
    count: props.count,
    onActive: (i) => { activeIndex.value = i; emit('active', i) },
    onPick: (href) => router.push(href)
  })
  stage.onReady(() => emit('ready'))
})
onBeforeUnmount(() => { stage?.dispose(); stage = null })

defineExpose({ go: (d: number) => stage?.go(d), active })
</script>

<template>
  <div class="gs">
    <canvas ref="canvas" class="gs__cv" />
    <!-- Chrome is supplied per-design so all twelve share optics but not looks -->
    <slot :active="active" :index="activeIndex" :go="(d: number) => stage?.go(d)" />
  </div>
</template>

<style scoped>
.gs { position: fixed; inset: 0; overflow: hidden; }
.gs__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; cursor: grab; }
.gs__cv:active { cursor: grabbing; }
</style>

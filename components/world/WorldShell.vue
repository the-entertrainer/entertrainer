<script setup lang="ts">
import type { AnchorId } from '~/composables/world/anchors'
import { ANCHORS, anchorById } from '~/composables/world/anchors'
import { tierLabel } from '~/composables/world/tierBudget'
import type { WorldHandle } from '~/composables/world/mountWorld'
import {
  WORLD_ARRIVAL,
  WORLD_ZONE_LINKS,
  bindWorldNavigation,
  isWorldAnchorId,
  routeFor,
} from '~/composables/world/worldRoutes'
import { useWorldTierStore } from '~/composables/world/worldTier'
import WorldFallbackPoster from './WorldFallbackPoster.vue'
import WorldMapSheet from './WorldMapSheet.vue'

const GYRO_KEY = 'satya-gyro'
const route = useRoute()
const store = useWorldTierStore()

const hostEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const mapRef = ref<{ root: HTMLElement | null } | null>(null)
const sheetRef = ref<{ root: HTMLElement | null } | null>(null)

const zone = ref<AnchorId>('nexus')
const statusText = ref(WORLD_ARRIVAL.nexus)
const reading = ref<AnchorId | null>(null)
const mapOpen = ref(false)
const mapCursor = ref<AnchorId>('nexus')
const ready = ref(false)
const context = ref<'ok' | 'lost' | 'restored'>('ok')
const gyroState = ref<'hidden' | 'ask' | 'on' | 'off' | 'denied'>('hidden')
const triangles = ref(0)
const calls = ref(0)
const points = ref(0)
const dpr = ref(1)

const hidden = ref(false)
const offscreen = ref(false)
const size = { w: 0, h: 0 }

let handle: WorldHandle | null = null
let mountToken = 0
let acceptTierWatch = false
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let dragging = false
let lastX = 0
let lastY = 0
let returnFocus: HTMLElement | null = null
let pendingReading = false
let unbindNav: (() => void) | null = null
let exitGen = 0

const readingAnchor = computed(() => (reading.value ? anchorById(reading.value) : null))
const zoneAnchor = computed(() => anchorById(zone.value))
const description = computed(() => {
  const place = zoneAnchor.value.label
  return `Satya Space, an orbital archive. You are at ${place}. Drag to look around, or open the map and choose a place. Choosing one opens a reading sheet. Tier ${store.tier}, ${tierLabel(store.tier)}.`
})
const showGyro = computed(() => gyroState.value === 'ask' && store.tier >= 2 && !store.reducedMotion)

const travelLinks = WORLD_ZONE_LINKS.filter((link) => link.id !== 'nexus')

function publishMeasure() {
  if (route.query.measure !== '1') return
  const target = window as unknown as { __satya?: Record<string, unknown> }
  let ext: WEBGL_lose_context | null = null
  target.__satya = {
    get tier() { return store.tier },
    get fps() { return store.fps },
    get calls() { return calls.value },
    get triangles() { return triangles.value },
    get points() { return points.value },
    get dpr() { return dpr.value },
    lose() {
      const canvas = canvasEl.value
      const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl')
      ext = gl?.getExtension('WEBGL_lose_context') ?? null
      ext?.loseContext()
    },
    restore() {
      ext?.restoreContext()
    },
  }
}

function waitForContextLoss(canvas: HTMLCanvasElement): Promise<void> {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (!gl || gl.isContextLost()) return Promise.resolve()
  return new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      canvas.removeEventListener('webglcontextlost', done)
      resolve()
    }
    canvas.addEventListener('webglcontextlost', done)
    window.setTimeout(done, 120)
  })
}

async function syncEngine() {
  const token = ++mountToken
  const previous = handle
  handle = null
  const canvas = canvasEl.value
  previous?.dispose(true)
  if (previous && canvas) await waitForContextLoss(canvas)
  if (token !== mountToken) return
  store.setLoop('idle')
  if (store.tier === 0) {
    ready.value = true
    if (context.value !== 'lost') context.value = 'ok'
    return
  }
  await nextTick()
  if (token !== mountToken || store.tier === 0 || !canvasEl.value) return
  const tier = store.tier
  if (tier !== 1 && tier !== 2 && tier !== 3) return
  try {
    const { mountWorld } = await import('~/composables/world/mountWorld')
    if (token !== mountToken || store.tier === 0 || !canvasEl.value) return
    const width = size.w || window.innerWidth
    const height = size.h || window.innerHeight
    handle = mountWorld({
      canvas: canvasEl.value,
      tier,
      motionOk: !store.reducedMotion,
      probe: store.override === null && store.probing,
      width,
      height,
      onArrive: (id) => {
        zone.value = id
        statusText.value = WORLD_ARRIVAL[id]
        if (pendingReading && id !== 'nexus') reading.value = id
        pendingReading = false
      },
      onProbe: (fps) => store.applyProbe(fps),
      onContextLost: () => {
        dropToPoster()
      },
      onContextRestored: () => {
        /* Context loss stays on the poster. Do not bring GL back. */
      },
      onStats: (stats) => {
        triangles.value = stats.triangles
        calls.value = stats.calls
        points.value = stats.points
        dpr.value = stats.dpr
        ready.value = true
        publishMeasure()
      },
    })
    const paused = hidden.value || offscreen.value || reading.value !== null
    handle.setPaused(paused)
    store.setLoop(paused ? 'paused' : 'running')
    context.value = 'ok'
    publishMeasure()
  } catch (error) {
    console.warn('[satya] WebGL failed, using the static poster', error)
    if (token === mountToken) {
      store.forceStatic('WebGL failed')
      ready.value = true
    }
  }
}

function dropToPoster() {
  context.value = 'lost'
  mountToken += 1
  const current = handle
  handle = null
  current?.dispose(true)
  store.setLoop('paused')
  store.forceStatic('context lost')
  const anchor = zone.value
  nextTick(() => {
    hostEl.value?.querySelector<HTMLElement>(`[data-zone-link="${anchor}"]`)?.focus()
  })
}

function focusControl(id: AnchorId) {
  const el = hostEl.value?.querySelector<HTMLElement>(
    `[data-zone-control="${id}"], [data-zone-link="${id}"]`,
  )
  el?.focus()
}

async function focusDestinationHeading() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await nextTick()
    const headings = [...document.querySelectorAll('h1')]
    const heading = headings.find((el) => !el.closest('.world-shell'))
    if (heading instanceof HTMLElement) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
      return
    }
    await new Promise((resolve) => window.setTimeout(resolve, 40))
  }
}

/** Camera only. Does not change the route. */
async function lookAt(id: AnchorId) {
  mapOpen.value = false
  statusText.value = store.reducedMotion || store.tier === 0 ? WORLD_ARRIVAL[id] : statusText.value
  if (!handle || store.tier === 0) {
    zone.value = id
    statusText.value = WORLD_ARRIVAL[id]
    await nextTick()
    focusControl(id)
    return
  }
  const arrived = await handle.travel(id)
  if (!arrived) return
  await nextTick()
  focusControl(id)
}

/**
 * Flight (or a cut, when motion is reduced or the tier is 0), then the route.
 * Nexus stays on `/` and focuses the motto.
 */
async function openAnchor(id: AnchorId) {
  const gen = ++exitGen
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  mapOpen.value = false
  if (store.reducedMotion || store.tier === 0) statusText.value = WORLD_ARRIVAL[id]
  if (id === 'nexus') {
    await lookAt('nexus')
    hostEl.value?.querySelector<HTMLElement>('#nexus-motto')?.focus()
    return
  }
  if (handle && store.tier > 0) {
    const arrived = await handle.travel(id)
    if (!arrived || gen !== exitGen) return
  } else {
    zone.value = id
    statusText.value = WORLD_ARRIVAL[id]
  }
  if (gen !== exitGen) return
  const nuxtApp = useNuxtApp()
  await new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.requestAnimationFrame(() => {
        void focusDestinationHeading().then(resolve)
      })
    }
    const remove = nuxtApp.hook('page:finish', () => {
      if (typeof remove === 'function') remove()
      finish()
    })
    void navigateTo(routeFor(id)).then(() => {
      window.setTimeout(finish, 60)
    })
  })
}

function closeReading() {
  reading.value = null
  pendingReading = false
  nextTick(() => returnFocus?.focus())
}

function openMap() {
  mapCursor.value = zone.value
  mapOpen.value = true
  nextTick(() => {
    mapRef.value?.root?.querySelector<HTMLElement>('#satya-map-title')?.focus()
  })
}

function onSelect(id: AnchorId) {
  mapCursor.value = id
  void lookAt(id)
}

function dismissGyro() {
  gyroState.value = 'off'
  try { sessionStorage.setItem(GYRO_KEY, 'off') } catch { /* private mode */ }
}

async function enableGyro() {
  const Doe = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  try {
    if (typeof Doe !== 'undefined' && typeof Doe.requestPermission === 'function') {
      const result = await Doe.requestPermission()
      if (result !== 'granted') {
        gyroState.value = 'denied'
        return
      }
    }
    window.addEventListener('deviceorientation', onOrient, { passive: true })
    gyroState.value = 'on'
    try { sessionStorage.setItem(GYRO_KEY, 'on') } catch { /* private mode */ }
  } catch {
    gyroState.value = 'denied'
  }
}

function onOrient(event: DeviceOrientationEvent) {
  handle?.setGyro(event.beta, event.gamma)
}

function offerGyro() {
  if (store.tier < 2 || store.reducedMotion) {
    gyroState.value = 'hidden'
    return
  }
  const hasEvent = typeof window.DeviceOrientationEvent !== 'undefined'
  if (!hasEvent) {
    gyroState.value = 'hidden'
    return
  }
  const needsPrompt = typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function'
    || window.matchMedia('(pointer: coarse)').matches
  if (!needsPrompt) {
    gyroState.value = 'hidden'
    return
  }
  let saved = ''
  try { saved = sessionStorage.getItem(GYRO_KEY) || '' } catch { /* private mode */ }
  if (saved === 'off') {
    gyroState.value = 'off'
    return
  }
  if (saved === 'on') {
    window.addEventListener('deviceorientation', onOrient, { passive: true })
    gyroState.value = 'on'
    return
  }
  gyroState.value = 'ask'
}

function trap(event: KeyboardEvent, root: HTMLElement | null | undefined) {
  if (event.key !== 'Tab' || !root) return
  const nodes = [...root.querySelectorAll<HTMLElement>('button, a[href]')]
    .filter((el) => !el.hasAttribute('disabled'))
  if (nodes.length < 2) return
  const first = nodes[0]!
  const last = nodes[nodes.length - 1]!
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKey(event: KeyboardEvent) {
  if (document.documentElement.classList.contains('settings-panel-open')) return
  const target = event.target
  if (target instanceof HTMLElement && target.closest('input, textarea')) return

  if (event.key === 'Escape') {
    if (reading.value) {
      event.preventDefault()
      closeReading()
      return
    }
    if (mapOpen.value) {
      event.preventDefault()
      mapOpen.value = false
    }
    return
  }

  if (reading.value) {
    trap(event, sheetRef.value?.root)
    return
  }
  if (mapOpen.value) {
    trap(event, mapRef.value?.root)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const ids = ANCHORS.map((anchor) => anchor.id)
      const index = Math.max(0, ids.indexOf(mapCursor.value))
      const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
      const next = ids[(index + step + ids.length) % ids.length]!
      mapCursor.value = next
      mapRef.value?.root?.querySelector<HTMLElement>(`[data-anchor="${next}"]`)?.focus()
    }
    return
  }

  if (
    (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'ArrowUp')
    && target instanceof HTMLElement
    && target.closest('#zones')
  ) {
    event.preventDefault()
    const ids = WORLD_ZONE_LINKS.map((link) => link.id)
    const index = Math.max(0, ids.indexOf(zone.value))
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
    const next = ids[(index + step + ids.length) % ids.length]!
    void lookAt(next)
    return
  }

  if (event.key === 'm' || event.key === 'M') {
    event.preventDefault()
    if (mapOpen.value) mapOpen.value = false
    else openMap()
  }
}

function onDown(event: PointerEvent) {
  if (reading.value || mapOpen.value || store.tier === 0) return
  dragging = true
  lastX = event.clientX
  lastY = event.clientY
  canvasEl.value?.setPointerCapture(event.pointerId)
}

function onMove(event: PointerEvent) {
  if (store.tier === 0 || !handle) return
  const width = size.w || window.innerWidth
  const height = size.h || window.innerHeight
  if (dragging) {
    handle.pointer(event.clientX - lastX, event.clientY - lastY, true, 0, 0)
    lastX = event.clientX
    lastY = event.clientY
    return
  }
  if (event.pointerType !== 'mouse') return
  const nx = (event.clientX / width - 0.5) * 2
  const ny = (event.clientY / height - 0.5) * 2
  handle.pointer(0, 0, false, nx, -ny)
}

function onUp() {
  if (!dragging) return
  dragging = false
  handle?.pointerUp()
}

function onVisibility() {
  hidden.value = document.hidden
}

watch(() => store.tier, () => {
  if (!acceptTierWatch) return
  void syncEngine()
})

watch(() => store.reducedMotion, (reduced) => {
  handle?.setMotionOk(!reduced)
  if (reduced) {
    window.removeEventListener('deviceorientation', onOrient)
    handle?.clearGyro()
    gyroState.value = 'hidden'
    return
  }
  offerGyro()
})

watch([hidden, offscreen, reading], () => {
  const paused = hidden.value || offscreen.value || reading.value !== null
  handle?.setPaused(paused)
  if (handle) store.setLoop(paused ? 'paused' : 'running')
})

onMounted(async () => {
  store.bindMotion()
  size.w = window.innerWidth
  size.h = window.innerHeight
  resizeObserver = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect
    if (!rect || rect.width < 2 || rect.height < 2) return
    size.w = rect.width
    size.h = rect.height
    handle?.resize(rect.width, rect.height)
  })
  if (hostEl.value) {
    resizeObserver.observe(hostEl.value)
    intersectionObserver = new IntersectionObserver((entries) => {
      offscreen.value = entries[0] ? !entries[0].isIntersecting : false
    }, { threshold: 0.01 })
    intersectionObserver.observe(hostEl.value)
  }
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  hidden.value = document.hidden
  store.init(route.query.tier)
  offerGyro()
  acceptTierWatch = true
  unbindNav = bindWorldNavigation({
    travelTo: (id) => { void lookAt(id) },
    enterReading: (id) => openAnchor(id),
  })
  await syncEngine()
  const at = Array.isArray(route.query.at) ? route.query.at[0] : route.query.at
  if (isWorldAnchorId(at)) void lookAt(at)
  publishMeasure()
})

onBeforeUnmount(() => {
  mountToken += 1
  handle?.dispose(true)
  handle = null
  unbindNav?.()
  unbindNav = null
  store.unbindMotion()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
  window.removeEventListener('deviceorientation', onOrient)
  const target = window as unknown as { __satya?: unknown }
  delete target.__satya
})
</script>

<template>
  <div
    ref="hostEl"
    class="stage world-shell"
    :data-tier="store.tier"
    :data-ready="ready ? 'true' : 'false'"
    :data-zone="zone"
    :data-reading="reading || ''"
    :data-loop="store.loop"
    :data-gyro="gyroState"
    :data-context="context"
    :data-reduced="store.reducedMotion ? 'true' : 'false'"
    :data-calls="calls"
    :data-triangles="triangles"
    :data-points="points"
    :data-dpr="dpr"
    :data-fps="store.fps ?? ''"
    :data-reason="store.reason"
  >
    <canvas
      v-show="store.tier > 0"
      ref="canvasEl"
      class="stage__canvas"
      role="img"
      aria-labelledby="world-canvas-label"
      @pointerdown="onDown"
      @pointermove="onMove"
    />
    <WorldFallbackPoster
      v-if="store.tier === 0"
      :failed="context === 'lost' || store.reason === 'WebGL failed'"
      :tier-label="`Tier ${store.tier} · ${tierLabel(store.tier)}`"
    />
    <p id="world-canvas-label" class="sr">{{ description }}</p>

    <a class="skip" href="#zones">Skip to zones</a>

    <div class="hud">
      <header class="hero">
        <p class="eyebrow">Satya Space</p>
        <h1 id="nexus-motto" tabindex="-1">Truth alone triumphs.</h1>
        <p class="attr">Mundaka Upanishad</p>
      </header>

      <div v-if="store.tier > 0" class="dock">
        <nav id="zones" class="zones" aria-label="Zones">
          <button type="button" data-zone-control="nexus" :aria-current="zone === 'nexus' ? 'true' : undefined" @click="openAnchor('nexus')">
            Nexus
          </button>
          <button
            v-for="link in travelLinks"
            :key="link.id"
            type="button"
            :data-zone-control="link.id"
            :aria-current="zone === link.id ? 'true' : undefined"
            @click="openAnchor(link.id)"
          >
            {{ link.label }}
          </button>
          <button type="button" @click="openMap">Map</button>
        </nav>
        <p class="meta">
          Tier {{ store.tier }} · {{ tierLabel(store.tier) }}
          <span v-if="store.fps !== null"> · {{ Math.round(store.fps) }} fps</span>
        </p>
        <button
          v-if="store.flagship && store.override === null"
          type="button"
          class="quality"
          @click="store.setQualityHigh(!store.qualityHigh)"
        >
          {{ store.qualityHigh ? 'Quality: High' : 'Quality: Standard' }}
        </button>
      </div>
    </div>

    <div v-if="showGyro" class="gyro" role="region" aria-label="Motion">
      <p>Use motion to look around?</p>
      <button type="button" @click="dismissGyro">Not now</button>
      <button type="button" @click="enableGyro">Enable</button>
    </div>
    <p v-else-if="gyroState === 'denied'" class="gyro gyro--note">Motion stayed off.</p>
    <p id="world-status" class="live" aria-live="polite" aria-atomic="true">{{ statusText }}</p>

    <WorldMapSheet
      ref="mapRef"
      :open="mapOpen"
      :current="mapCursor"
      @close="mapOpen = false"
      @select="onSelect"
    />
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  height: calc(100dvh - var(--nav-h, 0px));
  min-height: 560px;
  background: #07070A;
  color: #E8E4DC;
  overflow: hidden;
  touch-action: none;
  font-family: var(--font-ui), "Archivo", "Helvetica Neue", sans-serif;
  font-size: 16px;
}

.stage__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}

.sr,
.live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip {
  position: absolute;
  left: 12px;
  top: -48px;
  z-index: 6;
  background: #F7F1E4;
  color: #0B0B0C;
  padding: 10px 12px;
}

.skip:focus {
  top: 12px;
}

.hud {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: max(16px, env(safe-area-inset-top)) 16px max(14px, env(safe-area-inset-bottom));
  pointer-events: none;
}

.hero h1 {
  margin: 0;
  max-width: 12ch;
  font-family: var(--font-display), Georgia, serif;
  font-weight: 560;
  font-size: clamp(34px, 6vw, 72px);
  line-height: 0.92;
  letter-spacing: -0.035em;
  color: #F7F1E4;
}

.eyebrow,
.attr,
.meta {
  font-family: var(--font-mono), ui-monospace, monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 11px;
  color: #7A9AE8;
}

.eyebrow { margin: 0 0 8px; }
.attr { margin: 10px 0 0; text-transform: none; letter-spacing: 0.04em; color: #E8E4DC; }

.dock { pointer-events: auto; display: grid; gap: 8px; justify-items: start; }

.zones,
.docks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.zones button,
.docks button,
.quality,
.gyro button {
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid rgb(232 228 220 / 0.35);
  background: rgb(7 7 10 / 0.55);
  color: #E8E4DC;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
}

.zones button[aria-current="true"],
.docks button[aria-current="true"] {
  background: #2F5BD8;
  border-color: #2F5BD8;
  color: #F7F1E4;
}

.docks button { font-size: 13px; color: #7A9AE8; }

.meta { margin: 4px 0 0; pointer-events: none; }

.quality { margin-top: 4px; }

.zones button:focus-visible,
.docks button:focus-visible,
.quality:focus-visible,
.gyro button:focus-visible,
.skip:focus-visible {
  outline: 3px solid #7A9AE8;
  outline-offset: 3px;
}

.gyro {
  position: absolute;
  z-index: 3;
  left: 16px;
  top: 196px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: min(440px, calc(100% - 32px));
  pointer-events: auto;
}

.gyro p {
  margin: 0;
  flex: 1 1 180px;
  font-size: 15px;
}

.gyro--note {
  color: #7A9AE8;
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
}

@media (max-width: 720px) {
  .hero h1 { font-size: 36px; }
  .gyro { top: 158px; }
}
</style>

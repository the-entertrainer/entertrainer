import { defineStore } from 'pinia'
import {
  classifyTier,
  isSoftwareRenderer,
  parseTierQuery,
  type TierDecision,
  type TierSignals,
  type WorldTier,
} from '~/composables/world/classifyTier'

export type { WorldTier, TierSignals }

let motionQuery: MediaQueryList | null = null
let motionListener: ((event: MediaQueryListEvent) => void) | null = null
let attrObserver: MutationObserver | null = null

function readReducedMotion(): boolean {
  if (!import.meta.client) return false
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const attr = document.documentElement.dataset.reduceMotion
  return media || attr === 'on' || attr === '1'
}

function readSignals(reducedMotion: boolean, qualityHigh: boolean): TierSignals {
  const webgl = detectWebGL()
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const cores = navigator.hardwareConcurrency
  const shortSide = Math.min(window.innerWidth, window.innerHeight)
  return {
    reducedMotion,
    webgl: webgl.webgl,
    saveData: Boolean(connection?.saveData),
    softwareGl: webgl.software,
    deviceMemory: typeof memory === 'number' ? memory : null,
    cores: typeof cores === 'number' && cores > 0 ? cores : null,
    coarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    shortSide,
    dpr: window.devicePixelRatio || 1,
    renderer: webgl.renderer,
    vendor: webgl.vendor,
    qualityHigh,
  }
}

function detectWebGL(): { webgl: boolean, renderer: string, vendor: string, software: boolean } {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return { webgl: false, renderer: '', vendor: '', software: false }
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    let renderer = ''
    let vendor = ''
    if (ext) {
      renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '')
      vendor = String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '')
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return {
      webgl: true,
      renderer,
      vendor,
      software: isSoftwareRenderer(renderer),
    }
  } catch {
    return { webgl: false, renderer: '', vendor: '', software: false }
  }
}

/**
 * Tier for /lab/world. Detection runs on the client. `?tier=0|1|2|3` wins
 * over detection so a software-GL laptop can still be screenshotted at
 * every tier. The FPS probe may lower the tier one step at a time when
 * there is no query override.
 */
export const useWorldTierStore = defineStore('worldTier', {
  state: () => ({
    tier: 0 as WorldTier,
    detected: 0 as WorldTier,
    override: null as WorldTier | null,
    qualityHigh: false,
    reducedMotion: false,
    probing: false,
    fps: null as number | null,
    reason: 'pending',
    flagship: false,
    signals: null as TierSignals | null,
    loop: 'idle' as 'idle' | 'running' | 'paused',
  }),

  actions: {
    init(query: unknown) {
      this.reducedMotion = readReducedMotion()
      this.signals = readSignals(this.reducedMotion, this.qualityHigh)
      const decision = classifyTier(this.signals)
      this.detected = decision.tier
      this.flagship = decision.flagship
      const override = parseTierQuery(query)
      this.override = override
      if (override !== null) {
        this.tier = override
        this.reason = 'query override'
        this.probing = false
        return
      }
      this.applyDecision(decision)
      this.probing = this.tier > 0
    },

    bindMotion() {
      if (!import.meta.client || motionQuery) return
      motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      motionListener = () => this.refreshMotion()
      motionQuery.addEventListener?.('change', motionListener)
      attrObserver = new MutationObserver(() => this.refreshMotion())
      attrObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] })
    },

    unbindMotion() {
      if (motionQuery && motionListener) {
        motionQuery.removeEventListener?.('change', motionListener)
      }
      motionQuery = null
      motionListener = null
      attrObserver?.disconnect()
      attrObserver = null
    },

    refreshMotion() {
      const reduced = readReducedMotion()
      if (reduced === this.reducedMotion) return
      this.reducedMotion = reduced
      if (!this.signals) return
      this.signals = { ...this.signals, reducedMotion: reduced }
      const decision = classifyTier(this.signals)
      this.detected = decision.tier
      this.flagship = decision.flagship
      if (this.override !== null) return
      this.applyDecision(decision)
      this.probing = this.tier > 0
      this.fps = null
    },

    setQualityHigh(on: boolean) {
      this.qualityHigh = on
      if (!this.signals) return
      this.signals = { ...this.signals, qualityHigh: on }
      const decision = classifyTier(this.signals)
      this.detected = decision.tier
      this.flagship = decision.flagship
      if (this.override !== null) return
      this.applyDecision(decision)
      this.probing = this.tier > 0
      this.fps = null
    },

    /**
     * Spec: average under 28 fps across the probe window drops a tier.
     * One drop per completed probe. The scene remounts and probes again,
     * so a machine that cannot hold Tier 1 falls through to the poster.
     */
    applyProbe(avgFps: number) {
      this.fps = avgFps
      this.probing = false
      if (this.override !== null) return
      if (avgFps >= 28 || this.tier <= 0) return
      this.tier = (this.tier - 1) as WorldTier
      this.reason = `fps probe ${avgFps.toFixed(1)} < 28`
      this.probing = this.tier > 0
    },

    forceStatic(reason: string) {
      this.tier = 0
      this.reason = reason
      this.probing = false
    },

    setLoop(loop: 'idle' | 'running' | 'paused') {
      this.loop = loop
    },

    applyDecision(decision: TierDecision) {
      this.tier = decision.tier
      this.reason = decision.reason
      this.flagship = decision.flagship
    },
  },
})

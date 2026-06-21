<script setup lang="ts">
import gsap from 'gsap'
import { useThemeStore } from '~/stores/theme'
import {
  SCENES, CONVERGE_WORDS, GRAPH_NODES, GRAPH_EDGES, GLITCH_WORDS, CTA,
} from '~/experience/about/narrative'
import type { Scene } from '~/experience/about/narrative'

definePageMeta({ pageTransition: false })

useHead({
  title: 'About — Field Notes on Learning',
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap' },
  ],
})

const themeStore = useThemeStore()

const atmosRef   = ref<HTMLCanvasElement | null>(null)
const sceneRefs  = ref<(HTMLElement | null)[]>([])
const cleanups: Array<() => void> = []

const isAnimating = ref(false)
const progress    = ref(0)
let   currentTl: gsap.core.Timeline | null = null

type GifEntry = { id: string; url: string; width: number; height: number; title: string }
const manifest = ref<Record<string, GifEntry[]>>({})

function gifUrl(sceneId: number, index = 0): string | null {
  return manifest.value[String(sceneId)]?.[index]?.url ?? null
}
function allGifUrls(ids: number[]): string[] {
  return ids.flatMap(id => (manifest.value[String(id)] ?? []).map(g => g.url))
}

// Per-scene atmosphere targets
const ATMOS: Record<number, { i: number; x: number; y: number }> = {
  1:  { i: 0.1, x: 0.5, y: 0.5 },  2:  { i: 0.5, x: 0.7, y: 0.4 },
  3:  { i: 0.4, x: 0.6, y: 0.6 },  4:  { i: 0.6, x: 0.5, y: 0.5 },
  5:  { i: 0.7, x: 0.5, y: 0.5 },  6:  { i: 0.5, x: 0.65, y: 0.4 },
  7:  { i: 0.8, x: 0.5, y: 0.5 },  8:  { i: 0.5, x: 0.4, y: 0.3 },
  9:  { i: 0.5, x: 0.55, y: 0.55 }, 10: { i: 0.6, x: 0.5, y: 0.45 },
  11: { i: 1.0, x: 0.5, y: 0.5 },  12: { i: 0.4, x: 0.5, y: 0.5 },
  13: { i: 0.5, x: 0.4, y: 0.5 },  14: { i: 0.7, x: 0.5, y: 0.55 },
  15: { i: 0.6, x: 0.5, y: 0.5 },  16: { i: 0.4, x: 0.5, y: 0.5 },
  17: { i: 0.3, x: 0.5, y: 0.45 }, 18: { i: 0.5, x: 0.45, y: 0.5 },
  19: { i: 0.4, x: 0.5, y: 0.5 },  20: { i: 0.6, x: 0.5, y: 0.5 },
  21: { i: 0.3, x: 0.5, y: 0.4 },  22: { i: 0.9, x: 0.5, y: 0.5 },
  23: { i: 0.7, x: 0.5, y: 0.5 },  24: { i: 0.5, x: 0.5, y: 0.45 },
  25: { i: 0.8, x: 0.5, y: 0.5 },
}

function toneClass(t?: string) { return `t-${t ?? 'md'}` }

// ── Canvas: word convergence (Scene 05) ──────────────────────────────────────
function runConverge(canvas: HTMLCanvasElement, isDark: boolean) {
  const W = canvas.offsetWidth, H = canvas.offsetHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = W * dpr; canvas.height = H * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const words = CONVERGE_WORDS
  const TOTAL = 210
  // Start positions spread across screen, target = center
  const items = words.map((w, i) => {
    const angle = (i / words.length) * Math.PI * 2
    const r = Math.max(W, H) * 0.45
    return {
      word: w,
      sx: W / 2 + Math.cos(angle) * r,
      sy: H / 2 + Math.sin(angle) * r,
      tx: W / 2 + (Math.random() - 0.5) * 40,
      ty: H / 2 + (Math.random() - 0.5) * 40,
    }
  })

  let f = 0
  const loop = () => {
    ctx.clearRect(0, 0, W, H)
    const p = Math.min(f / TOTAL, 1)
    const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2

    items.forEach(({ word, sx, sy, tx, ty }, idx) => {
      const wordDelay = idx * 0.04
      const localP = Math.max(0, Math.min((p - wordDelay) / (1 - wordDelay), 1))
      const x = sx + (tx - sx) * localP
      const y = sy + (ty - sy) * localP
      const alpha = Math.min(localP * 3, 1) * (1 - ease * 0.6)
      ctx.globalAlpha = alpha
      ctx.fillStyle = isDark ? '#FAFAF8' : '#111111'
      ctx.font = `600 ${Math.round(22 + (1 - localP) * 18)}px "DM Sans", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(word, x, y)
    })

    // L&D. reveal at center
    if (p > 0.82) {
      const a = Math.min((p - 0.82) / 0.18, 1)
      ctx.globalAlpha = a
      ctx.fillStyle = '#243F6A'
      ctx.font = `800 ${Math.round(W * 0.10)}px "DM Sans", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('L&D.', W / 2, H / 2)
    }
    ctx.globalAlpha = 1

    f++
    if (f < TOTAL + 80) requestAnimationFrame(loop)
  }
  loop()
}

// ── Canvas: knowledge graph (Scene 07) ───────────────────────────────────────
function runNodeGraph(canvas: HTMLCanvasElement, isDark: boolean) {
  const W = canvas.offsetWidth, H = canvas.offsetHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = W * dpr; canvas.height = H * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const nodes = GRAPH_NODES.map(n => ({ ...n, px: n.x * W, py: n.y * H }))
  const NODE_FRAMES = nodes.map((_, i) => i * 14 + 10)
  const EDGE_START = 50
  const EDGE_DUR = 40
  const TOTAL = 300

  let f = 0
  const nodeColor = isDark ? '#FAFAF8' : '#111111'
  const lineColor = isDark ? 'rgba(36,63,106,0.55)' : 'rgba(36,63,106,0.45)'
  const dotColor = '#243F6A'

  const loop = () => {
    ctx.clearRect(0, 0, W, H)

    // Edges
    GRAPH_EDGES.forEach(([ai, bi]) => {
      const ef = Math.max(0, f - EDGE_START)
      const ep = Math.min(ef / EDGE_DUR, 1)
      if (ep <= 0) return
      const a = nodes[ai], b = nodes[bi]
      ctx.beginPath()
      ctx.moveTo(a.px, a.py)
      ctx.lineTo(a.px + (b.px - a.px) * ep, a.py + (b.py - a.py) * ep)
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // Nodes
    nodes.forEach((node, i) => {
      const np = Math.min((f - NODE_FRAMES[i]) / 20, 1)
      if (np <= 0) return
      ctx.beginPath()
      ctx.arc(node.px, node.py, 5 * np, 0, Math.PI * 2)
      ctx.fillStyle = dotColor
      ctx.globalAlpha = np
      ctx.fill()
      if (np > 0.5) {
        ctx.globalAlpha = (np - 0.5) * 2
        ctx.fillStyle = nodeColor
        ctx.font = `500 13px "DM Sans", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(node.label, node.px, node.py - 8)
      }
      ctx.globalAlpha = 1
    })

    f++
    if (f < TOTAL) requestAnimationFrame(loop)
  }
  loop()
}

// ── Glitch scene (Scene 11) ────────────────────────────────────────────────
function playGlitch(el: HTMLElement) {
  el.classList.remove('is-clarity')
  el.classList.add('is-glitching')
  setTimeout(() => {
    el.classList.remove('is-glitching')
    el.classList.add('is-clarity')
  }, 2600)
}

// ── Beat helpers ──────────────────────────────────────────────────────────
const ENTER = (tone: string) => {
  const map: Record<string, any> = {
    sm:   { yPercent: 16, scale: 0.99, opacity: 0, filter: 'blur(4px)',  dur: 0.28, hold: 0.40, stagger: 0.010 },
    md:   { yPercent: 20, scale: 0.98, opacity: 0, filter: 'blur(6px)',  dur: 0.36, hold: 0.52, stagger: 0.014 },
    lg:   { yPercent: 24, scale: 0.97, opacity: 0, filter: 'blur(8px)',  dur: 0.44, hold: 0.62, stagger: 0.018 },
    xl:   { yPercent: 20, scale: 0.95, opacity: 0, filter: 'blur(10px)', dur: 0.54, hold: 0.76, stagger: 0.015 },
    hero: { yPercent: 12, scale: 0.90, opacity: 0, filter: 'blur(22px)', dur: 0.70, hold: 1.00, stagger: 0.008 },
    deva: { yPercent: 18, scale: 0.96, opacity: 0, filter: 'blur(10px)', dur: 0.62, hold: 0.88, stagger: 0.022 },
    sig:  { yPercent: 10, scale: 0.99, opacity: 0, filter: 'blur(4px)',  dur: 0.38, hold: 0.56, stagger: 0.028 },
  }
  return map[tone] ?? map.md
}
const REST = { yPercent: 0, scale: 1, opacity: 1, filter: 'blur(0px)', transformOrigin: '50% 80%' }
const EXIT = (tone: string, chars: HTMLElement[]) => {
  const map: Record<string, any> = {
    sm: { yPercent: -7, scale: 1.005, opacity: 0, filter: 'blur(3px)', dur: 0.20, stagger: 0.008 },
    md: { yPercent: -9, scale: 1.008, opacity: 0, filter: 'blur(3px)', dur: 0.24, stagger: 0.010 },
    lg: { yPercent: -11, scale: 1.010, opacity: 0, filter: 'blur(4px)', dur: 0.28, stagger: 0.012 },
    xl: { yPercent: -8, scale: 1.015, opacity: 0, filter: 'blur(5px)', dur: 0.32, stagger: 0.010 },
    hero: { yPercent: -4, scale: 1.025, opacity: 0, filter: 'blur(8px)', dur: 0.38, stagger: 0.006 },
    deva: { yPercent: -8, scale: 1.010, opacity: 0, filter: 'blur(5px)', dur: 0.34, stagger: 0.015 },
    sig:  { yPercent: -5, scale: 1.005, opacity: 0, filter: 'blur(2px)', dur: 0.24, stagger: 0.018 },
  }
  return map[tone] ?? map.md
}

function buildBeatSequence(
  tl: gsap.core.Timeline,
  splits: Array<{ chars: HTMLElement[]; tone: string }>,
  isLast: (i: number) => boolean = (i) => i === splits.length - 1,
) {
  splits.forEach((s, i) => {
    const e = ENTER(s.tone)
    gsap.set(s.chars, { ...e, transformOrigin: '50% 80%' })
    tl.to(s.chars, { ...REST, duration: e.dur, ease: 'power2.out', stagger: { each: e.stagger, from: 'start' } }, i === 0 ? 0 : '>')
    tl.to({}, { duration: e.hold }, '>')
    if (!isLast(i)) {
      const ex = EXIT(s.tone, s.chars)
      tl.to(s.chars, { yPercent: ex.yPercent, scale: ex.scale, opacity: 0, filter: ex.filter, duration: ex.dur, ease: 'power2.in', stagger: { each: ex.stagger, from: 'end' } }, '>')
    }
  })
}

function advanceToScene(idx: number) {
  const next = sceneRefs.value[idx]
  if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onScrollAttempt(e: WheelEvent | TouchEvent) {
  if (!isAnimating.value) return
  e.preventDefault()
  e.stopPropagation()
  if (currentTl?.isActive()) {
    currentTl.timeScale(Math.min((currentTl.timeScale() || 1) + 2, 10))
  }
}

onMounted(async () => {
  document.documentElement.setAttribute('data-about', '')
  isAnimating.value = true  // lock immediately; first scene IO releases once it plays

  // Hand scroll control back to the browser so CSS scroll-snap works.
  // data-lenis-prevent on .fn makes Lenis skip preventDefault, allowing
  // native scroll. We add our OWN passive:false listeners that block scroll
  // during animations and accelerate the current GSAP timeline instead.
  document.documentElement.style.overflowY = 'scroll'
  document.documentElement.style.scrollSnapType = 'y mandatory'
  document.documentElement.style.scrollBehavior = 'smooth'

  window.addEventListener('wheel',     onScrollAttempt as EventListener, { passive: false })
  window.addEventListener('touchmove', onScrollAttempt as EventListener, { passive: false })

  await nextTick()

  // Load GIF manifest
  try {
    const data = await $fetch<Record<string, GifEntry[]>>('/about/gifs/manifest.json', { responseType: 'json' })
    if (data) manifest.value = data
  } catch {}

  await nextTick()

  // Atmosphere canvas
  const { Atmosphere } = await import('~/experience/about/atmosphere')
  let atmos: InstanceType<typeof Atmosphere> | null = null
  if (atmosRef.value) {
    atmos = new Atmosphere(atmosRef.value, { dark: themeStore.isDark })
    atmos.start()
    const onResize = () => atmos?.resize()
    window.addEventListener('resize', onResize)
    const stopTheme = watch(() => themeStore.isDark, d => atmos?.setDark(d))
    cleanups.push(() => { window.removeEventListener('resize', onResize); atmos?.dispose() })
    cleanups.push(stopTheme)
  }

  const [SplitTypeModule, rnModule] = await Promise.all([
    import('split-type'),
    import('rough-notation'),
  ])
  const SplitType = SplitTypeModule.default
  const annotate = rnModule.annotate

  // Build per-scene GSAP timelines
  const timelines = new Map<number, gsap.core.Timeline | null>()

  for (let si = 0; si < SCENES.length; si++) {
    const scene = SCENES[si]
    const el = sceneRefs.value[si]
    if (!el) continue

    const beatEls = [...el.querySelectorAll<HTMLElement>('.beat')]

    const splitAll = beatEls.map((beatEl, bi) => {
      const textEl = beatEl.querySelector<HTMLElement>('.beat-text')
      if (!textEl) return null
      const st = new SplitType(textEl, { types: 'words,chars', tagName: 'span' })
      const chars = (st.chars ?? []) as HTMLElement[]
      chars.forEach(c => gsap.set(c, { transformOrigin: '50% 80%' }))
      return { el: textEl, chars, tone: scene.beats[bi]?.tone ?? 'md' }
    }).filter(Boolean) as Array<{ el: HTMLElement; chars: HTMLElement[]; tone: string }>

    let tl: gsap.core.Timeline | null = null

    // ── Scene 01 — scale up ──────────────────────────────────────────────────
    if (scene.special === 'scaleUp') {
      tl = gsap.timeline({ paused: true })
      if (splitAll[0]) {
        tl.fromTo(splitAll[0].chars,
          { scale: 0.06, opacity: 0, filter: 'blur(24px)', transformOrigin: '50% 50%' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 2.8, ease: 'power3.out', stagger: 0.005 }
        )
      }
    }

    // ── Scene 11 — glitch (handled by IntersectionObserver, no tl) ──────────
    else if (scene.special === 'glitch') {
      tl = null
    }

    // ── Scene 05 — word convergence ──────────────────────────────────────────
    else if (scene.special === 'converge') {
      tl = gsap.timeline({ paused: true })
      buildBeatSequence(tl, splitAll, (i) => i < splitAll.length - 1 ? false : false)
      // After last beat holds, trigger canvas
      const cvs = el.querySelector<HTMLCanvasElement>('.scene-converge-canvas')
      tl.call(() => {
        if (cvs) {
          gsap.to(cvs, { opacity: 1, duration: 0.6, ease: 'power2.out' })
          runConverge(cvs, themeStore.isDark)
        }
        // Fade out last beat text
        if (splitAll[splitAll.length - 1]) {
          gsap.to(splitAll[splitAll.length - 1].chars, { opacity: 0, filter: 'blur(10px)', duration: 0.8, delay: 0.6, ease: 'power2.in' })
        }
      }, [], '+=0.4')
    }

    // ── Scene 07 — knowledge graph ───────────────────────────────────────────
    else if (scene.special === 'nodeGraph') {
      tl = gsap.timeline({ paused: true })
      // Intro 2 beats
      buildBeatSequence(tl, splitAll.slice(0, 2))
      // Start canvas graph
      const gCvs = el.querySelector<HTMLCanvasElement>('.scene-graph-canvas')
      tl.call(() => {
        if (gCvs) {
          gsap.to(gCvs, { opacity: 1, duration: 0.8, ease: 'power2.out' })
          runNodeGraph(gCvs, themeStore.isDark)
        }
      }, [], '>')
      tl.to({}, { duration: 2.0 }, '>')
      // Closing 2 beats appear over graph
      buildBeatSequence(tl, splitAll.slice(2))
    }

    // ── Scene 12 — diagram ───────────────────────────────────────────────────
    else if (scene.special === 'diagram') {
      const diagEl = el.querySelector<HTMLElement>('.scene-diagram')
      tl = gsap.timeline({ paused: true })
      if (diagEl) {
        tl.fromTo(diagEl, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' })
        tl.to(diagEl, { scale: 1.06, duration: 12, ease: 'none' }, '<')
      }
      buildBeatSequence(tl, splitAll, (i) => i === splitAll.length - 1)
    }

    // ── Scene 15 — cut / strikethrough ───────────────────────────────────────
    else if (scene.special === 'cut') {
      tl = gsap.timeline({ paused: true })
      // All beats start hidden
      beatEls.forEach(b => gsap.set(b, { opacity: 0, y: 28 }))
      // Reveal all
      tl.to(beatEls, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out' })
      // Strikethrough and drop each strikeable beat
      const strikeBeats = beatEls.filter((_, bi) => scene.beats[bi]?.strike)
      tl.call(() => {
        strikeBeats.forEach((bEl, si) => {
          setTimeout(() => {
            const ann = annotate(bEl, { type: 'strike', color: '#8C8C8C', strokeWidth: 3, animationDuration: 240 })
            ann.show()
            setTimeout(() => gsap.to(bEl, {
              y: window.innerHeight * 0.4 + si * 40,
              x: (Math.random() - 0.5) * 160,
              rotation: (Math.random() - 0.5) * 22,
              opacity: 0,
              duration: 0.75,
              ease: 'power2.in',
            }), 320)
          }, si * 240)
        })
      }, [], '>')
      tl.to({}, { duration: strikeBeats.length * 0.5 + 2.0 }, '>')
    }

    // ── Scene 18 & 23 — crossfade pairs ──────────────────────────────────────
    else if (scene.special === 'transform') {
      tl = gsap.timeline({ paused: true })
      if (scene.id === 18) {
        // Beat 0 is standalone intro
        buildBeatSequence(tl, splitAll.slice(0, 1))
        // Pairs: [1,2] [3,4] [5,6]
        for (let p = 0; p < 3; p++) {
          addTransformPair(tl, splitAll[1 + p * 2], splitAll[2 + p * 2])
        }
      } else {
        // Scene 23: all pairs
        for (let p = 0; p < 3; p++) {
          addTransformPair(tl, splitAll[p * 2], splitAll[p * 2 + 1])
        }
      }
    }

    // ── Scene 20 — montage ───────────────────────────────────────────────────
    else if (scene.special === 'montage') {
      tl = gsap.timeline({ paused: true })
      const gifEls = [...el.querySelectorAll<HTMLImageElement>('.montage-img')]
      if (gifEls.length > 0) {
        gifEls.forEach(g => gsap.set(g, { opacity: 0 }))
        gifEls.forEach((g, gi) => {
          tl!.to(g, { opacity: 0.82, duration: 0.5, ease: 'power2.out' }, gi * 1.8)
          tl!.to(g, { opacity: 0, duration: 0.5, ease: 'power2.in' }, gi * 1.8 + 1.3)
        })
      }
      buildBeatSequence(tl, splitAll, (i) => i === splitAll.length - 1)
    }

    // ── Scene 22 — payoff ────────────────────────────────────────────────────
    else if (scene.special === 'payoff') {
      tl = gsap.timeline({ paused: true })
      if (splitAll[0]) {
        const e0 = ENTER('xl')
        tl.fromTo(splitAll[0].chars, { ...e0, transformOrigin: '50% 80%' }, { ...REST, duration: e0.dur, ease: 'power2.out', stagger: { each: e0.stagger, from: 'start' } })
        tl.to({}, { duration: 0.5 })
        const ex0 = EXIT('xl', splitAll[0].chars)
        tl.to(splitAll[0].chars, { yPercent: ex0.yPercent, scale: ex0.scale, opacity: 0, filter: ex0.filter, duration: ex0.dur, ease: 'power2.in', stagger: { each: ex0.stagger, from: 'end' } })
      }
      if (splitAll[1]) {
        const e1 = ENTER('hero')
        tl.fromTo(splitAll[1].chars, { ...e1, transformOrigin: '50% 80%' }, { ...REST, duration: e1.dur, ease: 'power3.out', stagger: { each: e1.stagger, from: 'start' } }, '>')
      }
    }

    // ── Scene 24 — photo reveal ──────────────────────────────────────────────
    else if (scene.special === 'photoReveal') {
      const photoEl = el.querySelector<HTMLElement>('.scene-photo')
      tl = gsap.timeline({ paused: true })
      if (photoEl) {
        tl.fromTo(photoEl,
          { filter: 'blur(60px)', scale: 1.12, opacity: 0 },
          { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 3.5, ease: 'power2.out' }
        )
      }
      buildBeatSequence(tl, splitAll, (i) => i === splitAll.length - 1)
    }

    // ── CTA (no animation) ───────────────────────────────────────────────────
    else if (scene.special === 'cta') {
      tl = null
    }

    // ── Default — sequential beat reveal ────────────────────────────────────
    else {
      tl = gsap.timeline({ paused: true })
      buildBeatSequence(tl, splitAll, (i) => i === splitAll.length - 1)
    }

    timelines.set(scene.id, tl ?? null)
  }

  // IntersectionObserver — play scene when ≥88% visible (fires after smooth
  // scroll has nearly settled, so the animation starts on a stable frame).
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const idx = Number((entry.target as HTMLElement).dataset.si)
      const scene = SCENES[idx]
      if (!scene) continue

      if (entry.isIntersecting) {
        const a = ATMOS[scene.id]
        if (a && atmos) { atmos.setIntensity(a.i); atmos.setFocus(a.x, a.y) }

        const gifOverlay = (entry.target as HTMLElement).querySelector<HTMLElement>('.scene-bg-overlay')
        if (gifOverlay) gsap.to(gifOverlay, { opacity: 1, duration: 1.2, ease: 'power2.out' })

        isAnimating.value = true
        progress.value = ((idx + 1) / SCENES.length) * 100

        if (scene.special === 'glitch') {
          currentTl = null
          playGlitch(entry.target as HTMLElement)
          // Glitch runs 2.6 s then clears; advance 600 ms after clarity appears
          setTimeout(() => {
            isAnimating.value = false
            if (idx < SCENES.length - 1) advanceToScene(idx + 1)
          }, 3200)
        } else if (scene.special === 'cta') {
          currentTl = null
          isAnimating.value = false  // last scene — let user rest here
        } else {
          const tl = timelines.get(scene.id) ?? null
          currentTl = tl
          if (tl) {
            tl.eventCallback('onComplete', () => {
              setTimeout(() => {
                isAnimating.value = false
                if (idx < SCENES.length - 1) advanceToScene(idx + 1)
              }, 480)
            })
            tl.seek(0).timeScale(1).play()
          } else {
            isAnimating.value = false
          }
        }
      } else {
        const gifOverlay = (entry.target as HTMLElement).querySelector<HTMLElement>('.scene-bg-overlay')
        if (gifOverlay) gsap.to(gifOverlay, { opacity: 0, duration: 0.8, ease: 'power2.in' })
        // Reset glitch for replay
        if (scene.special === 'glitch') {
          const el = entry.target as HTMLElement
          el.classList.remove('is-glitching', 'is-clarity')
        }
      }
    }
  }, { threshold: 0.88 })

  sceneRefs.value.forEach(el => { if (el) observer.observe(el) })
  cleanups.push(() => observer.disconnect())
})

onBeforeUnmount(() => {
  document.documentElement.removeAttribute('data-about')
  document.documentElement.style.overflowY = ''
  document.documentElement.style.scrollSnapType = ''
  document.documentElement.style.scrollBehavior = ''
  window.removeEventListener('wheel',     onScrollAttempt as EventListener)
  window.removeEventListener('touchmove', onScrollAttempt as EventListener)
  isAnimating.value = false
  currentTl = null
  cleanups.forEach(fn => { try { fn() } catch {} })
  cleanups.length = 0
})

// ── crossfade pair helper ─────────────────────────────────────────────────
function addTransformPair(
  tl: gsap.core.Timeline,
  from?: { chars: HTMLElement[]; tone: string },
  to?: { chars: HTMLElement[]; tone: string },
) {
  if (!from || !to) return
  const ef = ENTER(from.tone)
  const et = ENTER(to.tone)
  gsap.set(from.chars, { ...ef, transformOrigin: '50% 80%' })
  gsap.set(to.chars, { ...et, transformOrigin: '50% 80%' })
  tl.to(from.chars, { ...REST, duration: ef.dur, ease: 'power2.out', stagger: { each: ef.stagger, from: 'start' } }, '>')
  tl.to({}, { duration: 0.35 }, '>')
  const exf = EXIT(from.tone, from.chars)
  tl.to(from.chars, { yPercent: exf.yPercent, scale: exf.scale, opacity: 0, filter: exf.filter, duration: 0.5, ease: 'power2.in' }, '>')
  tl.to(to.chars, { ...REST, duration: et.dur, ease: 'power3.out', stagger: { each: et.stagger * 0.8, from: 'start' } }, '<0.12')
  tl.to({}, { duration: et.hold }, '>')
  const ext = EXIT(to.tone, to.chars)
  tl.to(to.chars, { yPercent: ext.yPercent, scale: ext.scale, opacity: 0, filter: ext.filter, duration: ext.dur, ease: 'power2.in', stagger: { each: ext.stagger, from: 'end' } }, '>')
}
</script>

<template>
  <div class="fn" data-lenis-prevent>
    <canvas ref="atmosRef" class="fn-atmos" aria-hidden="true" />
    <div class="fn-progress" :style="{ width: `${progress}%` }" aria-hidden="true" />

    <section
      v-for="(scene, si) in SCENES"
      :key="scene.id"
      class="scene"
      :class="[`scene--${scene.special}`, `scene--${scene.align}`]"
      :data-si="si"
      :ref="el => sceneRefs[si] = el as HTMLElement"
      :aria-label="`${scene.label} — ${scene.title}`"
    >
      <!-- ── GIF / photo backgrounds ─────────────────────────────────────── -->

      <!-- Montage: multiple cycling backgrounds -->
      <template v-if="scene.special === 'montage'">
        <div class="scene-bg" aria-hidden="true">
          <img
            v-for="(url, gi) in allGifUrls(scene.montageSceneIds ?? [])"
            :key="gi"
            :src="url"
            class="scene-bg-img montage-img"
            loading="lazy"
            alt=""
          />
          <div class="scene-bg-overlay" />
        </div>
      </template>

      <!-- Photo reveal background -->
      <template v-else-if="scene.special === 'photoReveal'">
        <div class="scene-bg scene-bg--photo" aria-hidden="true">
          <img src="/naveen.jpeg" class="scene-photo" alt="" />
          <div class="scene-bg-overlay" />
        </div>
      </template>

      <!-- Regular GIF background -->
      <template v-else-if="scene.hasGif && gifUrl(scene.id)">
        <div class="scene-bg" aria-hidden="true">
          <img :src="gifUrl(scene.id)!" class="scene-bg-img" loading="lazy" alt="" />
          <div class="scene-bg-overlay" />
        </div>
      </template>

      <!-- ── Scene content ──────────────────────────────────────────────── -->

      <!-- Glitch -->
      <template v-if="scene.special === 'glitch'">
        <div class="glitch-chaos" aria-hidden="true">
          <span
            v-for="(word, wi) in GLITCH_WORDS"
            :key="word"
            class="glitch-word"
            :style="`--gi:${wi}`"
          >{{ word }}</span>
        </div>
        <div class="glitch-clarity">CLARITY.</div>
      </template>

      <!-- Diagram -->
      <template v-else-if="scene.special === 'diagram'">
        <div class="scene-diagram" aria-hidden="true">
          <svg viewBox="0 0 900 540" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
            <!-- Background -->
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
              </marker>
            </defs>
            <!-- Nodes -->
            <g class="diagram-nodes" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="20" y="40" width="120" height="36" rx="4"/><text x="80" y="62" text-anchor="middle" font-size="9">User Registration</text>
              <rect x="200" y="40" width="110" height="36" rx="4"/><text x="255" y="62" text-anchor="middle" font-size="9">Auth Service</text>
              <rect x="370" y="40" width="130" height="36" rx="4"/><text x="435" y="62" text-anchor="middle" font-size="9">Permission Matrix</text>
              <rect x="560" y="40" width="100" height="36" rx="4"/><text x="610" y="62" text-anchor="middle" font-size="9">Session Store</text>
              <rect x="720" y="40" width="140" height="36" rx="4"/><text x="790" y="62" text-anchor="middle" font-size="9">Audit Log Service</text>
              <!-- Row 2 -->
              <rect x="20" y="140" width="120" height="36" rx="4"/><text x="80" y="162" text-anchor="middle" font-size="9">Data Ingestion</text>
              <rect x="200" y="140" width="110" height="36" rx="4"/><text x="255" y="162" text-anchor="middle" font-size="9">Validation Layer</text>
              <rect x="370" y="140" width="130" height="36" rx="4"/><text x="435" y="162" text-anchor="middle" font-size="9">Transform Engine</text>
              <rect x="560" y="140" width="100" height="36" rx="4"/><text x="610" y="162" text-anchor="middle" font-size="9">Queue Manager</text>
              <rect x="720" y="140" width="140" height="36" rx="4"/><text x="790" y="162" text-anchor="middle" font-size="9">Retry Scheduler</text>
              <!-- Row 3 -->
              <rect x="20" y="240" width="120" height="36" rx="4"/><text x="80" y="262" text-anchor="middle" font-size="9">Business Logic</text>
              <rect x="200" y="240" width="110" height="36" rx="4"/><text x="255" y="262" text-anchor="middle" font-size="9">Rule Engine</text>
              <rect x="370" y="240" width="130" height="36" rx="4"/><text x="435" y="262" text-anchor="middle" font-size="9">Notification Hub</text>
              <rect x="560" y="240" width="100" height="36" rx="4"/><text x="610" y="262" text-anchor="middle" font-size="9">Email Service</text>
              <rect x="720" y="240" width="140" height="36" rx="4"/><text x="790" y="262" text-anchor="middle" font-size="9">Push Notification</text>
              <!-- Row 4 -->
              <rect x="20" y="340" width="120" height="36" rx="4"/><text x="80" y="362" text-anchor="middle" font-size="9">Reporting Engine</text>
              <rect x="200" y="340" width="110" height="36" rx="4"/><text x="255" y="362" text-anchor="middle" font-size="9">Analytics DB</text>
              <rect x="370" y="340" width="130" height="36" rx="4"/><text x="435" y="362" text-anchor="middle" font-size="9">Aggregation Layer</text>
              <rect x="560" y="340" width="100" height="36" rx="4"/><text x="610" y="362" text-anchor="middle" font-size="9">Cache Layer</text>
              <rect x="720" y="340" width="140" height="36" rx="4"/><text x="790" y="362" text-anchor="middle" font-size="9">Export Service</text>
              <!-- Row 5 -->
              <rect x="20" y="440" width="120" height="36" rx="4"/><text x="80" y="462" text-anchor="middle" font-size="9">Archive Module</text>
              <rect x="200" y="440" width="110" height="36" rx="4"/><text x="255" y="462" text-anchor="middle" font-size="9">Backup Engine</text>
              <rect x="370" y="440" width="130" height="36" rx="4"/><text x="435" y="462" text-anchor="middle" font-size="9">Recovery Point</text>
              <rect x="560" y="440" width="100" height="36" rx="4"/><text x="610" y="462" text-anchor="middle" font-size="9">CDN Gateway</text>
              <rect x="720" y="440" width="140" height="36" rx="4"/><text x="790" y="462" text-anchor="middle" font-size="9">Load Balancer</text>
            </g>
            <!-- Arrows (subset) -->
            <g class="diagram-arrows" stroke="currentColor" stroke-width="1" fill="none" marker-end="url(#arrow)" opacity="0.55">
              <line x1="140" y1="58" x2="198" y2="58"/><line x1="310" y1="58" x2="368" y2="58"/>
              <line x1="500" y1="58" x2="558" y2="58"/><line x1="660" y1="58" x2="718" y2="58"/>
              <line x1="140" y1="158" x2="198" y2="158"/><line x1="310" y1="158" x2="368" y2="158"/>
              <line x1="500" y1="158" x2="558" y2="158"/><line x1="660" y1="158" x2="718" y2="158"/>
              <line x1="80" y1="76" x2="80" y2="138"/><line x1="255" y1="76" x2="255" y2="138"/>
              <line x1="435" y1="76" x2="435" y2="138"/><line x1="610" y1="76" x2="610" y2="138"/>
              <line x1="80" y1="176" x2="80" y2="238"/><line x1="255" y1="176" x2="255" y2="238"/>
              <line x1="435" y1="176" x2="435" y2="238"/><line x1="610" y1="176" x2="610" y2="238"/>
              <line x1="80" y1="276" x2="80" y2="338"/><line x1="255" y1="276" x2="255" y2="338"/>
              <line x1="435" y1="276" x2="435" y2="338"/><line x1="610" y1="276" x2="610" y2="338"/>
              <line x1="80" y1="376" x2="80" y2="438"/><line x1="255" y1="376" x2="255" y2="438"/>
              <line x1="435" y1="376" x2="435" y2="438"/><line x1="610" y1="376" x2="610" y2="438"/>
              <!-- Cross connections -->
              <line x1="140" y1="260" x2="198" y2="158" stroke-dasharray="4 3"/>
              <line x1="310" y1="260" x2="558" y2="158" stroke-dasharray="4 3"/>
              <line x1="660" y1="160" x2="368" y2="258" stroke-dasharray="4 3"/>
              <line x1="500" y1="360" x2="310" y2="258" stroke-dasharray="4 3"/>
              <line x1="140" y1="360" x2="200" y2="258" stroke-dasharray="4 3"/>
              <line x1="660" y1="360" x2="500" y2="256" stroke-dasharray="4 3"/>
              <line x1="500" y1="460" x2="718" y2="360" stroke-dasharray="4 3"/>
              <line x1="310" y1="460" x2="560" y2="360" stroke-dasharray="4 3"/>
            </g>
          </svg>
        </div>
        <!-- Text beats overlay -->
        <div class="scene-stage scene-stage--diagram">
          <p
            v-for="(beat, bi) in scene.beats"
            :key="bi"
            class="beat"
            :class="[toneClass(beat.tone), { 'is-accent': beat.accent }]"
          >
            <span class="beat-text">{{ beat.text }}</span>
          </p>
        </div>
      </template>

      <!-- Converge canvas -->
      <template v-else-if="scene.special === 'converge'">
        <div class="scene-stage">
          <p
            v-for="(beat, bi) in scene.beats"
            :key="bi"
            class="beat"
            :class="[toneClass(beat.tone), { 'is-accent': beat.accent }]"
          >
            <span class="beat-text">{{ beat.text }}</span>
          </p>
        </div>
        <canvas class="scene-converge-canvas" aria-hidden="true" />
      </template>

      <!-- Node graph canvas -->
      <template v-else-if="scene.special === 'nodeGraph'">
        <canvas class="scene-graph-canvas" aria-hidden="true" />
        <div class="scene-stage scene-stage--center">
          <p
            v-for="(beat, bi) in scene.beats"
            :key="bi"
            class="beat"
            :class="[toneClass(beat.tone), { 'is-accent': beat.accent }]"
          >
            <span class="beat-text">{{ beat.text }}</span>
          </p>
        </div>
      </template>

      <!-- CTA -->
      <template v-else-if="scene.special === 'cta'">
        <NuxtLink :to="CTA.to" class="cta-pill">
          <span>{{ CTA.text }}</span>
        </NuxtLink>
      </template>

      <!-- Default (default, cut, transform, montage, payoff, photoReveal, scaleUp) -->
      <template v-else>
        <div class="scene-stage" :class="{ 'scene-stage--center': scene.align === 'center' }">
          <p
            v-for="(beat, bi) in scene.beats"
            :key="bi"
            class="beat"
            :class="[toneClass(beat.tone), { 'is-accent': beat.accent, 'is-strike': beat.strike }]"
          >
            <span class="beat-text">{{ beat.text }}</span>
          </p>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────────────── */
.fn {
  --bg: #080808;
  --text: #F2F2F0;
  --text-dim: rgba(242, 242, 240, 0.32);
  --accent: #243F6A;
  --scrim-dark: rgba(8, 8, 8, 0.64);
  --scrim-light: rgba(8, 8, 8, 0.46);
  position: relative;
  width: 100%;
  background: var(--bg);
  color: var(--text);
}

[data-theme="light"] .fn {
  --bg: #F8F8F6;
  --text: #0E0E0E;
  --text-dim: rgba(14, 14, 14, 0.38);
  --scrim-dark: rgba(248, 248, 246, 0.74);
  --scrim-light: rgba(248, 248, 246, 0.60);
}

.fn-atmos {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* Thin progress bar — bottom edge, fills as scenes advance */
.fn-progress {
  position: fixed;
  bottom: 0; left: 0;
  height: 2rem;
  background: rgba(242, 242, 240, 0.30);
  z-index: 100;
  pointer-events: none;
  transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-theme="light"] .fn-progress { background: rgba(14, 14, 14, 0.20); }

/* ── Scene ─────────────────────────────────────────────────────────────────── */
.scene {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100svh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80rem clamp(40rem, 8vw, 160rem);
  overflow: hidden;
}
.scene--center { align-items: center; text-align: center; }
.scene--left   { align-items: flex-start; }

/* ── GIF / photo backgrounds ───────────────────────────────────────────────── */
.scene-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}
.scene-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(0.10) contrast(1.05) brightness(0.92);
  transform: scale(1.08);
  animation: kenburns 20s ease-in-out infinite alternate;
}
@keyframes kenburns {
  0%   { transform: scale(1.06) translate3d(-1.5%, -1%, 0); }
  100% { transform: scale(1.16) translate3d(1.5%, 1.5%, 0); }
}
.montage-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  animation: none;
}
.scene-bg-overlay {
  position: absolute;
  inset: 0;
  background: var(--scrim-dark);
  opacity: 0; /* animated in by GSAP on scene enter */
  z-index: 1;
}
[data-theme="light"] .scene-bg-overlay {
  background: var(--scrim-dark);
}

/* Photo reveal */
.scene-bg--photo { background: var(--bg); }
.scene-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0; /* GSAP animates in */
  filter: blur(60px);
}
.scene-bg--photo .scene-bg-overlay {
  background: rgba(12, 14, 20, 0.35);
  opacity: 1;
}

/* ── Stage (stacked beat grid) ─────────────────────────────────────────────── */
.scene-stage {
  position: relative;
  z-index: 6;
  width: 100%;
  max-width: 1400rem;
  min-height: 30vh;
  display: grid;
  place-items: center start;
}
.scene-stage--center { place-items: center; }
.scene--center .scene-stage { place-items: center; }
.scene--left .scene-stage   { place-items: center start; }

.scene-stage--diagram {
  position: absolute;
  bottom: clamp(40rem, 8vh, 100rem);
  left: clamp(24rem, 7vw, 140rem);
  right: clamp(24rem, 7vw, 140rem);
  min-height: unset;
  z-index: 7;
  background: rgba(12, 14, 20, 0.55);
  backdrop-filter: blur(8px);
  padding: clamp(20rem, 3vh, 48rem) clamp(24rem, 4vw, 60rem);
  border-radius: 14rem;
  border: 1rem solid rgba(36, 63, 106, 0.3);
}
[data-theme="light"] .scene-stage--diagram {
  background: rgba(250, 250, 248, 0.82);
}

/* ── Beats ─────────────────────────────────────────────────────────────────── */
.beat {
  grid-area: 1 / 1;
  margin: 0;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.04em;
  max-width: min(100%, 760rem);
  will-change: transform, opacity, filter;
}
.scene--center .beat, .scene-stage--center .beat { max-width: none; text-align: center; }
.scene--cut .beat { max-width: none; }

.beat-text :deep(.char) {
  display: inline-block;
  will-change: transform, opacity, filter;
  transform-origin: 50% 80%;
}
.beat-text :deep(.word) { display: inline-block; }

/* ── Tone scale ────────────────────────────────────────────────────────────── */
.t-sm   { font-size: clamp(18rem, 2.6vw, 28rem);  font-weight: 400; letter-spacing: -0.01em; opacity: 0.60; }
.t-md   { font-size: clamp(24rem, 4vw, 44rem);    font-weight: 500; letter-spacing: -0.03em; }
.t-lg   { font-size: clamp(32rem, 5.8vw, 72rem);  font-weight: 600; }
.t-xl   { font-size: clamp(44rem, 8.5vw, 124rem); font-weight: 700; letter-spacing: -0.05em; }
.t-hero { font-size: clamp(58rem, 13vw, 200rem);  font-weight: 800; letter-spacing: -0.06em; line-height: 0.90; }
.t-deva { font-family: 'Noto Sans Devanagari', serif; font-size: clamp(38rem, 7.5vw, 108rem); font-weight: 600; letter-spacing: 0; line-height: 1.3; }
.t-sig  { font-size: clamp(22rem, 3.2vw, 44rem);  font-weight: 400; font-style: italic; opacity: 0.72; }

/* ── Accent ────────────────────────────────────────────────────────────────── */
.is-accent { position: relative; }
.is-accent .beat-text {
  text-shadow: 0 0 60rem rgba(36, 63, 106, 0.50);
}
[data-theme="light"] .is-accent .beat-text {
  color: #243F6A;
  text-shadow: 0 0 40rem rgba(36, 63, 106, 0.30);
}
.is-accent::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  bottom: -0.10em;
  height: 0.06em;
  background: #243F6A;
  border-radius: 999rem;
}
.scene--center .is-accent::after { left: 8%; right: 8%; }
.t-hero.is-accent::after, .t-deva.is-accent::after { display: none; }
.t-hero.is-accent .beat-text { text-shadow: 0 0 120rem rgba(36, 63, 106, 0.80); }

/* ── Scene 01 — scaleUp ────────────────────────────────────────────────────── */
.scene--scaleUp .beat { max-width: none; }
.scene--scaleUp .scene-stage { min-height: 0; }

/* ── Scene 11 — glitch + CLARITY ──────────────────────────────────────────── */
.scene--glitch {
  background: #080808;
  overflow: hidden;
}
[data-theme="light"] .scene--glitch { background: #080808; }

.glitch-chaos {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  flex-wrap: wrap;
  align-content: space-around;
  justify-content: space-around;
  padding: 8%;
  gap: clamp(16rem, 2vw, 32rem);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.scene--glitch.is-glitching .glitch-chaos {
  opacity: 1;
}
.scene--glitch.is-clarity .glitch-chaos {
  opacity: 0;
}

.glitch-word {
  font-size: clamp(20rem, 4vw, 68rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #FAFAF8;
  opacity: 0.75;
  animation: glitch-anim 0.35s infinite;
  animation-delay: calc(var(--gi, 0) * 80ms);
}

@keyframes glitch-anim {
  0%, 88%, 100% { clip-path: none; transform: translate(0); }
  89%  { clip-path: inset(42% 0 38% 0); transform: translate(-5px, 2px); color: #8EC5FC; }
  90%  { clip-path: inset(72% 0 12% 0); transform: translate(5px, -2px); color: #FAFAF8; }
  91%  { clip-path: inset(18% 0 55% 0); transform: translate(-3px, 4px); color: #E0C3FC; }
  92%  { clip-path: inset(60% 0 25% 0); transform: translate(4px, -3px); color: #FAFAF8; }
  93%  { clip-path: none; transform: translate(2px, -1px); }
}

.glitch-clarity {
  position: absolute;
  inset: 0;
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(60rem, 14vw, 220rem);
  font-weight: 800;
  letter-spacing: -0.06em;
  color: #FAFAF8;
  opacity: 0;
  transition: opacity 0.6s ease 0.1s;
  text-shadow: 0 0 120rem rgba(36, 63, 106, 0.9);
}
.scene--glitch.is-clarity .glitch-clarity {
  opacity: 1;
}

/* ── Scene 12 — diagram ────────────────────────────────────────────────────── */
.scene--diagram { padding-top: 0; padding-bottom: 0; }
.scene-stage--diagram {
  bottom: clamp(40rem, 8vh, 100rem);
  left: clamp(40rem, 8vw, 160rem);
  right: clamp(40rem, 8vw, 160rem);
}
.scene-diagram {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0; /* GSAP animates in */
}
.diagram-svg {
  width: 100%;
  height: 100%;
  max-height: 100vh;
  color: var(--text);
  opacity: 0.40;
}
[data-theme="light"] .diagram-svg { opacity: 0.28; }

/* ── Canvas scenes ─────────────────────────────────────────────────────────── */
.scene-converge-canvas,
.scene-graph-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 7;
  opacity: 0;
  pointer-events: none;
}

/* ── Scene 25 — CTA ────────────────────────────────────────────────────────── */
.scene--cta {
  background: var(--bg);
  align-items: center;
  justify-content: center;
}
.cta-pill {
  display: inline-flex;
  align-items: center;
  padding: clamp(20rem, 2.4vw, 38rem) clamp(36rem, 4.8vw, 80rem);
  background: #243F6A;
  color: #FAFAF8 !important;
  border-radius: 999rem;
  font-size: clamp(26rem, 4vw, 60rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  box-shadow: 0 28rem 80rem rgba(36, 63, 106, 0.50);
  transition: transform 0.4s cubic-bezier(.16,1,.3,1), box-shadow 0.4s ease;
  will-change: transform;
  text-decoration: none;
}
.cta-pill:hover {
  transform: translateY(-6rem) scale(1.02);
  box-shadow: 0 40rem 120rem rgba(36, 63, 106, 0.70);
}

/* ── Mobile ────────────────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .scene { padding: 60rem clamp(24rem, 6vw, 56rem); }
  .beat  { max-width: 100%; }
  .t-sm   { font-size: clamp(16rem, 4vw, 22rem); }
  .t-md   { font-size: clamp(20rem, 5.2vw, 34rem); }
  .t-lg   { font-size: clamp(26rem, 6.8vw, 52rem); }
  .t-xl   { font-size: clamp(34rem, 8.5vw, 68rem); }
  .t-hero { font-size: clamp(44rem, 11vw, 80rem); letter-spacing: -0.05em; }
  .t-deva { font-size: clamp(32rem, 8vw, 64rem); }
  .t-sig  { font-size: clamp(18rem, 4.5vw, 34rem); }
  .scene-diagram { display: none; }
  .scene-stage--diagram { position: relative; bottom: auto; left: auto; right: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .fn { scroll-snap-type: none; overflow-y: auto; }
  .beat { grid-area: auto; opacity: 1; margin-bottom: 0.4em; }
  .scene-stage { display: block; }
  .glitch-word { animation: none; }
}
</style>

<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import lottie, { type AnimationItem } from 'lottie-web'
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap'
    }
  ]
})

const rootRef = ref<HTMLElement | null>(null)
const { $lenis } = useNuxtApp()

const stickerAnims: AnimationItem[] = []
const stickerMap = new Map<HTMLElement, AnimationItem>()
const cleanups: Array<() => void> = []

// ── Word masking ───────────────────────────────────────────────────────
function maskWords(el: HTMLElement): HTMLElement[] {
  const fills: HTMLElement[] = []
  const frag = document.createDocumentFragment()

  const wrap = (html: string, extraClass = '') => {
    const mask = document.createElement('span')
    mask.className = 'wmask'
    const fill = document.createElement('span')
    fill.className = ('wfill ' + extraClass).trim()
    fill.innerHTML = html
    mask.appendChild(fill)
    frag.appendChild(mask)
    fills.push(fill)
  }

  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      ;(node.textContent ?? '').split(/(\s+)/).forEach((part) => {
        if (part === '') return
        if (part.trim() === '') frag.appendChild(document.createTextNode(part))
        else wrap(part)
      })
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const en = node as HTMLElement
      wrap(en.innerHTML, en.className)
    }
  })

  el.innerHTML = ''
  el.appendChild(frag)
  return fills
}

// ── Decode / scramble ─────────────────────────────────────────────────
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/<>*+=?'
const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
function randGlyphs(n: number) {
  let s = ''
  for (let i = 0; i < n; i++) s += randGlyph()
  return s
}
function decodeText(final: string, p: number) {
  const reveal = Math.floor(p * final.length)
  let out = ''
  for (let i = 0; i < final.length; i++) {
    const c = final[i]
    if (c === ' ') { out += ' '; continue }
    out += i < reveal ? c : randGlyph()
  }
  return out
}

function collectFills(sceneEl: Element): HTMLElement[] {
  const fills: HTMLElement[] = []
  sceneEl.querySelectorAll<HTMLElement>('.line').forEach((line) => {
    if (line.classList.contains('no-split')) return
    fills.push(...maskWords(line))
  })
  return fills
}

const RISE = { yPercent: 130, opacity: 0, filter: 'blur(8px)' }

function stickerIn(tl: gsap.core.Timeline, s: HTMLElement | null, at: number | string = 0.15) {
  if (!s) return
  const rot = parseFloat(s.dataset.rot ?? '6')
  const anim = stickerMap.get(s)
  tl.to(s, { opacity: 1, scale: 1, rotation: rot, y: 0, duration: 0.55, ease: 'back.out(1.9)' }, at)
  tl.call(() => anim?.play(), undefined, at)
}

function attachTheatre(_sheetId: string, tl: gsap.core.Timeline) {
  return {
    play() { tl.restart() },
    pause() { tl.pause() }
  }
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const root = rootRef.value
  if (!root) return

  // Wire Lenis scroll events to ScrollTrigger for position sync
  const lenisInst = $lenis as any
  const syncST = () => ScrollTrigger.update()
  lenisInst?.on?.('scroll', syncST)
  cleanups.push(() => lenisInst?.off?.('scroll', syncST))

  // ── Load Lottie stickers ───────────────────────────────────────────
  root.querySelectorAll<HTMLElement>('.sticker').forEach((wrapper) => {
    const inner = wrapper.querySelector<HTMLElement>('.sticker-lottie')
    if (!inner?.dataset.src) return
    const anim = lottie.loadAnimation({
      container: inner, renderer: 'svg', loop: true, autoplay: false, path: inner.dataset.src
    })
    stickerAnims.push(anim)
    stickerMap.set(wrapper, anim)
  })

  // ── Wheel snap: one gesture → snap to next/prev scene ─────────────
  const snapSections = Array.from(root.querySelectorAll<HTMLElement>('.scene, .coda'))
  let snapIdx = 0
  let snapping = false

  const onWheel = (e: WheelEvent) => {
    if (snapping) { e.preventDefault(); return }
    const dir = e.deltaY > 0 ? 1 : -1
    const next = Math.max(0, Math.min(snapSections.length - 1, snapIdx + dir))
    if (next === snapIdx) return
    e.preventDefault()
    snapping = true
    snapIdx = next
    lenisInst?.scrollTo?.(snapSections[next], {
      duration: 0.9,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      onComplete: () => { snapping = false }
    })
  }
  document.addEventListener('wheel', onWheel, { passive: false })
  cleanups.push(() => document.removeEventListener('wheel', onWheel))

  // ── Scene timeline builders ────────────────────────────────────────

  function buildIntroTl(el: HTMLElement) {
    const fills   = collectFills(el)
    const gifWrap = el.querySelector<HTMLElement>('.intro-gif-wrap')!
    gsap.set(fills, RISE)
    gsap.set(gifWrap, { opacity: 0, scale: 0.65, rotation: -12, y: 30 })
    const tl = gsap.timeline({ paused: true })
    tl.to(gifWrap, { opacity: 1, scale: 1, rotation: -3, y: 0, duration: 0.85, ease: 'back.out(1.5)' })
    tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.055 }, 0.3)
    tl.to({}, { duration: 0.5 })
    return tl
  }

  function buildFateTl(el: HTMLElement) {
    const fills   = collectFills(el)
    const sticker = el.querySelector<HTMLElement>('.sticker')
    const gifEl   = el.querySelector<HTMLElement>('.scene-gif')
    gsap.set(fills, RISE)
    if (gifEl) gsap.set(gifEl, { opacity: 0, y: -110, rotation: -24, scale: 0.72 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '-11') - 22, y: 24 })
    const mid = Math.ceil(fills.length * 0.42)
    const tl = gsap.timeline({ paused: true })
    tl.to(fills.slice(0, mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out', stagger: 0.038 })
    if (gifEl) tl.to(gifEl, { opacity: 1, y: 0, rotation: -8, scale: 1, duration: 0.65, ease: 'back.out(1.4)' }, '>')
    tl.to(fills.slice(mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.78, ease: 'power3.out', stagger: 0.038 }, '>0.08')
    stickerIn(tl, sticker, '>-0.2')
    tl.to({}, { duration: 0.4 })
    return tl
  }

  function buildLeapTl(el: HTMLElement) {
    const fills   = collectFills(el)
    const sticker = el.querySelector<HTMLElement>('.sticker')
    const gifEl   = el.querySelector<HTMLElement>('.scene-gif')
    gsap.set(fills, RISE)
    if (gifEl) gsap.set(gifEl, { opacity: 0, y: 60, rotation: 18, scale: 0.65 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '14') - 22, y: 24 })
    const mid = Math.ceil(fills.length * 0.28)
    const tl = gsap.timeline({ paused: true })
    tl.to(fills.slice(0, mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.72, ease: 'power3.out', stagger: 0.04 })
    if (gifEl) tl.to(gifEl, { opacity: 1, y: 0, rotation: 6, scale: 1, duration: 0.72, ease: 'back.out(1.7)' }, '>')
    tl.to(fills.slice(mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.82, ease: 'power3.out', stagger: 0.038 }, '>0.06')
    stickerIn(tl, sticker, '>-0.3')
    tl.to({}, { duration: 0.4 })
    return tl
  }

  function buildMythTl(el: HTMLElement) {
    const fills   = collectFills(el)
    const sticker = el.querySelector<HTMLElement>('.sticker')
    const gifEl   = el.querySelector<HTMLElement>('.scene-gif')
    gsap.set(fills, RISE)
    if (gifEl) gsap.set(gifEl, { opacity: 0, y: -50, rotation: 15, scale: 0.6 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '-9') - 22, y: 24 })
    const mid = Math.ceil(fills.length * 0.38)
    const tl = gsap.timeline({ paused: true })
    tl.to(fills.slice(0, mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.78, ease: 'power3.out', stagger: 0.035 })
    if (gifEl) tl.to(gifEl, { opacity: 1, y: 0, rotation: -6, scale: 1, duration: 0.62, ease: 'back.out(1.5)' }, '>')
    tl.to(fills.slice(mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.82, ease: 'power3.out', stagger: 0.035 }, '>0.08')
    stickerIn(tl, sticker, '>-0.2')
    tl.to({}, { duration: 0.4 })
    return tl
  }

  function buildMentorTl(el: HTMLElement) {
    const fills   = collectFills(el)
    const sticker = el.querySelector<HTMLElement>('.sticker')
    const gifEl   = el.querySelector<HTMLElement>('.scene-gif')
    gsap.set(fills, RISE)
    if (gifEl) gsap.set(gifEl, { opacity: 0, x: -60, rotation: -14, scale: 0.65 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '7') - 22, y: 24 })
    const mid = Math.ceil(fills.length * 0.3)
    const tl = gsap.timeline({ paused: true })
    tl.to(fills.slice(0, mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.72, ease: 'power3.out', stagger: 0.04 })
    if (gifEl) tl.to(gifEl, { opacity: 1, x: 0, rotation: -4, scale: 1, duration: 0.75, ease: 'back.out(1.5)' }, '>')
    tl.to(fills.slice(mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out', stagger: 0.04 }, '>0.08')
    stickerIn(tl, sticker, '>-0.25')
    tl.to({}, { duration: 0.4 })
    return tl
  }

  function buildPsychTl(el: HTMLElement) {
    const fills   = collectFills(el)
    const sticker = el.querySelector<HTMLElement>('.sticker')
    const gifEl   = el.querySelector<HTMLElement>('.scene-gif')
    gsap.set(fills, RISE)
    if (gifEl) gsap.set(gifEl, { opacity: 0, scale: 0.5, rotation: 12, y: 30 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '-13') - 22, y: 24 })
    const mid = Math.ceil(fills.length * 0.5)
    const tl = gsap.timeline({ paused: true })
    tl.to(fills.slice(0, mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', stagger: 0.04 })
    if (gifEl) tl.to(gifEl, { opacity: 1, scale: 1, rotation: -4, y: 0, duration: 0.65, ease: 'back.out(1.6)' }, '>')
    tl.to(fills.slice(mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out', stagger: 0.04 }, '>0.08')
    stickerIn(tl, sticker, '>-0.3')
    tl.to({}, { duration: 0.4 })
    return tl
  }

  function buildThesisTl(el: HTMLElement) {
    const sticker = el.querySelector<HTMLElement>('.sticker')
    const gifEl   = el.querySelector<HTMLElement>('.scene-gif')
    const f7: HTMLElement[] = []
    el.querySelectorAll<HTMLElement>('.line:not(.decode-line)').forEach((l) => f7.push(...maskWords(l)))
    gsap.set(f7, RISE)
    if (gifEl) gsap.set(gifEl, { opacity: 0, scale: 0.8 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '-8') - 22, y: 24 })

    const decodeEl = el.querySelector<HTMLElement>('.decode-line')!
    const finalText = decodeEl.dataset.final ?? decodeEl.textContent ?? ''
    decodeEl.textContent = randGlyphs(finalText.length)
    gsap.set(decodeEl, { opacity: 0, yPercent: 40 })

    const tl = gsap.timeline({ paused: true })
    if (gifEl) tl.to(gifEl, { opacity: 0.18, scale: 1, duration: 1.0, ease: 'power2.out' }, 0)
    tl.to(f7, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.05 })
    stickerIn(tl, sticker, '>-0.4')
    tl.to(decodeEl, { opacity: 1, yPercent: 0, duration: 0.4, ease: 'power3.out' }, '>0.1')
    const ds = { p: 0 }
    tl.to(ds, {
      p: 1, duration: 1.4, ease: 'none',
      onUpdate: () => { decodeEl.textContent = decodeText(finalText, ds.p) }
    }, '>')
    tl.to({}, { duration: 0.4 })
    return tl
  }

  function buildStripTl(el: HTMLElement) {
    const sticker   = el.querySelector<HTMLElement>('.sticker')
    const gifEl     = el.querySelector<HTMLElement>('.scene-gif')
    const stripLine = el.querySelector<HTMLElement>('.strip-line')!
    const f8 = maskWords(stripLine)
    gsap.set(f8, RISE)
    if (gifEl) gsap.set(gifEl, { opacity: 0, rotation: -28, scale: 0.5, y: -30 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '12') - 22, y: 24 })

    const tl = gsap.timeline({ paused: true })
    if (gifEl) tl.to(gifEl, { opacity: 1, rotation: 6, scale: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0)
    tl.to(f8, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.035 }, 0.2)
    stickerIn(tl, sticker, 0.3)
    tl.to({}, { duration: 0.35 })
    const jargon = el.querySelectorAll<HTMLElement>('.wfill.jargon')
    tl.set(jargon, { textDecoration: 'line-through' })
    tl.to(jargon, { opacity: 0.1, filter: 'blur(3px)', duration: 0.9, ease: 'power2.inOut', stagger: 0.06 })
    tl.to(el.querySelectorAll('.wfill.crisp'), { scale: 1.06, duration: 0.9, ease: 'power2.out' }, '<')
    if (gifEl) tl.to(gifEl, { rotation: '+=38', scale: 1.18, duration: 0.8, ease: 'power1.inOut' }, '<')
    if (sticker) tl.to(sticker, { rotation: '+=12', duration: 0.8, ease: 'power1.inOut' }, '<')
    tl.to({}, { duration: 0.3 })
    return tl
  }

  function buildVerseTl(el: HTMLElement) {
    const sticker  = el.querySelector<HTMLElement>('.sticker')
    const gifEl    = el.querySelector<HTMLElement>('.scene-gif')
    const vhindi   = el.querySelector<HTMLElement>('.vhindi')!
    const beam     = el.querySelector<HTMLElement>('.vbeam')!
    const translit = maskWords(el.querySelector<HTMLElement>('.translit')!)
    const veng     = maskWords(el.querySelector<HTMLElement>('.verse-eng')!)
    gsap.set(vhindi, { opacity: 0, filter: 'blur(26px)', scale: 1.05 })
    gsap.set([...translit, ...veng], { yPercent: 130, opacity: 0 })
    gsap.set(beam, { xPercent: -160, opacity: 0 })
    if (gifEl) gsap.set(gifEl, { opacity: 0, scale: 0.4, rotation: 22 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '-6') - 22, y: 24 })

    const tl = gsap.timeline({ paused: true })
    if (gifEl) tl.to(gifEl, { opacity: 1, scale: 1, rotation: -10, duration: 0.65, ease: 'back.out(1.8)' }, 0)
    tl.to(vhindi, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.2, ease: 'power3.out' }, 0.12)
    tl.to(beam, { xPercent: 360, opacity: 1, duration: 1.0, ease: 'power1.inOut' }, 0.3)
    tl.to(beam, { opacity: 0, duration: 0.3 }, '>-0.15')
    stickerIn(tl, sticker, '>-0.3')
    tl.to(translit, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 }, '>-0.2')
    tl.to(veng, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, '>')
    tl.to({}, { duration: 0.4 })
    return tl
  }

  function buildCloserTl(el: HTMLElement) {
    const fills   = collectFills(el)
    const sticker = el.querySelector<HTMLElement>('.sticker')
    const gifEl   = el.querySelector<HTMLElement>('.scene-gif')
    gsap.set(fills, RISE)
    if (gifEl) gsap.set(gifEl, { opacity: 0, y: 60, scale: 0.65, rotation: -14 })
    if (sticker) gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: parseFloat(sticker.dataset.rot ?? '5') - 22, y: 24 })
    const mid = Math.ceil(fills.length * 0.32)
    const tl = gsap.timeline({ paused: true })
    tl.to(fills.slice(0, mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', stagger: 0.04 })
    if (gifEl) tl.to(gifEl, { opacity: 1, y: 0, scale: 1, rotation: 7, duration: 0.7, ease: 'back.out(1.4)' }, '>')
    tl.to(fills.slice(mid), { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out', stagger: 0.04 }, '>0.08')
    stickerIn(tl, sticker, '>-0.3')
    tl.to({}, { duration: 0.5 })
    return tl
  }

  // ── Register scenes: build timelines + IntersectionObserver ──────
  const scenes = [
    { sel: '.scene-intro',   id: 'intro',   build: buildIntroTl },
    { sel: '.scene-fate',    id: 'fate',    build: buildFateTl },
    { sel: '.scene-leap',    id: 'leap',    build: buildLeapTl },
    { sel: '.scene-myth',    id: 'myth',    build: buildMythTl },
    { sel: '.scene-mentors', id: 'mentors', build: buildMentorTl },
    { sel: '.scene-psych',   id: 'psych',   build: buildPsychTl },
    { sel: '.scene-thesis',  id: 'thesis',  build: buildThesisTl },
    { sel: '.scene-strip',   id: 'strip',   build: buildStripTl },
    { sel: '.scene-verse',   id: 'verse',   build: buildVerseTl },
    { sel: '.scene-closer',  id: 'closer',  build: buildCloserTl },
  ]

  scenes.forEach(({ sel, id, build }) => {
    const el = root.querySelector<HTMLElement>(sel)
    if (!el) return
    const tl = build(el)
    const scene = attachTheatre(id, tl)

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) scene.play()
      else scene.pause()
    }, { threshold: 0.52 })

    io.observe(el)
    cleanups.push(() => io.disconnect())
  })

  // ── Coda ──────────────────────────────────────────────────────────
  const coda = root.querySelector<HTMLElement>('.coda')
  if (coda) {
    const items = coda.querySelectorAll<HTMLElement>('.coda-reveal')
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.fromTo(items,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1 }
        )
      }
    }, { threshold: 0.4 })
    io.observe(coda)
    cleanups.push(() => io.disconnect())
  }
})

onUnmounted(() => {
  stickerAnims.forEach((a) => a.destroy())
  stickerAnims.length = 0
  stickerMap.clear()
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
})
</script>

<template>
  <div ref="rootRef" class="about-cine">

    <!-- 1 · INTRO -->
    <section class="scene scene-intro">
      <div class="scene-inner intro-inner">
        <div class="intro-gif-wrap">
          <img class="intro-gif" src="/hi.gif" alt="Hi" />
        </div>
        <div class="intro-text">
          <p class="line l-xl">Hey. I'm <span class="hl">Naveen Jose.</span></p>
          <p class="line l-md dim">Instructional Designer. Obsessed with two things:</p>
          <p class="line l-lg">making things look <span class="hl">simple</span>,</p>
          <p class="line l-lg">and making them look <span class="hl">good</span>.</p>
        </div>
      </div>
    </section>

    <!-- 2 · TWIST OF FATE -->
    <section class="scene scene-fate">
      <div class="sticker sticker-bl s-fate" data-rot="-11">
        <div class="sticker-lottie" data-src="/lottie/stickers/explore.json"></div>
      </div>
      <div class="scene-inner">
        <p class="line l-md">Walked out of college with a hospitality degree.</p>
        <p class="line l-lg"><span class="hl">Hotel career.</span> Full stop.</p>
        <div class="scene-gif fate-gif gif-polaroid">
          <img src="/graduation.gif" alt="" />
          <p class="gif-caption">Not the plan.</p>
        </div>
        <p class="line l-md dim">That was the entire plan.</p>
        <p class="line l-xl">Then L&amp;D happened.</p>
      </div>
    </section>

    <!-- 3 · THE LEAP -->
    <section class="scene scene-leap">
      <div class="sticker sticker-tl s-leap" data-rot="14">
        <div class="sticker-lottie" data-src="/lottie/stickers/heart.json"></div>
      </div>
      <div class="scene-inner">
        <p class="line l-md">Then Marriott called.</p>
        <div class="scene-gif leap-gif gif-card">
          <img src="/gifs/leap.gif" alt="" />
        </div>
        <p class="line l-md dim">I said yes before they finished the sentence.</p>
        <p class="line l-xl">L&amp;D is just — <span class="hl">in my blood.</span></p>
      </div>
    </section>

    <!-- 4 · MYTH-BUST -->
    <section class="scene scene-myth">
      <div class="sticker sticker-tr s-myth" data-rot="-9">
        <div class="sticker-lottie" data-src="/lottie/stickers/calendar.json"></div>
      </div>
      <div class="scene-inner">
        <p class="line l-md">But let's be real for a second.</p>
        <p class="line l-sm quote">"I wanted a chill job, so I figured training would be easier."</p>
        <div class="scene-gif myth-gif gif-card">
          <img src="/gifs/myth.gif" alt="" />
        </div>
        <p class="line l-lg">Hard. Nope.</p>
        <p class="line l-xl">This job will <span class="hl">humble you.</span> Fast.</p>
      </div>
    </section>

    <!-- 5 · MENTORS -->
    <section class="scene scene-mentors">
      <div class="sticker sticker-br s-mentors" data-rot="7">
        <div class="sticker-lottie" data-src="/lottie/stickers/visibility2.json"></div>
      </div>
      <div class="scene-inner">
        <p class="line l-md">Thankfully, I found the actual geniuses.</p>
        <div class="scene-gif mentor-gif gif-polaroid">
          <img src="/gifs/mentor.gif" alt="" />
          <p class="gif-caption">mind = blown</p>
        </div>
        <p class="line l-lg">The ones who walked into any room —</p>
        <p class="line l-xl">and quietly <span class="hl">rewired every brain</span> in it.</p>
      </div>
    </section>

    <!-- 6 · PSYCHOLOGY -->
    <section class="scene scene-psych">
      <div class="sticker sticker-tr s-psych" data-rot="-13">
        <div class="sticker-lottie" data-src="/lottie/stickers/activity.json"></div>
      </div>
      <div class="scene-inner">
        <p class="line l-lg">The brain is hilarious.</p>
        <p class="line l-md">It'll pick up a new accent just by being near one.</p>
        <div class="scene-gif psych-gif gif-card">
          <img src="/gifs/psych.gif" alt="" />
        </div>
        <p class="line l-md">But actively resist anything it actually needs to know.</p>
        <p class="line l-xl">So what's the <span class="hl">hack?</span></p>
      </div>
    </section>

    <!-- 7 · THESIS + DECODE -->
    <section class="scene scene-thesis">
      <div class="sticker sticker-bl s-thesis" data-rot="-8">
        <div class="sticker-lottie" data-src="/lottie/stickers/edit.json"></div>
      </div>
      <!-- hacker GIF as faint background ghost -->
      <div class="scene-gif thesis-gif">
        <img src="/gifs/hacker.gif" alt="" />
      </div>
      <div class="scene-inner center">
        <p class="line l-md dim">That's what this job really is.</p>
        <p class="line l-lg">We aren't just building training.</p>
        <p class="line l-xl">We are <span class="hl">hackers.</span></p>
        <p class="line l-xl decode-line mono" data-final="We hack brains."></p>
      </div>
    </section>

    <!-- 8 · STRIP THE NOISE -->
    <section class="scene scene-strip">
      <div class="sticker sticker-tl s-strip" data-rot="12">
        <div class="sticker-lottie" data-src="/lottie/stickers/trash2.json"></div>
      </div>
      <div class="scene-inner center">
        <div class="scene-gif strip-gif gif-card">
          <img src="/gifs/strip.gif" alt="" />
        </div>
        <p class="line l-lg strip-line">We cancel <span class="jargon">the noise,</span> <span class="jargon">the corporate jargon,</span> <span class="jargon">the absolute fluff</span> — and keep only <span class="crisp">the crisp, shiny details</span> the mind needs.</p>
      </div>
    </section>

    <!-- 9 · MANTRA (CLIMAX) -->
    <section class="scene scene-verse">
      <div class="sticker sticker-br s-verse" data-rot="-6">
        <div class="sticker-lottie" data-src="/lottie/stickers/infinity.json"></div>
      </div>
      <div class="scene-inner center">
        <div class="scene-gif verse-gif">
          <img src="/gifs/verse.gif" alt="" />
        </div>
        <span class="vbeam"></span>
        <p class="line vhindi no-split">असतो मा सद्गमय</p>
        <p class="line l-md translit">Asatoma sadgamaya.</p>
        <p class="line l-xl verse-eng">From the unreal, to the <span class="hl">real.</span></p>
      </div>
    </section>

    <!-- 10 · CLOSER -->
    <section class="scene scene-closer">
      <div class="sticker sticker-tr s-closer" data-rot="5">
        <div class="sticker-lottie" data-src="/lottie/stickers/arrowUpCircle.json"></div>
      </div>
      <div class="scene-inner center">
        <p class="line l-lg">That's the whole job.</p>
        <div class="scene-gif closer-gif gif-card">
          <img src="/gifs/closer.gif" alt="" />
        </div>
        <p class="line l-md">Strip the unreal. Lead people to what matters.</p>
        <p class="line l-xl">We make the <span class="hl">impossible, possible.</span></p>
      </div>
    </section>

    <!-- CODA · IDENTITY + CONTACT -->
    <section class="coda">
      <div class="coda-portrait coda-reveal">
        <img src="/naveen.jpeg" alt="Naveen Jose" />
      </div>
      <p class="coda-name coda-reveal">Naveen Jose</p>
      <p class="coda-cred coda-reveal">CIDS Certified Instructional Designer</p>
      <div class="coda-contact">
        <a class="coda-reveal" href="mailto:iamnaveenjose@outlook.com">iamnaveenjose@outlook.com</a>
        <a class="coda-reveal" href="https://linkedin.com/in/entertrainer" target="_blank" rel="noopener noreferrer">linkedin.com/in/entertrainer</a>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* Accent highlight */
.about-cine { --hl: #6E92CE; }
[data-theme="light"] .about-cine { --hl: #243F6A; }

.about-cine {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--main-font);
}

/* ── Scenes — full-viewport snap targets ── */
.scene {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rem var(--grid-margin);
  background: var(--color-bg);
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
.scene-inner {
  width: 100%;
  max-width: 900rem;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  position: relative;
  z-index: 2;
}
.scene-inner.center { align-items: center; text-align: center; }

/* ── Inline GIF elements (in normal text flow) ── */
.scene-gif {
  opacity: 0;
  will-change: transform, opacity;
  align-self: flex-start;
  margin: 0.35em 0;
}
.scene-gif img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8rem;
}

/* Polaroid-style card (white surround) */
.gif-polaroid {
  background: #FDFCF8;
  padding: 12rem 12rem 46rem;
  box-shadow: 0 16rem 48rem rgba(0,0,0,0.42), 0 3rem 10rem rgba(0,0,0,0.2);
  border-radius: 4rem;
}
.gif-polaroid img { border-radius: 2rem; }
.gif-caption {
  text-align: center;
  font-size: 12rem;
  font-weight: 500;
  font-style: italic;
  color: #666;
  margin-top: 10rem;
}

/* Rounded card */
.gif-card {
  border-radius: 12rem;
  overflow: hidden;
  box-shadow: 0 10rem 32rem rgba(0,0,0,0.35), 0 2rem 6rem rgba(0,0,0,0.16);
}

/* Per-scene sizes & alignment */
.fate-gif    { width: clamp(140rem, 16vw, 230rem); align-self: flex-end; }
.leap-gif    { width: clamp(130rem, 15vw, 210rem); align-self: flex-start; }
.myth-gif    { width: clamp(130rem, 14vw, 200rem); align-self: center; }
.mentor-gif  { width: clamp(150rem, 17vw, 240rem); align-self: flex-end; }
.psych-gif   { width: clamp(130rem, 15vw, 210rem); align-self: flex-start; }

/* Thesis: hacker GIF as faint absolute background */
.thesis-gif  {
  position: absolute !important;
  right: -4%;
  top: 0;
  bottom: 0;
  width: clamp(200rem, 26vw, 380rem);
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
  margin: 0;
  align-self: unset;
}
.thesis-gif img { border-radius: 0; }

.strip-gif   { width: clamp(90rem, 10vw, 150rem); align-self: center; margin-bottom: 0.5em; }
.verse-gif   { width: clamp(80rem, 9vw, 130rem);  align-self: center; margin-bottom: 0.3em; }
.closer-gif  { width: clamp(140rem, 16vw, 220rem); align-self: center; }

@media (max-width: 768px) {
  .fate-gif, .leap-gif, .myth-gif, .mentor-gif, .psych-gif, .closer-gif {
    width: clamp(110rem, 30vw, 175rem);
    align-self: center;
  }
  .thesis-gif { display: none; }
  .verse-gif  { width: 90rem; }
  .strip-gif  { width: 88rem; }
}

/* ── Intro two-column layout ── */
.intro-inner {
  flex-direction: row !important;
  align-items: center;
  gap: 60rem;
}
.intro-gif-wrap {
  flex: 0 0 auto;
  background: #FDFCF8;
  border-radius: 20rem;
  padding: 24rem;
  box-shadow: 0 12rem 40rem rgba(0,0,0,0.38), 0 2rem 8rem rgba(0,0,0,0.18);
  will-change: transform, opacity;
}
.intro-gif {
  display: block;
  width: clamp(140rem, 20vw, 260rem);
  height: auto;
}
.intro-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.28em;
}
@media (max-width: 768px) {
  .intro-inner { flex-direction: column !important; align-items: flex-start; gap: 36rem; }
  .intro-gif { width: clamp(110rem, 38vw, 180rem); }
}

/* ── Scrapbook sticker badges ── */
.sticker {
  position: absolute;
  width: 84rem;
  height: 84rem;
  border-radius: 50%;
  padding: 16rem;
  box-shadow: 0 6rem 20rem rgba(0,0,0,0.35), inset 0 1rem 0 rgba(255,255,255,0.3);
  opacity: 0;
  will-change: transform, opacity;
  pointer-events: none;
  z-index: 6;
}
.sticker::before {
  content: '';
  position: absolute;
  top: -10rem;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  width: 38rem;
  height: 14rem;
  background: rgba(255,255,255,0.55);
  border-radius: 2rem;
  pointer-events: none;
}
.s-fate    { background: #FF6B6B; }
.s-leap    { background: #4FC3F7; }
.s-myth    { background: #CE93D8; }
.s-mentors { background: #F9A825; }
.s-psych   { background: #06D6A0; }
.s-thesis  { background: #EF5350; }
.s-strip   { background: #FF9800; }
.s-verse   { background: #7E57C2; }
.s-closer  { background: #26C6DA; }
.sticker-tl { top: 10%; left: 5%; }
.sticker-tr { top: 10%; right: 5%; }
.sticker-bl { bottom: 14%; left: 5%; }
.sticker-br { bottom: 14%; right: 5%; }
.sticker-lottie {
  width: 100%;
  height: 100%;
  filter: brightness(0) invert(1);
}
@media (max-width: 640px) {
  .sticker { width: 60rem; height: 60rem; padding: 10rem; }
  .sticker-tl { top: 6%; left: 3%; }
  .sticker-tr { top: 6%; right: 3%; }
  .sticker-bl { bottom: 8%; left: 3%; }
  .sticker-br { bottom: 8%; right: 3%; }
}

/* ── Line scale system ── */
.line { letter-spacing: -0.035em; line-height: 1.08; font-weight: 600; }
.l-xl { font-size: clamp(44rem, 8.4vw, 132rem); font-weight: 700; line-height: 1.0; }
.l-lg { font-size: clamp(30rem, 5vw, 74rem); font-weight: 650; }
.l-md { font-size: clamp(21rem, 2.9vw, 40rem); font-weight: 500; line-height: 1.24; letter-spacing: -0.025em; }
.l-sm { font-size: clamp(15rem, 1.7vw, 21rem); font-weight: 400; line-height: 1.4; letter-spacing: -0.01em; }
.dim   { opacity: 0.45; }
.quote { font-style: italic; opacity: 0.6; }
.mono  { font-family: "SFMono-Regular", "JetBrains Mono", "Menlo", monospace; letter-spacing: 0; }
.hl    { color: var(--hl); font-weight: 700; }

/* ── Word-mask scaffolding ── */
:deep(.wmask) {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
  padding: 0.16em 0.07em;
  margin: -0.16em -0.07em;
}
:deep(.wfill) {
  display: inline-block;
  will-change: transform, opacity, filter;
}

/* Strip effect */
:deep(.wfill.jargon) { color: var(--color-text); }
:deep(.wfill.crisp)  { color: var(--hl); font-weight: 700; transform-origin: left center; }

/* ── Mantra / verse ── */
.vhindi {
  font-family: 'Noto Sans Devanagari', 'Mangal', 'Aparajita', sans-serif;
  font-size: clamp(38rem, 7vw, 104rem);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.4;
  margin-bottom: 0.18em;
  will-change: transform, opacity, filter;
}
.translit {
  font-style: italic;
  opacity: 0.5;
  letter-spacing: 0.02em;
  margin-bottom: 0.1em;
}
.verse-eng { margin-top: 0.1em; }
.vbeam {
  position: absolute;
  top: 50%;
  left: 0;
  width: 24%;
  height: 42%;
  transform: translateY(-50%);
  pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--hl), transparent);
  filter: blur(26px);
  opacity: 0;
  mix-blend-mode: screen;
}
.scene-verse .scene-inner { position: relative; }

/* ── Coda ── */
.coda {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18rem;
  padding: 120rem var(--grid-margin);
  background: var(--color-bg);
  scroll-snap-align: start;
}
.coda-portrait {
  width: 200rem;
  height: 200rem;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16rem;
}
.coda-portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
.coda-name { font-size: clamp(28rem, 4vw, 44rem); font-weight: 700; letter-spacing: -0.04em; }
.coda-cred { font-size: 14rem; opacity: 0.45; letter-spacing: -0.01em; }
.coda-contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rem;
  margin-top: 28rem;
}
.coda-contact a {
  font-size: clamp(16rem, 2vw, 22rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  opacity: 0.65;
  transition: opacity 0.2s ease, color 0.2s ease;
}
.coda-contact a:hover { opacity: 1; color: var(--hl); }

@media (max-width: 640px) {
  .scene { padding: 64rem 24rem; }
  .scene-inner { gap: 0.5em; }
}
</style>

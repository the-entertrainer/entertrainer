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

const tls: gsap.core.Timeline[] = []
const stickerAnims: AnimationItem[] = []
const stickerMap = new Map<HTMLElement, AnimationItem>()
const cleanups: Array<() => void> = []

// ── Word masking ───────────────────────────────────────────────────────
function maskWords(el: HTMLElement): HTMLElement[] {
  const fills: HTMLElement[] = []
  const frag  = document.createDocumentFragment()

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

// ── Pinned scrubbed timeline factory ──────────────────────────────────
function pinned(trigger: Element, end = '+=110%') {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top top',
      end,
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  })
  tls.push(tl)
  return tl
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

function stickerOut(tl: gsap.core.Timeline, s: HTMLElement | null, at: number | string = '>-0.1') {
  if (!s) return
  const anim = stickerMap.get(s)
  tl.to(s, { opacity: 0, scale: 0.5, y: -40, duration: 0.3, ease: 'power2.in' }, at)
  tl.call(() => anim?.stop(), undefined, at)
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const root = rootRef.value
  if (!root) return

  const lenisInst = $lenis as any
  lenisInst?.on?.('scroll', ScrollTrigger.update)

  // ── Load all Lottie stickers ────────────────────────────────────────
  root.querySelectorAll<HTMLElement>('.sticker').forEach((wrapper) => {
    const inner = wrapper.querySelector<HTMLElement>('.sticker-lottie')
    if (!inner?.dataset.src) return
    const anim = lottie.loadAnimation({
      container: inner,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: inner.dataset.src
    })
    stickerAnims.push(anim)
    stickerMap.set(wrapper, anim)
  })

  // Helper for standard narrative scenes
  function sceneWithSticker(sel: string, end = '+=110%', out = true) {
    const el = root.querySelector<HTMLElement>(sel)
    if (!el) return
    const fills = collectFills(el)
    const s = el.querySelector<HTMLElement>('.sticker')
    gsap.set(fills, RISE)
    if (s) {
      const rot = parseFloat(s.dataset.rot ?? '6')
      gsap.set(s, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }
    const tl = pinned(el, end)
    tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.045 })
    stickerIn(tl, s, 0.2)
    tl.to({}, { duration: 0.5 })
    if (out) {
      tl.to(fills, { yPercent: -26, opacity: 0, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in', stagger: 0.02 })
      stickerOut(tl, s)
    }
  }

  // ── Scene 1: INTRO — immediate entrance, scrub only the exit ──────
  const introEl = root.querySelector<HTMLElement>('.scene-intro')
  if (introEl) {
    const fills   = collectFills(introEl)
    const gifWrap = introEl.querySelector<HTMLElement>('.intro-gif-wrap')!
    gsap.set(fills, RISE)
    gsap.set(gifWrap, { opacity: 0, scale: 0.65, rotation: -12, y: 30 })

    // GIF card springs in first — immediate on load, no scrub
    gsap.to(gifWrap, {
      opacity: 1, scale: 1, rotation: -3, y: 0,
      duration: 0.85, ease: 'back.out(1.5)', delay: 0.15
    })
    // Text words rise up after the card has landed
    gsap.to(fills, {
      yPercent: 0, opacity: 1, filter: 'blur(0px)',
      duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.55
    })

    // Pin + scrub only the EXIT
    const tl = pinned(introEl, '+=90%')
    tl.to(fills,   { yPercent: -26, opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'power2.in', stagger: 0.02 })
    tl.to(gifWrap, { opacity: 0, scale: 0.8, y: -50, duration: 0.7, ease: 'power2.in' }, '<0.1')
  }

  // ── Scene 2: Fate — polaroid slams in ────────────────────────────
  const fateEl = root.querySelector<HTMLElement>('.scene-fate')
  if (fateEl) {
    const fills    = collectFills(fateEl)
    const sticker  = fateEl.querySelector<HTMLElement>('.sticker')
    const polaroid = fateEl.querySelector<HTMLElement>('.fate-polaroid')!

    gsap.set(fills, RISE)
    gsap.set(polaroid, { opacity: 0, y: -180, rotation: -28, scale: 0.72 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '-11')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(fateEl, '+=125%')
    tl.to(polaroid, { opacity: 1, y: 0, rotation: -10, scale: 1, duration: 0.75, ease: 'back.out(1.35)' }, 0)
    tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.04 }, 0.18)
    stickerIn(tl, sticker, 0.28)
    tl.to({}, { duration: 0.45 })
    tl.to(fills,    { yPercent: -26, opacity: 0, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in', stagger: 0.02 })
    tl.to(polaroid, { opacity: 0, y: -100, rotation: 18, scale: 0.5, duration: 0.5, ease: 'power3.in' }, '<0.05')
    stickerOut(tl, sticker, '<0.05')
  }

  // ── Scene 3: Leap — GIF bounces up from below ─────────────────────
  const leapEl = root.querySelector<HTMLElement>('.scene-leap')
  if (leapEl) {
    const fills   = collectFills(leapEl)
    const sticker = leapEl.querySelector<HTMLElement>('.sticker')
    const gifWrap = leapEl.querySelector<HTMLElement>('.leap-gif-wrap')

    gsap.set(fills, RISE)
    if (gifWrap) gsap.set(gifWrap, { opacity: 0, y: 80, rotation: 12, scale: 0.65 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '14')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(leapEl, '+=110%')
    tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.045 })
    if (gifWrap) tl.to(gifWrap, { opacity: 1, y: 0, rotation: 6, scale: 1, duration: 0.75, ease: 'back.out(1.6)' }, 0.25)
    stickerIn(tl, sticker, 0.2)
    tl.to({}, { duration: 0.5 })
    tl.to(fills, { yPercent: -26, opacity: 0, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in', stagger: 0.02 })
    if (gifWrap) tl.to(gifWrap, { opacity: 0, y: -80, scale: 0.7, duration: 0.5, ease: 'power2.in' }, '<0.05')
    stickerOut(tl, sticker)
  }

  // ── Scene 4: Myth — reality-check GIF drops in top-right ──────────
  const mythEl = root.querySelector<HTMLElement>('.scene-myth')
  if (mythEl) {
    const fills    = collectFills(mythEl)
    const sticker  = mythEl.querySelector<HTMLElement>('.sticker')
    const gifFloat = mythEl.querySelector<HTMLElement>('.myth-gif-float')

    gsap.set(fills, RISE)
    if (gifFloat) gsap.set(gifFloat, { opacity: 0, y: -60, rotation: 20, scale: 0.6 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '-9')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(mythEl, '+=110%')
    tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.045 })
    if (gifFloat) tl.to(gifFloat, { opacity: 1, y: 0, rotation: -8, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, 0.3)
    stickerIn(tl, sticker, 0.2)
    tl.to({}, { duration: 0.5 })
    tl.to(fills, { yPercent: -26, opacity: 0, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in', stagger: 0.02 })
    if (gifFloat) tl.to(gifFloat, { opacity: 0, scale: 0.5, y: -80, duration: 0.4, ease: 'power3.in' }, '<0.05')
    stickerOut(tl, sticker)
  }

  // ── Scene 5: Mentors — mind-blown GIF slides in from left ─────────
  const mentorEl = root.querySelector<HTMLElement>('.scene-mentors')
  if (mentorEl) {
    const fills   = collectFills(mentorEl)
    const sticker = mentorEl.querySelector<HTMLElement>('.sticker')
    const gifWrap = mentorEl.querySelector<HTMLElement>('.mentor-gif-wrap')

    gsap.set(fills, RISE)
    if (gifWrap) gsap.set(gifWrap, { opacity: 0, x: -80, rotation: -18, scale: 0.65 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '7')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(mentorEl, '+=120%')
    if (gifWrap) tl.to(gifWrap, { opacity: 1, x: 0, rotation: -6, scale: 1, duration: 0.8, ease: 'back.out(1.4)' }, 0)
    tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.05 }, 0.2)
    stickerIn(tl, sticker, 0.3)
    tl.to({}, { duration: 0.4 })
    tl.to(fills, { yPercent: -26, opacity: 0, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in', stagger: 0.02 })
    if (gifWrap) tl.to(gifWrap, { opacity: 0, x: -80, scale: 0.7, duration: 0.5, ease: 'power2.in' }, '<0.05')
    stickerOut(tl, sticker)
  }

  // ── Scene 6: Psych — big brain GIF floats up ──────────────────────
  const psychEl = root.querySelector<HTMLElement>('.scene-psych')
  if (psychEl) {
    const fills    = collectFills(psychEl)
    const sticker  = psychEl.querySelector<HTMLElement>('.sticker')
    const gifFloat = psychEl.querySelector<HTMLElement>('.psych-gif-float')

    gsap.set(fills, RISE)
    if (gifFloat) gsap.set(gifFloat, { opacity: 0, scale: 0.5, rotation: 15, y: 40 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '-13')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(psychEl, '+=130%')
    tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.045 })
    if (gifFloat) tl.to(gifFloat, { opacity: 1, scale: 1, rotation: -5, y: 0, duration: 0.7, ease: 'back.out(1.5)' }, 0.35)
    stickerIn(tl, sticker, 0.25)
    tl.to({}, { duration: 0.5 })
    tl.to(fills, { yPercent: -26, opacity: 0, filter: 'blur(8px)', duration: 0.7, ease: 'power2.in', stagger: 0.02 })
    if (gifFloat) tl.to(gifFloat, { opacity: 0, scale: 0.6, y: -50, duration: 0.45, ease: 'power2.in' }, '<0.05')
    stickerOut(tl, sticker)
  }

  // ── Scene 7: Thesis + decode + hacker GIF ─────────────────────────
  const s7 = root.querySelector<HTMLElement>('.scene-thesis')
  if (s7) {
    const sticker  = s7.querySelector<HTMLElement>('.sticker')
    const gifFloat = s7.querySelector<HTMLElement>('.thesis-gif-float')
    const f7: HTMLElement[] = []
    s7.querySelectorAll<HTMLElement>('.line:not(.decode-line)').forEach((l) => f7.push(...maskWords(l)))
    gsap.set(f7, RISE)
    if (gifFloat) gsap.set(gifFloat, { opacity: 0, scale: 0.8, x: 60 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '-8')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const decodeEl = s7.querySelector<HTMLElement>('.decode-line')!
    const finalText = decodeEl.dataset.final ?? decodeEl.textContent ?? ''
    decodeEl.textContent = randGlyphs(finalText.length)
    gsap.set(decodeEl, { opacity: 0, yPercent: 40 })

    const tl = pinned(s7, '+=160%')
    if (gifFloat) tl.to(gifFloat, { opacity: 0.2, scale: 1, x: 0, duration: 1.0, ease: 'power2.out' }, 0)
    tl.to(f7, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.05 })
    stickerIn(tl, sticker, 0.25)
    tl.to(decodeEl, { opacity: 1, yPercent: 0, duration: 0.4, ease: 'power3.out' }, '>0.1')
    const ds = { p: 0 }
    tl.to(ds, {
      p: 1, duration: 1.4, ease: 'none',
      onUpdate: () => { decodeEl.textContent = decodeText(finalText, ds.p) }
    }, '>')
    tl.to({}, { duration: 0.4 })
  }

  // ── Scene 8: Strip + scissors GIF spins in ────────────────────────
  const s8 = root.querySelector<HTMLElement>('.scene-strip')
  if (s8) {
    const sticker   = s8.querySelector<HTMLElement>('.sticker')
    const gifFloat  = s8.querySelector<HTMLElement>('.strip-gif-float')
    const stripLine = s8.querySelector<HTMLElement>('.strip-line')!
    const f8 = maskWords(stripLine)
    gsap.set(f8, RISE)
    if (gifFloat) gsap.set(gifFloat, { opacity: 0, rotation: -30, scale: 0.4, y: -40 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '12')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(s8, '+=150%')
    tl.to(f8, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.035 })
    if (gifFloat) tl.to(gifFloat, { opacity: 1, rotation: 8, scale: 1, y: 0, duration: 0.55, ease: 'back.out(2)' }, 0.2)
    stickerIn(tl, sticker, 0.2)
    tl.to({}, { duration: 0.3 })
    const jargon = s8.querySelectorAll<HTMLElement>('.wfill.jargon')
    tl.set(jargon, { textDecoration: 'line-through' })
    tl.to(jargon, { opacity: 0.1, filter: 'blur(3px)', duration: 0.9, ease: 'power2.inOut', stagger: 0.06 })
    tl.to(s8.querySelectorAll('.wfill.crisp'), { scale: 1.06, duration: 0.9, ease: 'power2.out' }, '<')
    if (gifFloat) tl.to(gifFloat, { rotation: '+=40', scale: 1.2, duration: 0.8, ease: 'power1.inOut' }, '<')
    if (sticker) tl.to(sticker, { rotation: `+=${12}`, duration: 0.8, ease: 'power1.inOut' }, '<')
  }

  // ── Scene 9: Mantra + zen sticker GIF ────────────────────────────
  const s9 = root.querySelector<HTMLElement>('.scene-verse')
  if (s9) {
    const sticker  = s9.querySelector<HTMLElement>('.sticker')
    const gifFloat = s9.querySelector<HTMLElement>('.verse-gif-float')
    const vhindi   = s9.querySelector<HTMLElement>('.vhindi')!
    const beam     = s9.querySelector<HTMLElement>('.vbeam')!
    const translit = maskWords(s9.querySelector<HTMLElement>('.translit')!)
    const veng     = maskWords(s9.querySelector<HTMLElement>('.verse-eng')!)

    gsap.set(vhindi, { opacity: 0, filter: 'blur(26px)', scale: 1.05 })
    gsap.set([...translit, ...veng], { yPercent: 130, opacity: 0 })
    gsap.set(beam, { xPercent: -160, opacity: 0 })
    if (gifFloat) gsap.set(gifFloat, { opacity: 0, scale: 0.4, rotation: 25 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '-6')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(s9, '+=160%')
    tl.to(vhindi, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.2, ease: 'power3.out' })
    tl.to(beam, { xPercent: 360, opacity: 1, duration: 1.0, ease: 'power1.inOut' }, 0.2)
    tl.to(beam, { opacity: 0, duration: 0.3 }, '>-0.15')
    if (gifFloat) tl.to(gifFloat, { opacity: 1, scale: 1, rotation: -10, duration: 0.6, ease: 'back.out(1.8)' }, 0.3)
    stickerIn(tl, sticker, 0.35)
    tl.to(translit, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 }, '>-0.2')
    tl.to(veng, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, '>')
    tl.to({}, { duration: 0.4 })
  }

  // ── Scene 10: Closer — celebration GIF floats in ──────────────────
  const closerEl = root.querySelector<HTMLElement>('.scene-closer')
  if (closerEl) {
    const fills    = collectFills(closerEl)
    const sticker  = closerEl.querySelector<HTMLElement>('.sticker')
    const gifFloat = closerEl.querySelector<HTMLElement>('.closer-gif-float')

    gsap.set(fills, RISE)
    if (gifFloat) gsap.set(gifFloat, { opacity: 0, y: 80, scale: 0.6, rotation: -15 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '5')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(closerEl, '+=120%')
    tl.to(fills, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.045 })
    if (gifFloat) tl.to(gifFloat, { opacity: 1, y: 0, scale: 1, rotation: 8, duration: 0.8, ease: 'back.out(1.4)' }, 0.3)
    stickerIn(tl, sticker, 0.2)
    tl.to({}, { duration: 0.6 })
  }

  // ── Coda: scroll-triggered reveal ────────────────────────────────
  const coda = root.querySelector<HTMLElement>('.coda')
  if (coda) {
    const items = coda.querySelectorAll<HTMLElement>('.coda-reveal')
    gsap.from(items, {
      opacity: 0, y: 36, duration: 0.85, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: coda, start: 'top 78%' }
    })
  }

  ScrollTrigger.refresh()
  cleanups.push(() => lenisInst?.off?.('scroll', ScrollTrigger.update))
})

onUnmounted(() => {
  stickerAnims.forEach((a) => a.destroy())
  stickerAnims.length = 0
  stickerMap.clear()
  tls.forEach((tl) => { tl.scrollTrigger?.kill(); tl.kill() })
  tls.length = 0
  ScrollTrigger.getAll().forEach((t) => t.kill())
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
})
</script>

<template>
  <div ref="rootRef" class="about-cine">

    <!-- 1 · INTRO -->
    <section class="scene scene-intro">
      <div class="scene-inner intro-inner">

        <!-- GIF card — left column -->
        <div class="intro-gif-wrap">
          <img class="intro-gif" src="/hi.gif" alt="Hi" />
        </div>

        <!-- Text — right column -->
        <div class="intro-text">
          <p class="line l-xl">Hey. I'm <span class="hl">Naveen Jose.</span></p>
          <p class="line l-md dim">I'm an Instructional Designer with a very particular, borderline obsessive need for two things:</p>
          <p class="line l-lg">making things look <span class="hl">simple</span>,</p>
          <p class="line l-lg">and making things look <span class="hl">good</span>.</p>
        </div>

      </div>
    </section>

    <!-- 2 · TWIST OF FATE -->
    <section class="scene scene-fate">
      <div class="sticker sticker-bl s-fate" data-rot="-11">
        <div class="sticker-lottie" data-src="/lottie/stickers/explore.json"></div>
      </div>
      <div class="scene-inner fate-inner">
        <div class="fate-text">
          <p class="line l-md">Walked out of college with a hospitality degree.</p>
          <p class="line l-lg"><span class="hl">Hotel career.</span> Full stop.</p>
          <p class="line l-md dim">That was the entire plan.</p>
          <p class="line l-xl">Then L&amp;D happened.</p>
        </div>
        <div class="fate-polaroid">
          <img class="fate-polaroid__img" src="/graduation.gif" alt="College graduation" />
          <p class="fate-polaroid__caption">Not the plan.</p>
        </div>
      </div>
    </section>

    <!-- 3 · THE LEAP -->
    <section class="scene scene-leap">
      <div class="sticker sticker-tl s-leap" data-rot="14">
        <div class="sticker-lottie" data-src="/lottie/stickers/heart.json"></div>
      </div>
      <div class="scene-inner leap-inner">
        <div class="leap-text">
          <p class="line l-md">Then Marriott called.</p>
          <p class="line l-md dim">I said yes before they finished the sentence.</p>
          <p class="line l-xl">L&amp;D is just — <span class="hl">in my blood.</span></p>
          <p class="line l-md">A passion. A very specific kind of headache I actually enjoy.</p>
        </div>
        <div class="leap-gif-wrap gif-card">
          <img src="/gifs/leap.gif" alt="" />
        </div>
      </div>
    </section>

    <!-- 4 · MYTH-BUST -->
    <section class="scene scene-myth">
      <div class="sticker sticker-tr s-myth" data-rot="-9">
        <div class="sticker-lottie" data-src="/lottie/stickers/calendar.json"></div>
      </div>
      <div class="myth-gif-float gif-float">
        <img src="/gifs/myth.gif" alt="" />
      </div>
      <div class="scene-inner">
        <p class="line l-md">But let's be real for a second.</p>
        <p class="line l-sm quote">"I wanted a chill job, so I figured training would be easier."</p>
        <p class="line l-lg">Hard. Nope.</p>
        <p class="line l-xl">This job will <span class="hl">humble you.</span> Fast.</p>
      </div>
    </section>

    <!-- 5 · MENTORS -->
    <section class="scene scene-mentors">
      <div class="sticker sticker-br s-mentors" data-rot="7">
        <div class="sticker-lottie" data-src="/lottie/stickers/visibility2.json"></div>
      </div>
      <div class="scene-inner mentor-inner">
        <div class="mentor-gif-wrap gif-card">
          <img src="/gifs/mentor.gif" alt="" />
          <p class="gif-card__caption">mind = blown</p>
        </div>
        <div class="mentor-text">
          <p class="line l-md">Thankfully, I found the actual geniuses.</p>
          <p class="line l-lg">The ones who walked into any room —</p>
          <p class="line l-xl">and quietly <span class="hl">rewired every brain</span> in it.</p>
        </div>
      </div>
    </section>

    <!-- 6 · PSYCHOLOGY -->
    <section class="scene scene-psych">
      <div class="sticker sticker-tr s-psych" data-rot="-13">
        <div class="sticker-lottie" data-src="/lottie/stickers/activity.json"></div>
      </div>
      <div class="psych-gif-float gif-float">
        <img src="/gifs/psych.gif" alt="" />
      </div>
      <div class="scene-inner">
        <p class="line l-lg">The brain is hilarious.</p>
        <p class="line l-md">It'll pick up a new accent just by being near one.</p>
        <p class="line l-md">But actively resist anything it actually needs to know.</p>
        <p class="line l-xl">So what's the <span class="hl">hack?</span></p>
        <p class="line l-md dim">That question keeps me up at night.</p>
      </div>
    </section>

    <!-- 7 · THESIS + DECODE -->
    <section class="scene scene-thesis">
      <div class="sticker sticker-bl s-thesis" data-rot="-8">
        <div class="sticker-lottie" data-src="/lottie/stickers/edit.json"></div>
      </div>
      <div class="thesis-gif-float gif-float">
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
      <div class="strip-gif-float gif-float">
        <img src="/gifs/strip.gif" alt="" />
      </div>
      <div class="scene-inner center">
        <p class="line l-lg strip-line">We cancel <span class="jargon">the noise,</span> <span class="jargon">the corporate jargon,</span> <span class="jargon">the absolute fluff</span> — and keep only <span class="crisp">the crisp, shiny details</span> the mind needs.</p>
      </div>
    </section>

    <!-- 9 · MANTRA (CLIMAX) -->
    <section class="scene scene-verse">
      <div class="sticker sticker-br s-verse" data-rot="-6">
        <div class="sticker-lottie" data-src="/lottie/stickers/infinity.json"></div>
      </div>
      <div class="verse-gif-float gif-float">
        <img src="/gifs/verse.gif" alt="" />
      </div>
      <div class="scene-inner center">
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
      <div class="closer-gif-float gif-float">
        <img src="/gifs/closer.gif" alt="" />
      </div>
      <div class="scene-inner center">
        <p class="line l-lg">That's the whole job.</p>
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
/* Accent highlight — luminous on dark, true brand navy on light */
.about-cine { --hl: #6E92CE; }
[data-theme="light"] .about-cine { --hl: #243F6A; }

.about-cine {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--main-font);
}

/* ── Scenes ── */
.scene {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rem var(--grid-margin);
  background: var(--color-bg);
  overflow: hidden;
}
.scene-inner {
  width: 100%;
  max-width: 1100rem;
  display: flex;
  flex-direction: column;
  gap: 0.28em;
  position: relative;
  z-index: 2;
}
.scene-inner.center { align-items: center; text-align: center; }

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
  box-shadow:
    0 12rem 40rem rgba(0,0,0,0.38),
    0 2rem 8rem rgba(0,0,0,0.18);
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

/* ── Scene 2: Fate — two-column + polaroid ── */
.fate-inner {
  flex-direction: row !important;
  align-items: center;
  gap: 64rem;
}
.fate-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.fate-polaroid {
  flex: 0 0 auto;
  width: clamp(160rem, 20vw, 270rem);
  background: #FDFCF8;
  padding: 14rem 14rem 52rem;
  box-shadow:
    0 16rem 48rem rgba(0,0,0,0.45),
    0 3rem 10rem rgba(0,0,0,0.22);
  will-change: transform, opacity;
  z-index: 3;
}
.fate-polaroid__img {
  display: block;
  width: 100%;
  height: auto;
}
.fate-polaroid__caption {
  text-align: center;
  font-size: 13rem;
  font-weight: 500;
  font-style: italic;
  color: #666;
  margin-top: 10rem;
  letter-spacing: 0.01em;
}
@media (max-width: 768px) {
  .fate-inner {
    flex-direction: column-reverse !important;
    align-items: flex-start;
    gap: 32rem;
  }
  .fate-polaroid { width: 150rem; align-self: center; }
}

/* ── Scrapbook sticker badges ── */
.sticker {
  position: absolute;
  width: 84rem;
  height: 84rem;
  border-radius: 50%;
  padding: 16rem;
  box-shadow:
    0 6rem 20rem rgba(0,0,0,0.35),
    inset 0 1rem 0 rgba(255,255,255,0.3);
  opacity: 0;
  will-change: transform, opacity;
  pointer-events: none;
  z-index: 6;
}
/* Tape strip across the top */
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
/* Per-scene badge colours */
.s-fate    { background: #FF6B6B; }
.s-leap    { background: #4FC3F7; }
.s-myth    { background: #CE93D8; }
.s-mentors { background: #F9A825; }
.s-psych   { background: #06D6A0; }
.s-thesis  { background: #EF5350; }
.s-strip   { background: #FF9800; }
.s-verse   { background: #7E57C2; }
.s-closer  { background: #26C6DA; }

/* Corner positions */
.sticker-tl { top: 10%; left: 5%; }
.sticker-tr { top: 10%; right: 5%; }
.sticker-bl { bottom: 14%; left: 5%; }
.sticker-br { bottom: 14%; right: 5%; }

/* Lottie icon container — fill badge, render icon as white */
.sticker-lottie {
  width: 100%;
  height: 100%;
  filter: brightness(0) invert(1);
}

@media (max-width: 640px) {
  .sticker { width: 60rem; height: 60rem; padding: 10rem; }
  .sticker-tl { top: 6%;  left: 3%; }
  .sticker-tr { top: 6%;  right: 3%; }
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

.hl { color: var(--hl); font-weight: 700; }

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

/* ── Strip-the-noise ── */
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
  .scene-inner { gap: 0.34em; }
}

/* ── Shared GIF card (Polaroid-style, in-flow) ── */
.gif-card {
  flex: 0 0 auto;
  background: #FDFCF8;
  border-radius: 12rem;
  padding: 12rem 12rem 44rem;
  box-shadow:
    0 16rem 48rem rgba(0,0,0,0.42),
    0 3rem 10rem rgba(0,0,0,0.2);
  will-change: transform, opacity;
  opacity: 0;
}
.gif-card img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4rem;
}
.gif-card__caption {
  text-align: center;
  font-size: 12rem;
  font-weight: 500;
  font-style: italic;
  color: #666;
  margin-top: 10rem;
}

/* ── Shared floating GIF (absolute, out of flow) ── */
.gif-float {
  position: absolute;
  will-change: transform, opacity;
  opacity: 0;
  pointer-events: none;
  z-index: 5;
}
.gif-float img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 10rem;
}

/* ── Scene-specific float positions & sizes ── */
.myth-gif-float  { top: 8%;    right: 6%;   width: clamp(110rem, 13vw, 200rem); }
.psych-gif-float { bottom: 12%; right: 5%;  width: clamp(120rem, 14vw, 210rem); }
.thesis-gif-float {
  right: -2%; top: 0; bottom: 0;
  width: clamp(200rem, 26vw, 380rem);
  display: flex; align-items: center;
}
.thesis-gif-float img { border-radius: 0; }
.strip-gif-float { top: 10%;    right: 6%;   width: clamp(90rem, 10vw, 150rem); }
.verse-gif-float { bottom: 10%; left: 6%;    width: clamp(80rem, 9vw, 130rem); }
.closer-gif-float { bottom: 8%; right: 6%;   width: clamp(130rem, 15vw, 220rem); }

/* ── Scene 3: Leap two-column ── */
.leap-inner {
  flex-direction: row !important;
  align-items: center;
  gap: 56rem;
}
.leap-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.28em;
}
.leap-gif-wrap { width: clamp(130rem, 16vw, 220rem); }

/* ── Scene 5: Mentors two-column ── */
.mentor-inner {
  flex-direction: row !important;
  align-items: center;
  gap: 60rem;
}
.mentor-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.28em;
}
.mentor-gif-wrap { width: clamp(150rem, 18vw, 240rem); }

@media (max-width: 768px) {
  .leap-inner   { flex-direction: column !important; align-items: flex-start; gap: 32rem; }
  .leap-gif-wrap { width: clamp(110rem, 32vw, 170rem); align-self: center; }
  .mentor-inner { flex-direction: column-reverse !important; align-items: flex-start; gap: 28rem; }
  .mentor-gif-wrap { width: 140rem; align-self: center; }
  .myth-gif-float, .psych-gif-float, .strip-gif-float, .closer-gif-float {
    width: clamp(80rem, 22vw, 130rem);
  }
  .thesis-gif-float { display: none; }
  .verse-gif-float  { width: 80rem; }
}
</style>

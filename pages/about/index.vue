<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

// Animate a sticker in at position `at` in the timeline
function stickerIn(tl: gsap.core.Timeline, s: HTMLElement | null, at: number | string = 0.15) {
  if (!s) return
  const rot = parseFloat(s.dataset.rot ?? '6')
  tl.to(s, { opacity: 1, scale: 1, rotation: rot, y: 0, duration: 0.55, ease: 'back.out(1.9)' }, at)
}

// Animate a sticker out
function stickerOut(tl: gsap.core.Timeline, s: HTMLElement | null, at: number | string = '>-0.1') {
  if (!s) return
  tl.to(s, { opacity: 0, scale: 0.5, y: -40, duration: 0.3, ease: 'power2.in' }, at)
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  const root = rootRef.value
  if (!root) return

  const lenis = $lenis as any
  lenis?.on?.('scroll', ScrollTrigger.update)

  // Helper for standard narrative scenes with sticker
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

  // ── Scene 1: INTRO — immediate entrance tween, scrub only the exit ──
  const introEl = root.querySelector<HTMLElement>('.scene-intro')
  if (introEl) {
    const fills = collectFills(introEl)
    const s = introEl.querySelector<HTMLElement>('.sticker')
    gsap.set(fills, RISE)
    if (s) gsap.set(s, { opacity: 0, scale: 0.3, rotation: -18, y: 24 })

    // Immediate entrance — no scrub needed; page should be alive on load
    gsap.to(fills, {
      yPercent: 0, opacity: 1, filter: 'blur(0px)',
      duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.25
    })
    if (s) {
      const rot = parseFloat(s.dataset.rot ?? '8')
      gsap.to(s, { opacity: 1, scale: 1, rotation: rot, y: 0, duration: 0.7, ease: 'back.out(1.7)', delay: 0.65 })
    }

    // Pin + scrub only the EXIT
    const tl = pinned(introEl, '+=90%')
    tl.to(fills, { yPercent: -26, opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'power2.in', stagger: 0.02 })
    if (s) tl.to(s, { opacity: 0, scale: 0.4, y: -50, duration: 0.5 }, '<0.05')
  }

  // ── Scenes 2–6: plain narrative beats ─────────────────────────────
  sceneWithSticker('.scene-fate')
  sceneWithSticker('.scene-leap')
  sceneWithSticker('.scene-myth')
  sceneWithSticker('.scene-mentors')
  sceneWithSticker('.scene-psych', '+=130%')

  // ── Scene 7: Thesis + decode ("We hack brains.") ──────────────────
  const s7 = root.querySelector<HTMLElement>('.scene-thesis')
  if (s7) {
    const sticker = s7.querySelector<HTMLElement>('.sticker')
    const f7: HTMLElement[] = []
    s7.querySelectorAll<HTMLElement>('.line:not(.decode-line)').forEach((l) => f7.push(...maskWords(l)))
    gsap.set(f7, RISE)
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '-8')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const decodeEl = s7.querySelector<HTMLElement>('.decode-line')!
    const finalText = decodeEl.dataset.final ?? decodeEl.textContent ?? ''
    decodeEl.textContent = randGlyphs(finalText.length)
    gsap.set(decodeEl, { opacity: 0, yPercent: 40 })

    const tl = pinned(s7, '+=160%')
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

  // ── Scene 8: Strip the noise ───────────────────────────────────────
  const s8 = root.querySelector<HTMLElement>('.scene-strip')
  if (s8) {
    const sticker = s8.querySelector<HTMLElement>('.sticker')
    const stripLine = s8.querySelector<HTMLElement>('.strip-line')!
    const f8 = maskWords(stripLine)
    gsap.set(f8, RISE)
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '12')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(s8, '+=150%')
    tl.to(f8, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.035 })
    stickerIn(tl, sticker, 0.2)
    tl.to({}, { duration: 0.3 })
    const jargon = s8.querySelectorAll<HTMLElement>('.wfill.jargon')
    tl.set(jargon, { textDecoration: 'line-through' })
    tl.to(jargon, { opacity: 0.1, filter: 'blur(3px)', duration: 0.9, ease: 'power2.inOut', stagger: 0.06 })
    tl.to(s8.querySelectorAll('.wfill.crisp'), { scale: 1.06, duration: 0.9, ease: 'power2.out' }, '<')
    if (sticker) tl.to(sticker, { rotation: `+=${12}`, duration: 0.8, ease: 'power1.inOut' }, '<')
  }

  // ── Scene 9: Mantra (climax) — blur → sharp + accent beam ─────────
  const s9 = root.querySelector<HTMLElement>('.scene-verse')
  if (s9) {
    const sticker = s9.querySelector<HTMLElement>('.sticker')
    const vhindi   = s9.querySelector<HTMLElement>('.vhindi')!
    const beam     = s9.querySelector<HTMLElement>('.vbeam')!
    const translit = maskWords(s9.querySelector<HTMLElement>('.translit')!)
    const veng     = maskWords(s9.querySelector<HTMLElement>('.verse-eng')!)

    gsap.set(vhindi, { opacity: 0, filter: 'blur(26px)', scale: 1.05 })
    gsap.set([...translit, ...veng], { yPercent: 130, opacity: 0 })
    gsap.set(beam, { xPercent: -160, opacity: 0 })
    if (sticker) {
      const rot = parseFloat(sticker.dataset.rot ?? '-6')
      gsap.set(sticker, { opacity: 0, scale: 0.3, rotation: rot - 22, y: 24 })
    }

    const tl = pinned(s9, '+=160%')
    tl.to(vhindi, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.2, ease: 'power3.out' })
    tl.to(beam, { xPercent: 360, opacity: 1, duration: 1.0, ease: 'power1.inOut' }, 0.2)
    tl.to(beam, { opacity: 0, duration: 0.3 }, '>-0.15')
    stickerIn(tl, sticker, 0.35)
    tl.to(translit, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 }, '>-0.2')
    tl.to(veng, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, '>')
    tl.to({}, { duration: 0.4 })
  }

  // ── Scene 10: Closer — holds (no out) so it hands to the coda ─────
  sceneWithSticker('.scene-closer', '+=120%', false)

  // ── Coda: identity + contact (normal flow, simple reveal) ──────────
  const coda = root.querySelector<HTMLElement>('.coda')
  if (coda) {
    const items = coda.querySelectorAll<HTMLElement>('.coda-reveal')
    gsap.from(items, {
      opacity: 0, y: 36, duration: 0.85, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: coda, start: 'top 78%' }
    })
  }

  ScrollTrigger.refresh()
  cleanups.push(() => lenis?.off?.('scroll', ScrollTrigger.update))
})

onUnmounted(() => {
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
      <span class="sticker sticker-tr" data-rot="8">✨</span>
      <div class="scene-inner">
        <p class="line l-xl">Hey. I'm <span class="hl">Naveen Jose.</span></p>
        <p class="line l-md dim">I'm an Instructional Designer with a very particular, borderline obsessive need for two things:</p>
        <p class="line l-lg">making things look <span class="hl">simple</span>,</p>
        <p class="line l-lg">and making things look <span class="hl">good</span>.</p>
      </div>
    </section>

    <!-- 2 · TWIST OF FATE -->
    <section class="scene scene-fate">
      <span class="sticker sticker-bl" data-rot="-11">🎲</span>
      <div class="scene-inner">
        <p class="line l-md">Honestly, doing what I do today feels like a highly specific twist of fate.</p>
        <p class="line l-md">I walked out of college with a degree in hospitality, fully expecting to spend the rest of my life worrying about room inventory.</p>
        <p class="line l-md">I definitely didn't plan on Learning &amp; Development becoming my life's work.</p>
        <p class="line l-md">But Club Mahindra handed me an opportunity to step up — a responsibility passed down by my <span class="hl">first mentor</span>.</p>
      </div>
    </section>

    <!-- 3 · THE LEAP -->
    <section class="scene scene-leap">
      <span class="sticker sticker-tl" data-rot="14">⚡</span>
      <div class="scene-inner">
        <p class="line l-md">Taking the leap from there to Marriott International was a massive shift.</p>
        <p class="line l-md dim">People still ask how I managed the switch.</p>
        <p class="line l-lg">The answer is honestly just that L&amp;D is in my <span class="hl">blood</span>.</p>
        <p class="line l-md">It's a passion, a very specific kind of headache I actually enjoy, and the exact reason I get out of bed every day.</p>
        <p class="line l-md">So, I gave an interview, and I got the job. <span class="hl">Miraculous, I know.</span></p>
      </div>
    </section>

    <!-- 4 · MYTH-BUST -->
    <section class="scene scene-myth">
      <span class="sticker sticker-tr" data-rot="-9">⏰</span>
      <div class="scene-inner">
        <p class="line l-md">But let's clear something up.</p>
        <p class="line l-md">Switching to L&amp;D might look like the ultimate life hack for an easy paycheck.</p>
        <p class="line l-sm quote">I've literally heard people say, "I wanted a 9-to-6 job, so I figured training would be better."</p>
        <p class="line l-md">Right. You decided to tackle the complex psychology of adult learning because you wanted to beat the evening traffic. Makes total sense.</p>
        <p class="line l-lg">What this job actually demands will <span class="hl">humble you real fast.</span></p>
      </div>
    </section>

    <!-- 5 · MENTORS -->
    <section class="scene scene-mentors">
      <span class="sticker sticker-br" data-rot="7">💡</span>
      <div class="scene-inner">
        <p class="line l-md">Thankfully, I had mentors who showed me the other side. The stellar ones.</p>
        <p class="line l-lg">The actual <span class="hl">geniuses</span> who didn't just treat training like an HR hostage situation —</p>
        <p class="line l-md">but knew how to quietly rewire a room full of people.</p>
      </div>
    </section>

    <!-- 6 · PSYCHOLOGY -->
    <section class="scene scene-psych">
      <span class="sticker sticker-tr" data-rot="-13">🧠</span>
      <div class="scene-inner">
        <p class="line l-lg">That psychological side is what hooks me.</p>
        <p class="line l-lg">The human brain is hilarious.</p>
        <p class="line l-md">It constantly picks up new accents, habits, and completely useless trivia just by existing.</p>
        <p class="line l-md">Yet, it often actively resists learning what it actually needs to know.</p>
        <p class="line l-md">So how do you bypass that? What's the exact <span class="hl">seasoning</span> you have to hide in a module so the brain decides to keep it? What is the <span class="hl">hack</span> that opens up someone's mind without them even realizing it?</p>
      </div>
    </section>

    <!-- 7 · THESIS + DECODE -->
    <section class="scene scene-thesis">
      <span class="sticker sticker-bl" data-rot="-8">👾</span>
      <div class="scene-inner center">
        <p class="line l-md dim">That's the part of this industry that changes your perspective entirely.</p>
        <p class="line l-lg">We aren't just building training material.</p>
        <p class="line l-xl">We are <span class="hl">hackers</span>.</p>
        <p class="line l-xl decode-line mono" data-final="We hack brains."></p>
      </div>
    </section>

    <!-- 8 · STRIP THE NOISE -->
    <section class="scene scene-strip">
      <span class="sticker sticker-tl" data-rot="12">✂️</span>
      <div class="scene-inner center">
        <p class="line l-lg strip-line">We cancel out <span class="jargon">the noise,</span> <span class="jargon">the corporate jargon,</span> <span class="jargon">the absolute fluff,</span> and keep only <span class="crisp">the crisp, shiny details</span> the mind actually needs to absorb.</p>
      </div>
    </section>

    <!-- 9 · MANTRA (CLIMAX) -->
    <section class="scene scene-verse">
      <span class="sticker sticker-br" data-rot="-6">🪷</span>
      <div class="scene-inner center">
        <span class="vbeam"></span>
        <p class="line vhindi no-split">असतो मा सद्गमय</p>
        <p class="line l-md translit">Asatoma sadgamaya.</p>
        <p class="line l-xl verse-eng">From the unreal, to the <span class="hl">real</span>.</p>
      </div>
    </section>

    <!-- 10 · CLOSER -->
    <section class="scene scene-closer">
      <span class="sticker sticker-tr" data-rot="5">🏔️</span>
      <div class="scene-inner center">
        <p class="line l-lg">That's the whole job.</p>
        <p class="line l-md">Stripping away the unreal to lead people to the concepts that actually matter.</p>
        <p class="line l-md">We change perspectives. We influence. We move the immovable.</p>
        <p class="line l-xl">And we make the <span class="hl">impossible, possible.</span></p>
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

/* ── Scrapbook stickers ── */
.sticker {
  position: absolute;
  font-size: 72rem;
  line-height: 1;
  user-select: none;
  pointer-events: none;
  z-index: 6;
  filter: drop-shadow(0 4rem 10rem rgba(0,0,0,0.28));
  will-change: transform, opacity;
  opacity: 0;
}
.sticker-tl { top: 10%; left: 5%; }
.sticker-tr { top: 10%; right: 5%; }
.sticker-bl { bottom: 14%; left: 5%; }
.sticker-br { bottom: 14%; right: 5%; }

@media (max-width: 640px) {
  .sticker { font-size: 48rem; }
  .sticker-tl { top: 8%;  left: 3%; }
  .sticker-tr { top: 8%;  right: 3%; }
  .sticker-bl { bottom: 10%; left: 3%; }
  .sticker-br { bottom: 10%; right: 3%; }
}

/* ── Line scale system ── */
.line { letter-spacing: -0.035em; line-height: 1.08; font-weight: 600; }
.l-xl { font-size: clamp(44rem, 8.4vw, 132rem); font-weight: 700; line-height: 1.0; }
.l-lg { font-size: clamp(30rem, 5vw, 74rem); font-weight: 650; }
.l-md { font-size: clamp(21rem, 2.9vw, 40rem); font-weight: 500; line-height: 1.24; letter-spacing: -0.025em; }
.l-sm { font-size: clamp(15rem, 1.7vw, 21rem); font-weight: 400; line-height: 1.4; letter-spacing: -0.01em; }
.dim  { opacity: 0.45; }
.quote { font-style: italic; opacity: 0.6; }
.mono { font-family: "SFMono-Regular", "JetBrains Mono", "Menlo", monospace; letter-spacing: 0; }

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
</style>

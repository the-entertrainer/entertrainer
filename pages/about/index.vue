<template>
  <div class="about-wrap">
    <!-- Living fluted-glass gradient — the site's signature backdrop -->
    <UiGlassBackdrop />

    <div class="about-container">

      <!-- ───────────────── Hero panel ───────────────── -->
      <section class="about-panel about-panel--hero anim">
        <h1 class="about-intro">
          I am Naveen, and I'm an Instructional Designer.
        </h1>
        <hr class="about-rule" />
        <p class="about-lead">
          Finding Instructional Design as a career was never planned—it was a discovery.
        </p>
      </section>

      <!-- ───────────────── Chapter 01 · The Floor ───────────────── -->
      <section class="about-panel anim">
        <p class="about-chapter"><span class="about-chapter__no">01</span> The Floor</p>
        <p class="about-body">I started my career in the hotel industry and had the opportunity to work with brands such as Marriott International and Club Mahindra. My first job was as a housekeeper - with Club Mahindra. Yes, I made beds, cleaned rooms, folded towel art (the fun stuff), and learned how to make spaces feel welcoming, organized, and beautiful. Housekeeping is an art backed by science. You can still see the way I keep my toilet rolls in my place - nicely folded into a rose 😂 and my bedsheets are always wrinkle free 😉</p>
      </section>

      <figure class="shot shot--duo anim">
        <div class="shot__grid shot__grid--duo">
          <div class="shot__cell">
            <img class="shot__img px" src="/about/about-housekeeper-1.webp" alt="Naveen early in his career at the hotel" loading="lazy" />
          </div>
          <div class="shot__cell">
            <img class="shot__img px" src="/about/about-housekeeper-2.webp" alt="Naveen in a Marriott lobby" loading="lazy" />
          </div>
        </div>
        <figcaption class="shot__cap">
          <span class="shot__cap-rule" />
          <span>Where it started — the floors of Club Mahindra Udaipur. Long before I ever designed a lesson, I was learning that a space, like a story, has to make people <em>feel</em> something.</span>
        </figcaption>
      </figure>

      <section class="about-panel about-panel--callout anim">
        <p class="about-callout">Looking back, that role taught me something I still carry today: details matter, and experiences matter even more.</p>
      </section>

      <!-- ───────────────── Chapter 02 · The Spark ───────────────── -->
      <section class="about-panel anim">
        <p class="about-chapter"><span class="about-chapter__no">02</span> The Spark</p>
        <p class="about-body">The path that led me into Learning and Development was shaped by the mentors I met along the way. Their guidance redirected my curiosity toward learning, people, and growth. The transition wasn't easy. It took countless sleepless nights, long days, and an endless commitment to learning concepts I once didn't even know existed.</p>
      </section>

      <figure class="shot shot--editorial anim">
        <div class="shot__grid shot__grid--editorial">
          <div class="shot__cell shot__cell--wide">
            <img class="shot__img px" src="/about/about-sewa-1.webp" alt="SEWA Chronicles comic storyboards laid out on a table" loading="lazy" />
          </div>
          <div class="shot__cell shot__cell--tall">
            <img class="shot__img px" src="/about/about-sewa-2.webp" alt="SEWA Chronicles comic pages in a training room" loading="lazy" />
          </div>
        </div>
        <figcaption class="shot__cap">
          <span class="shot__cap-rule" />
          <span><strong>SEWA Chronicles</strong> — my first project alongside a Corporate L&amp;D team. We turned dry service standards into comic strips. I didn't have the words <em>"instructional design"</em> yet, but this was exactly that: turning information into something people actually wanted to read.</span>
        </figcaption>
      </figure>

      <section class="about-panel anim">
        <p class="about-pull">
          What fascinated me most wasn't the content itself—it was people.
        </p>
        <div class="about-questions">
          <p>How do people learn?</p>
          <p>Why do they resist change?</p>
          <p>What motivates them?</p>
          <p>What makes them remember?</p>
        </div>
        <p class="about-body">Observing people, understanding their behaviors, and uncovering what drives them became an obsession. That curiosity eventually led me into Learning &amp; Development and, later, Instructional Design.</p>
      </section>

      <!-- ───────────────── Chapter 03 · The Craft ───────────────── -->
      <section class="about-panel anim">
        <p class="about-chapter"><span class="about-chapter__no">03</span> The Craft</p>
        <p class="about-body">To me, Instructional Designers decide what is taught and how it is taught. But more importantly, we are entertainers. We remove the noise, simplify complexity, and uncover the core truth that helps people understand, remember, and act.</p>
      </section>

      <figure class="shot shot--gallery anim">
        <div class="shot__grid shot__grid--gallery">
          <figure class="shot__item">
            <div class="shot__cell"><img class="shot__img" src="/about/about-ignite.webp" alt="IGNITE certification program for Marriott International" loading="lazy" /></div>
            <figcaption class="shot__tag">IGNITE · Leadership ignition</figcaption>
          </figure>
          <figure class="shot__item">
            <div class="shot__cell"><img class="shot__img" src="/about/about-cdt.webp" alt="CDT Masterclass — Training the Trainers" loading="lazy" /></div>
            <figcaption class="shot__tag">CDT Masterclass · Training the trainers</figcaption>
          </figure>
          <figure class="shot__item">
            <div class="shot__cell"><img class="shot__img" src="/about/about-onboarding.webp" alt="Heroes On Board onboarding program" loading="lazy" /></div>
            <figcaption class="shot__tag">Heroes On Board · Onboarding</figcaption>
          </figure>
        </div>
        <figcaption class="shot__cap">
          <span class="shot__cap-rule" />
          <span>Programs I went on to design and run for <strong>Marriott International</strong> — rooms full of people learning without ever feeling like they were being taught.</span>
        </figcaption>
      </figure>

      <section class="about-panel about-panel--closing anim">
        <p class="about-body">That's what excites me every day: turning information into experiences that people genuinely connect with.</p>
        <p class="about-asatoma">Asatoma Sadgamaya.</p>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

let io: IntersectionObserver | null = null

// ── Scroll-linked parallax on photographs (cinematic drift) ────────────────
let pxEls: HTMLElement[] = []
let pxRaf = 0
let reduceMotion = false

function applyParallax() {
  pxRaf = 0
  const vh = window.innerHeight
  for (const el of pxEls) {
    const r = el.getBoundingClientRect()
    const center = r.top + r.height / 2
    // -0.5 (above centre) … +0.5 (below centre)
    const rel = (center - vh / 2) / vh
    const shift = Math.max(-1, Math.min(1, rel)) * -16 // px
    el.style.transform = `translateY(${shift.toFixed(2)}px)`
  }
}

function onScroll() {
  if (!pxRaf) pxRaf = requestAnimationFrame(applyParallax)
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  io = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view')
          io!.unobserve(e.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -28px 0px' }
  )

  const els = document.querySelectorAll('.anim')
  els.forEach((el, i) => {
    if (i < 3) (el as HTMLElement).style.transitionDelay = `${i * 0.09}s`
    io!.observe(el)
  })

  if (!reduceMotion) {
    pxEls = Array.from(document.querySelectorAll<HTMLElement>('.px'))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    applyParallax()
  }
})

onBeforeUnmount(() => {
  io?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (pxRaf) cancelAnimationFrame(pxRaf)
})
</script>

<style scoped>
/* ─── Wrap ─── (transparent so the living gradient shows through) */
.about-wrap {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  padding: calc(108rem + var(--safe-top)) 0 96rem;
  overflow-x: clip;
}

/* ─── Container ─── */
.about-container {
  position: relative;
  z-index: 1;
  max-width: 720rem;
  margin: 0 auto;
  padding: 0 24rem;
}

/* ─── Base reveal ─── */
.anim {
  opacity: 0;
  transform: translateY(20rem);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.anim.in-view {
  opacity: 1;
  transform: none;
}

/* ─── Frosted glass story panel ─── */
.about-panel {
  position: relative;
  z-index: 1;
  margin: 0 0 18rem;
  padding: 40rem 40rem;
  border-radius: 26rem;
  /* theme-true frosted glass: dark panel in dark theme, light in light theme */
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.10), transparent 38%),
    color-mix(in srgb, var(--color-bg) 62%, transparent);
  backdrop-filter: blur(26px) saturate(1.4);
  -webkit-backdrop-filter: blur(26px) saturate(1.4);
  border: 1px solid var(--color-glass-border);
  box-shadow:
    0 34rem 90rem -42rem rgba(0, 0, 0, 0.6),
    inset 0 1px 1px color-mix(in srgb, var(--color-text) 16%, transparent),
    inset 0 0 60rem color-mix(in srgb, var(--color-text) 3%, transparent);
}
.about-panel--hero {
  padding: 48rem 40rem 44rem;
  margin-bottom: 26rem;
}
.about-panel--callout { padding: 30rem 36rem; }
.about-panel--closing { margin-bottom: 0; }

/* ─── Intro ─── */
.about-intro {
  font-size: clamp(32rem, 4vw, 50rem);
  font-weight: 700;
  line-height: 1.18;
  letter-spacing: -0.04em;
  color: var(--color-text);
}

/* ─── Rule ─── */
.about-rule {
  border: none;
  border-top: 1px solid var(--color-divider);
  margin: 28rem 0 24rem;
}

/* ─── Lead ─── */
.about-lead {
  font-size: clamp(18rem, 2.1vw, 23rem);
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

/* ─── Chapter marker ─── */
.about-chapter {
  display: flex;
  align-items: baseline;
  gap: 14rem;
  margin: 0 0 22rem;
  font-size: 13rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.62;
}
.about-chapter__no {
  font-size: 13rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text);
  padding: 3rem 8rem;
  border: 1px solid color-mix(in srgb, var(--color-text) 35%, transparent);
  border-radius: 5rem;
  opacity: 0.9;
}

/* ─── Body copy ─── */
.about-body {
  font-size: var(--text-body);
  font-weight: 400;
  line-height: 1.78;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.82;
}
.about-body + .about-body { margin-top: 18rem; }

/* ─── Callout ─── */
.about-callout {
  font-size: var(--text-body);
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: -0.02em;
  color: var(--color-text);
  border-left: 2px solid var(--color-accent);
  padding-left: 18rem;
}

/* ─── Pull ─── */
.about-pull {
  font-size: clamp(22rem, 2.6vw, 30rem);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.032em;
  color: var(--color-text);
  margin-bottom: 28rem;
}

/* ─── Questions ─── */
.about-questions {
  margin-bottom: 28rem;
}
.about-questions p {
  font-size: var(--text-body);
  font-weight: 400;
  font-style: italic;
  line-height: 2.0;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.72;
}

/* ───────────────── Cinematic photo shots — float on the gradient ───────────────── */
.shot {
  position: relative;
  z-index: 1;
  /* break out wider than the panels, floating directly on the gradient */
  width: min(92vw, 920rem);
  left: 50%;
  translate: -50% 0;
  margin: 34rem 0;
}

.shot__grid { display: grid; gap: 12rem; }
.shot__grid--duo { grid-template-columns: 1fr 1fr; }
.shot__grid--editorial { grid-template-columns: 1.5fr 1fr; }
.shot__grid--gallery { grid-template-columns: repeat(3, 1fr); gap: 16rem; }

/* Glass-framed cell — a floating "film still" */
.shot__cell {
  position: relative;
  overflow: hidden;
  border-radius: 16rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 30%, transparent);
  box-shadow:
    0 40rem 90rem -38rem rgba(0, 0, 0, 0.7),
    inset 0 1px 1px rgba(255, 255, 255, 0.28);
}
/* Duo / editorial use a fixed cinematic band height with cover crop */
.shot--duo .shot__cell      { aspect-ratio: 4 / 5; }
.shot__cell--wide           { aspect-ratio: 16 / 10; }
.shot__cell--tall           { aspect-ratio: 3 / 4; }

.shot__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 1.12;                                    /* cinematic settle (independent prop) */
  transition: scale 1.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.shot.in-view .shot__img { scale: 1.04; }

/* Gallery items show the full collage (titles are baked in) — no crop, no overscan */
.shot__grid--gallery .shot__cell { aspect-ratio: auto; box-shadow: 0 34rem 76rem -34rem rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.24); }
.shot__grid--gallery .shot__img  { height: auto; object-fit: contain; scale: 1; }
.shot__item { margin: 0; }
.shot__tag {
  display: inline-block;
  margin-top: 12rem;
  padding: 6rem 11rem;
  border-radius: 9rem;
  font-size: 11rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.75;
  background: color-mix(in srgb, var(--color-bg) 52%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--color-glass-border);
}

/* Staggered reveal across gallery columns */
.shot--gallery .shot__item { opacity: 0; transform: translateY(18rem); transition: opacity 0.7s ease, transform 0.7s ease; }
.shot--gallery.in-view .shot__item:nth-child(1) { opacity: 1; transform: none; transition-delay: 0.05s; }
.shot--gallery.in-view .shot__item:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.16s; }
.shot--gallery.in-view .shot__item:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.27s; }

/* Caption — a frosted glass chip so it stays legible over the vivid gradient */
.shot__cap {
  display: flex;
  gap: 14rem;
  margin-top: 18rem;
  max-width: 640rem;
  padding: 15rem 18rem;
  border-radius: 14rem;
  font-size: var(--text-sm);
  line-height: 1.6;
  letter-spacing: -0.012em;
  color: var(--color-text);
  opacity: 0.92;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border: 1px solid var(--color-glass-border);
  box-shadow: inset 0 1px 1px color-mix(in srgb, var(--color-text) 14%, transparent);
}
.shot__cap em     { font-style: italic; opacity: 0.95; }
.shot__cap strong { font-weight: 600; }
.shot__cap-rule {
  flex: 0 0 auto;
  width: 2px;
  align-self: stretch;
  background: var(--color-accent);
  border-radius: 2px;
}

/* ─── Asatoma ─── */
.about-asatoma {
  font-size: var(--text-body);
  font-weight: 500;
  font-style: italic;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.5;
  margin-top: 28rem;
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .anim,
  .shot__item,
  .shot__img { transition: none; }
  .shot__img { scale: 1; }
}

/* ─── Tablet ─── */
@media (max-width: 820px) {
  .shot { width: min(94vw, 720rem); }
  .shot__grid--editorial { grid-template-columns: 1.4fr 1fr; }
}

/* ─── Mobile ─── */
@media (max-width: 600px) {
  .about-wrap { padding-top: calc(92rem + var(--safe-top)); }
  .about-container { padding: 0 14rem; }

  .about-panel { padding: 28rem 24rem; border-radius: 22rem; }
  .about-panel--hero { padding: 34rem 24rem 30rem; }
  .about-panel--callout { padding: 24rem 22rem; }

  .shot { width: 100%; left: 0; translate: none; margin: 26rem 0; }
  .shot__grid--duo { grid-template-columns: 1fr 1fr; gap: 10rem; }
  .shot__grid--editorial { grid-template-columns: 1fr; }
  .shot__cell--wide { aspect-ratio: 16 / 10; }
  .shot__cell--tall { aspect-ratio: 16 / 11; }
  .shot__grid--gallery { grid-template-columns: 1fr; gap: 22rem; }
  .shot__cap { font-size: 13rem; }
}
</style>

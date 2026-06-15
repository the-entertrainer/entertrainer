<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })
</script>

<template>
  <div class="about-page">
    <NuxtLink to="/" class="back-btn">← back</NuxtLink>

    <header class="about-header">
      <p class="about-eyebrow">Naveen Jose &middot; CIDS Certified</p>
      <h1 class="about-title">I make learning<br><em>impossible to ignore.</em></h1>
      <p class="about-lead">
        Born in hospitality. Hardwired for storytelling. Certified in instructional design.
        I build experiences that don't feel like training at all.
      </p>
    </header>

    <section class="about-section">
      <p class="section-label">The Origin</p>
      <div class="section-body">
        <p>
          It started with comic books. At Mahindra Holidays, I was supposed to be doing L&amp;D the
          traditional way — slide decks, compliance modules, sign-off sheets. Instead, I created
          <em>The SEWA Chronicles</em> — a serialised comic series that turned service values into
          characters, scenes, and stakes. Engagement went up. Retention followed. That moment drew
          the line between what training is and what it could be.
        </p>
        <p>
          Hospitality taught me one thing above everything else: the person in front of you is
          everything. I carried that into every SCORM module, every storyboard, every animated
          sequence I've built since.
        </p>
      </div>
    </section>

    <section class="about-section">
      <p class="section-label">The Philosophy</p>
      <div class="section-body">
        <blockquote class="about-quote">
          "Entertrainer" is not a typo. It's a manifesto.
        </blockquote>
        <p>
          Entertain + Train. If it doesn't hold attention, it can't transfer knowledge. I design
          every piece of learning with the same questions a filmmaker asks: Does this moment matter?
          Will they remember this scene? What does the learner <em>feel</em> here?
        </p>
        <p>
          Anchored in Bloom's Taxonomy and adult learning principles (andragogy), but dressed in
          storytelling, motion, and craft. The methodology is rigorous. The experience is anything
          but dry.
        </p>
      </div>
    </section>

    <section class="about-section">
      <p class="section-label">The Timeline</p>
      <div class="timeline">
        <div class="timeline-item">
          <span class="t-year">2026 — Now</span>
          <div class="t-content">
            <strong>Asst Manager, Training &amp; Quality</strong>
            <span>Concentrix</span>
          </div>
        </div>
        <div class="timeline-item">
          <span class="t-year">2024 — 2026</span>
          <div class="t-content">
            <strong>Asst Manager, Learning &amp; Development</strong>
            <span>Courtyard by Marriott</span>
          </div>
        </div>
        <div class="timeline-item">
          <span class="t-year">2022 — 2024</span>
          <div class="t-content">
            <strong>CMET, Learning &amp; Development</strong>
            <span>Mahindra Holidays &mdash; Created <em>The SEWA Chronicles</em></span>
          </div>
        </div>
        <div class="timeline-item">
          <span class="t-year">Foundation</span>
          <div class="t-content">
            <strong>BSc Hotel Management</strong>
            <span>IHM Chennai</span>
          </div>
        </div>
      </div>
    </section>

    <section class="about-section">
      <p class="section-label">The Toolkit</p>
      <div class="tools-grid">
        <span class="tool-chip">Articulate Storyline 360</span>
        <span class="tool-chip">Adobe Suite</span>
        <span class="tool-chip">After Effects</span>
        <span class="tool-chip">Vyond</span>
        <span class="tool-chip">Canva</span>
        <span class="tool-chip">Redcraft.AI</span>
        <span class="tool-chip">Storyboarding</span>
        <span class="tool-chip">Bloom's Taxonomy</span>
        <span class="tool-chip">Andragogy</span>
        <span class="tool-chip">SCORM</span>
      </div>
    </section>

    <section class="about-section about-contact">
      <p class="section-label">Say Hello</p>
      <div class="contact-links">
        <a href="mailto:iamnaveenjose@outlook.com" class="contact-link">
          iamnaveenjose@outlook.com
        </a>
        <a
          href="https://linkedin.com/in/entertrainer"
          target="_blank"
          rel="noopener noreferrer"
          class="contact-link"
        >
          linkedin.com/in/entertrainer
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100dvh;
  background: var(--color-bg);
  color: var(--color-text);
  padding: calc(var(--safe-top) + 120rem) var(--grid-margin) calc(var(--safe-bottom) + 100rem);
  max-width: 900rem;
}

.back-btn {
  position: fixed;
  top: calc(38rem + var(--safe-top));
  left: calc(106rem + var(--safe-left));
  height: 48rem;
  z-index: 30;
  display: flex;
  align-items: center;
  padding: 0 20rem;
  border-radius: var(--radius-full);
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--color-text);
  font-size: 14rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.25s ease;
}
.back-btn:hover {
  background: var(--color-glass-bg-hover);
  border-color: var(--color-glass-border-hover);
}

/* ── Header ── */
.about-header {
  margin-bottom: 80rem;
}
.about-eyebrow {
  font-size: 13rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 24rem;
}
.about-title {
  font-size: clamp(60rem, 8vw, 120rem);
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 1.05;
  margin-bottom: 32rem;
}
.about-title em {
  font-style: italic;
  color: var(--color-accent);
}
.about-lead {
  font-size: clamp(17rem, 2vw, 22rem);
  font-weight: 400;
  line-height: 1.6;
  opacity: 0.65;
  max-width: 640rem;
}

/* ── Sections ── */
.about-section {
  border-top: 1px solid var(--color-divider);
  padding-top: 60rem;
  margin-bottom: 60rem;
  display: grid;
  grid-template-columns: 160rem 1fr;
  gap: 0 48rem;
}
.section-label {
  font-size: 12rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.35;
  padding-top: 6rem;
}
.section-body {
  display: flex;
  flex-direction: column;
  gap: 20rem;
}
.section-body p {
  font-size: 17rem;
  line-height: 1.75;
  opacity: 0.8;
}
.section-body em {
  font-style: italic;
  opacity: 1;
  color: var(--color-text);
}

/* ── Quote ── */
.about-quote {
  font-size: clamp(22rem, 3vw, 32rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.3;
  color: var(--color-text);
  opacity: 1;
  border: none;
  margin: 0 0 8rem;
  padding: 0;
}

/* ── Timeline ── */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.timeline-item {
  display: grid;
  grid-template-columns: 140rem 1fr;
  gap: 0 24rem;
  padding: 20rem 0;
  border-bottom: 1px solid var(--color-divider);
}
.timeline-item:last-child { border-bottom: none; }
.t-year {
  font-size: 12rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--color-accent);
  padding-top: 3rem;
}
.t-content {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}
.t-content strong {
  font-size: 16rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.t-content span {
  font-size: 13rem;
  opacity: 0.45;
}
.t-content em { font-style: italic; }

/* ── Tools grid ── */
.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10rem;
}
.tool-chip {
  display: inline-flex;
  align-items: center;
  padding: 8rem 16rem;
  border-radius: var(--radius-full);
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  font-size: 13rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--color-text);
}

/* ── Contact ── */
.contact-links {
  display: flex;
  flex-direction: column;
  gap: 12rem;
}
.contact-link {
  font-size: 18rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  letter-spacing: -0.02em;
}
.contact-link:hover { opacity: 1; }

/* ── Mobile ── */
@media (max-width: 640px) {
  .about-section {
    grid-template-columns: 1fr;
    gap: 16rem 0;
  }
  .timeline-item {
    grid-template-columns: 1fr;
    gap: 4rem 0;
  }
}
</style>

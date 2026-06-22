<template>
  <div class="about-wrap">
    <div class="about-container">

      <h1 class="about-intro anim">
        I am Naveen, and I'm an Instructional Designer.
      </h1>

      <hr class="about-rule anim" />

      <p class="about-lead anim">
        Finding Instructional Design as a career was never planned—it was a discovery.
      </p>

      <div class="about-section anim">
        <p>I started my career in the hotel industry and had the opportunity to work with brands such as Marriott International and Club Mahindra. My first job was as a housekeeper. Yes, I made beds, cleaned rooms, folded towel art (the fun stuff), and learned how to make spaces feel welcoming, organized, and beautiful.</p>
        <p class="about-callout">Looking back, that role taught me something I still carry today: details matter, and experiences matter even more.</p>
      </div>

      <div class="about-section anim">
        <p>The path that led me into Learning and Development was shaped by the mentors I met along the way. Their guidance redirected my curiosity toward learning, people, and growth. The transition wasn't easy. It took countless sleepless nights, long days, and an endless commitment to learning concepts I once didn't even know existed.</p>
      </div>

      <p class="about-pull anim">
        What fascinated me most wasn't the content itself—it was people.
      </p>

      <div class="about-questions anim">
        <p>How do people learn?</p>
        <p>Why do they resist change?</p>
        <p>What motivates them?</p>
        <p>What makes them remember?</p>
      </div>

      <div class="about-section anim">
        <p>Observing people, understanding their behaviors, and uncovering what drives them became an obsession. That curiosity eventually led me into Learning &amp; Development and, later, Instructional Design.</p>
      </div>

      <div class="about-section anim">
        <p>To me, Instructional Designers decide what is taught and how it is taught. But more importantly, we are entertainers. We remove the noise, simplify complexity, and uncover the core truth that helps people understand, remember, and act.</p>
      </div>

      <div class="about-section anim">
        <p>That's what excites me every day: turning information into experiences that people genuinely connect with.</p>
      </div>

      <p class="about-asatoma anim">Asatoma Sadgamaya.</p>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

let io: IntersectionObserver | null = null

onMounted(() => {
  document.documentElement.setAttribute('data-about', '')

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
})

onBeforeUnmount(() => {
  io?.disconnect()
  document.documentElement.removeAttribute('data-about')
})
</script>

<style scoped>
/* ─── Wrap ─── */
.about-wrap {
  min-height: 100dvh;
  background: var(--color-bg);
  padding: calc(96rem + var(--safe-top)) 0 80rem;
}

/* ─── Container ─── */
.about-container {
  max-width: 680rem;
  margin: 0 auto;
  padding: 0 30rem;
}

/* ─── Base animation ─── */
.anim {
  opacity: 0;
  transform: translateY(16rem);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.anim.in-view {
  opacity: 1;
  transform: none;
}

/* ─── Intro ─── */
.about-intro {
  font-size: clamp(32rem, 4vw, 50rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.04em;
  color: var(--color-text);
  margin-bottom: 32rem;
}

/* ─── Rule ─── */
.about-rule {
  border: none;
  border-top: 1px solid var(--color-divider);
  margin: 0 0 44rem;
  transform-origin: left center;
  transform: scaleX(0); /* override anim's translateY */
  transition: opacity 0.4s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.about-rule.in-view {
  opacity: 1;
  transform: scaleX(1); /* override anim's translateY(0) */
}

/* ─── Lead ─── */
.about-lead {
  font-size: clamp(18rem, 2.1vw, 23rem);
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: -0.025em;
  color: var(--color-text);
  margin-bottom: 52rem;
}

/* ─── Body sections ─── */
.about-section {
  margin-bottom: 32rem;
  display: flex;
  flex-direction: column;
  gap: 18rem;
}
.about-section p:not(.about-callout) {
  font-size: var(--text-body);
  font-weight: 400;
  line-height: 1.8;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0.68;
}

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
  margin: 48rem 0 40rem;
}

/* ─── Questions ─── */
.about-questions {
  margin-bottom: 32rem;
}
.about-questions p {
  font-size: var(--text-body);
  font-weight: 400;
  font-style: italic;
  line-height: 2.1;
  letter-spacing: -0.018em;
  color: var(--color-text);
  opacity: 0;
  transform: translateY(10rem);
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.about-questions.in-view p:nth-child(1) { opacity: 0.62; transform: none; }
.about-questions.in-view p:nth-child(2) { opacity: 0.62; transform: none; transition-delay: 0.07s; }
.about-questions.in-view p:nth-child(3) { opacity: 0.62; transform: none; transition-delay: 0.14s; }
.about-questions.in-view p:nth-child(4) { opacity: 0.62; transform: none; transition-delay: 0.21s; }

/* ─── Asatoma ─── */
.about-asatoma {
  font-size: var(--text-body);
  font-weight: 500;
  font-style: italic;
  letter-spacing: -0.018em;
  color: var(--color-text);
  margin-top: 72rem;
}
.about-asatoma.in-view {
  opacity: 0.36; /* override .anim.in-view opacity:1 */
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .anim,
  .about-questions p,
  .about-rule { transition: none; }
}

/* ─── Mobile ─── */
@media (max-width: 600px) {
  .about-wrap { padding-top: calc(80rem + var(--safe-top)); }
  .about-container { padding: 0 20rem; }
}
</style>

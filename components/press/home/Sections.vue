<script setup lang="ts">
/**
 * Three section fronts, the way a real front page teases what's inside:
 * Instructional Design (the practice), My Work (the proof), Web Apps (the
 * toolkit). One photograph among the three — the SEWA Chronicles cover — so
 * the eye has somewhere real to land instead of three identical text blocks.
 */
const R = useReveal()
const TOOLS = ['EasyMCQ', 'Cadence', 'Draftly', 'StoryGen']
</script>

<template>
  <section class="sf">
    <p class="press-label sf__eyebrow" v-motion :initial="R.rise(0).initial" :visible-once="R.rise(0).visibleOnce">Inside this edition</p>

    <div class="sf__grid">
      <NuxtLink to="/instructional-design" class="sf__box sf__box--text" v-motion :initial="R.riseIn(0, 90).initial" :visible-once="R.riseIn(0, 90).visibleOnce">
        <span class="press-label">01 &middot; Practice</span>
        <h2 class="sf__title">Instructional Design</h2>
        <p class="sf__deck">What gets designed when no one's watching? A page that redesigns its own example while you read it — turn on all three moves and watch the load fall.</p>
        <span class="sf__go">Try it &rarr;</span>
      </NuxtLink>

      <NuxtLink to="/my-work" class="sf__box sf__box--feature" v-motion :initial="R.riseIn(1, 90).initial" :visible-once="R.riseIn(1, 90).visibleOnce">
        <PressHalftone src="/work-01.png" alt="The SEWA Chronicles cover" ratio="4/3" class="sf__art" />
        <span class="sf__box-body">
          <span class="press-label">02 &middot; Projects</span>
          <h2 class="sf__title">My Work</h2>
          <p class="sf__deck">Proof it wasn't all talk. The SEWA Chronicles: a service-culture comic for Club Mahindra, built end to end — story, script, art, layout.</p>
          <span class="sf__go">Read the case study &rarr;</span>
        </span>
      </NuxtLink>

      <NuxtLink to="/tools" class="sf__box sf__box--text" v-motion :initial="R.riseIn(2, 90).initial" :visible-once="R.riseIn(2, 90).visibleOnce">
        <span class="press-label">03 &middot; Free tools</span>
        <h2 class="sf__title">Web Apps</h2>
        <p class="sf__deck">The toolkit that powers impactful learning. Four small apps, each built because the tool didn't already exist.</p>
        <ul class="sf__tools">
          <li v-for="t in TOOLS" :key="t">{{ t }}</li>
        </ul>
        <span class="sf__go">Open the toolkit &rarr;</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.sf { position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: clamp(32px, 5vw, 56px) var(--press-edge); border-top: 2px solid var(--press-ink); }
.sf__eyebrow { padding-top: 18px; }

.sf__grid { margin-top: 22px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--press-rule); border: 1px solid var(--press-rule); }
.sf__box { display: flex; flex-direction: column; gap: 10px; padding: 24px 22px 26px; background: var(--press-paper); color: var(--press-ink); text-decoration: none; }
.sf__box--feature { padding: 0 0 26px; gap: 0; }
.sf__art { width: 100%; border-bottom: 1px solid var(--press-rule); margin-bottom: 18px; }
.sf__box-body { display: flex; flex-direction: column; gap: 10px; padding: 0 22px; }

.sf__title { margin: 4px 0 0; font-family: var(--press-sans); font-weight: 800; font-size: 26px; line-height: 1.05; letter-spacing: -0.015em; }
.sf__deck { margin: 0; font-family: var(--press-serif); font-size: 15px; line-height: 1.55; color: var(--press-ink-80); flex: 1 1 auto; }
.sf__tools { list-style: none; margin: 4px 0 0; padding: 10px 0 0; border-top: 1px solid var(--press-rule); display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; font-family: var(--press-mono); font-size: 11.5px; letter-spacing: 0.04em; color: var(--press-ink-62); }
.sf__go { margin-top: 6px; font-family: var(--press-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; transition: transform 0.2s ease; }
@media (hover: hover) { .sf__box:hover .sf__go { transform: translateX(3px); } }
.sf__box:focus-visible { outline: 2px solid var(--press-ink); outline-offset: -2px; }

@media (max-width: 860px) { .sf__grid { grid-template-columns: 1fr; } }
</style>

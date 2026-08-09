<script setup lang="ts">
useSeoMeta({
  title: 'Entertrainer — Instructional Design by Naveen Jose',
  description: 'Naveen Jose is a Certified Instructional Design Specialist who builds training people actually finish — plus four free web apps for L&D teams.',
  ogTitle: 'Entertrainer — Instructional Design by Naveen Jose',
  ogDescription: 'Instructional design, but fun. Training people actually finish, and the free tools that make it.',
  ogUrl: 'https://entertrainer.in/'
})

const contentStore = useContentStore()

/* One flat wall. Every page this site has, in reading order — no sections, no
   filters, nothing to choose before you can start looking. The panels differ
   from each other so the eye has somewhere to land; that is the whole
   navigation model. */
const panels = computed(() => contentStore.panels)
</script>

<template>
  <WandaSurface :crumbs="[{ label: 'Index', active: true }]">
    <section class="masthead">
      <h1 class="masthead-title">{{ contentStore.brand }}</h1>
      <p class="masthead-standfirst">
        {{ contentStore.tagline }}. {{ contentStore.yearsExperience }} years building training
        people actually finish — and the tools that make it.
      </p>
      <p class="masthead-hint" aria-hidden="true">{{ panels.length }} pages</p>
    </section>

    <div class="wall">
      <WandaPanel
        v-for="(panel, i) in panels"
        :key="panel.id"
        :panel="panel"
        :index="i"
      />
    </div>

    <footer class="colophon">
      <a :href="`mailto:${contentStore.email}`">{{ contentStore.email }}</a>
      <a
        v-for="s in contentStore.socialLinks.filter(l => l.platform !== 'email')"
        :key="s.platform"
        :href="s.url"
        target="_blank"
        rel="noopener"
      >{{ s.label }}</a>
    </footer>
  </WandaSurface>
</template>

<style scoped>
.masthead {
  padding: calc(var(--w-header-h) + 110px) var(--w-gutter-right) 90px var(--w-gutter);
}
.masthead-title {
  margin: 0;
  font-family: var(--w-display);
  /* The real index carries no headline of this kind at all — see
     Inspiration/WANDA_SYSTEM.md §10 — so 200px was never a measured number.
     This is the one deliberate departure the brand name earns: it is the
     page's single moment of scale, held well under the old ceiling so it
     doesn't read as a poster next to everything quieter below it. */
  font-size: clamp(40px, 6.5vw, 96px);
  line-height: 0.84;
  font-weight: 700;
  letter-spacing: -0.035em;
  text-transform: uppercase;
}
.masthead-standfirst {
  margin: 28px 0 0;
  max-width: 52ch;
  font-family: var(--w-mono);
  font-size: var(--w-chrome-size);
  line-height: 1.5;
  opacity: var(--w-rest);
}
.masthead-hint {
  margin: 40px 0 0;
  font-family: var(--w-mono);
  font-size: 16px;
  opacity: 0.35;
}

.wall { position: relative; }

.colophon {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  padding: 70px var(--w-gutter-right) 70px var(--w-gutter);
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  font-family: var(--w-mono);
  font-size: 16px;
}
.colophon a { opacity: var(--w-rest); transition: opacity 0.2s linear; }
.colophon a:hover { opacity: 1; }

@media (max-width: 812px) {
  .masthead { padding-top: calc(var(--w-header-h) + 48px); padding-bottom: 56px; }
}
</style>

<script setup lang="ts">
import { absoluteUrl } from '~/utils/site'
useSeoMeta({
  title: 'Instructional Design Workflow · Entertrainer',
  description: 'Source, analyse, structure, storyboard, develop assets, build the module, then polish. The full path from raw material to a finished lesson.',
  ogTitle: 'Instructional Design Workflow',
  ogDescription: 'Seven stages from source material to a polished module.',
  ogUrl: absoluteUrl('/tools/id-workflow')
})

const stages = [
  {
    id: 'source',
    num: '1',
    title: 'Content sourcing',
    purpose: 'Gather the raw material that will become the lesson.',
    checklist: [
      'Collect the original essay, notes, or source documents',
      'Note the audience and the real-world task they need to perform',
      'Flag any claims that need a source or a simpler explanation'
    ],
    tools: [{ label: 'Open the 1=2 essay', href: '/elevate/one-equals-two-lets-break-maths' }]
  },
  {
    id: 'analysis',
    num: '2',
    title: 'Analysis',
    purpose: 'Decide what the learner must be able to do, and what is getting in the way.',
    checklist: [
      'Write one observable objective',
      'Identify the real constraint (knowledge, skill, environment, or access)',
      'Decide what evidence will show the objective was met'
    ],
    tools: [{ label: 'Instructional design lesson', href: '/instructional-design' }]
  },
  {
    id: 'structure',
    num: '3',
    title: 'Structuring',
    purpose: 'Turn the analysis into a clear sequence of teaching moments.',
    checklist: [
      'List the sections in the order a learner should meet them',
      'Mark which moments need interaction (process, check, reflection)',
      'Cut anything that does not serve the objective'
    ],
    tools: []
  },
  {
    id: 'storyboard',
    num: '4',
    title: 'Storyboard',
    purpose: 'Describe each screen or block before building it.',
    checklist: [
      'Write the learner-facing text for each block',
      'Note the visual or interaction for each block',
      'Flag the knowledge check and the reflection'
    ],
    tools: [{ label: 'Storygen', href: '/tools/storygen' }, { label: 'E-learning author', href: '/tools/elearn-author' }]
  },
  {
    id: 'assets',
    num: '5',
    title: 'Develop assets',
    purpose: 'Make the images, diagrams, and other media the blocks need.',
    checklist: [
      'List every image or diagram called for in the storyboard',
      'Reuse existing assets where they already exist',
      'Keep captions and credits with the asset'
    ],
    tools: [{ label: '1=2 lesson (example assets)', href: '/learn/one-equals-two' }]
  },
  {
    id: 'module',
    num: '6',
    title: 'Develop module',
    purpose: 'Turn the storyboard into a working lesson that the LessonPlayer can render.',
    checklist: [
      'Convert the storyboard into lesson JSON (blocks array)',
      'Preview it in the author tool',
      'Add the page that mounts LessonPlayer'
    ],
    tools: [{ label: 'E-learning author', href: '/tools/elearn-author' }, { label: 'Live 1=2 lesson', href: '/learn/one-equals-two' }]
  },
  {
    id: 'polish',
    num: '7',
    title: 'Finish and polish',
    purpose: 'Tighten the language, check the interactions, and confirm it builds cleanly.',
    checklist: [
      'Read the whole lesson once for voice and clarity',
      'Confirm every interactive block marks complete',
      'Check the original essay still links to the lesson',
      'Confirm the production build succeeds'
    ],
    tools: [{ label: 'Learn index', href: '/learn' }]
  }
]

const open = ref<string | null>('source')

function toggle(id: string) {
  open.value = open.value === id ? null : id
}
</script>

<template>
  <div class="idw">
    <header class="idw__head">
      <NuxtLink to="/tools" class="idw__back">← Tools</NuxtLink>
      <p class="idw__meta">Instructional design</p>
      <h1>Workflow</h1>
      <p class="idw__dek">Source → Analysis → Structure → Storyboard → Assets → Module → Polish. One path from raw material to a finished lesson.</p>
    </header>

    <ol class="idw__stages">
      <li v-for="stage in stages" :key="stage.id" class="idw__stage" :class="{ 'is-open': open === stage.id }">
        <button type="button" class="idw__stage-head" :aria-expanded="open === stage.id" @click="toggle(stage.id)">
          <span class="idw__num">{{ stage.num }}</span>
          <span class="idw__title">{{ stage.title }}</span>
          <span class="idw__toggle">{{ open === stage.id ? '−' : '+' }}</span>
        </button>
        <div v-if="open === stage.id" class="idw__body">
          <p class="idw__purpose">{{ stage.purpose }}</p>
          <ul class="idw__check">
            <li v-for="item in stage.checklist" :key="item">{{ item }}</li>
          </ul>
          <div v-if="stage.tools.length" class="idw__tools">
            <NuxtLink v-for="tool in stage.tools" :key="tool.href" :to="tool.href" class="idw__tool">{{ tool.label }}</NuxtLink>
          </div>
        </div>
      </li>
    </ol>

    <footer class="idw__foot">
      <p>The 1=2 lesson already walks this path. Use it as the reference, then apply the same stages to the next Elevate piece.</p>
      <NuxtLink to="/learn/one-equals-two" class="idw__cta">Open the 1=2 lesson</NuxtLink>
    </footer>
  </div>
</template>

<style scoped>
.idw { max-width: 40rem; margin: 0 auto; padding: 1.5rem 1.25rem 4rem; color: var(--ink); background: var(--paper); }
.idw__head { margin-bottom: 2rem; }
.idw__back { font: 500 0.75rem/1 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); text-decoration: none; }
.idw__meta { margin: 1rem 0 0.25rem; font: 500 0.75rem/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--signal-cobalt); }
.idw h1 { margin: 0; font: 500 2.25rem/1.05 var(--font-display); letter-spacing: -0.04em; }
.idw__dek { margin: 0.75rem 0 0; font-size: 1.0625rem; line-height: 1.45; color: var(--ink-soft); }
.idw__stages { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--ink); }
.idw__stage { border-bottom: 1px solid var(--line); }
.idw__stage-head { width: 100%; display: grid; grid-template-columns: 2rem 1fr auto; gap: 0.75rem; align-items: center; padding: 1rem 0; background: none; border: none; text-align: left; cursor: pointer; font: inherit; color: inherit; }
.idw__num { font: 500 0.875rem/1 var(--font-mono); color: var(--signal-cobalt); }
.idw__title { font: 500 1.125rem/1.2 var(--font-display); letter-spacing: -0.02em; }
.idw__toggle { font: 500 1.25rem/1 var(--font-mono); color: var(--ink-soft); }
.idw__body { padding: 0 0 1.25rem 2.75rem; }
.idw__purpose { margin: 0 0 0.75rem; font-size: 1rem; line-height: 1.5; }
.idw__check { margin: 0 0 1rem; padding-left: 1.25rem; }
.idw__check li { margin: 0.375rem 0; font-size: 0.9375rem; line-height: 1.4; color: var(--ink-soft); }
.idw__tools { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.idw__tool { display: inline-block; padding: 0.375rem 0.75rem; border: 1px solid var(--ink); border-radius: 999px; text-decoration: none; color: var(--ink); font-size: 0.8125rem; font-weight: 500; }
.idw__tool:hover { background: var(--accent); }
.idw__foot { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--ink); text-align: center; }
.idw__foot p { margin: 0 0 1rem; color: var(--ink-soft); }
.idw__cta { display: inline-block; padding: 0.75rem 1.5rem; border: 1px solid var(--ink); border-radius: 999px; text-decoration: none; color: var(--ink); font-weight: 500; }
.idw__cta:hover { background: var(--accent); }
</style>

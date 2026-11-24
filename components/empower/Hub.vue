<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import {
  EMPOWER_TOOLS,
  LEARNING_MODE_LINK,
  MORE_TOOLS,
  TOOL_GROUPS,
  type EmpowerTool,
  type ToolGroup,
} from '~/utils/empower/catalog'
import { recentList, type RecentTool } from '~/utils/empower/db'
import { offlineLabel, offlinePhase, type OfflinePhase } from '~/utils/empower/offline'

const query = ref('')
const recent = ref<RecentTool[]>([])
const phase = ref<OfflinePhase>('download')
const arrival = ref('')
const needle = computed(() => query.value.trim().toLowerCase())

function matches(hay: string): boolean {
  return !needle.value || hay.toLowerCase().includes(needle.value)
}

function toolHay(tool: EmpowerTool): string {
  return `${tool.title} ${tool.task} ${tool.blurb} ${tool.keywords} ${tool.group}`
}

const visibleTools = computed(() => EMPOWER_TOOLS.filter(tool => matches(toolHay(tool))))
const groups = computed(() => TOOL_GROUPS.map(group => ({
  group,
  tools: visibleTools.value.filter(tool => tool.group === group),
})).filter(entry => entry.tools.length))

const showLearning = computed(() => matches(`${LEARNING_MODE_LINK.title} ${LEARNING_MODE_LINK.task} ${LEARNING_MODE_LINK.keywords} Learn`))
const more = computed(() => MORE_TOOLS.filter(tool => matches(`${tool.title} ${tool.blurb} ${tool.keywords}`)))
const recentVisible = computed(() => {
  const allowed = new Set(visibleTools.value.map(tool => tool.href))
  return recent.value.filter(item => allowed.has(item.href))
})
const featured = computed(() => recentVisible.value[0] ?? null)
const recentRest = computed(() => recentVisible.value.slice(1))
const countText = computed(() => {
  if (!needle.value) return ''
  const count = visibleTools.value.length
  return count === 1 ? '1 tool matches.' : `${count} tools match.`
})

function blurbFor(href: string): string {
  return EMPOWER_TOOLS.find(tool => tool.href === href)?.task ?? ''
}

async function refreshOffline() {
  phase.value = await offlinePhase()
}

async function refreshRecent() {
  recent.value = await recentList()
}

onMounted(async () => {
  document.documentElement.dataset.empowerRecent = 'hub'
  arrival.value = 'Entering Workshop.'
  const heading = document.getElementById('empower-title')
  if (heading) {
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
    heading.focus()
  }
  await Promise.all([refreshOffline(), refreshRecent()])
  window.addEventListener('online', refreshOffline)
  window.addEventListener('offline', refreshOffline)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', refreshOffline)
  window.removeEventListener('offline', refreshOffline)
})

function groupId(group: ToolGroup): string {
  return `empower-group-${group.toLowerCase()}`
}
</script>

<template>
  <div class="em-hub">
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ arrival }}</p>
    <EdStageHero
      variant="flow"
      title="Empower"
      title-id="empower-title"
      deck="Everyday tools for clearer thinking and work. They run in your browser — private, and available offline once loaded."
    />

    <div class="em-search">
      <p class="em-pill" :class="{ 'em-pill--ready': phase === 'ready', 'em-pill--limited': phase === 'limited' }" role="status">
        <svg v-if="phase === 'ready'" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M5 12.5 9.2 17 19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ offlineLabel(phase) }}
      </p>
      <div class="em-field">
        <label for="empower-search">Search tools</label>
        <input id="empower-search" v-model="query" class="em-input" type="search" autocomplete="off" placeholder="Try readability, PDF, or memory">
      </div>
    </div>
    <p class="sr-only" aria-live="polite">{{ countText }}</p>

    <section class="em-recent" aria-label="Recently used">
      <h2 class="em-h2">Recently used</h2>
      <p v-if="!recent.length" class="em-note">Tools you open will be listed here, on this device only.</p>
      <template v-else-if="featured">
        <NuxtLink :to="featured.href" class="em-feature">
          <strong>{{ featured.title }}</strong>
          <span>{{ blurbFor(featured.href) }}</span>
        </NuxtLink>
        <div v-if="recentRest.length" class="em-links">
          <NuxtLink v-for="item in recentRest" :key="item.id" :to="item.href" class="em-tool-link">
            <strong>{{ item.title }}</strong>
            <span>{{ blurbFor(item.href) }}</span>
          </NuxtLink>
        </div>
      </template>
      <p v-else class="em-note">Nothing you have opened matches that search.</p>
    </section>

    <div class="em-groups">
      <section v-for="entry in groups" :key="entry.group" :aria-labelledby="groupId(entry.group)">
        <h2 :id="groupId(entry.group)" class="em-group-label">{{ entry.group }}</h2>
        <div class="em-links">
          <NuxtLink v-for="tool in entry.tools" :key="tool.slug" :to="tool.href" class="em-tool-link">
            <strong>{{ tool.title }}</strong>
            <span>{{ tool.task }}</span>
          </NuxtLink>
          <NuxtLink
            v-if="entry.group === 'Learn' && showLearning"
            :to="LEARNING_MODE_LINK.href"
            class="em-tool-link"
          >
            <strong>{{ LEARNING_MODE_LINK.title }}</strong>
            <span>{{ LEARNING_MODE_LINK.task }}</span>
          </NuxtLink>
        </div>
      </section>
      <p v-if="!groups.length" class="em-note" role="status">No tools match that search.</p>
    </div>

    <section v-if="!needle || more.length" class="em-more" aria-labelledby="empower-more">
      <h2 id="empower-more" class="em-group-label">More</h2>
      <div class="em-links">
        <NuxtLink v-for="tool in (needle ? more : MORE_TOOLS)" :key="tool.href" :to="tool.href" class="em-tool-link">
          <strong>{{ tool.title }}</strong>
          <span>{{ tool.blurb }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

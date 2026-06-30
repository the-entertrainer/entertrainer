<script setup lang="ts">
import { useScribeFlowStore } from '~/stores/scribeflow'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const scribeStore = useScribeFlowStore()
const showNewModal = ref(false)
const projectTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  await scribeStore.loadProjects()
  const hash = window.location.hash
  if (hash.includes('scenario=')) {
    const ok = await scribeStore.importFromUrl(hash)
    if (ok) window.location.hash = ''
  }
})

function openNew() {
  showNewModal.value = true
  nextTick(() => titleInput.value?.focus())
}

async function createProject() {
  const t = projectTitle.value.trim()
  if (!t) return
  await scribeStore.createProject(t)
  projectTitle.value = ''
  showNewModal.value = false
}

function selectProject(id: string) { scribeStore.setCurrentProject(id) }

async function deleteProject(id: string, e: Event) {
  e.stopPropagation()
  if (confirm('Delete this scenario? This cannot be undone.')) {
    await scribeStore.deleteProject(id)
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const sortedProjects = computed(() =>
  [...scribeStore.projects.values()].sort((a, b) => b.updatedAt - a.updatedAt)
)
</script>

<template>
  <div class="sf-root">
    <!-- ═══ Project List ═══ -->
    <UiToolShell
      v-if="!scribeStore.currentProjectId"
      eyebrow="Web App"
      title="ScribeFlow"
      deck="Author branching dialogues and scenarios with a visual node editor."
    >
      <button class="glass-btn sf-btn-new" @click="openNew">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New scenario
      </button>

      <div v-if="sortedProjects.length" class="sf-grid">
        <div
          v-for="p in sortedProjects" :key="p.id"
          class="glass-panel sf-card" @click="selectProject(p.id)"
        >
          <div class="sf-card-body">
            <h3>{{ p.title }}</h3>
            <span class="sf-meta">{{ p.nodes.length }} nodes · {{ formatDate(p.updatedAt) }}</span>
          </div>
          <button class="sf-card-del" @click="(e) => deleteProject(p.id, e)" aria-label="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <p v-else class="stub-text sf-empty">No scenarios yet. Create one to get started.</p>

      <!-- New project modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showNewModal" class="sf-overlay" @click="showNewModal = false">
            <div class="glass-panel sf-modal" @click.stop>
              <h2>New Scenario</h2>
              <input
                ref="titleInput" v-model="projectTitle" type="text"
                class="glass-field sf-input" placeholder="Scenario title…"
                @keyup.enter="createProject"
              />
              <div class="sf-modal-actions">
                <button class="glass-btn--ghost sf-btn-ghost" @click="showNewModal = false">Cancel</button>
                <button class="glass-btn sf-btn-primary" @click="createProject" :disabled="!projectTitle.trim()">Create</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </UiToolShell>

    <!-- ═══ Editor ═══ -->
    <div v-else class="sf-editor-shell">
      <ScribeFlowEditor />
    </div>
  </div>
</template>

<style scoped>
.sf-root { min-height: 100dvh; color: var(--color-text); }

/* ── New button ── */
.sf-btn-new { gap: 8rem; margin-bottom: 28rem; }

/* ── Card grid (cards are glass panels) ── */
.sf-grid { display: flex; flex-direction: column; gap: 12rem; }
.sf-grid .glass-panel:nth-child(2) { animation-delay: 0.05s; }
.sf-grid .glass-panel:nth-child(3) { animation-delay: 0.1s; }
.sf-grid .glass-panel:nth-child(4) { animation-delay: 0.15s; }

.sf-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18rem 20rem;
  cursor: pointer;
  transition: transform 0.15s var(--ease-spring);
}
.sf-card:active { transform: scale(0.99); }
.sf-card h3 { font-size: var(--text-body); font-weight: 600; margin: 0 0 4rem; }
.sf-meta { font-size: var(--text-label); opacity: 0.45; letter-spacing: var(--tracking-label); text-transform: uppercase; }

.sf-card-del {
  position: relative; z-index: 4;
  width: 32rem; height: 32rem; border-radius: var(--radius-s);
  border: 1px solid transparent; background: none; color: var(--color-text);
  opacity: 0.3; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: opacity 0.15s, background 0.15s;
}
.sf-card-del:hover { opacity: 1; background: var(--color-glass-bg); border-color: var(--color-glass-border); }

.sf-empty { padding: 20rem 0; }

/* ── Modal ── */
.sf-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;
  padding: 20rem;
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
}
.sf-modal { width: 100%; max-width: 400rem; animation: none; }
.sf-modal h2 { font-size: var(--text-h2); font-weight: 700; margin: 0 0 20rem; }
.sf-input { margin-bottom: 20rem; }
.sf-modal-actions { display: flex; gap: 10rem; justify-content: flex-end; }
.sf-btn-ghost { padding: 10rem 20rem; font-size: 13rem; }
.sf-btn-primary { padding: 10rem 20rem; font-size: 13rem; }
.sf-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Editor shell ── */
.sf-editor-shell { width: 100%; height: 100dvh; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

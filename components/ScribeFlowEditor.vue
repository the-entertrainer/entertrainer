<script setup lang="ts">
import { useScribeFlowStore } from '~/stores/scribeflow'

const scribeStore = useScribeFlowStore()
const showShare = ref(false)
const shareUrl = ref('')
const copied = ref(false)

function goBack() { scribeStore.setCurrentProject(null) }

function share() {
  const hash = scribeStore.exportAsUrl()
  shareUrl.value = `${window.location.origin}${window.location.pathname}${hash}`
  showShare.value = true
  copied.value = false
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}

const isMobile = ref(false)
onMounted(() => { isMobile.value = window.innerWidth < 640 })
</script>

<template>
  <div class="sfe">
    <!-- Header bar -->
    <header class="sfe-bar">
      <div class="sfe-bar-left">
        <button class="sfe-back" @click="goBack" aria-label="Back to projects">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="sfe-title-group">
          <h2 class="sfe-title">{{ scribeStore.currentProject?.title }}</h2>
          <span class="sfe-count">{{ scribeStore.currentNodes.length }} nodes</span>
        </div>
      </div>

      <div class="sfe-bar-center">
        <button
          :class="['sfe-tab', { active: scribeStore.editingMode === 'canvas' }]"
          @click="scribeStore.setEditingMode('canvas')"
        >Canvas</button>
        <button
          :class="['sfe-tab', { active: scribeStore.editingMode === 'outline' }]"
          @click="scribeStore.setEditingMode('outline')"
        >Outline</button>
      </div>

      <div class="sfe-bar-right">
        <button class="sfe-share" @click="share">Share</button>
      </div>
    </header>

    <!-- Main workspace -->
    <div class="sfe-workspace">
      <div class="sfe-pane sfe-main">
        <ScribeFlowCanvas v-if="scribeStore.editingMode === 'canvas'" />
        <ScribeFlowOutline v-else />
      </div>

      <aside v-if="scribeStore.selectedNode && !isMobile" class="sfe-pane sfe-inspector">
        <ScribeFlowNodePanel />
      </aside>
    </div>

    <!-- Mobile bottom sheet for node editing -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="scribeStore.selectedNode && isMobile" class="sfe-sheet-backdrop" @click="scribeStore.selectedNodeId = null">
          <div class="sfe-sheet" @click.stop>
            <div class="sfe-sheet-handle" />
            <ScribeFlowNodePanel />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Share modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showShare" class="sf-overlay" @click="showShare = false">
          <div class="sf-modal" @click.stop>
            <h3>Share Scenario</h3>
            <p class="sfe-share-desc">Anyone with this link can import your scenario.</p>
            <div class="sfe-share-row">
              <input type="text" :value="shareUrl" readonly class="sf-input sfe-share-input" />
              <button class="sf-btn-primary" @click="copyLink">{{ copied ? '✓' : 'Copy' }}</button>
            </div>
            <button class="sf-btn-ghost sfe-share-close" @click="showShare = false">Close</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.sfe { display: flex; flex-direction: column; width: 100%; height: 100dvh; background: var(--color-bg); color: var(--color-text); }

/* ── Header ── */
.sfe-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10rem 16rem; gap: 12rem;
  border-bottom: 1px solid var(--color-divider);
  flex-shrink: 0;
}
.sfe-bar-left { display: flex; align-items: center; gap: 10rem; flex: 1; min-width: 0; }
.sfe-bar-center { display: flex; gap: 4rem; }
.sfe-bar-right { flex: 1; display: flex; justify-content: flex-end; }

.sfe-back {
  width: 34rem; height: 34rem; border-radius: var(--radius-s);
  border: 1px solid var(--color-glass-border); background: none;
  color: var(--color-text); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.sfe-back:hover { background: var(--color-glass-bg); }

.sfe-title-group { min-width: 0; }
.sfe-title { font-size: 15rem; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sfe-count { font-size: var(--text-label); opacity: 0.4; letter-spacing: var(--tracking-label); text-transform: uppercase; }

.sfe-tab {
  padding: 7rem 14rem; border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border); background: none;
  color: var(--color-text); font: 500 12rem/1 var(--main-font); cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.sfe-tab.active { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
.sfe-tab:not(.active):hover { background: var(--color-glass-bg); }

.sfe-share {
  padding: 7rem 16rem; border-radius: var(--radius-full);
  border: none; background: var(--color-accent); color: #fff;
  font: 600 12rem/1 var(--main-font); cursor: pointer;
}

/* ── Workspace ── */
.sfe-workspace { display: flex; flex: 1; overflow: hidden; }
.sfe-pane { overflow: hidden; }
.sfe-main { flex: 1; }
.sfe-inspector { width: 300rem; border-left: 1px solid var(--color-divider); overflow-y: auto; }

/* ── Mobile bottom sheet ── */
.sfe-sheet-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.35); display: flex; align-items: flex-end;
}
.sfe-sheet {
  width: 100%; max-height: 70dvh; border-radius: var(--radius-l) var(--radius-l) 0 0;
  background: var(--color-bg); border-top: 1px solid var(--color-glass-border);
  overflow-y: auto; padding-bottom: env(safe-area-inset-bottom, 0px);
}
.sfe-sheet-handle {
  width: 36rem; height: 4rem; border-radius: 2rem;
  background: var(--color-glass-border); margin: 10rem auto 6rem;
}

.sheet-enter-active { transition: transform 0.3s ease; }
.sheet-leave-active { transition: transform 0.2s ease; }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }

/* ── Share ── */
.sfe-share-desc { font-size: var(--text-sm); opacity: 0.5; margin: 0 0 16rem; }
.sfe-share-row { display: flex; gap: 8rem; margin-bottom: 16rem; }
.sfe-share-input { flex: 1; font-size: 13rem; }
.sfe-share-close { width: 100%; }

/* Reuse page modal styles */
.sf-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; padding: 20rem; }
.sf-modal { background: var(--color-bg); border: 1px solid var(--color-glass-border); border-radius: var(--radius-l); padding: 28rem; width: 100%; max-width: 440rem; box-shadow: 0 24rem 60rem -12rem rgba(0,0,0,0.35); }
.sf-modal h3 { font-size: var(--text-h2); font-weight: 700; margin: 0 0 8rem; }
.sf-input { width: 100%; padding: 12rem 14rem; border-radius: var(--radius-m); border: 1px solid var(--color-glass-border); background: var(--color-glass-bg); color: var(--color-text); font: 400 var(--text-sm)/1.4 var(--main-font); }
.sf-input:focus { outline: none; border-color: var(--color-glass-border-hover); }
.sf-btn-primary { padding: 10rem 18rem; border-radius: var(--radius-full); border: none; background: var(--color-accent); color: #fff; font: 600 13rem/1 var(--main-font); cursor: pointer; white-space: nowrap; }
.sf-btn-ghost { padding: 10rem 18rem; border-radius: var(--radius-full); border: 1px solid var(--color-glass-border); background: none; color: var(--color-text); font: 600 13rem/1 var(--main-font); cursor: pointer; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .sfe-bar { padding: 8rem 12rem; }
  .sfe-inspector { display: none; }
}
</style>

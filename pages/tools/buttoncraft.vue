<script setup lang="ts">
import { BUTTON_TEMPLATES } from '~/utils/buttonTemplates'
import BcIcon from '~/components/tools/buttoncraft/Icon.vue'

definePageMeta({ pageTransition: { name: 'fade', mode: 'out-in' } })

const store = useButtonCraftStore()

const mobilePanel = ref<'templates' | 'properties' | null>(null)
const savedFlash = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  if (!store.hasProject) store.loadTemplate(BUTTON_TEMPLATES[0].id)
})

// Small "saved" flash whenever the project updates, matching StoryGen's pattern.
watch(() => store.currentProject?.updatedAt, (val, prev) => {
  if (!val || !prev) return
  savedFlash.value = true
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { savedFlash.value = false }, 1400)
})

const projectName = computed({
  get: () => store.currentProject?.name ?? '',
  set: (v: string) => store.renameProject(v)
})
</script>

<template>
  <div class="bc-root">
    <UiGlassBackdrop />

    <header class="bc-topbar glass-panel">
      <span class="bc-wordmark">Button<em>Craft</em></span>
      <input
        v-model="projectName"
        class="bc-title"
        placeholder="Untitled Button"
        aria-label="Project name"
        maxlength="60"
      />
      <span class="bc-saved" :class="{ 'bc-saved--on': savedFlash }">● Saved</span>

      <button type="button" class="bc-tool bc-mobile-only" @click="mobilePanel = mobilePanel === 'templates' ? null : 'templates'">
        Templates
      </button>
      <button type="button" class="bc-tool bc-mobile-only" @click="mobilePanel = mobilePanel === 'properties' ? null : 'properties'">
        Style
      </button>

      <ToolsButtoncraftExportButton class="bc-topbar__export" />
    </header>

    <div class="bc-body">
      <ToolsButtoncraftTemplatesSidebar class="bc-panel bc-panel--templates bc-desktop-only" />

      <div class="bc-center">
        <ToolsButtoncraftStateTabs class="glass-panel bc-tabs-wrap" />
        <div class="bc-stage">
          <div class="bc-stage__checker">
            <ToolsButtoncraftButtonPreview />
          </div>
        </div>
      </div>

      <ToolsButtoncraftPropertiesPanel class="bc-panel bc-panel--properties bc-desktop-only" />
    </div>

    <Transition name="fade">
      <div v-if="mobilePanel" class="bc-mobile-sheet-backdrop" @click.self="mobilePanel = null">
        <div class="bc-mobile-sheet glass-panel">
          <button type="button" class="bc-mobile-sheet__close" @click="mobilePanel = null"><BcIcon name="close" :size="16" /></button>
          <ToolsButtoncraftTemplatesSidebar v-if="mobilePanel === 'templates'" />
          <ToolsButtoncraftPropertiesPanel v-else />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bc-root {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left);
}

/* ── Topbar ── */
.bc-topbar {
  /* The site's global corner chrome (home + menu buttons, see UiMenu) sits
     fixed at --chrome-offset from each edge — inset far enough that our
     wordmark/title/export controls never sit underneath it. */
  flex-shrink: 0;
  margin: 12rem 78rem 0;
  padding: 10rem 14rem;
  display: flex;
  align-items: center;
  gap: 12rem;
  border-radius: 18rem;
}
.bc-wordmark {
  font-size: 15rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  flex-shrink: 0;
  background: linear-gradient(100deg, #8B7CF6, #5B8DEF 55%, #2DD4BF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.bc-wordmark em { font-style: normal; }
.bc-title {
  flex: 1;
  min-width: 60rem;
  background: none;
  border: none;
  font-size: 14rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.85;
  padding: 6rem 8rem;
  border-radius: 8rem;
}
.bc-title:focus { outline: none; background: var(--color-glass-bg); opacity: 1; }
.bc-saved {
  font-size: 11rem;
  opacity: 0;
  color: #2DD4BF;
  font-weight: 600;
  transition: opacity 0.3s ease;
  flex-shrink: 0;
}
.bc-saved--on { opacity: 0.8; }
.bc-tool {
  font-size: 12.5rem;
  font-weight: 600;
  padding: 8rem 14rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-glass-border);
  color: var(--color-text);
  white-space: nowrap;
  flex-shrink: 0;
}
.bc-mobile-only { display: none; }

/* ── Body: 3-column app layout ── */
.bc-body {
  flex: 1;
  display: flex;
  gap: 14rem;
  padding: 14rem;
  overflow: hidden;
  min-height: 0;
}
.bc-panel {
  border-radius: 18rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 46%, transparent);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px) saturate(1.3);
  flex-shrink: 0;
}
.bc-panel--templates { width: 260rem; }
.bc-panel--properties { width: 320rem; }

.bc-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rem;
  min-width: 0;
}
.bc-tabs-wrap { flex-shrink: 0; padding: 4rem; }
.bc-stage {
  flex: 1;
  border-radius: 20rem;
  border: 1px solid var(--color-glass-border);
  background: color-mix(in srgb, var(--color-bg) 60%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 32rem;
}
.bc-stage__checker {
  background-image:
    linear-gradient(45deg, rgba(128,128,128,0.12) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(128,128,128,0.12) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(128,128,128,0.12) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(128,128,128,0.12) 75%);
  background-size: 20rem 20rem;
  background-position: 0 0, 0 10rem, 10rem -10rem, -10rem 0;
  padding: 40rem;
  border-radius: 16rem;
}

/* ── Mobile sheets ── */
.bc-mobile-sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
}
.bc-mobile-sheet {
  width: 100%;
  max-height: 78vh;
  border-radius: 22rem 22rem 0 0;
  padding-top: 20rem;
  position: relative;
  overflow: hidden;
}
.bc-mobile-sheet > :deep(.bc-props),
.bc-mobile-sheet > :deep(.bc-templates) { max-height: calc(78vh - 20rem); }
.bc-mobile-sheet__close {
  position: absolute;
  top: 14rem;
  right: 14rem;
  z-index: 1;
  width: 30rem;
  height: 30rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-glass-bg);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .bc-desktop-only { display: none; }
  .bc-mobile-only { display: inline-flex; }
  .bc-topbar { flex-wrap: wrap; margin: 8rem 72rem 0; }
  .bc-wordmark { display: none; }
  .bc-title { order: 1; }
  .bc-saved { display: none; }
  .bc-body { padding: 8rem; }
  .bc-stage { padding: 16rem; }
}
</style>

<template>
  <DialogueLoadError v-if="loadError" @retry="boot" />
  <div v-else>
    <button type="button" class="icon-btn fab-settings u-icon-btn u-icon-btn--idle" aria-label="Settings" @click="navigateTo('/dialogue/settings')">⚙</button>
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="44" height="44" role="img" aria-label="Dialogue">
          <rect x="48" y="16" width="416" height="480" rx="28" fill="#12110F"/>
          <rect x="64" y="32" width="384" height="448" rx="20" fill="#F6F1E8"/>
          <path fill="#FF4D2E" d="M256 120c-78 0-140 52-140 120 0 42 24 78 62 100l-48 78c-4 6 2 14 9 11l92-36c8 2 17 3 25 3 78 0 140-52 140-120S334 120 256 120z"/>
          <ellipse cx="268" cy="230" rx="58" ry="68" fill="#F6F1E8"/>
        </svg>
      </span>
      <div>
        <div class="name">Dialogue</div>
        <div class="tag">Comics from your pocket.</div>
      </div>
    </div>
    <div class="shelf">
      <button type="button" class="btn-primary large" @click="navigateTo('/dialogue/new')">＋ New comic</button>
      <div v-if="!store.projects.length" class="empty-state">Your first balloon is one tap away.</div>
      <div class="recents">
        <button
          v-for="p in store.projects"
          :key="p.id"
          type="button"
          class="comic-card"
          @click="navigateTo(`/dialogue/c/${p.id}`)"
          @contextmenu.prevent="openMenu(p.id)"
        >
          <img class="cover" :src="covers[p.id] || '/dialogue/icons/icon-512.png'" alt="" />
          <div class="meta">{{ p.title }}</div>
        </button>
      </div>
    </div>
    <DialogueContextMenu
      :open="!!menuId"
      @duplicate="onDup"
      @rename="onRename"
      @delete="onDel"
      @export="onExport"
      @close="menuId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { loadDialogueHomeLibs } from '~/composables/dialogue/loadDialogueScripts'
import { useDialogueDb } from '~/composables/dialogue/useDialogueDb'

useSeoMeta({
  title: 'Dialogue — comics from your pocket',
  description: 'Vertical webcomic studio for phones. Snap art, letter, export for WEBTOON.',
  ogTitle: 'Dialogue — comics from your pocket',
  ogUrl: 'https://entertrainer.in/dialogue',
})

definePageMeta({ layout: 'dialogue' })
const store = useDialogueProjectsStore()
const menuId = ref<string | null>(null)
const covers = ref<Record<string, string>>({})
const loadError = ref(false)

async function boot() {
  loadError.value = false
  try {
    await loadDialogueHomeLibs()
    await (window as any).DialogueDemo.ensureDemo()
    await store.hydrate()
    await fillCovers()
  } catch (error) {
    console.error(error)
    loadError.value = true
  }
}

onMounted(boot)

async function fillCovers() {
  for (const p of store.projects) {
    if (p.coverAssetId) {
      const a = await (window as any).DialogueDB.getAsset(p.coverAssetId)
      if (a?.dataURL) covers.value[p.id] = a.dataURL
    }
  }
}

function openMenu(id: string) { menuId.value = id }
async function onDup() {
  if (!menuId.value) return
  await useDialogueDb().duplicateProject(menuId.value)
  menuId.value = null
  await store.refresh()
}
async function onRename() {
  if (!menuId.value) return
  const b = await useDialogueDb().getProjectBundle(menuId.value)
  const t = prompt('Rename comic', b?.project.title || '')
  if (t && b) {
    b.project.title = t.trim() || b.project.title
    await useDialogueDb().saveProjectBundle(b)
  }
  menuId.value = null
  await store.refresh()
}
async function onDel() {
  if (!menuId.value) return
  if (confirm('Delete this comic?')) await useDialogueDb().deleteProject(menuId.value)
  menuId.value = null
  await store.refresh()
}
function onExport() {
  if (!menuId.value) return
  const id = menuId.value
  menuId.value = null
  navigateTo(`/dialogue/c/${id}?export=1`)
}

</script>

<template>
  <div class="settings-list">
    <div class="row">
      <label>Theme</label>
      <select v-model="store.settings.theme" @change="persist">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
    <div class="row">
      <label>Default format</label>
      <select v-model="store.settings.defaultFormat" @change="persist">
        <option value="webtoon">Webtoon</option>
        <option value="shorts">Shorts</option>
        <option value="square">Square</option>
        <option value="page">Page</option>
      </select>
    </div>
    <div class="row">
      <label>Autosave</label>
      <input v-model="store.settings.autosave" type="checkbox" @change="persist" />
    </div>
    <div class="row">
      <label>Reduce motion</label>
      <input v-model="store.settings.reduceMotion" type="checkbox" @change="persist" />
    </div>
    <div class="row">
      <label>Export quality</label>
      <input v-model.number="store.settings.exportQuality" type="range" min="0.6" max="1" step="0.02" @change="persist" />
    </div>
    <div class="row">
      <button type="button" class="btn-primary" @click="reset">Reset local data</button>
    </div>
    <div class="row soon"><label>Cloud sync</label><span>Soon</span></div>
    <div class="row soon"><label>Pressure pen</label><span>Soon</span></div>
    <div class="row"><label>About</label><span>Dialogue — Comics from your pocket.</span></div>
    <p class="camera-note">Dialogue uses the camera only to put a photo on your panel. Nothing leaves this phone.</p>
  </div>
</template>

<script setup lang="ts">
const store = useDialogueProjectsStore()

onMounted(async () => {
  await store.hydrate()
  applyTheme()
})

async function persist() {
  applyTheme()
  if (process.client && (window as any).DialogueDB) {
    await (window as any).DialogueDB.setMeta('settings', store.settings)
  }
}
function applyTheme() {
  const t = store.settings.theme
  if (t === 'system') delete document.documentElement.dataset.theme
  else document.documentElement.dataset.theme = t
  document.documentElement.dataset.reduceMotion = store.settings.reduceMotion ? '1' : '0'
}
async function reset() {
  if (!confirm('Erase all local Dialogue comics and settings?')) return
  await (window as any).DialogueDB.resetAll()
  location.href = '/dialogue'
}
</script>

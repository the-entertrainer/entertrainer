import { defineStore } from 'pinia'
import type { DialogueBundle, DialogueProject, DialogueSettings } from '../types/dialogue'

export const useDialogueProjectsStore = defineStore('dialogueProjects', {
  state: () => ({
    projects: [] as DialogueProject[],
    current: null as DialogueBundle | null,
    settings: {
      theme: 'system',
      defaultFormat: 'webtoon',
      autosave: true,
      exportQuality: 0.92,
    } as DialogueSettings,
    ready: false,
  }),
  actions: {
    async hydrate() {
      if (!process.client) return
      const { useDialogueDb } = await import('../composables/dialogue/useDialogueDb')
      const db = useDialogueDb()
      this.projects = await db.listProjects()
      this.settings = (await db.getMeta('settings', this.settings)) as DialogueSettings
      this.ready = true
    },
    async refresh() {
      if (!process.client) return
      const { useDialogueDb } = await import('../composables/dialogue/useDialogueDb')
      this.projects = await useDialogueDb().listProjects()
    },
    setCurrent(bundle: DialogueBundle | null) {
      this.current = bundle
    },
  },
})

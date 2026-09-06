import type { DialogueBundle, DialogueProject } from '../../types/dialogue'

/** Thin client wrapper — prefers window.DialogueDB from the static PWA scripts when present. */
export function useDialogueDb() {
  function api() {
    if (!process.client) throw new Error('Dialogue DB is client-only')
    const w = window as any
    if (!w.DialogueDB) throw new Error('DialogueDB not loaded — include /dialogue/js/db.js + Dexie')
    return w.DialogueDB as {
      listProjects: () => Promise<DialogueProject[]>
      getProjectBundle: (id: string) => Promise<DialogueBundle | null>
      saveProjectBundle: (b: DialogueBundle, opts?: { replaceChildren?: boolean }) => Promise<DialogueProject>
      deleteProject: (id: string) => Promise<void>
      duplicateProject: (id: string) => Promise<DialogueProject | null>
      getMeta: (key: string, fallback?: unknown) => Promise<any>
      setMeta: (key: string, value: unknown) => Promise<void>
      resetAll: () => Promise<void>
      emptyProject: (partial?: Partial<DialogueProject>) => DialogueProject
    }
  }
  return {
    listProjects: () => api().listProjects(),
    getProjectBundle: (id: string) => api().getProjectBundle(id),
    saveProjectBundle: (b: DialogueBundle, opts?: { replaceChildren?: boolean }) => api().saveProjectBundle(b, opts),
    deleteProject: (id: string) => api().deleteProject(id),
    duplicateProject: (id: string) => api().duplicateProject(id),
    getMeta: (key: string, fallback?: unknown) => api().getMeta(key, fallback),
    setMeta: (key: string, value: unknown) => api().setMeta(key, value),
    resetAll: () => api().resetAll(),
    emptyProject: (partial?: Partial<DialogueProject>) => api().emptyProject(partial),
  }
}

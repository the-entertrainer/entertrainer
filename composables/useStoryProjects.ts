import type { StoryGenProject } from '~/types/story'

// Local-first project shelf: an index of lightweight metadata (with a
// small JPEG thumbnail) plus one storage key per project body. Everything
// stays on this device.

export interface ProjectMeta {
  id: string
  title: string
  model: string
  updated: string
  screens: number
  minutes: number
  thumb?: string
}

const INDEX_KEY = 'storygen-projects'
const PROJECT_PREFIX = 'storygen-p:'
const LEGACY_KEY = 'storygen-project'
const MAX_PROJECTS = 40

export function newProjectId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function listProjects(): ProjectMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    const list: ProjectMeta[] = raw ? JSON.parse(raw) : []
    return list.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
  } catch { return [] }
}

function writeIndex(list: ProjectMeta[]) {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(list.slice(0, MAX_PROJECTS))) } catch {}
}

export function readProject(id: string): StoryGenProject | null {
  try {
    const raw = localStorage.getItem(PROJECT_PREFIX + id)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function writeProject(id: string, project: StoryGenProject) {
  try { localStorage.setItem(PROJECT_PREFIX + id, JSON.stringify(project)) } catch {}
  const list = listProjects().filter(p => p.id !== id)
  const prior = listProjects().find(p => p.id === id)
  list.unshift({
    id,
    title: project.title,
    model: project.model,
    updated: project.updated,
    screens: project.cards.length,
    minutes: Math.max(1, Math.round(project.cards.reduce((s, c) => s + (c.duration || 0), 0) / 60)),
    thumb: prior?.thumb
  })
  writeIndex(list)
}

export function writeThumb(id: string, dataUrl: string) {
  const list = listProjects()
  const entry = list.find(p => p.id === id)
  if (!entry) return
  entry.thumb = dataUrl
  writeIndex(list)
}

export function removeProject(id: string) {
  try { localStorage.removeItem(PROJECT_PREFIX + id) } catch {}
  writeIndex(listProjects().filter(p => p.id !== id))
}

// The pre-shelf era stored a single project under one key — fold it into
// the index the first time the new home screen loads.
export function migrateLegacyProject() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (Array.isArray(data?.cards) && data.cards.length) {
      const id = newProjectId()
      writeProject(id, {
        version: '5.0',
        title: String(data.title || 'Untitled Storyboard'),
        model: String(data.model || 'freeform'),
        updated: String(data.updated || new Date().toISOString()),
        cards: data.cards,
        connections: Array.isArray(data.connections) ? data.connections : []
      })
    }
    localStorage.removeItem(LEGACY_KEY)
  } catch {}
}

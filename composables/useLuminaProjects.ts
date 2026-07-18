import type { LuminaCourse } from '~/types/lumina'

// Local-first course shelf for Lumina — same architecture as StoryGen's
// shelf: a lightweight metadata index plus one storage key per course
// body. Everything stays on this device.

export interface LuminaProjectMeta {
  id: string
  title: string
  updated: string
  lessons: number
  blocks: number
  accent: string
}

const INDEX_KEY = 'lumina-projects'
const PROJECT_PREFIX = 'lumina-p:'
const MAX_PROJECTS = 40

export function newLuminaProjectId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function listLuminaProjects(): LuminaProjectMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    const list: LuminaProjectMeta[] = raw ? JSON.parse(raw) : []
    return list.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''))
  } catch { return [] }
}

function writeIndex(list: LuminaProjectMeta[]) {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(list.slice(0, MAX_PROJECTS))) } catch {}
}

export function readLuminaProject(id: string): LuminaCourse | null {
  try {
    const raw = localStorage.getItem(PROJECT_PREFIX + id)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function writeLuminaProject(id: string, course: LuminaCourse) {
  try { localStorage.setItem(PROJECT_PREFIX + id, JSON.stringify(course)) } catch {}
  const list = listLuminaProjects().filter(p => p.id !== id)
  list.unshift({
    id,
    title: course.title,
    updated: course.updated,
    lessons: course.lessons.length,
    blocks: course.lessons.reduce((s, l) => s + l.blocks.length, 0),
    accent: course.theme.accent
  })
  writeIndex(list)
}

export function removeLuminaProject(id: string) {
  try { localStorage.removeItem(PROJECT_PREFIX + id) } catch {}
  writeIndex(listLuminaProjects().filter(p => p.id !== id))
}

/** Pinned, same-origin copies. Dialogue script tags expect window.Konva and window.Dexie. */
export const DIALOGUE_KONVA_SRC = '/dialogue/vendor/konva-10.9.1.min.js'
export const DIALOGUE_DEXIE_SRC = '/dialogue/vendor/dexie-4.4.7.js'

const EDITOR_SCRIPTS = [
  '/dialogue/js/utils.js',
  '/dialogue/js/formats.js',
  '/dialogue/js/db.js',
  '/dialogue/js/history.js',
  '/dialogue/js/export.js',
  '/dialogue/js/editor.js',
]

const HOME_SCRIPTS = [
  '/dialogue/js/utils.js',
  '/dialogue/js/formats.js',
  '/dialogue/js/db.js',
  '/dialogue/js/demo.js',
]

const NEW_SCRIPTS = [
  '/dialogue/js/utils.js',
  '/dialogue/js/formats.js',
  '/dialogue/js/db.js',
]

function leaf(src: string) {
  return src.split('/').pop() || src
}

export function dropDialogueScript(src: string) {
  const name = leaf(src)
  for (const script of [...document.scripts]) {
    if (script.src.includes(name)) script.remove()
  }
}

export function loadDialogueScript(src: string): Promise<void> {
  const name = leaf(src)
  const existing = [...document.scripts].find((script) => script.src.includes(name))
  if (existing?.dataset.loaded === '1') return Promise.resolve()
  if (existing) existing.remove()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.onload = () => {
      script.dataset.loaded = '1'
      resolve()
    }
    script.onerror = () => {
      script.remove()
      reject(new Error(`Could not load ${src}`))
    }
    document.head.appendChild(script)
  })
}

async function loadSet(sources: string[]) {
  for (const src of sources) await loadDialogueScript(src)
}

export async function loadDialogueDexie() {
  const w = window as any
  if (!w.Dexie) await loadDialogueScript(DIALOGUE_DEXIE_SRC)
  if (!w.Dexie) throw new Error('Dexie did not start')
}

export async function loadDialogueHomeLibs() {
  await loadDialogueDexie()
  await loadSet(HOME_SCRIPTS)
  if (!(window as any).DialogueDB) throw new Error('Dialogue library did not start')
}

export async function loadDialogueNewLibs() {
  await loadDialogueDexie()
  await loadSet(NEW_SCRIPTS)
  if (!(window as any).DialogueDB) throw new Error('Dialogue library did not start')
}

export async function loadDialogueEditorLibs() {
  const w = window as any
  if (!w.Konva) await loadDialogueScript(DIALOGUE_KONVA_SRC)
  await loadDialogueDexie()
  await loadSet(EDITOR_SCRIPTS)
  if (!w.JSZip) await loadDialogueScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
  if (!w.jspdf && !w.jsPDF) await loadDialogueScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
  if (!w.saveAs) await loadDialogueScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js')
  if (!w.Konva || !w.Dexie || !w.DialogueEditor) throw new Error('Dialogue editor did not start')
}

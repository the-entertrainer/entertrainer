<template>
  <div>
    <div class="topbar">
      <button type="button" class="icon-btn" aria-label="Back" @click="navigateTo('/dialogue')">←</button>
      <h1>New comic</h1>
      <span style="width:56px" />
    </div>
    <DialogueNewWizard @create="onCreate" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dialogue' })

async function onCreate(payload: { formatId: string; layoutId: string; start: string | null }) {
  await ensureBridge()
  const F = (window as any).DialogueFormats
  const U = (window as any).DialogueUtils
  const DB = (window as any).DialogueDB
  const format = F.FORMATS[payload.formatId] || F.FORMATS.webtoon
  const layout = F.LAYOUTS[payload.layoutId] || F.LAYOUTS.stack3
  const rects = F.layoutRects(format, layout)
  const g = F.gutterForWidth(format.width)
  const height = rects.length ? rects[rects.length - 1].y + rects[rects.length - 1].h + g : F.defaultPageHeight(format, 1)
  const project = DB.emptyProject({
    title: 'Untitled',
    formatId: format.id,
    width: format.width,
    height: format.infinite ? height : format.height,
  })
  const page = { id: U.uid('page'), projectId: project.id, order: 0, width: format.width, height: project.height }
  const panels = rects.map((r: any, i: number) => ({
    id: U.uid('panel'), pageId: page.id, order: i,
    x: r.x, y: r.y, w: r.w, h: r.h, fit: 'cover', artX: 0, artY: 0, artScale: 1, placeholderColor: '#d5cbbd',
  }))
  await DB.saveProjectBundle({ project, pages: [page], panels, nodes: [], assets: [] })
  navigateTo(`/dialogue/c/${project.id}`)
}

async function ensureBridge() {
  if ((window as any).DialogueDB) return
  for (const src of ['https://unpkg.com/dexie@4/dist/dexie.js', '/dialogue/js/utils.js', '/dialogue/js/formats.js', '/dialogue/js/db.js']) {
    await new Promise<void>((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(); document.head.appendChild(s)
    })
  }
}
</script>

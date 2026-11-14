import { zipStore } from './zip'

export interface PdfSource {
  id: string
  name: string
  bytes: Uint8Array
}

async function lib() {
  return import('pdf-lib')
}

export async function pageCount(bytes: Uint8Array): Promise<number> {
  const { PDFDocument } = await lib()
  const doc = await PDFDocument.load(bytes)
  return doc.getPageCount()
}

export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  const { PDFDocument } = await lib()
  const merged = await PDFDocument.create()
  for (const file of files) {
    const src = await PDFDocument.load(file)
    const pages = await merged.copyPages(src, src.getPageIndices())
    pages.forEach(page => merged.addPage(page))
  }
  return merged.save()
}

export function parsePageRange(spec: string, count: number): number[] | { error: string } {
  const text = spec.trim()
  if (!text) return { error: 'Enter pages, such as 1-2 or 1, 3.' }
  const pages = new Set<number>()
  for (const part of text.split(',')) {
    const bit = part.trim()
    if (!bit) continue
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(bit)
    if (range) {
      const start = Number(range[1])
      const end = Number(range[2])
      if (start < 1 || end < start || end > count) return { error: `Pages must be between 1 and ${count}.` }
      for (let n = start; n <= end; n++) pages.add(n)
      continue
    }
    if (!/^\d+$/.test(bit)) return { error: `“${bit}” is not a page number.` }
    const page = Number(bit)
    if (page < 1 || page > count) return { error: `Pages must be between 1 and ${count}.` }
    pages.add(page)
  }
  if (!pages.size) return { error: 'Enter at least one page.' }
  return [...pages]
}

export async function extractPages(bytes: Uint8Array, pages: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await lib()
  const src = await PDFDocument.load(bytes)
  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, pages.map(page => page - 1))
  copied.forEach(page => out.addPage(page))
  return out.save()
}

export async function splitZip(bytes: Uint8Array, baseName: string): Promise<Uint8Array> {
  const { PDFDocument } = await lib()
  const src = await PDFDocument.load(bytes)
  const count = src.getPageCount()
  const files: { name: string; data: Uint8Array }[] = []
  for (let index = 0; index < count; index++) {
    const out = await PDFDocument.create()
    const [page] = await out.copyPages(src, [index])
    out.addPage(page)
    const saved = await out.save()
    files.push({ name: `${baseName}-page-${index + 1}.pdf`, data: saved })
  }
  return zipStore(files)
}

export async function reorderPages(bytes: Uint8Array, order: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await lib()
  const src = await PDFDocument.load(bytes)
  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, order)
  copied.forEach(page => out.addPage(page))
  return out.save()
}

export async function compressPdf(bytes: Uint8Array): Promise<Uint8Array> {
  const { PDFDocument } = await lib()
  const doc = await PDFDocument.load(bytes)
  return doc.save({ useObjectStreams: true })
}

export async function signPdf(bytes: Uint8Array, options: {
  pageNumber: number
  png?: Uint8Array | null
  typed?: string
}): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts } = await lib()
  const doc = await PDFDocument.load(bytes)
  const page = doc.getPage(Math.min(doc.getPageCount(), Math.max(1, options.pageNumber)) - 1)
  let y = 48
  if (options.png && options.png.length) {
    const image = await doc.embedPng(options.png)
    const width = 180
    const height = Math.max(36, (image.height / image.width) * width)
    page.drawImage(image, { x: 48, y, width, height })
    y += height + 12
  }
  const typed = options.typed?.trim()
  if (typed) {
    const font = await doc.embedFont(StandardFonts.Helvetica)
    page.drawText(typed.slice(0, 80), { x: 48, y, size: 16, font })
  }
  return doc.save()
}

// Proper document parsing, all in the browser: real PDF text extraction via
// pdf.js, real .docx extraction via mammoth, and native reads for the text
// family. Heavy parsers load lazily so the base app stays light.

const TEXT_EXTS = ['txt', 'md', 'markdown', 'csv', 'json', 'html', 'htm', 'rtf', 'vtt', 'srt']
const MAX_CHARS = 60000

function ext(name: string) { return name.split('.').pop()?.toLowerCase() ?? '' }

// pdfjs-dist's default build calls Promise.withResolvers(), a 2024 API
// (Safari 17.4+ / iOS 17.4+) — on anything older this throws a generic
// "undefined is not a function" deep in the bundle. The "legacy" build
// ships the same core-js polyfill pdfjs uses internally for older engines,
// so we import from there for both the main thread and the worker.
if (typeof Promise.withResolvers !== 'function') {
  (Promise as any).withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: any) => void
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
    return { promise, resolve, reject }
  }
}

let pdfjsMod: typeof import('pdfjs-dist/legacy/build/pdf.mjs') | null = null
async function loadPdfjs() {
  if (pdfjsMod) return pdfjsMod
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  pdfjsMod = pdfjs
  return pdfjs
}

// pdf.js hands back text items in content-stream order, not reading order —
// fine for a simple single-column memo, but real-world documents (two-
// column newsletters, tables, sidebars) routinely draw out of visual order,
// which scrambles sentences and is exactly the kind of garbled input that
// makes a downstream LLM hallucinate structure. Rebuild reading order from
// each item's own position instead of trusting stream order: bucket items
// into lines by y, split lines into left/right column bands when the page
// has a consistent vertical gutter, then walk column-by-column, top to
// bottom — the same heuristic `pdftotext -layout` and most real extractors
// use.
type PosItem = { str: string; x: number; y: number; w: number; h: number }

// Groups already-column-sorted items into visual lines (baseline within half
// a line-height of each other) and joins each line into a string. Items
// sharing a word are often split across multiple text runs (font changes,
// kerning) with no space glyph between them — joining every item with a
// space would fracture words, joining with nothing would run adjacent words
// together. Only insert a space when the gap between one item's end and the
// next item's start is wide enough to be a real word break, judged relative
// to that item's own character height.
function joinLines(items: PosItem[]): string {
  if (!items.length) return ''
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x)
  const lines: PosItem[][] = []
  for (const it of sorted) {
    const last = lines[lines.length - 1]
    const tol = Math.max(2, it.h * 0.5)
    if (last && Math.abs(last[0].y - it.y) <= tol) last.push(it)
    else lines.push([it])
  }
  for (const l of lines) l.sort((a, b) => a.x - b.x)

  return lines.map(l => {
    let out = l[0]?.str ?? ''
    for (let i = 1; i < l.length; i++) {
      const prev = l[i - 1]
      const gap = l[i].x - (prev.x + prev.w)
      if (gap > Math.max(1, prev.h * 0.18) && !/\s$/.test(out)) out += ' '
      out += l[i].str
    }
    return out
  }).join('\n')
}

function reconstructLayout(items: any[], pageWidth: number): string {
  const all: PosItem[] = items
    .filter((it: any) => typeof it.str === 'string')
    .map((it: any) => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      w: it.width ?? 0,
      h: it.height || Math.abs(it.transform[3]) || 10
    }))
  if (!all.length) return ''

  // Column detection: find an x-band that very few ROWS ever cross — a real
  // gutter. Coverage is counted per row (not per item): a single full-width
  // title crossing the gutter should count once, not drown out the signal,
  // so a page with an 11-line column on each side and one banner title
  // still shows a clear valley at the gutter instead of the title's width
  // masking it. Split items into column groups BEFORE line-grouping (not
  // after) — if two side-by-side headlines share a y-coordinate, grouping
  // by y first would merge them into one garbled line before column-
  // splitting ever gets a chance to separate them.
  const rowTol = Math.max(2, (all.reduce((s, it) => s + it.h, 0) / all.length) * 0.5)
  const rowsByY: PosItem[][] = []
  for (const it of [...all].sort((a, b) => b.y - a.y)) {
    const last = rowsByY[rowsByY.length - 1]
    if (last && Math.abs(last[0].y - it.y) <= rowTol) last.push(it)
    else rowsByY.push([it])
  }

  const bandWidth = Math.max(6, pageWidth * 0.01)
  const bands = Math.ceil(pageWidth / bandWidth)
  const coverage = new Array(bands).fill(0)
  for (const row of rowsByY) {
    // Mark bands actually spanned by this row's own items, not the row's
    // outer bounding box — a two-column row's items sit far apart, and a
    // bounding box from the leftmost to the rightmost would bridge straight
    // over the real gutter between them.
    const touched = new Set<number>()
    for (const it of row) {
      const from = Math.max(0, Math.floor(it.x / bandWidth))
      const to = Math.min(bands - 1, Math.ceil((it.x + it.w) / bandWidth))
      for (let b = from; b <= to; b++) touched.add(b)
    }
    for (const b of touched) coverage[b]++
  }
  const maxCoverage = Math.max(...coverage, 1)
  let gutter = -1
  const loBand = Math.floor(bands * 0.25)
  const hiBand = Math.ceil(bands * 0.75)
  for (let b = loBand; b < hiBand; b++) {
    // Allow one stray full-width row (a title) to cross the gutter without
    // masking it, but require the valley to be clearly thinner than the
    // page's real column traffic.
    if (coverage[b] <= 1 && maxCoverage >= 4) { gutter = b * bandWidth + bandWidth / 2; break }
  }
  const left = gutter < 0 ? [] : all.filter(it => it.x < gutter)
  const right = gutter < 0 ? [] : all.filter(it => it.x >= gutter)
  // Only trust the gutter as a real column break if both sides have enough
  // distinct lines to be genuine columns, not a title that just happens to
  // start left of a stray indented footnote.
  const isTwoColumn = gutter >= 0
    && new Set(left.map(it => Math.round(it.y))).size >= 3
    && new Set(right.map(it => Math.round(it.y))).size >= 3

  if (!isTwoColumn) return joinLines(all)
  return [joinLines(left), joinLines(right)].join('\n')
}

class PdfPasswordError extends Error {
  constructor() { super('This PDF is password-protected.') }
}

async function parsePdfViaPdfjs(bytes: ArrayBuffer): Promise<{ text: string; emptyPageRatio: number; numPages: number }> {
  const pdfjs = await loadPdfjs()
  const task = pdfjs.getDocument({ data: bytes, password: '' })
  let doc: any
  try {
    doc = await task.promise
  } catch (err: any) {
    if (err?.name === 'PasswordException') throw new PdfPasswordError()
    throw err
  }
  const pages: string[] = []
  let emptyPages = 0
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1 })
    const pageText = reconstructLayout(content.items, viewport.width)
    if (!pageText.trim()) emptyPages++
    pages.push(pageText)
  }
  await task.destroy().catch(() => {})
  return { text: pages.join('\n\n'), emptyPageRatio: doc.numPages ? emptyPages / doc.numPages : 1, numPages: doc.numPages }
}

// Turns a PDF-string escape sequence body (the content between the parens
// of a `(...)` literal) into real text: \n \r \t \( \) \\ and \ddd octal.
function unescapePdfLiteral(s: string): string {
  return s.replace(/\\(\d{1,3}|\r\n|[\s\S])/g, (_, esc: string) => {
    if (/^\d+$/.test(esc)) return String.fromCharCode(parseInt(esc, 8) & 0xff)
    if (esc === 'n') return '\n'
    if (esc === 'r') return '\r'
    if (esc === 't') return '\t'
    if (esc === 'b' || esc === 'f') return ''
    if (esc === '\r\n' || esc === '\n' || esc === '\r') return ''
    return esc
  })
}

// A dependency-free fallback that walks the PDF's own object structure
// directly: find every `stream…endstream`, inflate it if it's the (near-
// universal) FlateDecode filter, then pull text straight out of the page
// content operators (`(…) Tj` and `[(…) …] TJ`). No pdf.js, no worker — just
// regex and the standard Streams API, so it survives whatever specific
// modern JS feature pdf.js's own bundle happens to require on a given
// device. It won't resolve custom font encodings as precisely as pdf.js,
// but for ordinary text-based PDFs (the overwhelming majority) it recovers
// real, readable content instead of nothing.
async function parsePdfViaStreamScan(bytes: ArrayBuffer): Promise<string> {
  const buf = new Uint8Array(bytes)
  let raw = ''
  const CHUNK = 0x8000
  for (let i = 0; i < buf.length; i += CHUNK) {
    raw += String.fromCharCode(...buf.subarray(i, i + CHUNK))
  }

  const canInflate = typeof DecompressionStream !== 'undefined'
  // "stream…endstream" is a reliable delimiter on its own; walking back to
  // the enclosing "N 0 obj" for its dictionary sidesteps trying to regex-
  // match (possibly nested) << >> pairs, which JS regex can't do reliably.
  const streamRe = /\bstream\r?\n([\s\S]*?)endstream/g
  const opRe = /\(((?:\\.|[^\\()])*)\)\s*Tj|\[((?:\\.|[^\\\[\]])*)\]\s*TJ/g
  const arrayStrRe = /\(((?:\\.|[^\\()])*)\)/g

  const pieces: string[] = []
  let match: RegExpExecArray | null

  while ((match = streamRe.exec(raw))) {
    const objStart = raw.lastIndexOf('obj', match.index)
    const dict = objStart >= 0 ? raw.slice(objStart, match.index) : ''
    const body = match[1]
    if (/\/Filter\s*[^/]*\/(DCTDecode|JPXDecode|CCITTFaxDecode|JBIG2Decode)/.test(dict)) continue // images, not text
    const isFlate = /\/Filter\s*[^/]*\/FlateDecode/.test(dict)

    let content = body
    if (isFlate) {
      if (!canInflate) continue
      try {
        // The regex captures up to the EOL that precedes the "endstream"
        // keyword, but that EOL is PDF-syntax padding, not compressed
        // data — one extra trailing byte is enough to make every inflate
        // call fail, so it must come off before decompressing.
        const trimmed = body.replace(/[\r\n]+$/, '')
        const bodyBytes = Uint8Array.from(trimmed, c => c.charCodeAt(0) & 0xff)
        const stream = new Blob([bodyBytes]).stream().pipeThrough(new DecompressionStream('deflate'))
        content = new TextDecoder('latin1').decode(await new Response(stream).arrayBuffer())
      } catch {
        continue
      }
    }
    if (!/\bT[jJ]\b/.test(content)) continue // not a text-showing content stream

    let opMatch: RegExpExecArray | null
    opRe.lastIndex = 0
    while ((opMatch = opRe.exec(content))) {
      if (opMatch[1] !== undefined) {
        pieces.push(unescapePdfLiteral(opMatch[1]))
      } else if (opMatch[2] !== undefined) {
        let strMatch: RegExpExecArray | null
        arrayStrRe.lastIndex = 0
        const words: string[] = []
        while ((strMatch = arrayStrRe.exec(opMatch[2]))) words.push(unescapePdfLiteral(strMatch[1]))
        pieces.push(words.join(''))
      }
    }
    pieces.push('\n')
  }
  return pieces.join(' ')
}

// pdf.js's own extraction is semantically correct whenever it produces
// anything at all — it never emits hex/glyph-id junk — so a short length
// gate is enough to trust it (a table-heavy page like "FY23 12% FY24 15%"
// is legitimate real text despite a low letter ratio). The dependency-free
// regex scanner is the one that needs the stricter ratio check: it can't
// resolve CID/hex-encoded fonts and, on those, inflates real bytes into
// pages of bracket/whitespace noise that would otherwise pass a bare
// length check.
function hasSubstantialText(s: string): boolean {
  return s.trim().length >= 20
}
function hasPlausibleFallbackText(s: string): boolean {
  const letters = s.match(/[A-Za-z]/g)?.length ?? 0
  return letters >= 20 && letters / Math.max(1, s.trim().length) > 0.15
}

const OCR_MAX_PAGES = 15

// Last-resort path for PDFs with no machine-readable text layer at all —
// scans, flattened "print to image" exports, photographed pages. Same
// pipeline real-world browser OCR tools use: pdf.js renders each page to a
// canvas, Tesseract.js (Tesseract compiled to WASM) reads the pixels. Slow
// (seconds per page), so it only runs after both text paths have failed,
// and it's capped so a 200-page scanned book doesn't hang the tab.
async function parsePdfViaOcr(bytes: ArrayBuffer, onProgress?: (msg: string) => void): Promise<string> {
  const pdfjs = await loadPdfjs()
  const { createWorker } = await import('tesseract.js')
  const task = pdfjs.getDocument({ data: bytes, password: '' })
  const doc = await task.promise
  const pageCount = Math.min(doc.numPages, OCR_MAX_PAGES)

  // Self-host the worker, WASM core, and English language data instead of
  // tesseract.js's CDN defaults: some corporate/restricted networks that
  // block third-party CDNs (jsdelivr, projectnaptha) are exactly the ones
  // most likely to hand a scanned policy PDF to this tool.
  const worker = await createWorker('eng', undefined, {
    workerPath: '/tesseract/worker.min.js',
    corePath: '/tesseract/tesseract-core-lstm.wasm.js',
    langPath: '/tesseract'
  })
  const pages: string[] = []
  try {
    for (let i = 1; i <= pageCount; i++) {
      onProgress?.(`Reading page ${i} of ${pageCount} with OCR…`)
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await page.render({ canvas, canvasContext: ctx, viewport }).promise
      const { data } = await worker.recognize(canvas)
      pages.push(data.text)
    }
  } finally {
    await worker.terminate().catch(() => {})
    await task.destroy().catch(() => {})
  }
  if (doc.numPages > pageCount) pages.push(`\n[Only the first ${pageCount} of ${doc.numPages} pages were OCR'd — paste the rest directly if you need it.]`)
  return pages.join('\n\n')
}

async function parsePdf(file: File, onProgress?: (msg: string) => void): Promise<string> {
  const bytes = await file.arrayBuffer()
  try {
    // pdf.js hands this buffer to its worker as a transferable, which
    // detaches it in this thread — pass a throwaway copy so `bytes` is
    // still readable below if a fallback path is needed.
    const { text, emptyPageRatio } = await parsePdfViaPdfjs(bytes.slice(0))
    // A handful of blank pages (dividers, cover art) is normal; if MOST
    // pages came back with zero text, this is a scanned/image PDF, not a
    // parsing failure, and OCR — not more text-layer parsing — is what's
    // needed.
    if (hasSubstantialText(text) && emptyPageRatio < 0.5) return text
  } catch (err) {
    if (err instanceof PdfPasswordError) throw err
    if (import.meta.dev) console.warn('[StoryGen] pdf.js parse failed, falling back to stream scan:', err)
  }
  // pdf.js either threw (a browser API it needs is unsupported) or found no
  // text — try the dependency-free scanner before giving up. It only
  // recovers literal (…) Tj/TJ strings, so it helps plain-text PDFs and
  // stays silent (not garbled) on CID/hex-encoded ones.
  try {
    const fallback = await parsePdfViaStreamScan(bytes)
    if (hasPlausibleFallbackText(fallback)) return fallback
  } catch (err) {
    if (import.meta.dev) console.warn('[StoryGen] stream-scan parse failed, falling back to OCR:', err)
  }
  // Neither path found a text layer — this is almost always a scanned or
  // flattened-image PDF. OCR is the only approach that can still recover
  // the content, so it's the true last resort rather than surfacing failure.
  try {
    const ocr = await parsePdfViaOcr(bytes, onProgress)
    if (hasSubstantialText(ocr)) return ocr
  } catch (err) {
    if (import.meta.dev) console.warn('[StoryGen] OCR fallback failed:', err)
  }
  return ''
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
  return result.value
}

async function parseHtml(file: File): Promise<string> {
  const doc = new DOMParser().parseFromString(await file.text(), 'text/html')
  return doc.body?.textContent ?? ''
}

export interface ParsedSource {
  text: string
  notes: string[]
}

export async function parseFiles(files: File[], onProgress?: (msg: string) => void): Promise<ParsedSource> {
  const chunks: string[] = []
  const notes: string[] = []
  for (const file of files) {
    const e = ext(file.name)
    try {
      let text = ''
      if (e === 'pdf' || file.type === 'application/pdf') {
        text = await parsePdf(file, onProgress)
      } else if (e === 'docx' || file.type.includes('officedocument.wordprocessingml')) {
        text = await parseDocx(file)
      } else if (e === 'html' || e === 'htm') {
        text = await parseHtml(file)
      } else if (TEXT_EXTS.includes(e) || file.type.startsWith('text/')) {
        text = await file.text()
      } else if (e === 'doc' || e === 'ppt' || e === 'pptx') {
        notes.push(`${file.name}: this legacy/slide format can't be parsed in the browser — export it as PDF or paste the text.`)
        continue
      } else {
        // Last resort: try reading as text; binary junk gets filtered below
        text = await file.text()
      }
      const clean = text.replace(/\u00A0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
      if (clean.length < 20) {
        notes.push(e === 'pdf' || file.type === 'application/pdf'
          ? `${file.name}: no extractable text found \u2014 tried the text layer, a raw scan, and OCR. This PDF may be a very low-quality scan or corrupted. Try pasting the text directly below.`
          : `${file.name}: no readable text found.`)
      } else {
        chunks.push(`--- ${file.name} ---\n${clean}`)
      }
    } catch (err: any) {
      const msg = err instanceof PdfPasswordError
        ? `${file.name}: this PDF is password-protected \u2014 remove the password (or save an unprotected copy) and try again.`
        : `${file.name}: could not be parsed (${err?.message || 'unknown error'}) \u2014 try pasting the text directly below.`
      notes.push(msg)
    }
  }
  return { text: chunks.join('\n\n').slice(0, MAX_CHARS), notes }
}

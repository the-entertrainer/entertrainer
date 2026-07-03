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

async function parsePdfViaPdfjs(bytes: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const task = pdfjs.getDocument({ data: bytes })
  const doc = await task.promise
  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((item: any) => item.str).join(' '))
  }
  await task.destroy().catch(() => {})
  return pages.join('\n\n')
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

// A raw length check isn't enough for the fallback scanner: PDFs whose text
// is CID-encoded (hex glyph IDs instead of literal characters — common in
// "Print to PDF" output with subsetted fonts) inflate cleanly but yield
// pages of bracket/whitespace noise with no actual words. Require a real
// concentration of letters before trusting the result.
function hasRealText(s: string): boolean {
  const letters = s.match(/[A-Za-z]/g)?.length ?? 0
  return letters >= 20 && letters / Math.max(1, s.trim().length) > 0.15
}

async function parsePdf(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  try {
    // pdf.js hands this buffer to its worker as a transferable, which
    // detaches it in this thread — pass a throwaway copy so `bytes` is
    // still readable below if the fallback scanner is needed.
    const text = await parsePdfViaPdfjs(bytes.slice(0))
    if (hasRealText(text)) return text
  } catch (err) {
    if (import.meta.dev) console.warn('[StoryGen] pdf.js parse failed, falling back to stream scan:', err)
  }
  // pdf.js either threw (a browser API it needs is unsupported) or found no
  // text — try the dependency-free scanner before giving up. It only
  // recovers literal (…) Tj/TJ strings, so it helps plain-text PDFs and
  // stays silent (not garbled) on CID/hex-encoded ones.
  const fallback = await parsePdfViaStreamScan(bytes)
  return hasRealText(fallback) ? fallback : ''
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

export async function parseFiles(files: File[]): Promise<ParsedSource> {
  const chunks: string[] = []
  const notes: string[] = []
  for (const file of files) {
    const e = ext(file.name)
    try {
      let text = ''
      if (e === 'pdf' || file.type === 'application/pdf') {
        text = await parsePdf(file)
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
          ? `${file.name}: no extractable text found \u2014 this PDF may be scanned images, or your browser may be too old to read it. Try pasting the text directly below.`
          : `${file.name}: no readable text found.`)
      } else {
        chunks.push(`--- ${file.name} ---\n${clean}`)
      }
    } catch (err: any) {
      notes.push(`${file.name}: could not be parsed (${err?.message || 'unknown error'}) \u2014 try pasting the text directly below.`)
    }
  }
  return { text: chunks.join('\n\n').slice(0, MAX_CHARS), notes }
}

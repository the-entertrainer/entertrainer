import { unzip, zipText } from './zip'

export interface SlideNote {
  id: string
  title: string
  source: string
  notes: string
  seconds: number
}

const WPM = 150

export function secondsFor(notes: string): number {
  const words = notes.trim().split(/\s+/).filter(Boolean).length
  if (!words) return 0
  return Math.max(8, Math.round((words / WPM) * 60))
}

export function formatSeat(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  if (minutes <= 0) return `${rest} sec`
  return `${minutes} min ${rest} sec`
}

export function seatSeconds(slides: SlideNote[]): number {
  return slides.reduce((sum, slide) => sum + slide.seconds, 0)
}

function sentence(line: string): string {
  const trimmed = line.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

export function speakNotes(title: string, body: string): string {
  const lines = body
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.replace(/^[-*]\s+/, '').replace(/^\d+[.)]\s+/, ''))
  const spoken = lines.map(sentence).filter(Boolean)
  const open = title.trim() ? `Start with: ${title.trim()}.` : ''
  return [open, ...spoken].filter(Boolean).join('\n')
}

function pushSlide(slides: { title: string; body: string }[], title: string, body: string[]) {
  const name = title.trim() || `Slide ${slides.length + 1}`
  slides.push({ title: name, body: body.join('\n').trim() })
}

export function parseOutline(raw: string): { title: string; body: string }[] {
  const text = raw.replace(/\r\n/g, '\n').trim()
  if (!text) return []
  const lines = text.split('\n')
  const heading = /^(#{1,6})\s+(.+)$/
  if (lines.some(line => heading.test(line.trim()))) {
    const slides: { title: string; body: string }[] = []
    let title = ''
    let body: string[] = []
    let started = false
    for (const line of lines) {
      const match = heading.exec(line.trim())
      if (match) {
        if (started) pushSlide(slides, title, body)
        title = match[2].trim()
        body = []
        started = true
      } else if (!started) {
        if (line.trim()) {
          title = line.trim()
          started = true
        }
      } else {
        body.push(line)
      }
    }
    if (started) pushSlide(slides, title, body)
    return slides
  }

  const blocks = text.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean)
  if (blocks.length > 1) {
    return blocks.map(block => {
      const [first, ...rest] = block.split('\n')
      return { title: first.replace(/^\d+[.)]\s+/, '').trim(), body: rest.join('\n').trim() }
    })
  }

  const numbered = lines.filter(line => /^\d+[.)]\s+/.test(line.trim()))
  if (numbered.length >= 2) {
    const slides: { title: string; body: string }[] = []
    let title = ''
    let body: string[] = []
    let started = false
    for (const line of lines) {
      const match = /^(\d+[.)]\s+)(.*)$/.exec(line.trim())
      if (match) {
        if (started) pushSlide(slides, title, body)
        title = match[2].trim()
        body = []
        started = true
      } else if (started) body.push(line)
    }
    if (started) pushSlide(slides, title, body)
    return slides
  }

  const [first, ...rest] = lines
  return [{ title: first.trim() || 'Slide 1', body: rest.join('\n').trim() }]
}

function decodeXml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function xmlTexts(xml: string): string[] {
  const out: string[] = []
  const re = /<a:t[^>]*>([^<]*)<\/a:t>/g
  let match: RegExpExecArray | null
  while ((match = re.exec(xml))) {
    const text = decodeXml(match[1]).trim()
    if (text) out.push(text)
  }
  return out
}

function resolveRel(sourcePart: string, target: string): string {
  const dir = sourcePart.split('/').slice(0, -1)
  const parts = dir.concat(target.split('/'))
  const out: string[] = []
  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return out.join('/')
}

function slideOrder(files: Map<string, Uint8Array>): string[] {
  const presentation = zipText(files, 'ppt/presentation.xml')
  const rels = zipText(files, 'ppt/_rels/presentation.xml.rels')
  const ids: string[] = []
  const idRe = /<p:sldId\b[^>]*r:id="([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = idRe.exec(presentation))) ids.push(match[1])
  const targets = new Map<string, string>()
  const relRe = /<Relationship\b([^>]*)\/?>/g
  while ((match = relRe.exec(rels))) {
    const attrs = match[1]
    const id = /Id="([^"]+)"/.exec(attrs)?.[1]
    const target = /Target="([^"]+)"/.exec(attrs)?.[1]
    const type = /Type="([^"]+)"/.exec(attrs)?.[1] ?? ''
    if (id && target && /\/slide$/.test(type)) targets.set(id, target)
  }
  const ordered = ids
    .map(id => targets.get(id))
    .filter((target): target is string => Boolean(target))
    .map(target => resolveRel('ppt/presentation.xml', target))
  if (ordered.length) return ordered
  return [...files.keys()]
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = Number(/slide(\d+)/.exec(a)?.[1] ?? 0)
      const nb = Number(/slide(\d+)/.exec(b)?.[1] ?? 0)
      return na - nb
    })
}

function notesFor(files: Map<string, Uint8Array>, slidePath: string): string {
  const relPath = slidePath.replace(/^(.*\/)([^/]+)$/, '$1_rels/$2.rels')
  const rels = zipText(files, relPath)
  const target = /Target="([^"]*notesSlide[^"]+)"/.exec(rels)?.[1]
  if (!target) return ''
  const path = resolveRel(slidePath, target)
  return xmlTexts(zipText(files, path)).join('\n')
}

export async function slidesFromPptx(buffer: ArrayBuffer): Promise<{ title: string; body: string; notes: string }[]> {
  const files = await unzip(buffer)
  const paths = slideOrder(files)
  if (!paths.length) throw new Error('No slides were found in that file.')
  return paths.map(path => {
    const texts = xmlTexts(zipText(files, path))
    const title = texts[0] || 'Untitled slide'
    const body = texts.slice(1).join('\n')
    return { title, body, notes: notesFor(files, path) }
  })
}

export function toSlideNotes(slides: { title: string; body: string; notes?: string }[]): SlideNote[] {
  return slides.map((slide, index) => {
    const notes = (slide.notes || '').trim() || speakNotes(slide.title, slide.body)
    return {
      id: `slide-${index + 1}`,
      title: slide.title || `Slide ${index + 1}`,
      source: slide.body,
      notes,
      seconds: secondsFor(notes),
    }
  })
}

export function notesToTxt(slides: SlideNote[]): string {
  const total = formatSeat(seatSeconds(slides))
  const body = slides.map((slide, index) => {
    return [`Slide ${index + 1}: ${slide.title}`, `Time: ${formatSeat(slide.seconds)}`, slide.notes.trim(), ''].join('\n')
  }).join('\n')
  return `Talk Track\nTotal seat time: ${total} at ${WPM} words a minute.\n\n${body}`.trim() + '\n'
}

export async function notesToDocx(slides: SlideNote[]): Promise<Blob> {
  const docx = await import('docx')
  const children = [
    new docx.Paragraph({ text: 'Talk Track', heading: docx.HeadingLevel.TITLE }),
    new docx.Paragraph({
      children: [new docx.TextRun(`Total seat time: ${formatSeat(seatSeconds(slides))} at ${WPM} words a minute.`)],
    }),
  ]
  slides.forEach((slide, index) => {
    children.push(new docx.Paragraph({
      text: `Slide ${index + 1}: ${slide.title}`,
      heading: docx.HeadingLevel.HEADING_1,
    }))
    children.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: formatSeat(slide.seconds), italics: true })],
    }))
    for (const line of slide.notes.split('\n')) {
      children.push(new docx.Paragraph({ children: [new docx.TextRun(line)] }))
    }
  })
  const doc = new docx.Document({ sections: [{ children }] })
  return docx.Packer.toBlob(doc)
}

export function withSeconds(slides: SlideNote[]): SlideNote[] {
  return slides.map(slide => ({ ...slide, seconds: secondsFor(slide.notes) }))
}

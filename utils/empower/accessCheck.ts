import { loadPdfjs } from './pdfjs'
import { unzip, zipText } from './zip'

export type Severity = 'serious' | 'moderate' | 'minor'

export interface AccessIssue {
  severity: Severity
  where: string
  message: string
  hint: string
}

export interface AccessReport {
  name: string
  kind: 'pdf' | 'docx'
  issues: AccessIssue[]
  disclaimer: string
}

export const ACCESS_DISCLAIMER = 'Heuristic client checks — not a full WCAG audit certificate.'

const ORDER: Severity[] = ['serious', 'moderate', 'minor']

function sortIssues(issues: AccessIssue[]): AccessIssue[] {
  return [...issues].sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity))
}

function contrast(hex: string): number | null {
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null
  const n = Number.parseInt(hex, 16)
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(channel => {
    const s = channel / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  const lum = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  const lighter = Math.max(1, lum)
  const darker = Math.min(1, lum)
  return (lighter + 0.05) / (darker + 0.05)
}

function walkStruct(node: any, issues: AccessIssue[], page: number) {
  if (!node || typeof node !== 'object') return
  const role = String(node.role || '')
  if (/figure|image/i.test(role)) {
    const alt = String(node.alt || node.title || '').trim()
    if (!alt) {
      issues.push({
        severity: 'serious',
        where: `Page ${page}`,
        message: 'A figure has no text alternative.',
        hint: 'Add alt text that says what the figure is for, or mark it decorative.',
      })
    }
  }
  const children = Array.isArray(node.children) ? node.children : []
  for (const child of children) walkStruct(child, issues, page)
}

export async function checkPdf(name: string, bytes: ArrayBuffer): Promise<AccessReport> {
  const issues: AccessIssue[] = []
  const pdfjs = await loadPdfjs()
  const task = pdfjs.getDocument({ data: bytes.slice(0) })
  try {
    const doc = await task.promise
    const meta = await doc.getMetadata().catch(() => ({ info: {}, metadata: null }))
    const info = (meta?.info ?? {}) as Record<string, unknown>
    const title = String(info.Title || '').trim()
    if (!title) {
      issues.push({
        severity: 'serious',
        where: 'Document',
        message: 'The PDF has no title.',
        hint: 'Set the document title. A screen reader often reads it first.',
      })
    }
    const language = String(info.Language || info.Lang || '').trim()
    if (!language) {
      issues.push({
        severity: 'serious',
        where: 'Document',
        message: 'The PDF has no language set.',
        hint: 'Set the document language so pronunciation and translation have a starting point.',
      })
    }
    let untagged = 0
    let checked = 0
    const pageLimit = Math.min(doc.numPages, 20)
    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber++) {
      const page = await doc.getPage(pageNumber)
      const textContent = await page.getTextContent().catch(() => ({ items: [] }))
      const text = (textContent.items || []).map((item: { str?: string }) => item.str || '').join(' ').trim()
      if (text.length < 15) {
        issues.push({
          severity: 'moderate',
          where: `Page ${pageNumber}`,
          message: 'This page has almost no text. It may be a scan.',
          hint: 'A screen reader cannot read a picture of text. Add a text layer or a transcript.',
        })
      }
      if (typeof page.getStructTree === 'function') {
        checked++
        const tree = await page.getStructTree().catch(() => null)
        if (!tree) untagged++
        else walkStruct(tree, issues, pageNumber)
      }
    }
    if (checked > 0 && untagged === checked) {
      issues.push({
        severity: 'serious',
        where: 'Document',
        message: 'The PDF is not tagged, so reading order may be unclear.',
        hint: 'Export a tagged PDF from the source editor before the formal audit.',
      })
    }
    if (doc.numPages > 2 && typeof doc.getOutline === 'function') {
      const outline = await doc.getOutline().catch(() => null)
      if (!outline || !outline.length) {
        issues.push({
          severity: 'moderate',
          where: 'Document',
          message: 'There are no bookmarks.',
          hint: 'Bookmarks help people jump to headings in a long PDF.',
        })
      }
    }
    if (doc.numPages > pageLimit) {
      issues.push({
        severity: 'minor',
        where: 'Document',
        message: `Only the first ${pageLimit} of ${doc.numPages} pages were checked.`,
        hint: 'Run the rest in a full audit if this file is long.',
      })
    }
  } finally {
    await task.destroy?.().catch(() => {})
  }
  return { name, kind: 'pdf', issues: sortIssues(issues), disclaimer: ACCESS_DISCLAIMER }
}

export async function checkDocx(name: string, buffer: ArrayBuffer): Promise<AccessReport> {
  const issues: AccessIssue[] = []
  const files = await unzip(buffer)
  const document = zipText(files, 'word/document.xml')
  if (!document) throw new Error('That file does not look like a .docx.')
  const core = zipText(files, 'docProps/core.xml')
  const title = /<dc:title[^>]*>([^<]*)<\/dc:title>/.exec(core)?.[1]?.trim() ?? ''
  if (!title) {
    issues.push({
      severity: 'moderate',
      where: 'Document',
      message: 'The Word file has no title.',
      hint: 'Set the title in document properties.',
    })
  }
  if (!/<(?:\w+:)?lang\b/.test(document)) {
    issues.push({
      severity: 'moderate',
      where: 'Document',
      message: 'No language is set on the document text.',
      hint: 'Set the proofing language so a screen reader knows how to pronounce the words.',
    })
  }

  const headings: number[] = []
  const styleRe = /<(?:\w+:)?pStyle\b[^>]*(?:\w+:)?val="Heading\s*(\d)"/gi
  let styleMatch: RegExpExecArray | null
  while ((styleMatch = styleRe.exec(document))) headings.push(Number(styleMatch[1]))
  if (!headings.length && document.length > 800) {
    issues.push({
      severity: 'moderate',
      where: 'Document',
      message: 'No heading styles were found.',
      hint: 'Use Heading 1 and Heading 2 instead of bold lines, so the outline exists.',
    })
  }
  if (headings.length && headings[0] > 1) {
    issues.push({
      severity: 'moderate',
      where: 'Document',
      message: `The first heading is Heading ${headings[0]}, so Heading 1 is missing.`,
      hint: 'Start the outline at Heading 1.',
    })
  }
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      issues.push({
        severity: 'moderate',
        where: 'Document',
        message: `Heading level jumps from Heading ${headings[i - 1]} to Heading ${headings[i]}.`,
        hint: 'Move one level at a time.',
      })
      break
    }
  }

  const drawings = document.match(/<(?:\w+:)?docPr\b[^>]*\/?>/g) || []
  let missingAlt = 0
  for (const tag of drawings) {
    const descr = /(?:\w+:)?descr="([^"]*)"/.exec(tag)?.[1] ?? ''
    if (!descr.trim()) missingAlt++
  }
  const blips = document.match(/<(?:\w+:)?blip\b/g) || []
  if (!drawings.length && blips.length) missingAlt += blips.length
  if (missingAlt) {
    issues.push({
      severity: 'serious',
      where: 'Document',
      message: missingAlt === 1 ? 'An image has no text alternative.' : `${missingAlt} images have no text alternative.`,
      hint: 'Add a description, or mark the image as decorative.',
    })
  }

  const seen = new Set<string>()
  const colorRe = /<(?:\w+:)?color\b[^>]*(?:\w+:)?val="([0-9A-Fa-f]{6})"/g
  let colorMatch: RegExpExecArray | null
  while ((colorMatch = colorRe.exec(document))) {
    const hex = colorMatch[1].toUpperCase()
    if (seen.has(hex) || hex === '000000' || hex === 'AUTO') continue
    seen.add(hex)
    const ratio = contrast(hex)
    if (ratio != null && ratio < 4.5) {
      issues.push({
        severity: 'moderate',
        where: 'Document',
        message: `A run uses colour #${hex}, about ${ratio.toFixed(1)}:1 against white.`,
        hint: 'Body text needs at least 4.5:1. This is a hint, not a measured render of the page.',
      })
    }
    if (seen.size >= 4) break
  }

  try {
    const mammoth = await import('mammoth')
    const html = await mammoth.convertToHtml({ arrayBuffer: buffer })
    const value = String(html.value || '')
    const imageTag = '<' + 'img'
    if (value.toLowerCase().includes(imageTag) && missingAlt === 0) {
      const tags = value.split(imageTag).slice(1)
      const bare = tags.filter(chunk => !/\balt="[^"]+"/.test(chunk.slice(0, 240)))
      if (bare.length) {
        issues.push({
          severity: 'serious',
          where: 'Document',
          message: bare.length === 1 ? 'An image has no text alternative.' : `${bare.length} images have no text alternative.`,
          hint: 'Add a description, or mark the image as decorative.',
        })
      }
    }
  } catch {
    issues.push({
      severity: 'minor',
      where: 'Document',
      message: 'The Word file could not be fully converted for the image pass.',
      hint: 'The XML checks above still ran.',
    })
  }

  return { name, kind: 'docx', issues: sortIssues(issues), disclaimer: ACCESS_DISCLAIMER }
}

export function reportToText(report: AccessReport): string {
  const lines = [
    'Access Check',
    report.disclaimer,
    `File: ${report.name}`,
    '',
  ]
  if (!report.issues.length) {
    lines.push('No issues in this pass. This is still not a certificate.')
  } else {
    for (const issue of report.issues) {
      lines.push(`${issue.severity.toUpperCase()} — ${issue.where}: ${issue.message}`)
      lines.push(`Hint: ${issue.hint}`, '')
    }
  }
  return lines.join('\n').trim() + '\n'
}

export function reportToJson(report: AccessReport): string {
  return JSON.stringify(report, null, 2)
}

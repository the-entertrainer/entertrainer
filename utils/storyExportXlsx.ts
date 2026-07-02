import { saveAs } from 'file-saver'
import type { Connection, StoryCard } from '~/types/story'
import type { IdModel } from './idModels'
import { buildMcqRows, buildSections, hexShade, hexTint } from './storyExportShared'

const HEADER_FILL = 'FF2B2B2B'
const BORDER_COLOR = 'FFD8D8D8'

const COLUMNS = [
  { key: 'num', label: '#', width: 5 },
  { key: 'title', label: 'Screen', width: 24 },
  { key: 'type', label: 'Type', width: 17 },
  { key: 'content', label: 'On-Screen Content', width: 46 },
  { key: 'visual', label: 'Visual / Media', width: 32 },
  { key: 'narration', label: 'Narration / Audio', width: 40 },
  { key: 'notes', label: 'Notes', width: 26 },
  { key: 'time', label: 'Time', width: 8 }
] as const

export interface XlsxExportInput {
  title: string
  cards: StoryCard[]
  connections: Connection[]
  model: IdModel
}

export async function exportStoryXlsx(input: XlsxExportInput, filename: string) {
  // exceljs is heavy (~1 MB) — load it only when someone actually exports.
  const ExcelJS = (await import('exceljs')).default

  const wb = new ExcelJS.Workbook()
  wb.created = new Date()

  const thin = { style: 'thin' as const, color: { argb: BORDER_COLOR } }
  const allBorders = { top: thin, bottom: thin, left: thin, right: thin }

  // ── Storyboard sheet ─────────────────────────────────────────
  const ws = wb.addWorksheet('Storyboard', { views: [{ state: 'frozen', ySplit: 4 }] })
  ws.columns = COLUMNS.map(c => ({ width: c.width }))

  const titleRow = ws.addRow([input.title || 'Untitled Storyboard'])
  titleRow.font = { bold: true, size: 20, color: { argb: 'FF1A1A1A' } }
  titleRow.height = 30
  ws.mergeCells(1, 1, 1, COLUMNS.length)

  const modelLine = input.model.stages.length ? `${input.model.label} storyboard` : 'Storyboard'
  const metaRow = ws.addRow([`${modelLine} · ${new Date().toLocaleDateString()}`])
  metaRow.font = { size: 10, color: { argb: 'FF8A8A8A' } }
  ws.mergeCells(2, 1, 2, COLUMNS.length)
  ws.addRow([])

  const headerRow = ws.addRow(COLUMNS.map(c => c.label))
  headerRow.height = 22
  headerRow.eachCell(cell => {
    cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } }
    cell.alignment = { vertical: 'middle' }
    cell.border = allBorders
  })

  const sections = buildSections(input.cards, input.connections, input.model)
  for (const section of sections) {
    if (section.label) {
      const row = ws.addRow([section.label + (section.prompt ? `   —   ${section.prompt}` : '')])
      ws.mergeCells(row.number, 1, row.number, COLUMNS.length)
      row.height = 22
      const cell = row.getCell(1)
      cell.font = { bold: true, size: 11, color: { argb: `FF${hexShade(section.color)}` } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${hexTint(section.color)}` } }
      cell.alignment = { vertical: 'middle' }
      cell.border = allBorders
      if (!section.rows.length) {
        const empty = ws.addRow(['No screens yet for this stage.'])
        ws.mergeCells(empty.number, 1, empty.number, COLUMNS.length)
        empty.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF999999' } }
        empty.getCell(1).border = allBorders
      }
    }
    for (const r of section.rows) {
      const row = ws.addRow(COLUMNS.map(c => r[c.key]))
      row.eachCell(cell => {
        cell.font = { size: 10, color: { argb: 'FF2B2B2B' } }
        cell.alignment = { vertical: 'top', wrapText: true }
        cell.border = allBorders
      })
    }
  }

  // ── MCQ sheet ────────────────────────────────────────────────
  const mcqCols = [
    { label: '#', width: 5 },
    { label: 'Screen', width: 30 },
    { label: 'Question', width: 46 },
    { label: 'Options (✓ correct)', width: 44 },
    { label: 'Feedback', width: 40 }
  ]
  const wq = wb.addWorksheet('MCQ', { views: [{ state: 'frozen', ySplit: 2 }] })
  wq.columns = mcqCols.map(c => ({ width: c.width }))

  const qTitle = wq.addRow(['Knowledge Checks'])
  qTitle.font = { bold: true, size: 16, color: { argb: 'FF1A1A1A' } }
  qTitle.height = 26
  wq.mergeCells(1, 1, 1, mcqCols.length)

  const qHeader = wq.addRow(mcqCols.map(c => c.label))
  qHeader.height = 22
  qHeader.eachCell(cell => {
    cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } }
    cell.alignment = { vertical: 'middle' }
    cell.border = allBorders
  })

  const mcqRows = buildMcqRows(input.cards, input.connections)
  if (mcqRows.length) {
    for (const r of mcqRows) {
      const optionText = r.options
        .map((o, i) => `${String.fromCharCode(65 + i)}. ${o.text.trim() || '—'}${o.correct ? '  ✓' : ''}`)
        .join('\n')
      const row = wq.addRow([r.num, r.screen, r.question, optionText, r.feedback])
      row.eachCell(cell => {
        cell.font = { size: 10, color: { argb: 'FF2B2B2B' } }
        cell.alignment = { vertical: 'top', wrapText: true }
        cell.border = allBorders
      })
    }
  } else {
    const row = wq.addRow(['', '', 'No MCQ screens in this storyboard.', '', ''])
    row.eachCell(cell => { cell.border = allBorders })
    row.getCell(3).font = { italic: true, size: 10, color: { argb: 'FF999999' } }
  }

  const buffer = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename)
}

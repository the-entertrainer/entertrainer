import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType
} from 'docx'
import { saveAs } from 'file-saver'
import type { Connection, StoryCard } from '~/types/story'
import type { IdModel } from './idModels'
import { buildMcqRows, buildPlanRows, buildSections, hexShade, hexTint } from './storyExportShared'

const HEADER_FILL = '2B2B2B'
const COLUMNS = [
  { key: 'num', label: '#', width: 4 },
  { key: 'title', label: 'Screen', width: 14 },
  { key: 'type', label: 'Type', width: 10 },
  { key: 'content', label: 'On-Screen Content', width: 24 },
  { key: 'visual', label: 'Visual / Media', width: 15 },
  { key: 'narration', label: 'Narration / Audio', width: 19 },
  { key: 'notes', label: 'Notes', width: 9 },
  { key: 'time', label: 'Time', width: 5 }
] as const

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: 'D8D8D8' }
const CELL_BORDERS = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }

function textCell(text: string, opts: { header?: boolean; width?: number } = {}) {
  const lines = (text ?? '').split('\n').map(l => l.trim()).filter(Boolean)
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.TOP,
    shading: opts.header ? { type: ShadingType.CLEAR, fill: HEADER_FILL } : undefined,
    borders: CELL_BORDERS,
    margins: { top: 110, bottom: 110, left: 120, right: 120 },
    children: (lines.length ? lines : ['—']).map((line, i) => new Paragraph({
      spacing: i < lines.length - 1 ? { after: 40 } : undefined,
      children: [
        new TextRun({
          text: line,
          bold: !!opts.header,
          color: opts.header ? 'FFFFFF' : '2B2B2B',
          size: opts.header ? 19 : 18
        })
      ]
    }))
  })
}

// A full-width stage band, template-style: stage name bold in the stage's
// darkened accent, guiding question italic beneath, soft tinted fill.
function sectionRow(label: string, prompt: string | null, color: string | null, span: number) {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: span,
        shading: { type: ShadingType.CLEAR, fill: hexTint(color) },
        borders: CELL_BORDERS,
        margins: { top: 130, bottom: 130, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: label, bold: true, size: 21, color: hexShade(color) }),
              ...(prompt ? [new TextRun({ text: `   ${prompt}`, italics: true, size: 17, color: hexShade(color, 0.25) })] : [])
            ]
          })
        ]
      })
    ]
  })
}

function emptySectionRow(span: number) {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: span,
        borders: CELL_BORDERS,
        margins: { top: 90, bottom: 90, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: 'No screens yet for this stage.', italics: true, size: 17, color: '999999' })] })]
      })
    ]
  })
}

function headerRow() {
  return new TableRow({
    tableHeader: true,
    children: COLUMNS.map(c => textCell(c.label, { header: true, width: c.width }))
  })
}

export interface DocxExportInput {
  title: string
  cards: StoryCard[]
  connections: Connection[]
  model: IdModel
  plan?: Record<string, string>
}

export async function exportStoryDocx(input: DocxExportInput, filename: string) {
  const sections = buildSections(input.cards, input.connections, input.model)
  const mcqRows = buildMcqRows(input.cards, input.connections)
  const planRows = buildPlanRows(input.model, input.plan)

  const planTable = planRows.length
    ? new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              textCell(input.model.columnLabel, { header: true, width: 16 }),
              textCell('Guiding question', { header: true, width: 38 }),
              textCell('Plan', { header: true, width: 46 })
            ]
          }),
          ...planRows.map(row => new TableRow({
            children: [
              new TableCell({
                width: { size: 16, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                shading: { type: ShadingType.CLEAR, fill: hexTint(row.color) },
                borders: CELL_BORDERS,
                margins: { top: 110, bottom: 110, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: row.label, bold: true, size: 19, color: hexShade(row.color) })] })]
              }),
              textCell(row.prompt, { width: 38 }),
              textCell(row.notes, { width: 46 })
            ]
          }))
        ]
      })
    : null

  const storyboardRows: TableRow[] = [headerRow()]
  for (const section of sections) {
    if (section.label) {
      storyboardRows.push(sectionRow(section.label, section.prompt, section.color, COLUMNS.length))
      if (!section.rows.length) storyboardRows.push(emptySectionRow(COLUMNS.length))
    }
    for (const row of section.rows) {
      storyboardRows.push(new TableRow({
        children: COLUMNS.map(c => textCell(row[c.key], { width: c.width }))
      }))
    }
  }

  const storyboardTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: storyboardRows
  })

  const mcqTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          textCell('#', { header: true, width: 5 }),
          textCell('Screen', { header: true, width: 16 }),
          textCell('Question', { header: true, width: 27 }),
          textCell('Options (✓ correct)', { header: true, width: 30 }),
          textCell('Feedback', { header: true, width: 22 })
        ]
      }),
      ...(mcqRows.length
        ? mcqRows.map(row => new TableRow({
            children: [
              textCell(row.num),
              textCell(row.screen),
              textCell(row.question),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: CELL_BORDERS,
                margins: { top: 110, bottom: 110, left: 120, right: 120 },
                children: row.options.map((o, i) => new Paragraph({
                  spacing: { after: 40 },
                  children: [new TextRun({
                    text: `${String.fromCharCode(65 + i)}. ${o.text.trim() || '—'}${o.correct ? '  ✓' : ''}${o.goto ? `  → ${o.goto}` : ''}`,
                    bold: o.correct,
                    size: 18,
                    color: '2B2B2B'
                  })]
                }))
              }),
              textCell(row.feedback)
            ]
          }))
        : [new TableRow({ children: [
            textCell(''), textCell(''), textCell('No MCQ screens in this storyboard.'), textCell(''), textCell('')
          ] })])
    ]
  })

  const modelLine = input.model.stages.length ? `${input.model.label} storyboard` : 'Storyboard'

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri' } } }
    },
    sections: [{
      properties: {
        page: { size: { orientation: PageOrientation.LANDSCAPE, width: 16838, height: 11906 }, margin: { top: 720, bottom: 720, left: 720, right: 720 } }
      },
      children: [
        new Paragraph({ children: [new TextRun({ text: input.title || 'Untitled Storyboard', bold: true, size: 52, color: '1A1A1A' })], spacing: { after: 60 } }),
        new Paragraph({ children: [new TextRun({ text: `${modelLine} · ${new Date().toLocaleDateString()}`, size: 20, color: '8A8A8A' })], spacing: { after: 240 } }),
        ...(planTable
          ? [
              new Paragraph({ text: `${input.model.label} Design Plan`, heading: HeadingLevel.HEADING_1, spacing: { before: 120, after: 140 } }),
              planTable
            ]
          : []),
        new Paragraph({ text: 'Storyboard', heading: HeadingLevel.HEADING_1, spacing: { before: planTable ? 380 : 120, after: 140 } }),
        storyboardTable,
        new Paragraph({ text: 'MCQ', heading: HeadingLevel.HEADING_1, spacing: { before: 380, after: 140 } }),
        mcqTable
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}

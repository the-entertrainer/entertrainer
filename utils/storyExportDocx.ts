import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
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
import { CARD_KINDS } from './storyCards'
import { orderCards } from './storyGraph'

const HEADER_FILL = '243F6A'

function textCell(text: string, opts: { header?: boolean; width?: number } = {}) {
  const lines = (text ?? '').split('\n').map(l => l.trim()).filter(Boolean)
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.TOP,
    shading: opts.header ? { type: ShadingType.CLEAR, fill: HEADER_FILL } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: (lines.length ? lines : ['—']).map((line, i) => new Paragraph({
      spacing: i < lines.length - 1 ? { after: 40 } : undefined,
      children: [
        new TextRun({
          text: line,
          bold: !!opts.header,
          color: opts.header ? 'FFFFFF' : undefined,
          size: opts.header ? 19 : 18
        })
      ]
    }))
  })
}

function optionsCell(card: StoryCard) {
  const options = card.options || []
  const any = options.some(o => o.trim())
  return new TableCell({
    width: { size: 30, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: any
      ? options.map((text, i) => new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `${String.fromCharCode(65 + i)}. ${text.trim() || '—'}${i === card.correctIndex ? '  ✓' : ''}`,
              bold: i === card.correctIndex,
              size: 18
            })
          ]
        }))
      : [new Paragraph({ children: [new TextRun({ text: '—', size: 18 })] })]
  })
}

function headerRow(labels: { text: string; width: number }[]) {
  return new TableRow({
    tableHeader: true,
    children: labels.map(l => textCell(l.text, { header: true, width: l.width }))
  })
}

function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) {
  return new Paragraph({ text, heading: level, spacing: { before: 320, after: 160 } })
}

// The card's main storyboard content, flattened for the on-screen column.
function onScreenContent(card: StoryCard): string {
  if (card.kind === 'mcq') {
    const opts = (card.options || []).map((o, i) => `${String.fromCharCode(65 + i)}. ${o.trim() || '—'}`).join('\n')
    return [card.question, opts].filter(Boolean).join('\n')
  }
  return card.body
}

export interface DocxExportInput {
  title: string
  cards: StoryCard[]
  connections: Connection[]
}

export async function exportStoryDocx(input: DocxExportInput, filename: string) {
  const ordered = orderCards(input.cards, input.connections)

  const storyboardTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: '#', width: 4 },
        { text: 'Screen', width: 14 },
        { text: 'Type', width: 10 },
        { text: 'On-Screen Content', width: 24 },
        { text: 'Visual / Media', width: 16 },
        { text: 'Narration / Audio', width: 18 },
        { text: 'Developer Notes', width: 9 },
        { text: 'Time', width: 5 }
      ]),
      ...ordered.map((card, i) => new TableRow({
        children: [
          textCell(String(i + 1).padStart(2, '0')),
          textCell(card.title),
          textCell(CARD_KINDS[card.kind]?.label ?? card.kind),
          textCell(onScreenContent(card)),
          textCell(card.visual),
          textCell(card.narration),
          textCell(card.notes),
          textCell(`${card.duration || 0}s`)
        ]
      }))
    ]
  })

  const mcqCards = ordered.filter(c => c.kind === 'mcq')
  const numberOf = new Map(ordered.map((c, i) => [c.id, i + 1]))

  const mcqTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: '#', width: 5 },
        { text: 'Screen', width: 16 },
        { text: 'Question', width: 27 },
        { text: 'Options (✓ correct)', width: 30 },
        { text: 'Feedback', width: 22 }
      ]),
      ...(mcqCards.length
        ? mcqCards.map((card, i) => new TableRow({
            children: [
              textCell(String(i + 1).padStart(2, '0')),
              textCell(`Screen ${String(numberOf.get(card.id)).padStart(2, '0')}: ${card.title || 'Knowledge Check'}`),
              textCell(card.question),
              optionsCell(card),
              textCell(card.feedback)
            ]
          }))
        : [new TableRow({ children: [
            textCell(''), textCell(''), textCell('No MCQ screens in this storyboard.'), textCell(''), textCell('')
          ] })])
    ]
  })

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: input.title || 'Untitled Storyboard', heading: HeadingLevel.TITLE }),
        heading('Storyboard', HeadingLevel.HEADING_1),
        storyboardTable,
        heading('MCQ', HeadingLevel.HEADING_1),
        mcqTable,
        new Paragraph({
          spacing: { before: 260 },
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: `Exported from StoryGen · ${new Date().toLocaleDateString()}`, size: 15, color: '888888' })]
        })
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}

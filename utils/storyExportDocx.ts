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
import type { Connection, Mcq, Scene } from '~/types/story'
import { orderScenes, sceneNumbers } from './storyGraph'

const HEADER_FILL = '243F6A'

function textCell(text: string, opts: { header?: boolean; width?: number } = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.TOP,
    shading: opts.header ? { type: ShadingType.CLEAR, fill: HEADER_FILL } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text?.trim() || '—',
            bold: !!opts.header,
            color: opts.header ? 'FFFFFF' : undefined,
            size: opts.header ? 19 : 18
          })
        ]
      })
    ]
  })
}

function optionsCell(mcq: Mcq) {
  return new TableCell({
    width: { size: 32, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: mcq.options.length
      ? mcq.options.map(o => new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${o.correct ? '✓ ' : '– '}${o.text || '—'}`, bold: o.correct, size: 18 })
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

export interface DocxExportInput {
  title: string
  summary: string
  learningObjectives: string[]
  scenes: Scene[]
  connections: Connection[]
  mcqs: Mcq[]
}

export async function exportStoryDocx(input: DocxExportInput, filename: string) {
  const ordered = orderScenes(input.scenes, input.connections)
  const numbers = sceneNumbers(input.scenes, input.connections)

  const storyboardTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: '#', width: 5 },
        { text: 'Scene Title', width: 15 },
        { text: 'Visual / On-Screen Text', width: 23 },
        { text: 'Narration / Audio Script', width: 22 },
        { text: 'Interaction & Feedback', width: 15 },
        { text: 'Navigation', width: 12 },
        { text: 'Duration', width: 8 }
      ]),
      ...ordered.map((scene, i) => new TableRow({
        children: [
          textCell(String(i + 1).padStart(2, '0')),
          textCell(scene.title),
          textCell(scene.visualDescription),
          textCell(scene.narration),
          textCell(scene.interactions),
          textCell(scene.navigation),
          textCell(`${scene.duration || 0}s`)
        ]
      }))
    ]
  })

  const mcqTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow([
        { text: '#', width: 5 },
        { text: 'Linked Scene', width: 16 },
        { text: 'Question', width: 25 },
        { text: 'Answer Options (✓ correct)', width: 32 },
        { text: 'Explanation', width: 22 }
      ]),
      ...(input.mcqs.length
        ? input.mcqs.map((mcq, i) => {
            const num = mcq.sceneId ? numbers.get(mcq.sceneId) : null
            const scene = mcq.sceneId ? input.scenes.find(s => s.id === mcq.sceneId) : null
            const linked = num && scene ? `Scene ${String(num).padStart(2, '0')}: ${scene.title}` : 'General'
            return new TableRow({
              children: [
                textCell(String(i + 1).padStart(2, '0')),
                textCell(linked),
                textCell(mcq.question),
                optionsCell(mcq),
                textCell(mcq.explanation)
              ]
            })
          })
        : [new TableRow({ children: [
            textCell(''), textCell(''), textCell('No knowledge checks yet.'), textCell(''), textCell('')
          ] })])
    ]
  })

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: input.title || 'Untitled Storyboard', heading: HeadingLevel.TITLE }),
        ...(input.summary ? [new Paragraph({ text: input.summary, spacing: { before: 120, after: 120 } })] : []),
        ...(input.learningObjectives.length
          ? [
              new Paragraph({ text: 'Learning Objectives', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
              ...input.learningObjectives.map(o => new Paragraph({ text: o, bullet: { level: 0 } }))
            ]
          : []),
        heading('Storyboard', HeadingLevel.HEADING_1),
        storyboardTable,
        heading('MCQ', HeadingLevel.HEADING_1),
        mcqTable,
        new Paragraph({
          spacing: { before: 260 },
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: `Exported from StoryForge · ${new Date().toLocaleDateString()}`, size: 15, color: '888888' })]
        })
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}

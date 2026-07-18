import type { LuminaAuditIssue, LuminaBlock, LuminaCourse } from '~/types/lumina'
import { blockPreview, LUMINA_KINDS } from '~/utils/luminaBlocks'

// The export gatekeeper. Every export runs through this first: errors are
// things that would ship a broken or inaccessible course (they block the
// export until fixed), warnings are things a designer might do on purpose
// but should look at once. Each issue carries the lesson/block it points
// at so the editor can jump straight to it.

export function parseVideoEmbed(url: string): { kind: 'youtube' | 'vimeo' | 'file'; src: string } | null {
  const u = url.trim()
  if (!u) return null
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i)
  if (yt) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` }
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d{6,})/i)
  if (vm) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vm[1]}` }
  if (/^https?:\/\/\S+\.(mp4|webm|m4v)(\?\S*)?$/i.test(u)) return { kind: 'file', src: u }
  return null
}

function auditBlock(block: LuminaBlock, push: (level: 'error' | 'warning', message: string, fix: string) => void) {
  const name = LUMINA_KINDS[block.kind].label
  const empty = (s: string) => !s.trim()

  switch (block.kind) {
    case 'hero':
      if (empty(block.title)) push('error', `${name} has no text`, 'Type the heading, or delete the block.')
      break
    case 'text':
      if (empty(block.body)) push('error', `${name} is empty`, 'Write the paragraph, or delete the block.')
      break
    case 'list': {
      const filled = block.items.filter(i => i.trim())
      if (!filled.length) push('error', `${name} has no items`, 'Add at least one line, or delete the block.')
      else if (filled.length < block.items.length) push('warning', `${name} has blank items`, 'Empty lines are dropped on export. Remove them or fill them in.')
      break
    }
    case 'quote':
      if (empty(block.body)) push('error', `${name} is empty`, 'Add the quoted text, or delete the block.')
      break
    case 'callout':
      if (empty(block.title) && empty(block.body)) push('error', `${name} is empty`, 'Give the callout a title or body, or delete it.')
      break
    case 'divider':
      break
    case 'image':
      if (empty(block.src)) push('error', `${name} has no picture`, 'Upload an image or paste an image URL.')
      else if (empty(block.alt)) push('error', `${name} is missing alt text`, 'Describe the picture in a sentence, so screen reader users get the same information.')
      break
    case 'video':
      if (empty(block.src)) push('error', `${name} has no link`, 'Paste a YouTube, Vimeo or MP4 URL.')
      else if (!parseVideoEmbed(block.src)) push('error', `${name} link is not playable`, 'Use a YouTube / Vimeo page URL or a direct .mp4 link.')
      break
    case 'accordion':
    case 'tabs':
    case 'flashcards': {
      const filled = block.pairs.filter(p => p.title.trim() || p.body.trim())
      if (!filled.length) push('error', `${name} has no content`, 'Fill in at least one item, or delete the block.')
      else {
        if (filled.length < block.pairs.length) push('warning', `${name} has empty items`, 'Empty items are dropped on export. Remove them or fill them in.')
        if (block.kind !== 'flashcards' && filled.some(p => !p.title.trim())) push('warning', `${name} item is missing a title`, 'Untitled panels are hard to scan. Give each one a label.')
      }
      break
    }
    case 'quiz': {
      const opts = block.options.filter(o => o.trim())
      if (empty(block.title)) push('error', `${name} has no question`, 'Write the question learners will answer.')
      if (opts.length < 2) push('error', `${name} needs at least two answers`, 'Fill in more answer options.')
      else if (!block.options[block.correctIndex]?.trim()) push('error', `${name}: the correct answer is blank`, 'The option marked correct has no text. Fill it in or mark another option.')
      if (opts.length >= 2 && empty(block.feedback)) push('warning', `${name} has no feedback`, 'A sentence on why the answer is right is where the learning happens.')
      break
    }
    case 'cta':
      if (empty(block.title)) push('error', `${name} has no label`, 'Give the button text.')
      if (block.src.trim() && !/^https?:\/\//i.test(block.src.trim())) push('error', `${name} link is not a URL`, 'Links must start with http:// or https://.')
      break
  }
}

export function auditCourse(course: LuminaCourse): LuminaAuditIssue[] {
  const issues: LuminaAuditIssue[] = []
  if (!course.title.trim()) {
    issues.push({ level: 'warning', lessonId: '', blockId: null, message: 'The course has no title', fix: 'The title appears on the cover and in the LMS. Give it a name.' })
  }
  const totalBlocks = course.lessons.reduce((s, l) => s + l.blocks.length, 0)
  if (!totalBlocks) {
    issues.push({ level: 'error', lessonId: '', blockId: null, message: 'The course has no content', fix: 'Add at least one block before exporting.' })
    return issues
  }
  for (const lesson of course.lessons) {
    if (!lesson.title.trim()) {
      issues.push({ level: 'warning', lessonId: lesson.id, blockId: null, message: 'A lesson has no title', fix: 'Lesson titles build the course menu. Give this one a name.' })
    }
    if (!lesson.blocks.length) {
      issues.push({ level: 'warning', lessonId: lesson.id, blockId: null, message: `"${lesson.title || 'Untitled lesson'}" is empty`, fix: 'Empty lessons are skipped on export. Add blocks or delete it.' })
    }
    for (const block of lesson.blocks) {
      auditBlock(block, (level, message, fix) => {
        const preview = blockPreview(block)
        issues.push({
          level,
          lessonId: lesson.id,
          blockId: block.id,
          message: preview ? `${message}: “${preview}”` : message,
          fix
        })
      })
    }
  }
  // Errors first so the sheet reads blockers → advisories.
  return issues.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1))
}

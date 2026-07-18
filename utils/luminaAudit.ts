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
    case 'imagetext':
      if (empty(block.src)) push('error', `${name} has no picture`, 'Upload an image or paste an image URL.')
      else if (empty(block.alt)) push('error', `${name} is missing alt text`, 'Describe the picture in a sentence, so screen reader users get the same information.')
      if (empty(block.body)) push('warning', `${name} has no text`, 'Add the paragraph that sits beside the picture.')
      break
    case 'video':
      if (empty(block.src)) push('error', `${name} has no link`, 'Paste a YouTube, Vimeo or MP4 URL.')
      else if (!parseVideoEmbed(block.src)) push('error', `${name} link is not playable`, 'Use a YouTube / Vimeo page URL or a direct .mp4 link.')
      break
    case 'audio':
      if (empty(block.src)) push('error', `${name} has no clip`, 'Paste a direct link to an MP3, WAV or M4A file.')
      else if (!/^https?:\/\/|^data:audio\//i.test(block.src.trim())) push('error', `${name} link is not playable`, 'Use a direct audio URL (ending in .mp3, .wav or .m4a).')
      break
    case 'stat':
      if (empty(block.title)) push('error', `${name} has no number`, 'Type the figure that leads this block, like 92% or 3x.')
      if (empty(block.body)) push('warning', `${name} has no label`, 'A number needs a few words to mean something. Add the label.')
      break
    case 'table': {
      const rows = block.grid.filter(r => r.some(c => c.trim()))
      if (rows.length < 2) push('error', `${name} needs a header and a row`, 'Fill in the header row and at least one data row.')
      break
    }
    case 'reflection':
      if (empty(block.title)) push('error', `${name} has no prompt`, 'Write the question you want learners to reflect on.')
      break
    case 'accordion':
    case 'tabs':
    case 'flashcards':
    case 'steps':
    case 'cardgrid':
    case 'reveal': {
      const filled = block.pairs.filter(p => p.title.trim() || p.body.trim())
      if (!filled.length) push('error', `${name} has no content`, 'Fill in at least one item, or delete the block.')
      else {
        if (filled.length < block.pairs.length) push('warning', `${name} has empty items`, 'Empty items are dropped on export. Remove them or fill them in.')
        if (block.kind !== 'flashcards' && block.kind !== 'reveal' && filled.some(p => !p.title.trim())) push('warning', `${name} item is missing a title`, 'Untitled items are hard to scan. Give each one a label.')
      }
      break
    }
    case 'quiz':
    case 'truefalse': {
      const opts = block.options.filter(o => o.trim())
      if (empty(block.title)) push('error', `${name} has no question`, 'Write the question learners will answer.')
      if (opts.length < 2) push('error', `${name} needs at least two answers`, 'Fill in more answer options.')
      else if (!block.options[block.correctIndex]?.trim()) push('error', `${name}: the correct answer is blank`, 'The option marked correct has no text. Fill it in or mark another option.')
      if (opts.length >= 2 && empty(block.feedback)) push('warning', `${name} has no feedback`, 'A sentence on why the answer is right is where the learning happens.')
      break
    }
    case 'multiquiz': {
      const opts = block.options.filter(o => o.trim())
      if (empty(block.title)) push('error', `${name} has no question`, 'Write the question learners will answer.')
      if (opts.length < 2) push('error', `${name} needs at least two answers`, 'Fill in more answer options.')
      if (!block.correctSet.length) push('error', `${name} has no correct answers marked`, 'Tick every option that should count as correct.')
      break
    }
    case 'fillblank':
      if (empty(block.body)) push('error', `${name} has no sentence`, 'Write the sentence and mark the gap with three underscores ___.')
      else if (!block.body.includes('___')) push('error', `${name} has no gap`, 'Put ___ (three underscores) where the missing word goes.')
      if (!block.options.some(o => o.trim())) push('error', `${name} has no accepted answer`, 'Add at least one word that counts as correct.')
      break
    case 'poll':
      if (empty(block.title)) push('error', `${name} has no question`, 'Write the question learners will vote on.')
      if (block.options.filter(o => o.trim()).length < 2) push('error', `${name} needs at least two choices`, 'Give learners something to choose between.')
      break
    case 'scenario': {
      const choices = block.options.filter(o => o.trim())
      if (empty(block.title)) push('error', `${name} has no situation`, 'Describe the decision learners are facing.')
      if (choices.length < 2) push('error', `${name} needs at least two choices`, 'Add the options learners can pick from.')
      else {
        block.options.forEach((o, i) => {
          if (o.trim() && !block.outcomes[i]?.trim()) push('warning', `A choice has no outcome`, 'Each choice should show learners what happens next. Fill in its outcome.')
        })
      }
      break
    }
    case 'ordering': {
      const steps = block.items.filter(i => i.trim())
      if (empty(block.title)) push('warning', `${name} has no prompt`, 'A short instruction helps, like "Put these in order".')
      if (steps.length < 3) push('error', `${name} needs at least three items`, 'Ordering only makes sense with a few steps to arrange.')
      break
    }
    case 'matching': {
      const pairs = block.pairs.filter(p => p.title.trim() && p.body.trim())
      if (pairs.length < 2) push('error', `${name} needs at least two full pairs`, 'Each pair needs both a left and a right item.')
      if (block.pairs.some(p => (p.title.trim() ? 1 : 0) + (p.body.trim() ? 1 : 0) === 1)) push('warning', `A pair is half-empty`, 'Fill in both sides, or remove the pair.')
      break
    }
    case 'memory': {
      const pairs = block.pairs.filter(p => p.title.trim() && p.body.trim())
      if (pairs.length < 2) push('error', `${name} needs at least two full pairs`, 'A memory game needs pairs to match. Fill in both sides.')
      if (pairs.length > 8) push('warning', `${name} has a lot of pairs`, 'More than eight pairs gets hard on a phone. Consider splitting it.')
      break
    }
    case 'sortgame': {
      const cats = block.options.filter(o => o.trim())
      const cards = block.pairs.filter(p => p.title.trim())
      if (cats.length < 2) push('error', `${name} needs at least two buckets`, 'Name the categories cards get sorted into.')
      if (cards.length < 2) push('error', `${name} needs at least two cards`, 'Add the cards learners will sort.')
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

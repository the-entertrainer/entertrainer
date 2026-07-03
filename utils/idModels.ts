import type { CardKind } from '~/types/story'

export type ModelId =
  | 'freeform'
  | 'blooms'
  | 'gagne'
  | 'addie'
  | 'sam'
  | 'merrill'
  | 'action-mapping'
  | '70-20-10'

export interface IdStage {
  id: string
  label: string
  short: string       // compact chip text
  color: string
  prompt: string      // the guiding question shown in the inspector and exports
  kind: CardKind      // default card kind when quick-adding this stage
  group?: string      // optional grouping band (Gagné: Before / During / After)
}

// The critical distinction most tools miss:
// - 'journey' frameworks (Gagné, Bloom's, Merrill, Action Mapping,
//   70-20-10) describe the LEARNER's experience — their stages are lesson
//   sections, so screens carry stage tags and exports group by stage.
// - 'process' frameworks (ADDIE, SAM) describe the DESIGNER's workflow —
//   a learner never sits "inside the Develop phase". Their stages are a
//   planning worksheet: per-phase notes about the project, kept alongside
//   a flat screen flow and exported as a Design Plan table.
export type ModelKind = 'journey' | 'process'

export interface IdModel {
  id: ModelId
  label: string
  tagline: string
  kind: ModelKind
  columnLabel: string // what a stage is called in this model's exports
  stages: IdStage[]
}

// Every framework here is expressed in our own words, tuned for a screen-
// by-screen storyboard: each stage carries a working question the designer
// answers with one or more cards. The stage sequence is the export order
// and the lane order on the canvas.
export const ID_MODELS: Record<ModelId, IdModel> = {
  'freeform': {
    id: 'freeform',
    kind: 'journey',
    label: 'Freeform',
    tagline: 'Blank canvas — structure it your way',
    columnLabel: 'Stage',
    stages: []
  },

  'blooms': {
    id: 'blooms',
    kind: 'journey',
    label: "Bloom's Taxonomy",
    tagline: 'Climb from recall to creation, level by level',
    columnLabel: "Bloom's Level",
    stages: [
      { id: 'remember', label: 'Remember', short: 'Remember', color: '#94A3B8', kind: 'text-image',
        prompt: 'What must learners be able to recall — facts, terms, steps? (recognize · list · define · locate)' },
      { id: 'understand', label: 'Understand', short: 'Understand', color: '#60A5FA', kind: 'text-image',
        prompt: 'What must learners explain in their own words? (summarize · classify · compare · interpret)' },
      { id: 'apply', label: 'Apply', short: 'Apply', color: '#2DD4BF', kind: 'text-image',
        prompt: 'Where will learners put the skill to work? (use · implement · solve · demonstrate)' },
      { id: 'analyze', label: 'Analyze', short: 'Analyze', color: '#34D399', kind: 'text-image',
        prompt: 'What will learners take apart or examine? (differentiate · organize · contrast · investigate)' },
      { id: 'evaluate', label: 'Evaluate', short: 'Evaluate', color: '#FBBF24', kind: 'mcq',
        prompt: 'What judgments will learners make, against which criteria? (critique · defend · test · judge)' },
      { id: 'create', label: 'Create', short: 'Create', color: '#FB7185', kind: 'text-image',
        prompt: 'What will learners produce to show mastery? (design · assemble · propose · build)' }
    ]
  },

  'gagne': {
    id: 'gagne',
    kind: 'journey',
    label: "Gagné's 9 Events",
    tagline: 'The classic lesson arc — attention to transfer',
    columnLabel: 'Event',
    stages: [
      { id: 'attention', label: '1 · Gain attention', short: 'Attention', color: '#FB7185', kind: 'video', group: 'Before instruction',
        prompt: 'Open with a hook — a story, statistic, or provocation that earns focus.' },
      { id: 'objectives', label: '2 · State objectives', short: 'Objectives', color: '#F59E0B', kind: 'objectives', group: 'Before instruction',
        prompt: 'Tell learners exactly what they will be able to do by the end.' },
      { id: 'recall', label: '3 · Recall prior learning', short: 'Recall', color: '#FBBF24', kind: 'text-image', group: 'Before instruction',
        prompt: 'Bridge to what learners already know so new content has an anchor.' },
      { id: 'present', label: '4 · Present the content', short: 'Present', color: '#34D399', kind: 'text-image', group: 'During instruction',
        prompt: 'Deliver the core material — chunked, sequenced, and multimodal.' },
      { id: 'guidance', label: '5 · Guide the learning', short: 'Guide', color: '#2DD4BF', kind: 'text-image', group: 'During instruction',
        prompt: 'Support first attempts — worked examples, hints, and scaffolds.' },
      { id: 'practice', label: '6 · Elicit performance', short: 'Practice', color: '#60A5FA', kind: 'text-image', group: 'During instruction',
        prompt: 'Let learners perform on their own — activities and exercises.' },
      { id: 'feedback', label: '7 · Provide feedback', short: 'Feedback', color: '#A78BFA', kind: 'text-image', group: 'After instruction',
        prompt: 'Return specific, timely feedback on what was done well and what to fix.' },
      { id: 'assess', label: '8 · Assess performance', short: 'Assess', color: '#E879F9', kind: 'mcq',
        group: 'After instruction',
        prompt: 'Measure mastery — a scored check aligned to the objectives.' },
      { id: 'transfer', label: '9 · Enhance transfer', short: 'Transfer', color: '#94A3B8', kind: 'summary', group: 'After instruction',
        prompt: 'Bridge to the real world — job aids, spaced practice, next steps.' }
    ]
  },

  'addie': {
    id: 'addie',
    kind: 'process',
    label: 'ADDIE',
    tagline: 'The design process — phase-by-phase project plan',
    columnLabel: 'Phase',
    stages: [
      { id: 'analyze', label: 'Analyze', short: 'Analyze', color: '#A78BFA', kind: 'text-image',
        prompt: 'Who is the audience, what do they need, and what gap does this close?' },
      { id: 'design', label: 'Design', short: 'Design', color: '#60A5FA', kind: 'text-image',
        prompt: 'How is content sequenced, what does each screen show, which media carry it?' },
      { id: 'develop', label: 'Develop', short: 'Develop', color: '#2DD4BF', kind: 'text-image',
        prompt: 'Build the assets — scripts, slides, media, and assembled screens.' },
      { id: 'implement', label: 'Implement', short: 'Implement', color: '#34D399', kind: 'text-image',
        prompt: 'How does this reach learners — pilot group first, then full rollout?' },
      { id: 'evaluate', label: 'Evaluate', short: 'Evaluate', color: '#FBBF24', kind: 'mcq',
        prompt: 'How well did it work — learner results, feedback, and what to improve?' }
    ]
  },

  'sam': {
    id: 'sam',
    kind: 'process',
    label: 'SAM',
    tagline: 'Iterative design process — plan in quick cycles',
    columnLabel: 'Phase',
    stages: [
      { id: 'evaluate', label: 'Evaluate', short: 'Evaluate', color: '#FB7185', kind: 'text-image',
        prompt: 'What do we know so far — the need, the audience, and how the last pass landed?' },
      { id: 'design', label: 'Design', short: 'Design', color: '#60A5FA', kind: 'text-image',
        prompt: 'Sketch this iteration — what goes in, in what order, shown how?' },
      { id: 'develop', label: 'Develop', short: 'Develop', color: '#2DD4BF', kind: 'text-image',
        prompt: 'Produce a working slice learners can react to — then loop back.' }
    ]
  },

  'merrill': {
    id: 'merrill',
    kind: 'journey',
    label: "Merrill's First Principles",
    tagline: 'Real problems at the center of learning',
    columnLabel: 'Principle',
    stages: [
      { id: 'problem', label: 'Task / Problem', short: 'Problem', color: '#FB7185', kind: 'text-image',
        prompt: 'What real-world task anchors this module? Show the whole problem early.' },
      { id: 'activation', label: 'Activation', short: 'Activation', color: '#F59E0B', kind: 'text-image',
        prompt: 'How do you wake relevant prior experience before teaching anything new?' },
      { id: 'demonstration', label: 'Demonstration', short: 'Demo', color: '#60A5FA', kind: 'video',
        prompt: 'Show — don\'t just tell. Model the skill on a problem like theirs.' },
      { id: 'application', label: 'Application', short: 'Apply', color: '#2DD4BF', kind: 'mcq',
        prompt: 'Let learners try it on a new problem, with feedback and fading support.' },
      { id: 'integration', label: 'Integration', short: 'Integrate', color: '#34D399', kind: 'summary',
        prompt: 'How do learners carry this into their world — reflect, defend, share, adapt?' }
    ]
  },

  'action-mapping': {
    id: 'action-mapping',
    kind: 'journey',
    label: 'Action Mapping',
    tagline: 'Start with the business goal, map back to behavior',
    columnLabel: 'Component',
    stages: [
      { id: 'goal', label: 'Business Goal', short: 'Goal', color: '#FB7185', kind: 'title',
        prompt: 'The measurable outcome this module exists to move. One sentence.' },
      { id: 'actions', label: 'Actions', short: 'Actions', color: '#F59E0B', kind: 'text-image',
        prompt: 'What must people do on the job for that goal to happen?' },
      { id: 'practice', label: 'Practice Activities', short: 'Practice', color: '#2DD4BF', kind: 'mcq',
        prompt: 'Realistic activities that rehearse each action — scenarios beat quizzes.' },
      { id: 'information', label: 'Information', short: 'Info', color: '#60A5FA', kind: 'text-image',
        prompt: 'Only the content needed to complete the practice. Cut everything else.' }
    ]
  },

  '70-20-10': {
    id: '70-20-10',
    kind: 'journey',
    label: '70 · 20 · 10',
    tagline: 'Experience, exchange, education — in proportion',
    columnLabel: 'Bucket',
    stages: [
      { id: 'experience', label: '70% · Experience', short: '70%', color: '#2DD4BF', kind: 'text-image',
        prompt: 'On-the-job practice: stretch tasks, projects, and reflection on real work.' },
      { id: 'social', label: '20% · Social', short: '20%', color: '#60A5FA', kind: 'text-image',
        prompt: 'Learning from others: coaching, peer exchange, communities, feedback.' },
      { id: 'formal', label: '10% · Formal', short: '10%', color: '#A78BFA', kind: 'text-image',
        prompt: 'Structured content: courses, reading, and self-study that support the rest.' }
    ]
  }
}

export const MODEL_ORDER: ModelId[] = [
  'blooms', 'gagne', 'addie', 'sam', 'merrill', 'action-mapping', '70-20-10', 'freeform'
]

export function modelOf(id: string | undefined | null): IdModel {
  return ID_MODELS[(id as ModelId) || 'freeform'] ?? ID_MODELS['freeform']
}

// Resolves a stage tag for a CARD — process models never tag cards, so
// their phases resolve to null here (they only surface via the plan).
export function stageOf(modelId: string | undefined | null, stageId: string | undefined | null): IdStage | null {
  if (!stageId) return null
  const model = modelOf(modelId)
  if (model.kind === 'process') return null
  return model.stages.find(s => s.id === stageId) ?? null
}

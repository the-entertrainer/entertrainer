/** Dialogue data model — mirrored in public/dialogue/js */

export type DialogueFormatId = 'webtoon' | 'shorts' | 'square' | 'page';
export type DialogueLayoutId = 'splash1' | 'stack2' | 'stack3' | 'grid4' | 'blank';
export type NodeType = 'balloon' | 'caption' | 'sticker' | 'frame';
export type BalloonShape = 'speech' | 'thought' | 'caption' | 'ellipse' | 'rounded';
export type FitMode = 'contain' | 'cover';

export interface DialogueProject {
  id: string;
  title: string;
  formatId: DialogueFormatId;
  width: number;
  height: number | null;
  createdAt: number;
  updatedAt: number;
  coverAssetId: string | null;
  revision: number;
}

export interface DialoguePage {
  id: string;
  projectId: string;
  order: number;
  width: number;
  height: number;
}

export interface DialoguePanel {
  id: string;
  pageId: string;
  order: number;
  x: number;
  y: number;
  w: number;
  h: number;
  artAssetId?: string | null;
  fit?: FitMode;
  artX?: number;
  artY?: number;
  artScale?: number;
  placeholderColor?: string;
}

export interface DialogueNode {
  id: string;
  type: NodeType;
  shape?: BalloonShape;
  panelId: string | null;
  pageId: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fontSize?: number;
  tail?: { x: number; y: number } | null;
  assetId?: string | null;
  stickerPath?: string;
}

export interface DialogueAsset {
  id: string;
  projectId: string;
  mime: string;
  name: string;
  dataURL?: string;
  blob?: Blob;
  createdAt: number;
}

export interface DialogueBundle {
  project: DialogueProject;
  pages: DialoguePage[];
  panels: DialoguePanel[];
  nodes: DialogueNode[];
  assets: DialogueAsset[];
}

export interface WebtoonSlice {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

export interface DialogueSettings {
  theme: 'system' | 'light' | 'dark';
  defaultFormat: DialogueFormatId;
  autosave: boolean;
  reduceMotion: boolean;
  exportQuality: number;
}


/** AI Story Mode / Canon Engine — stored in IndexedDB `stories` (Dexie v3) */
export type DialogueDensity = 'draft' | 'studio' | 'epic';
export type DialogueBeat = 'setup' | 'turn' | 'payoff' | 'hook';
export type DialogueShot = 'establishing' | 'wide' | 'medium' | 'close' | 'insert' | 'reaction';

export interface DialogueVisualDNA {
  face: string;
  hair: string;
  body: string;
  skin: string;
  distinctiveMarks: string;
  wardrobeLocked: string[];
  colorHex: string[];
  props: string[];
}

export interface DialogueStoryCharacter {
  id: string;
  name: string;
  role: string;
  ageRange?: string;
  genderPresentation?: string;
  visualDNA?: DialogueVisualDNA;
  voice?: { diction: string; catchphrases: string[]; taboo: string };
  psychology?: { want: string; need: string; wound: string; lie: string; fear: string };
  relationships: Array<{ targetId: string; type: string; tension: string }> | string;
  arc?: string;
  /** Legacy flat fields */
  appearance: string;
  personality: string;
}

export interface DialogueStoryOutline {
  title: string;
  logline: string;
  density?: DialogueDensity;
  maturityHint?: 'all-ages' | 'teen' | 'adult';
  chapters: Array<{
    id: string;
    title: string;
    summary: string;
    arcRole?: string;
    scenes: Array<{
      id: string;
      summary: string;
      beat?: DialogueBeat;
      conflict?: string;
      emotion?: string;
      pageHint: number;
    }>;
  }>;
  suggestedPages: number;
  rationale: string;
}

export interface DialogueStoryPageSpec {
  id: string;
  chapterId: string | null;
  title: string;
  kind: 'story' | 'cover' | 'back';
  panels: Array<{
    id: string;
    order: number;
    scene: string;
    shot?: DialogueShot;
    camera?: string;
    action?: string;
    subtext?: string;
    characters: string[];
    dialogue: Array<{ speakerId: string | null; text: string; balloon: 'speech' | 'thought' | 'caption' }>;
    imagePrompt: string;
    notes: string;
  }>;
}

export interface DialogueStoryBible {
  characters: DialogueStoryCharacter[];
  locations: Array<{
    id: string;
    name: string;
    sensory?: string;
    palette?: string[];
    recurringMotifs?: string[];
    description: string;
  }>;
  rules?: string[];
  motifs?: string[];
  timeline?: Array<{ label: string; when: string }>;
  visualStyle: string | {
    medium: string;
    line: string;
    lighting: string;
    palette: string;
    cameraGrammar: string;
    referencesAvoid: string;
  };
  visualStyleFlat?: string;
  toneNotes: string;
  maturity?: 'all-ages' | 'teen' | 'adult';
  chapters: Array<{ id: string; title: string; summary: string }>;
}

export interface DialogueStoryDoc {
  id: string;
  title: string;
  status: 'draft' | 'bible' | 'pages' | 'ready';
  density?: DialogueDensity;
  plot: string;
  tone: string;
  messages: Array<{ role: string; content: string }>;
  outline: DialogueStoryOutline | null;
  beatGraph?: DialogueStoryOutline | null;
  bible: DialogueStoryBible | null;
  pages: DialogueStoryPageSpec[];
  projectLinks: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

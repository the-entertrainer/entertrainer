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


/** AI Story Mode — stored in IndexedDB `stories` (Dexie v2) */
export interface DialogueStoryCharacter {
  id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  relationships: string;
}

export interface DialogueStoryOutline {
  title: string;
  logline: string;
  chapters: Array<{
    id: string;
    title: string;
    summary: string;
    scenes: Array<{ id: string; summary: string; pageHint: number }>;
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
    characters: string[];
    dialogue: Array<{ speakerId: string | null; text: string; balloon: 'speech' | 'thought' | 'caption' }>;
    imagePrompt: string;
    notes: string;
  }>;
}

export interface DialogueStoryDoc {
  id: string;
  title: string;
  status: 'draft' | 'bible' | 'pages' | 'ready';
  plot: string;
  tone: string;
  messages: Array<{ role: string; content: string }>;
  outline: DialogueStoryOutline | null;
  bible: {
    characters: DialogueStoryCharacter[];
    locations: Array<{ id: string; name: string; description: string }>;
    visualStyle: string;
    toneNotes: string;
    chapters: Array<{ id: string; title: string; summary: string }>;
  } | null;
  pages: DialogueStoryPageSpec[];
  projectLinks: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

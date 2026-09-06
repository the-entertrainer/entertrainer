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

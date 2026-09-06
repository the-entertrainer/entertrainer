export const FORMATS = {
  webtoon: { id: 'webtoon' as const, label: 'Webtoon', width: 800, height: Infinity, infinite: true },
  shorts: { id: 'shorts' as const, label: 'Shorts', width: 1080, height: 1920, infinite: false },
  square: { id: 'square' as const, label: 'Square', width: 1080, height: 1080, infinite: false },
  page: { id: 'page' as const, label: 'Page', width: 2480, height: 3508, infinite: false },
};

export const LAYOUTS = {
  splash1: { id: 'splash1' as const, label: '1 splash', panels: 1, kind: 'stack' as const },
  stack2: { id: 'stack2' as const, label: '2 stack', panels: 2, kind: 'stack' as const },
  stack3: { id: 'stack3' as const, label: '3 stack', panels: 3, kind: 'stack' as const },
  grid4: { id: 'grid4' as const, label: '4 grid', panels: 4, kind: 'grid' as const },
  blank: { id: 'blank' as const, label: 'Blank', panels: 0, kind: 'blank' as const },
};

export const GUTTER_AT_800 = 24;

export function gutterForWidth(w: number) {
  return Math.round(GUTTER_AT_800 * (w / 800));
}

export function defaultPageHeight(format: { id: string; width: number; height: number; infinite?: boolean }, panelCount: number) {
  if (format.id === 'webtoon') {
    const n = Math.max(panelCount || 1, 1);
    return Math.round(format.width * (16 / 9) * n + gutterForWidth(format.width) * (n + 1));
  }
  return format.height === Infinity ? 1280 : format.height;
}

export function layoutRects(format: { width: number; height: number; infinite?: boolean }, layout: { panels: number; kind: string }) {
  const w = format.width;
  const g = gutterForWidth(w);
  const count = layout.panels;
  if (!count) return [] as { x: number; y: number; w: number; h: number }[];
  if (layout.kind === 'grid' && count === 4) {
    const h = format.infinite ? Math.round(w * (16 / 9)) : format.height;
    const pw = (w - g * 3) / 2;
    const ph = (h - g * 3) / 2;
    return [
      { x: g, y: g, w: pw, h: ph },
      { x: g * 2 + pw, y: g, w: pw, h: ph },
      { x: g, y: g * 2 + ph, w: pw, h: ph },
      { x: g * 2 + pw, y: g * 2 + ph, w: pw, h: ph },
    ];
  }
  const pageH = defaultPageHeight(format as any, count);
  const ph = (pageH - g * (count + 1)) / count;
  const rects = [];
  for (let i = 0; i < count; i++) {
    rects.push({ x: g, y: g + i * (ph + g), w: w - g * 2, h: ph });
  }
  return rects;
}

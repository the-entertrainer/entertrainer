(function (global) {
  const FORMATS = {
    webtoon: { id: 'webtoon', label: 'Webtoon', width: 800, height: Infinity, infinite: true },
    shorts: { id: 'shorts', label: 'Shorts', width: 1080, height: 1920, infinite: false },
    square: { id: 'square', label: 'Square', width: 1080, height: 1080, infinite: false },
    page: { id: 'page', label: 'Page', width: 2480, height: 3508, infinite: false },
  };
  const LAYOUTS = {
    splash1: { id: 'splash1', label: '1 splash', panels: 1, kind: 'stack' },
    stack2: { id: 'stack2', label: '2 stack', panels: 2, kind: 'stack' },
    stack3: { id: 'stack3', label: '3 stack', panels: 3, kind: 'stack' },
    grid4: { id: 'grid4', label: '4 grid', panels: 4, kind: 'grid' },
    blank: { id: 'blank', label: 'Blank', panels: 0, kind: 'blank' },
  };
  const GUTTER_AT_800 = 24;
  function gutterForWidth(w) {
    return Math.round(GUTTER_AT_800 * (w / 800));
  }
  function defaultPageHeight(format, panelCount) {
    if (format.id === 'webtoon') {
      const n = Math.max(panelCount || 1, 1);
      return Math.round(format.width * (16 / 9) * n + gutterForWidth(format.width) * (n + 1));
    }
    return format.height === Infinity ? 1280 : format.height;
  }
  function layoutRects(format, layout) {
    const w = format.width;
    const g = gutterForWidth(w);
    const count = layout.panels;
    if (!count) return [];
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
    const pageH = defaultPageHeight(format, count);
    const ph = (pageH - g * (count + 1)) / count;
    const rects = [];
    for (let i = 0; i < count; i++) {
      rects.push({ x: g, y: g + i * (ph + g), w: w - g * 2, h: ph });
    }
    return rects;
  }
  global.DialogueFormats = { FORMATS, LAYOUTS, GUTTER_AT_800, gutterForWidth, defaultPageHeight, layoutRects };
})(typeof window !== 'undefined' ? window : globalThis);

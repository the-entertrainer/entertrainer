(function (global) {
  function uid(prefix) {
    return (prefix || 'id') + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }
  function now() { return Date.now(); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
  /** Slice a vertical strip into WEBTOON-sized chunks. */
  function sliceWebtoon(width, totalHeight, maxSliceHeight) {
    const slices = [];
    let y = 0;
    let i = 0;
    const maxH = Math.max(1, maxSliceHeight | 0);
    const h = Math.max(0, totalHeight | 0);
    while (y < h) {
      const sliceH = Math.min(maxH, h - y);
      slices.push({ index: i, x: 0, y, width, height: sliceH, name: String(i + 1).padStart(3, '0') + '.jpg' });
      y += sliceH;
      i += 1;
    }
    return slices;
  }
  function comicInfoXml(project) {
    const title = (project && project.title) || 'Untitled';
    const series = title;
    return `<?xml version="1.0" encoding="utf-8"?>\n<ComicInfo>\n  <Title>${escapeXml(title)}</Title>\n  <Series>${escapeXml(series)}</Series>\n  <LanguageISO>en</LanguageISO>\n  <Manga>No</Manga>\n</ComicInfo>`;
  }
  function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  async function blobToDataURL(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }
  async function dataURLToBlob(dataURL) {
    const res = await fetch(dataURL);
    return res.blob();
  }
  function downloadBlob(blob, filename) {
    if (typeof saveAs === 'function') {
      saveAs(blob, filename);
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function fitContain(srcW, srcH, boxW, boxH) {
    const s = Math.min(boxW / srcW, boxH / srcH);
    const w = srcW * s, h = srcH * s;
    return { w, h, x: (boxW - w) / 2, y: (boxH - h) / 2, scale: s };
  }
  function fitCover(srcW, srcH, boxW, boxH) {
    const s = Math.max(boxW / srcW, boxH / srcH);
    const w = srcW * s, h = srcH * s;
    return { w, h, x: (boxW - w) / 2, y: (boxH - h) / 2, scale: s };
  }
  global.DialogueUtils = {
    uid, now, clamp, deepClone, sliceWebtoon, comicInfoXml, escapeXml,
    blobToDataURL, dataURLToBlob, downloadBlob, fitContain, fitCover,
  };
})(typeof window !== 'undefined' ? window : globalThis);

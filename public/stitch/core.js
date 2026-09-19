/* Shared by the UI, PDF worker, and regression tests. No DOM or network. */
export function pageIndices(value, count) {
  if (!Number.isSafeInteger(count) || count < 1) throw new Error('This PDF has no pages.');
  if (!value.trim() || value.trim().toLowerCase() === 'all') return Array.from({length: count}, (_, i) => i);
  const out = [];
  for (const part of value.split(',')) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('Use page numbers or ranges, such as 1-3, 5.');
    const start = Number(match[1]), end = Number(match[2] || match[1]);
    if (start < 1 || end < 1 || start > count || end > count) throw new Error(`Pages must be between 1 and ${count}.`);
    if (out.length + Math.abs(end - start) + 1 > 50000) throw new Error('Select no more than 50,000 pages per file.');
    const step = end >= start ? 1 : -1;
    for (let n = start; ; n += step) { out.push(n - 1); if (n === end) break; }
  }
  return out;
}
export function cleanPdf(buffer) {
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < Math.min(bytes.length - 4, 4096); i++) {
    if (bytes[i] === 37 && bytes[i+1] === 80 && bytes[i+2] === 68 && bytes[i+3] === 70 && bytes[i+4] === 45) return bytes.slice(i);
  }
  throw new Error('No PDF header found. This file is not a readable PDF.');
}
export function readableError(error) {
  const message = String(error?.message || error);
  return /encrypt|password/i.test(message) ? 'Password-protected PDF. Export an unlocked copy first.' : message;
}
export function outputName(value) {
  const name = value.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/\.+$/, '').slice(0, 180) || 'stitched-document';
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`;
}

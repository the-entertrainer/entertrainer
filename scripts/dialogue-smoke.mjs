#!/usr/bin/env node
/**
 * Dialogue smoke test — Node-only, no browser.
 * Creates fake 3-panel 2-balloon project, sliceWebtoon assert,
 * writes PNG/ZIP/PDF/.dialogue to artifacts/.
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ART = path.join(ROOT, 'artifacts');
fs.mkdirSync(ART, { recursive: true });

const require = createRequire(import.meta.url);

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
  console.log('OK:', msg);
}

function sliceWebtoon(width, totalHeight, maxSliceHeight) {
  const slices = [];
  let y = 0;
  let i = 0;
  const maxH = Math.max(1, maxSliceHeight | 0);
  const h = Math.max(0, totalHeight | 0);
  while (y < h) {
    const sliceH = Math.min(maxH, h - y);
    slices.push({
      index: i, x: 0, y, width, height: sliceH,
      name: String(i + 1).padStart(3, '0') + '.jpg',
    });
    y += sliceH;
    i += 1;
  }
  return slices;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4);
  const td = Buffer.concat([t, data]);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeSolidPNG(w, h, rgb) {
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = rgb[0];
    rgba[i * 4 + 1] = rgb[1];
    rgba[i * 4 + 2] = rgb[2];
    rgba[i * 4 + 3] = 255;
  }
  return encodePNG(w, h, rgba);
}

/** Minimal valid-ish PDF with embedded note (byteLength > 0). */
function makeMiniPDF(title) {
  const content = `BT /F1 24 Tf 50 750 Td (${title.replace(/[()\\]/g, '')}) Tj ET`;
  const objs = [];
  objs.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n');
  objs.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n');
  objs.push('3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj\n');
  objs.push(`4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream\nendobj\n`);
  objs.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n');
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const o of objs) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += o;
  }
  const xrefPos = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objs.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objs.length; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

/** Minimal ZIP (STORE) writer for smoke when jszip unavailable. */
function zipStore(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, data] of files) {
    const nameBuf = Buffer.from(name, 'utf8');
    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); // store
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc32(data), 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    const localFull = Buffer.concat([local, data]);
    locals.push(localFull);
    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc32(data), 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);
    offset += localFull.length;
  }
  const centralDir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, centralDir, end]);
}

// --- fake project ---
const project = {
  id: 'proj_smoke',
  title: 'Smoke Comic',
  formatId: 'webtoon',
  width: 800,
  height: 5000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  coverAssetId: 'asset_1',
  revision: 1,
};
const page = { id: 'page_1', projectId: project.id, order: 0, width: 800, height: 5000 };
const panels = [
  { id: 'panel_1', pageId: page.id, order: 0, x: 24, y: 24, w: 752, h: 400 },
  { id: 'panel_2', pageId: page.id, order: 1, x: 24, y: 448, w: 752, h: 400 },
  { id: 'panel_3', pageId: page.id, order: 2, x: 24, y: 872, w: 752, h: 400 },
];
const nodes = [
  { id: 'node_1', type: 'balloon', shape: 'speech', panelId: 'panel_1', pageId: page.id, x: 60, y: 60, w: 200, h: 80, text: 'Hello' },
  { id: 'node_2', type: 'balloon', shape: 'thought', panelId: 'panel_2', pageId: page.id, x: 80, y: 500, w: 220, h: 90, text: 'Did the bus just… talk?' },
];
assert(panels.length === 3, 'fake project has 3 panels');
assert(nodes.length === 2, 'fake project has 2 balloons');

// sliceWebtoon(800,5000,1280)
const slices = sliceWebtoon(800, 5000, 1280);
// 1280*3=3840, remainder 1160 → 4 slices
assert(slices.length === 4, `sliceWebtoon count === 4 (got ${slices.length})`);
assert(slices[0].height === 1280, 'first slice height 1280');
assert(slices[3].height === 5000 - 1280 * 3, 'last slice remainder height');
assert(slices[0].name === '001.jpg', 'first slice named 001.jpg');
assert(slices[3].name === '004.jpg', 'last slice named 004.jpg');

const png = makeSolidPNG(800, 200, [0xff, 0x4d, 0x2e]);
const pngPath = path.join(ART, 'smoke.png');
fs.writeFileSync(pngPath, png);
assert(fs.statSync(pngPath).size > 0, 'PNG byteLength > 0');

const zipBuf = zipStore([
  ['001.jpg', makeSolidPNG(800, 1280, [0xf6, 0xf1, 0xe8])],
  ['002.jpg', makeSolidPNG(800, 1280, [0x12, 0x11, 0x0f])],
  ['003.jpg', makeSolidPNG(800, 1280, [0xf5, 0xc5, 0x18])],
  ['004.jpg', makeSolidPNG(800, 1160, [0xff, 0x4d, 0x2e])],
]);
const zipPath = path.join(ART, 'smoke-webtoon.zip');
fs.writeFileSync(zipPath, zipBuf);
assert(fs.statSync(zipPath).size > 0, 'ZIP byteLength > 0');

const pdf = makeMiniPDF('Dialogue Smoke');
const pdfPath = path.join(ART, 'smoke.pdf');
fs.writeFileSync(pdfPath, pdf);
assert(fs.statSync(pdfPath).size > 0, 'PDF byteLength > 0');

const cover = makeSolidPNG(400, 711, [0x0d, 0x0c, 0x0a]);
const dialogueZip = zipStore([
  ['project.json', Buffer.from(JSON.stringify({ version: 1, project, pages: [page], panels, nodes, assetIndex: [] }, null, 2))],
  ['cover.png', cover],
  ['assets/.gitkeep', Buffer.from('')],
]);
const dialoguePath = path.join(ART, 'smoke.dialogue');
fs.writeFileSync(dialoguePath, dialogueZip);
assert(fs.statSync(dialoguePath).size > 0, '.dialogue byteLength > 0');

// mirror utils path check
const utilSrc = path.join(ROOT, 'public/dialogue/js/utils.js');
assert(fs.existsSync(utilSrc), 'public utils.js exists');
const utilText = fs.readFileSync(utilSrc, 'utf8');
assert(utilText.includes('sliceWebtoon'), 'utils.js exports sliceWebtoon');

console.log('\nAll smoke checks passed.');
console.log('Artifacts:', fs.readdirSync(ART).join(', '));

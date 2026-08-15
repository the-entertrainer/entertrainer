/**
 * Minimal TrueType metrics reader.
 *
 * The image build-scripts compose SVG by hand, and an SVG renderer has no
 * layout engine to ask "how wide is this line?". Every earlier pass answered
 * that with a fudge factor — `chars × 0.52em` — which is why headlines had to
 * be checked by eye after every wording change, and why the share card's
 * highlighter rectangle was placed by trial and error.
 *
 * This reads the font's own horizontal metrics instead, so `advance()` returns
 * the width the renderer will actually draw. It handles the three tables that
 * requires — cmap (character → glyph), hmtx (glyph → advance), head (units per
 * em) — plus OS/2 for cap height, and nothing else.
 *
 * Not handled, deliberately: kerning and OpenType substitution. Both only ever
 * make a line narrower than the sum of its advances, so measurements here are
 * an upper bound — the safe direction to be wrong in when the question is
 * "does this fit?".
 */
import { readFileSync } from 'node:fs'

export function loadFont(path) {
  const buf = readFileSync(path)
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  const u8 = (o) => dv.getUint8(o)
  const u16 = (o) => dv.getUint16(o)
  const i16 = (o) => dv.getInt16(o)
  const u32 = (o) => dv.getUint32(o)

  const tables = {}
  const numTables = u16(4)
  for (let i = 0; i < numTables; i++) {
    const o = 12 + 16 * i
    tables[String.fromCharCode(u8(o), u8(o + 1), u8(o + 2), u8(o + 3))] =
      { off: u32(o + 8), len: u32(o + 12) }
  }
  for (const t of ['head', 'hhea', 'hmtx', 'cmap']) {
    if (!tables[t]) throw new Error(`${path}: missing ${t} table`)
  }

  const unitsPerEm = u16(tables.head.off + 18)
  const numHMetrics = u16(tables.hhea.off + 34)
  const hmtx = tables.hmtx.off

  // Cap height comes from OS/2 v2+. Older faces fall back to a ratio, which is
  // only used for vertical centring and is forgiving of a percent or two.
  const os2 = tables['OS/2']?.off
  const capHeight = os2 && u16(os2) >= 2 && i16(os2 + 88) > 0
    ? i16(os2 + 88) : Math.round(unitsPerEm * 0.70)
  const descender = os2 ? Math.abs(i16(os2 + 70)) : Math.round(unitsPerEm * 0.22)

  /* ── cmap ──────────────────────────────────────────────────────────────
     Prefer (3,10) format 12 for the full plane, else (3,1) format 4. */
  const cmap = tables.cmap.off
  let sub = 0, subFormat = 0
  for (let i = 0, n = u16(cmap + 2); i < n; i++) {
    const rec = cmap + 4 + 8 * i
    const platform = u16(rec), encoding = u16(rec + 2)
    const off = cmap + u32(rec + 4)
    const format = u16(off)
    if (platform === 3 && encoding === 10 && format === 12) { sub = off; subFormat = 12; break }
    if (platform === 3 && encoding === 1 && format === 4 && !sub) { sub = off; subFormat = 4 }
    if (platform === 0 && format === 4 && !sub) { sub = off; subFormat = 4 }
  }
  if (!sub) throw new Error(`${path}: no usable cmap subtable`)

  const glyphCache = new Map()
  function glyph(cp) {
    if (glyphCache.has(cp)) return glyphCache.get(cp)
    let gid = 0
    if (subFormat === 12) {
      const nGroups = u32(sub + 12)
      let lo = 0, hi = nGroups - 1
      while (lo <= hi) {
        const mid = (lo + hi) >> 1, g = sub + 16 + mid * 12
        const start = u32(g), end = u32(g + 4)
        if (cp < start) hi = mid - 1
        else if (cp > end) lo = mid + 1
        else { gid = u32(g + 8) + (cp - start); break }
      }
    } else if (cp <= 0xffff) {
      const segX2 = u16(sub + 6)
      const endCodes = sub + 14
      const startCodes = endCodes + segX2 + 2
      const idDeltas = startCodes + segX2
      const idRangeOffsets = idDeltas + segX2
      for (let s = 0; s < segX2; s += 2) {
        if (u16(endCodes + s) < cp) continue
        if (u16(startCodes + s) > cp) break
        const ro = u16(idRangeOffsets + s)
        if (ro === 0) gid = (cp + i16(idDeltas + s)) & 0xffff
        else {
          const gi = idRangeOffsets + s + ro + (cp - u16(startCodes + s)) * 2
          const raw = u16(gi)
          gid = raw === 0 ? 0 : (raw + i16(idDeltas + s)) & 0xffff
        }
        break
      }
    }
    glyphCache.set(cp, gid)
    return gid
  }

  const advanceUnits = (gid) =>
    u16(hmtx + 4 * (gid < numHMetrics ? gid : numHMetrics - 1))

  /* ── glyf bounding boxes ───────────────────────────────────────────────
     An advance width is where the next glyph starts, not where this glyph's
     ink ends, and in a display serif the two are routinely different: the y in
     Fraunces throws a tail well to the right of its advance. Anything drawn
     *around* type — the share card's highlighter — has to be placed against
     ink, so each glyph's bounding box is read from the glyf table header. */
  const locaFmt = i16(tables.head.off + 50)
  const loca = tables.loca?.off
  const glyf = tables.glyf?.off

  function bbox(gid) {
    if (loca === undefined || glyf === undefined) return null
    const [start, end] = locaFmt
      ? [u32(loca + gid * 4), u32(loca + gid * 4 + 4)]
      : [u16(loca + gid * 2) * 2, u16(loca + gid * 2 + 2) * 2]
    if (end <= start) return null            // empty glyph, e.g. the space
    return { xMin: i16(glyf + start + 2), xMax: i16(glyf + start + 6) }
  }

  return {
    unitsPerEm,
    /** Cap height in em, e.g. 0.71 — the top of an uppercase H above baseline. */
    capRatio: capHeight / unitsPerEm,
    /** Descender depth in em, positive. */
    descRatio: descender / unitsPerEm,

    /**
     * Width of `text` set at `size` px, in px.
     * `tracking` is SVG `letter-spacing` in px, applied between characters.
     */
    advance(text, size, tracking = 0) {
      const cps = [...text]
      let units = 0
      for (const ch of cps) units += advanceUnits(glyph(ch.codePointAt(0)))
      return (units / unitsPerEm) * size + tracking * Math.max(0, cps.length - 1)
    },

    /**
     * Ink extents of `text` set at `size`, in px relative to the text's x
     * origin — `left` is where the first mark appears, `right` where the last
     * one ends. Both differ from 0 and from `advance()` by the side bearings.
     */
    inkExtents(text, size, tracking = 0) {
      let pen = 0, left = Infinity, right = -Infinity
      for (const ch of [...text]) {
        const gid = glyph(ch.codePointAt(0))
        const b = bbox(gid)
        if (b) {
          left = Math.min(left, pen + b.xMin)
          right = Math.max(right, pen + b.xMax)
        }
        pen += advanceUnits(gid) + (tracking * unitsPerEm) / size
      }
      const k = size / unitsPerEm
      return Number.isFinite(left)
        ? { left: left * k, right: right * k }
        : { left: 0, right: this.advance(text, size, tracking) }
    },

    /** Largest integer size at which every line in `lines` fits `maxWidth`. */
    fit(lines, maxSize, maxWidth, tracking = 0) {
      let size = maxSize
      while (size > 8 && lines.some((l) => this.advance(l, size, tracking) > maxWidth)) size--
      return size
    }
  }
}

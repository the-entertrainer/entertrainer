import type { WebtoonSlice } from '../../types/dialogue';

/** Slice a vertical strip into WEBTOON-sized chunks (default max 1280). */
export function sliceWebtoon(width: number, totalHeight: number, maxSliceHeight: number): WebtoonSlice[] {
  const slices: WebtoonSlice[] = [];
  let y = 0;
  let i = 0;
  const maxH = Math.max(1, maxSliceHeight | 0);
  const h = Math.max(0, totalHeight | 0);
  while (y < h) {
    const sliceH = Math.min(maxH, h - y);
    slices.push({
      index: i,
      x: 0,
      y,
      width,
      height: sliceH,
      name: String(i + 1).padStart(3, '0') + '.jpg',
    });
    y += sliceH;
    i += 1;
  }
  return slices;
}

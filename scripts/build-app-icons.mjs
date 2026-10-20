// Writes public/<app>-icon.svg + 192/512 PNGs from utils/appIcons.ts.
// Run: node --experimental-strip-types scripts/build-app-icons.mjs
import { writeFile } from 'node:fs/promises'
import { Resvg } from '@resvg/resvg-js'
import { appIconSvg } from '../utils/appIcons.ts'
const apps = { stack: 'Stack', 'mind-reader': 'The Mind Reader', astroclock: 'AstroClock', whatto: 'Whatto' }
for (const [id, title] of Object.entries(apps)) {
  const svg = appIconSvg(id, title)
  await writeFile(`public/${id}-icon.svg`, svg + '\n')
  for (const s of [192, 512]) {
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: s } }).render().asPng()
    await writeFile(`public/${id}-icon-${s}.png`, png)
  }
}

import { readFile, writeFile } from 'node:fs/promises'
import { Resvg } from '@resvg/resvg-js'

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8')
const targets = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['mstile-150x150.png', 150],
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['logo.png', 512],
]

const rendered = []
for (const [filename, size] of targets) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
  await writeFile(new URL(`../public/${filename}`, import.meta.url), png)
  if (size === 16 || size === 32) rendered.push({ size, png })
}

const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(rendered.length, 4)

const directory = Buffer.alloc(rendered.length * 16)
let offset = header.length + directory.length
for (const [index, { size, png }] of rendered.entries()) {
  const pointer = index * 16
  directory[pointer] = size === 256 ? 0 : size
  directory[pointer + 1] = size === 256 ? 0 : size
  directory[pointer + 2] = 0
  directory[pointer + 3] = 0
  directory.writeUInt16LE(1, pointer + 4)
  directory.writeUInt16LE(32, pointer + 6)
  directory.writeUInt32LE(png.length, pointer + 8)
  directory.writeUInt32LE(offset, pointer + 12)
  offset += png.length
}

await writeFile(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([header, directory, ...rendered.map(({ png }) => png)]))
console.log(`Refreshed ${targets.length} Entertrainer brand assets plus favicon.ico.`)

import { build } from 'esbuild'
import { readFile, writeFile } from 'node:fs/promises'
await build({ entryPoints: ['games/fever/game.js'], outfile: 'public/fever/fever.js', bundle: true, format: 'esm', minify: true, target: ['es2020'], legalComments: 'eof' })
const output = 'public/fever/fever.js'
await writeFile(output, (await readFile(output, 'utf8')).replace(/[ \t]+$/gm, ''))
console.log('Built Fever Dream with locally bundled Three.js.')

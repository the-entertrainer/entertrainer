/**
 * Begin used to throw ReferenceError on the unbound sidechain depth (DUCK)
 * inside scheduleStudio, before scheduleSong and before phase left "land".
 * Load the page script and run that click path against a fake AudioContext.
 */
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import esbuild from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vue = readFileSync(path.join(root, 'pages/engage/solfeggio.vue'), 'utf8')
const script = vue.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
const source = script
  .replace("import { useThemeStore } from '~/stores/theme'\n", '')
  .replaceAll('~/utils/', './utils/')
  + `
function useThemeStore() {
  return { theme: 'light', init() {}, toggle() {} }
}
globalThis.__sf = { begin, phase, sectionName }
`

const outDir = mkdtempSync(path.join(tmpdir(), 'sf-begin-'))
const outfile = path.join(outDir, 'page.mjs')
await esbuild.build({
  stdin: {
    contents: source,
    loader: 'ts',
    resolveDir: root,
    sourcefile: 'solfeggio.vue.ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  logLevel: 'silent',
})

class AudioParam {
  constructor() {
    this.value = 0
    this.ramps = []
  }
  setValueAtTime(value, time) {
    this.value = value
    this.ramps.push(['set', value, time])
    return this
  }
  exponentialRampToValueAtTime(value, time) {
    if (!(this.value > 0) || !(value > 0)) {
      throw new Error('exponentialRamp from ' + this.value + ' to ' + value)
    }
    this.value = value
    this.ramps.push(['exp', value, time])
    return this
  }
  linearRampToValueAtTime(value, time) {
    this.value = value
    this.ramps.push(['lin', value, time])
    return this
  }
  cancelScheduledValues() { return this }
}

class AudioNode {
  connect() { return this }
  disconnect() {}
}
class GainNode extends AudioNode {
  constructor() { super(); this.gain = new AudioParam() }
}
class OscillatorNode extends AudioNode {
  constructor() {
    super()
    this.frequency = new AudioParam()
    this.type = 'sine'
    this.started = false
  }
  start() { this.started = true }
  stop() {}
}
class BufferSourceNode extends OscillatorNode {
  constructor() { super(); this.buffer = null }
}
class BiquadFilterNode extends AudioNode {
  constructor() {
    super()
    this.frequency = new AudioParam()
    this.Q = new AudioParam()
    this.type = 'lowpass'
  }
}
class WaveShaperNode extends AudioNode {
  constructor() { super(); this.curve = null; this.oversample = 'none' }
}
class StereoPannerNode extends AudioNode {
  constructor() { super(); this.pan = new AudioParam() }
}

const started = []
class AudioContext {
  constructor() {
    this.currentTime = 1
    this.state = 'suspended'
    this.sampleRate = 48000
    this.destination = new AudioNode()
    this.resumed = false
  }
  resume() {
    this.resumed = true
    this.state = 'running'
    return Promise.resolve()
  }
  createGain() { return new GainNode() }
  createOscillator() {
    const node = new OscillatorNode()
    const start = node.start.bind(node)
    node.start = (...args) => { start(...args); started.push(node) }
    return node
  }
  createBufferSource() {
    const node = new BufferSourceNode()
    const start = node.start.bind(node)
    node.start = (...args) => { start(...args); started.push(node) }
    return node
  }
  createBiquadFilter() { return new BiquadFilterNode() }
  createWaveShaper() { return new WaveShaperNode() }
  createStereoPanner() { return new StereoPannerNode() }
  createBuffer(_channels, length, sampleRate) {
    const data = new Float32Array(length)
    return {
      sampleRate,
      getChannelData() { return data },
    }
  }
}

globalThis.ref = (value) => ({ value })
globalThis.computed = (fn) => ({ get value() { return fn() } })
globalThis.watch = () => {}
globalThis.onMounted = () => {}
globalThis.onBeforeUnmount = () => {}
globalThis.nextTick = (fn) => Promise.resolve(fn && fn())
globalThis.definePageMeta = () => {}
globalThis.useSeoMeta = () => {}
const pending = new Set()
globalThis.window = {
  AudioContext,
  setTimeout(fn, ms) {
    const id = setTimeout(fn, ms)
    pending.add(id)
    return id
  },
  clearTimeout(id) {
    pending.delete(id)
    clearTimeout(id)
  },
  requestAnimationFrame() { return 1 },
  cancelAnimationFrame() {},
  devicePixelRatio: 1,
}

const page = await import(pathToFileURL(outfile).href)
assert.equal(page, page)
const { begin, phase, sectionName } = globalThis.__sf
assert.equal(phase.value, 'land')
assert.equal(sectionName.value, '')
begin()
assert.equal(phase.value, 'hold', 'Begin must leave the landing state')
assert.equal(sectionName.value, 'intro', 'section label must leave the landing state')
assert.ok(started.length > 0, 'Begin must start audio nodes')
assert.ok(started.every((node) => node.started))

for (const id of pending) clearTimeout(id)

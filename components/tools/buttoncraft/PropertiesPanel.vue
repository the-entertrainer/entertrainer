<script setup lang="ts">
import type { FillType } from '~/types/buttoncraft'
import BcIcon from './Icon.vue'
import type { ButtonCraftIconName } from './Icon.vue'

const store = useButtonCraftStore()

const ICON_OPTIONS: { value: string; name: ButtonCraftIconName }[] = [
  { value: 'arrow-right', name: 'arrow-right' },
  { value: 'arrow-left', name: 'arrow-left' },
  { value: 'check', name: 'check' },
  { value: 'play', name: 'play' },
  { value: 'lock', name: 'lock' },
  { value: 'star', name: 'star' }
]

const FILL_TABS: { value: FillType; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'linear-gradient', label: 'Gradient' },
  { value: 'glassmorphism', label: 'Glass' },
  { value: 'neumorphism', label: 'Neumorphism' }
]

function getByPath(obj: any, path: string) {
  return path.split('.').reduce((n, k) => (n == null ? n : n[k]), obj)
}

function bind<T = any>(path: string) {
  return computed<T>({
    get: () => getByPath(store.buttonConfig, path),
    set: (v: any) => store.updateProperty(path, v)
  })
}

const label = bind<string>('label')
const iconPosition = bind<string>('iconPosition')
const icon = computed<string>({
  get: () => store.buttonConfig?.icon ?? '',
  set: (v: string) => store.updateProperty('icon', v || undefined)
})

const width = bind<number>('width')
const height = bind<number>('height')
const paddingX = bind<number>('paddingX')
const paddingY = bind<number>('paddingY')
const borderRadius = bind<number>('borderRadius')

const fillType = bind<FillType>('fillType')
const fillColor = bind<string>('fillColor')
const gradientAngle = bind<number>('gradient.angle')
const glassTint = bind<string>('glassConfig.tint')
const glassTintOpacity = bind<number>('glassConfig.tintOpacity')
const glassBlur = bind<number>('glassConfig.blur')
const glassBorderOpacity = bind<number>('glassConfig.borderOpacity')
const neuBase = bind<string>('neumorphismConfig.baseColor')
const neuDistance = bind<number>('neumorphismConfig.distance')
const neuIntensity = bind<number>('neumorphismConfig.intensity')
const neuBlur = bind<number>('neumorphismConfig.blur')
const neuInset = bind<boolean>('neumorphismConfig.inset')

const borderStyle = bind<string>('border.style')
const borderWidth = bind<number>('border.width')
const borderColor = bind<string>('border.color')

function setBorderStyle(style: 'none' | 'solid' | 'dashed') {
  borderStyle.value = style
  if (style !== 'none' && !borderWidth.value) borderWidth.value = 2
}

const fontSize = bind<number>('typography.fontSize')
const fontWeight = bind<number>('typography.fontWeight')
const letterSpacing = bind<number>('typography.letterSpacing')
const textColor = bind<string>('typography.textColor')
const textTransform = bind<string>('typography.textTransform')

const shadows = computed(() => store.currentProject?.button.shadows ?? [])
const gradientStops = computed(() => store.currentProject?.button.gradient.stops ?? [])

const intensityPct = computed({
  get: () => Math.round((store.currentProject?.stateGen.intensity ?? 0.5) * 100),
  set: (v: number) => store.updateStateGenSettings({ intensity: v / 100 })
})
const disabledOpacityPct = computed({
  get: () => Math.round((store.currentProject?.stateGen.disabledOpacity ?? 0.45) * 100),
  set: (v: number) => store.updateStateGenSettings({ disabledOpacity: v / 100 })
})
const visitedEnabled = computed({
  get: () => store.currentProject?.stateGen.visitedEnabled ?? true,
  set: (v: boolean) => store.updateStateGenSettings({ visitedEnabled: v })
})
const selectedEnabled = computed({
  get: () => store.currentProject?.stateGen.selectedEnabled ?? true,
  set: (v: boolean) => store.updateStateGenSettings({ selectedEnabled: v })
})

const open = reactive<Record<string, boolean>>({
  states: true, content: true, layout: false, fill: true, border: false, shadows: false, typography: false
})
function toggle(key: string) { open[key] = !open[key] }
</script>

<template>
  <aside class="bc-props">
    <template v-if="store.buttonConfig">
      <!-- States / intelligence -->
      <section class="bc-section">
        <button type="button" class="bc-section__head" @click="toggle('states')">
          <span>Smart states</span>
          <BcIcon name="chevron-down" :size="14" :class="{ 'bc-rot': !open.states }" />
        </button>
        <div v-show="open.states" class="bc-section__body">
          <p class="bc-hint">Design Normal, then generate the rest. Re-run any time — manual pins stick.</p>
          <label class="glass-label">Intensity — {{ intensityPct }}%</label>
          <input type="range" min="0" max="100" v-model.number="intensityPct" class="bc-range" />

          <label class="glass-label">Disabled opacity — {{ disabledOpacityPct }}%</label>
          <input type="range" min="10" max="90" v-model.number="disabledOpacityPct" class="bc-range" />

          <label class="bc-toggle"><input type="checkbox" v-model="visitedEnabled" /> Visited state</label>
          <label class="bc-toggle"><input type="checkbox" v-model="selectedEnabled" /> Selected state</label>

          <button type="button" class="glass-btn bc-generate-btn" @click="store.generateAllStates()">
            Generate all states
          </button>
        </div>
      </section>

      <!-- Content -->
      <section class="bc-section">
        <button type="button" class="bc-section__head" @click="toggle('content')">
          <span>Content</span>
          <BcIcon name="chevron-down" :size="14" :class="{ 'bc-rot': !open.content }" />
        </button>
        <div v-show="open.content" class="bc-section__body">
          <label class="glass-label" for="bc-label">Label</label>
          <input id="bc-label" v-model="label" type="text" class="glass-field" maxlength="40" />

          <label class="glass-label">Icon</label>
          <select v-model="icon" class="glass-field glass-select">
            <option value="">None</option>
            <option v-for="o in ICON_OPTIONS" :key="o.value" :value="o.value">{{ o.value }}</option>
          </select>

          <template v-if="icon">
            <label class="glass-label">Icon position</label>
            <div class="bc-segmented">
              <button type="button" :class="{ 'bc-segmented__opt--active': iconPosition === 'left' }" class="bc-segmented__opt" @click="iconPosition = 'left'">Left</button>
              <button type="button" :class="{ 'bc-segmented__opt--active': iconPosition === 'right' }" class="bc-segmented__opt" @click="iconPosition = 'right'">Right</button>
              <button type="button" :class="{ 'bc-segmented__opt--active': iconPosition === 'only' }" class="bc-segmented__opt" @click="iconPosition = 'only'">Icon only</button>
            </div>
          </template>
        </div>
      </section>

      <!-- Layout -->
      <section class="bc-section">
        <button type="button" class="bc-section__head" @click="toggle('layout')">
          <span>Layout</span>
          <BcIcon name="chevron-down" :size="14" :class="{ 'bc-rot': !open.layout }" />
        </button>
        <div v-show="open.layout" class="bc-section__body bc-grid2">
          <label class="bc-field"><span class="glass-label">Width</span><input type="number" v-model.number="width" class="glass-field" min="40" max="600" /></label>
          <label class="bc-field"><span class="glass-label">Height</span><input type="number" v-model.number="height" class="glass-field" min="24" max="200" /></label>
          <label class="bc-field"><span class="glass-label">Padding X</span><input type="number" v-model.number="paddingX" class="glass-field" min="0" max="120" /></label>
          <label class="bc-field"><span class="glass-label">Padding Y</span><input type="number" v-model.number="paddingY" class="glass-field" min="0" max="80" /></label>
          <label class="bc-field bc-field--full"><span class="glass-label">Border radius</span><input type="range" min="0" max="60" v-model.number="borderRadius" class="bc-range" /></label>
        </div>
      </section>

      <!-- Fill & Style -->
      <section class="bc-section">
        <button type="button" class="bc-section__head" @click="toggle('fill')">
          <span>Fill &amp; style</span>
          <BcIcon name="chevron-down" :size="14" :class="{ 'bc-rot': !open.fill }" />
        </button>
        <div v-show="open.fill" class="bc-section__body">
          <div class="bc-segmented bc-segmented--4">
            <button
              v-for="t in FILL_TABS" :key="t.value" type="button"
              class="bc-segmented__opt" :class="{ 'bc-segmented__opt--active': fillType === t.value }"
              @click="fillType = t.value"
            >{{ t.label }}</button>
          </div>

          <template v-if="fillType === 'solid'">
            <label class="glass-label">Fill color</label>
            <input type="color" v-model="fillColor" class="bc-color" />
          </template>

          <template v-else-if="fillType === 'linear-gradient'">
            <label class="glass-label">Angle — {{ gradientAngle }}°</label>
            <input type="range" min="0" max="360" v-model.number="gradientAngle" class="bc-range" />
            <label class="glass-label">Stops</label>
            <div v-for="(stop, i) in gradientStops" :key="i" class="bc-stop-row">
              <input type="color" :value="stop.color" class="bc-color bc-color--sm" @input="store.updateGradientStop(i, { color: ($event.target as HTMLInputElement).value })" />
              <input type="number" :value="stop.pos" min="0" max="100" class="glass-field bc-field--num" @input="store.updateGradientStop(i, { pos: Number(($event.target as HTMLInputElement).value) })" />
              <button type="button" class="bc-icon-btn" :disabled="gradientStops.length <= 2" @click="store.removeGradientStop(i)"><BcIcon name="close" :size="13" /></button>
            </div>
            <button type="button" class="glass-chip" @click="store.addGradientStop()"><BcIcon name="plus" :size="12" /> Add stop</button>
          </template>

          <template v-else-if="fillType === 'glassmorphism'">
            <label class="glass-label">Tint color</label>
            <input type="color" v-model="glassTint" class="bc-color" />
            <label class="glass-label">Tint opacity — {{ Math.round(glassTintOpacity * 100) }}%</label>
            <input type="range" min="2" max="60" :value="Math.round(glassTintOpacity * 100)" class="bc-range" @input="glassTintOpacity = Number(($event.target as HTMLInputElement).value) / 100" />
            <label class="glass-label">Blur — {{ glassBlur }}px</label>
            <input type="range" min="0" max="40" v-model.number="glassBlur" class="bc-range" />
            <label class="glass-label">Border opacity — {{ Math.round(glassBorderOpacity * 100) }}%</label>
            <input type="range" min="0" max="100" :value="Math.round(glassBorderOpacity * 100)" class="bc-range" @input="glassBorderOpacity = Number(($event.target as HTMLInputElement).value) / 100" />
          </template>

          <template v-else-if="fillType === 'neumorphism'">
            <label class="glass-label">Base color</label>
            <input type="color" v-model="neuBase" class="bc-color" />
            <label class="glass-label">Distance — {{ neuDistance }}px</label>
            <input type="range" min="2" max="24" v-model.number="neuDistance" class="bc-range" />
            <label class="glass-label">Intensity — {{ Math.round(neuIntensity * 100) }}%</label>
            <input type="range" min="10" max="100" :value="Math.round(neuIntensity * 100)" class="bc-range" @input="neuIntensity = Number(($event.target as HTMLInputElement).value) / 100" />
            <label class="glass-label">Blur — {{ neuBlur }}px</label>
            <input type="range" min="2" max="40" v-model.number="neuBlur" class="bc-range" />
            <label class="bc-toggle"><input type="checkbox" v-model="neuInset" /> Inset (pressed)</label>
          </template>
        </div>
      </section>

      <!-- Border -->
      <section class="bc-section">
        <button type="button" class="bc-section__head" @click="toggle('border')">
          <span>Border</span>
          <BcIcon name="chevron-down" :size="14" :class="{ 'bc-rot': !open.border }" />
        </button>
        <div v-show="open.border" class="bc-section__body">
          <div class="bc-segmented">
            <button type="button" class="bc-segmented__opt" :class="{ 'bc-segmented__opt--active': borderStyle === 'none' }" @click="setBorderStyle('none')">None</button>
            <button type="button" class="bc-segmented__opt" :class="{ 'bc-segmented__opt--active': borderStyle === 'solid' }" @click="setBorderStyle('solid')">Solid</button>
            <button type="button" class="bc-segmented__opt" :class="{ 'bc-segmented__opt--active': borderStyle === 'dashed' }" @click="setBorderStyle('dashed')">Dashed</button>
          </div>
          <template v-if="borderStyle !== 'none'">
            <label class="glass-label">Width — {{ borderWidth }}px</label>
            <input type="range" min="1" max="8" v-model.number="borderWidth" class="bc-range" />
            <label class="glass-label">Color</label>
            <input type="color" v-model="borderColor" class="bc-color" />
          </template>
        </div>
      </section>

      <!-- Shadows -->
      <section class="bc-section">
        <button type="button" class="bc-section__head" @click="toggle('shadows')">
          <span>Shadows</span>
          <BcIcon name="chevron-down" :size="14" :class="{ 'bc-rot': !open.shadows }" />
        </button>
        <div v-show="open.shadows" class="bc-section__body">
          <div v-for="s in shadows" :key="s.id" class="bc-shadow-card">
            <div class="bc-shadow-card__row">
              <input type="color" :value="s.color" class="bc-color bc-color--sm" @input="store.updateShadowLayer(s.id, { color: ($event.target as HTMLInputElement).value })" />
              <label class="bc-toggle bc-toggle--sm"><input type="checkbox" :checked="s.inset" @change="store.updateShadowLayer(s.id, { inset: ($event.target as HTMLInputElement).checked })" /> Inset</label>
              <button type="button" class="bc-icon-btn" @click="store.removeShadowLayer(s.id)"><BcIcon name="trash" :size="13" /></button>
            </div>
            <div class="bc-grid4">
              <label class="bc-field bc-field--tiny"><span class="glass-label">X</span><input type="number" :value="s.x" class="glass-field bc-field--num" @input="store.updateShadowLayer(s.id, { x: Number(($event.target as HTMLInputElement).value) })" /></label>
              <label class="bc-field bc-field--tiny"><span class="glass-label">Y</span><input type="number" :value="s.y" class="glass-field bc-field--num" @input="store.updateShadowLayer(s.id, { y: Number(($event.target as HTMLInputElement).value) })" /></label>
              <label class="bc-field bc-field--tiny"><span class="glass-label">Blur</span><input type="number" :value="s.blur" min="0" class="glass-field bc-field--num" @input="store.updateShadowLayer(s.id, { blur: Number(($event.target as HTMLInputElement).value) })" /></label>
              <label class="bc-field bc-field--tiny"><span class="glass-label">Spread</span><input type="number" :value="s.spread" class="glass-field bc-field--num" @input="store.updateShadowLayer(s.id, { spread: Number(($event.target as HTMLInputElement).value) })" /></label>
            </div>
          </div>
          <button type="button" class="glass-chip" @click="store.addShadowLayer()"><BcIcon name="plus" :size="12" /> Add shadow layer</button>
        </div>
      </section>

      <!-- Typography -->
      <section class="bc-section">
        <button type="button" class="bc-section__head" @click="toggle('typography')">
          <span>Typography</span>
          <BcIcon name="chevron-down" :size="14" :class="{ 'bc-rot': !open.typography }" />
        </button>
        <div v-show="open.typography" class="bc-section__body">
          <label class="glass-label">Font size — {{ fontSize }}px</label>
          <input type="range" min="11" max="28" v-model.number="fontSize" class="bc-range" />
          <label class="glass-label">Font weight — {{ fontWeight }}</label>
          <input type="range" min="400" max="800" step="100" v-model.number="fontWeight" class="bc-range" />
          <label class="glass-label">Letter spacing — {{ letterSpacing }}px</label>
          <input type="range" min="-1" max="2" step="0.1" v-model.number="letterSpacing" class="bc-range" />
          <label class="glass-label">Text color</label>
          <input type="color" v-model="textColor" class="bc-color" />
          <label class="glass-label">Text transform</label>
          <select v-model="textTransform" class="glass-field glass-select">
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>
      </section>
    </template>
  </aside>
</template>

<style scoped>
.bc-props {
  height: 100%;
  overflow-y: auto;
  padding: 12rem 14rem 40rem;
}
.bc-section { border-bottom: 1px solid var(--color-divider); padding: 4rem 0; }
.bc-section:last-child { border-bottom: none; }
.bc-section__head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rem 6rem;
  font-size: 13rem;
  font-weight: 600;
  color: var(--color-text);
}
.bc-section__head svg { transition: transform 0.18s ease; opacity: 0.6; }
.bc-section__head svg.bc-rot { transform: rotate(-90deg); }
.bc-section__body {
  display: flex;
  flex-direction: column;
  gap: 8rem;
  padding: 4rem 6rem 16rem;
}
.bc-hint { font-size: 11.5rem; opacity: 0.55; line-height: 1.4; margin-bottom: 4rem; }

.bc-range {
  width: 100%;
  accent-color: var(--color-accent);
  height: 18rem;
}
.bc-color {
  width: 100%;
  height: 38rem;
  border-radius: 10rem;
  border: 1px solid var(--color-glass-border);
  background: none;
  padding: 3rem;
  cursor: pointer;
}
.bc-color--sm { width: 38rem; height: 34rem; flex-shrink: 0; }

.bc-toggle { display: flex; align-items: center; gap: 8rem; font-size: 13rem; color: var(--color-text); cursor: pointer; }
.bc-toggle--sm { font-size: 12rem; opacity: 0.8; }
.bc-toggle input { accent-color: var(--color-accent); width: 15rem; height: 15rem; }

.bc-generate-btn { width: 100%; margin-top: 6rem; }

.bc-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10rem; }
.bc-grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6rem; margin-top: 8rem; }
.bc-field { display: flex; flex-direction: column; gap: 4rem; }
.bc-field--full { grid-column: 1 / -1; }
.bc-field--tiny .glass-label { font-size: 9.5rem; }
.bc-field--num { padding: 8rem 8rem; font-size: 12rem; }

.bc-segmented {
  display: flex;
  border: 1px solid var(--color-glass-border);
  border-radius: 10rem;
  overflow: hidden;
  margin-bottom: 4rem;
}
.bc-segmented__opt {
  flex: 1;
  padding: 8rem 6rem;
  font-size: 12rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.55;
  text-align: center;
  white-space: nowrap;
}
.bc-segmented__opt--active { opacity: 1; background: var(--color-glass-bg-hover); }

.bc-stop-row { display: flex; align-items: center; gap: 8rem; }
.bc-stop-row .bc-field--num { flex: 1; }

.bc-shadow-card {
  border: 1px solid var(--color-glass-border);
  border-radius: 12rem;
  padding: 10rem;
  margin-bottom: 8rem;
}
.bc-shadow-card__row { display: flex; align-items: center; gap: 10rem; margin-bottom: 4rem; }
.bc-shadow-card__row .bc-toggle { flex: 1; }

.bc-icon-btn {
  width: 28rem;
  height: 28rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rem;
  color: var(--color-text);
  opacity: 0.6;
  flex-shrink: 0;
}
.bc-icon-btn:hover { opacity: 1; background: var(--color-glass-bg); }
.bc-icon-btn:disabled { opacity: 0.25; cursor: not-allowed; }
</style>

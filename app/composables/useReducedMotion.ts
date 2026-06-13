import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'

export type DeviceTier = 'high' | 'mid' | 'low'

interface MotionState {
  prefersReducedMotion: Ref<boolean>
  deviceTier: Ref<DeviceTier>
  /** Whether the heavy Three.js background should run */
  enableThree: ComputedRef<boolean>
  /** Whether per-panel idle floating should run */
  enableFloat: ComputedRef<boolean>
  /** Whether the spiral should animate at all (vs. render static) */
  enableSpiral: ComputedRef<boolean>
  isTouch: Ref<boolean>
}

let singleton: MotionState | null = null

/**
 * Centralises motion + device-capability decisions. Defaults are SSR-safe
 * (assume capable desktop); real values are measured in onMounted on the client.
 */
export function useReducedMotion(): MotionState {
  if (singleton) return singleton

  const prefersReducedMotion = ref(false)
  const deviceTier = ref<DeviceTier>('high')
  const isTouch = ref(false)

  onMounted(() => {
    prefersReducedMotion.value = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    isTouch.value = window.matchMedia('(pointer: coarse)').matches

    // Crude device tiering from hardware hints.
    const cores = navigator.hardwareConcurrency ?? 8
    // @ts-expect-error deviceMemory is non-standard but widely supported
    const mem: number = navigator.deviceMemory ?? 8
    const narrow = window.innerWidth < 640

    if (narrow || cores <= 4 || mem < 4) deviceTier.value = 'low'
    else if (cores <= 8 || mem < 8) deviceTier.value = 'mid'
    else deviceTier.value = 'high'
  })

  const enableThree = computed(
    () => !prefersReducedMotion.value && deviceTier.value !== 'low',
  )
  const enableFloat = computed(() => !prefersReducedMotion.value)
  const enableSpiral = computed(() => !prefersReducedMotion.value)

  singleton = {
    prefersReducedMotion,
    deviceTier,
    enableThree,
    enableFloat,
    enableSpiral,
    isTouch,
  }
  return singleton
}

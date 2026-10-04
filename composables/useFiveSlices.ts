/**
 * Open state for the 5 Slices overlay.
 * One shared flag so the masthead, /slices, and the dialog agree.
 * The trigger element stays off useState — it must not be serialized.
 */
const trigger = shallowRef<HTMLElement | null>(null)

export function useFiveSlices() {
  const route = useRoute()
  // Factory runs once per request. A direct /slices visit starts open,
  // including on the server, before the dialog paints.
  const open = useState('five-slices-open', () => route.path === '/slices')

  function rememberTrigger(from?: EventTarget | null) {
    if (from instanceof HTMLElement) trigger.value = from
  }

  function openSlices(from?: EventTarget | null) {
    rememberTrigger(from)
    if (open.value) return
    open.value = true
  }

  function closeSlices() {
    open.value = false
    if (!import.meta.client) return
    nextTick(() => trigger.value?.focus())
  }

  return { open, trigger, rememberTrigger, openSlices, closeSlices }
}

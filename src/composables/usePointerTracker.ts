import { computed } from 'vue'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'

export interface PointerState {
  /** Normalised −1…1, relative to the viewport centre. */
  x: number
  y: number
  /** Same values run through a spring — this is what scenes should read. */
  smoothX: number
  smoothY: number
  hasPointer: boolean
}

interface UsePointerTrackerOptions {
  /** 0…1 per frame. Lower is heavier. */
  damping?: number
}

/**
 * Tracks the pointer as a damped value.
 *
 * Scenes read `smoothX`/`smoothY` rather than the raw position, which is what
 * keeps the character's gaze and the orbs from snapping — they lag slightly
 * behind the cursor and settle, the way something with mass would.
 *
 * The returned object is deliberately plain rather than reactive: it is read
 * inside render loops, and going through Vue's reactivity there would mean a
 * dependency notification every frame for no benefit. That is also why this
 * is not `useMouse` from VueUse — VueUse here only owns the listener
 * lifecycle, not the value.
 */
export const usePointerTracker = (options: UsePointerTrackerOptions = {}) => {
  const { damping = 0.06 } = options
  const uiStore = useUiStore()

  // A finger is not a hovering cursor: on touch there is nothing to follow.
  const canHover = useMediaQuery('(hover: hover)')
  const isEnabled = computed(() => canHover.value && !uiStore.prefersReducedMotion)

  const pointer: PointerState = {
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
    hasPointer: false
  }

  const handlePointerMove = (event: PointerEvent): void => {
    if (!isEnabled.value) return

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    pointer.hasPointer = true
  }

  const handlePointerLeave = (): void => {
    pointer.x = 0
    pointer.y = 0
    pointer.hasPointer = false
  }

  /** Call once per frame from the scene's update callback. */
  const advance = (): PointerState => {
    pointer.smoothX += (pointer.x - pointer.smoothX) * damping
    pointer.smoothY += (pointer.y - pointer.smoothY) * damping
    return pointer
  }

  useEventListener(window, 'pointermove', handlePointerMove, { passive: true })
  useEventListener(document, 'pointerleave', handlePointerLeave)

  return { pointer, advance }
}

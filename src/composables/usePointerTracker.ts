import { computed } from 'vue'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'

export interface PointerState {
  /** Normalised −1…1, relative to the viewport centre. */
  x: number
  y: number
  /** The same values lagged by `advance()`. Only meaningful if you call it. */
  smoothX: number
  smoothY: number
  hasPointer: boolean
}

interface UsePointerTrackerOptions {
  /** 0…1 per frame. Lower is heavier. */
  damping?: number
}

/**
 * Tracks the pointer, optionally as a damped value.
 *
 * `advance()` lags the position so a scene reading `smoothX`/`smoothY` settles
 * the way something with mass would instead of snapping — the tech-stack pit
 * uses it that way. It is a plain per-frame lerp and therefore **frame-rate
 * dependent**, so a scene that already damps with a delta (`MathUtils.damp`,
 * a spring) should read raw `x`/`y` and not call `advance()` at all. Stacking
 * both is how the peek figure's head ended up a third of a second behind the
 * cursor.
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

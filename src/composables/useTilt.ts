import { computed, onBeforeUnmount, type Ref } from 'vue'
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'

interface UseTiltOptions {
  /** Maximum rotation in degrees on each axis. */
  maxAngle?: number
}

/**
 * Publishes the pointer's position over an element as CSS custom properties,
 * so the card itself can decide what to do with them:
 *
 *   --nx-tilt-x / --nx-tilt-y   rotation in degrees
 *   --nx-px / --nx-py           0…100% pointer position, for highlights
 *
 * Doing it in CSS keeps the effect on the compositor and avoids a Vue update
 * per pointer event. Disabled entirely under reduced motion and on devices
 * without a hovering pointer.
 */
export const useTilt = (element: Ref<HTMLElement | null>, options: UseTiltOptions = {}) => {
  const { maxAngle = 4 } = options
  const uiStore = useUiStore()

  // A finger is not a hovering cursor: on touch there is nothing to follow.
  const canHover = useMediaQuery('(hover: hover)')
  const isEnabled = computed(() => canHover.value && !uiStore.prefersReducedMotion)

  let frame = 0
  let pendingEvent: PointerEvent | null = null

  const apply = (): void => {
    frame = 0
    const target = element.value
    const event = pendingEvent
    if (!target || !event) return

    const rect = target.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height

    target.style.setProperty('--nx-tilt-y', `${(px - 0.5) * 2 * maxAngle}deg`)
    target.style.setProperty('--nx-tilt-x', `${(0.5 - py) * 2 * maxAngle}deg`)
    target.style.setProperty('--nx-px', `${(px * 100).toFixed(1)}%`)
    target.style.setProperty('--nx-py', `${(py * 100).toFixed(1)}%`)
  }

  const handlePointerMove = (event: PointerEvent): void => {
    if (!isEnabled.value) return

    pendingEvent = event
    if (frame !== 0) return
    frame = requestAnimationFrame(apply)
  }

  const handlePointerLeave = (): void => {
    const target = element.value
    if (!target) return

    target.style.setProperty('--nx-tilt-x', '0deg')
    target.style.setProperty('--nx-tilt-y', '0deg')
  }

  useEventListener(element, 'pointermove', handlePointerMove, { passive: true })
  useEventListener(element, 'pointerleave', handlePointerLeave)

  onBeforeUnmount(() => {
    if (frame !== 0) cancelAnimationFrame(frame)
  })
}

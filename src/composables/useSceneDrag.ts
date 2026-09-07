import { ref, type Ref } from 'vue'

/**
 * Turning a 3D scene by dragging it.
 *
 * Movement is handed to the scene as a fraction of the stage rather than in
 * pixels, so the same gesture turns an object by the same amount on a phone and
 * on a wide monitor. The pointer is captured, which is what keeps the drag alive
 * when it leaves the canvas mid-gesture.
 *
 * Both the LED sign and the hero character are dragged this way; the scene
 * itself decides what a turn means and where it stops.
 */

/** What a draggable scene has to offer. Implemented by `LedSign` and `HeroCharacter`. */
export interface DraggableSceneProps {
  /** Takes hold: the idle motion keeps running, the spring stops pulling. */
  beginDrag: () => void
  /** Turns the scene, in fractions of the stage — `1` is a drag across its full width. */
  dragBy: (fractionX: number, fractionY: number) => void
  /** Lets go. Whatever speed the drag had carries into the spring. */
  endDrag: () => void
}

interface UseSceneDragOptions {
  /** The element the gesture is measured against — the stage, not the canvas. */
  container: Ref<HTMLElement | null>
  /** Resolves to the scene being dragged, or null before it exists. */
  target: () => DraggableSceneProps | null
}

export const useSceneDrag = (options: UseSceneDragOptions) => {
  const { container, target } = options

  const isDragging = ref(false)
  let lastPointerX = 0
  let lastPointerY = 0

  const handlePointerDown = (event: PointerEvent): void => {
    const scene = target()
    if (!scene) return

    isDragging.value = true
    lastPointerX = event.clientX
    lastPointerY = event.clientY

    scene.beginDrag()
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent): void => {
    const scene = target()
    const element = container.value
    if (!isDragging.value || !scene || !element) return

    const bounds = element.getBoundingClientRect()

    scene.dragBy(
      (event.clientX - lastPointerX) / Math.max(bounds.width, 1),
      (event.clientY - lastPointerY) / Math.max(bounds.height, 1)
    )

    lastPointerX = event.clientX
    lastPointerY = event.clientY
  }

  const handlePointerUp = (): void => {
    if (!isDragging.value) return

    isDragging.value = false
    target()?.endDrag()
  }

  return {
    isDragging,
    /** Spread onto the stage element with `v-on`. */
    dragHandlers: {
      pointerdown: handlePointerDown,
      pointermove: handlePointerMove,
      pointerup: handlePointerUp,
      pointercancel: handlePointerUp
    }
  }
}

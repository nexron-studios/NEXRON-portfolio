<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { createSceneLighting } from '@/three/lighting'
import { createLedSign, type LedSign } from '@/three/ledSign'
import { useUiStore } from '@/stores/ui'

/**
 * The NEXRON LED sign, turning slowly in chrome.
 *
 * The model file is four megabytes, so the component is mounted only once the
 * block is near the viewport — that gate sits in `AboutSection`, since a
 * component cannot defer its own creation.
 */
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const signRef = shallowRef<LedSign | null>(null)

const uiStore = useUiStore()

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, renderer, isCompact } = context

  camera.position.set(0, 0, isCompact ? 5.2 : 4.4)
  camera.lookAt(0, 0, 0)

  scene.add(createSceneLighting())

  // The model lands well after the frame drawn on mount. With reduced motion
  // there is no loop to pick it up, so the scene is asked for one more frame.
  const sign = createLedSign(renderer, { onLoaded: () => renderOnce() })
  signRef.value = sign
  scene.add(sign.group)

  // `useThreeScene` renders exactly one frame and starts no loop under reduced
  // motion, and the model usually lands after that frame — `rest` therefore
  // sets the pose now and again when the file arrives.
  if (uiStore.prefersReducedMotion) sign.rest()

  const update = (elapsed: number, delta: number): void => {
    sign.update(elapsed, delta)
  }

  const dispose = (): void => {
    sign.dispose()
    signRef.value = null
  }

  return { update, dispose }
}

/**
 * Dragging turns the sign, and letting go lets it drift back onto its idle
 * path over a few seconds.
 *
 * Movement is handed over as a fraction of the stage rather than in pixels, so
 * the same gesture turns the sign by the same amount on a phone and on a wide
 * monitor. The pointer is captured, which is what keeps the drag alive when it
 * leaves the canvas mid-gesture.
 */
const isDragging = ref(false)
let lastPointerX = 0
let lastPointerY = 0

const handleDragStart = (event: PointerEvent): void => {
  const sign = signRef.value
  if (!sign) return

  isDragging.value = true
  lastPointerX = event.clientX
  lastPointerY = event.clientY

  sign.beginDrag()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

const handleDragMove = (event: PointerEvent): void => {
  const sign = signRef.value
  const element = container.value
  if (!isDragging.value || !sign || !element) return

  const bounds = element.getBoundingClientRect()

  sign.dragBy(
    (event.clientX - lastPointerX) / Math.max(bounds.width, 1),
    (event.clientY - lastPointerY) / Math.max(bounds.height, 1)
  )

  lastPointerX = event.clientX
  lastPointerY = event.clientY
}

const handleDragEnd = (): void => {
  if (!isDragging.value) return

  isDragging.value = false
  signRef.value?.endDrag()
}

const { renderOnce } = useThreeScene({ container, canvas, setup: setupScene, fov: 40 })
</script>

<template>
  <!--
    `touch-action: pan-y` and not `none`: a vertical swipe has to keep scrolling
    the page, or the sign becomes a trap on a phone. Horizontal drags are ours.
  -->
  <div
    ref="container"
    class="relative h-full w-full touch-pan-y select-none"
    :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    @pointerdown="handleDragStart"
    @pointermove="handleDragMove"
    @pointerup="handleDragEnd"
    @pointercancel="handleDragEnd"
  >
    <canvas ref="canvas" class="h-full w-full" />
  </div>
</template>

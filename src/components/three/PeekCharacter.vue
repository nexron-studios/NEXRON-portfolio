<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { usePointerTracker } from '@/composables/usePointerTracker'
import { createCharacterLighting, type CharacterLightingProps } from '@/three/lighting'
import { createPeekCharacter, type PeekCharacter } from '@/three/peekCharacter'
import { revealProgress } from '@/utils/reveal'
import { useUiStore } from '@/stores/ui'

/**
 * The figure that rises from behind a panel as its slot scrolls into view.
 *
 * It fills whatever box the section gives it, the way every other scene here
 * does — the section owns the position and the clipping edge, because the edge
 * is a different element in each place it is used.
 */
const FOV = 38
const CAMERA_DISTANCE = 3.4

/**
 * How much world the camera sees vertically at the origin. Fixed by the fov and
 * the distance and independent of the canvas aspect, which is what lets the
 * scene size the figure against the frame instead of guessing at a scale.
 */
const VIEW_HEIGHT = 2 * CAMERA_DISTANCE * Math.tan((FOV * Math.PI) / 360)

const uiStore = useUiStore()
const { advance } = usePointerTracker({ damping: 0.08 })

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const figureRef = shallowRef<PeekCharacter | null>(null)
const lightingRef = shallowRef<CharacterLightingProps | null>(null)

const { top, height } = useElementBounding(container)
const { height: viewportHeight } = useWindowSize()

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, renderer } = context

  camera.position.set(0, 0, CAMERA_DISTANCE)
  camera.lookAt(0, 0, 0)

  const lighting = createCharacterLighting(uiStore.theme)
  lightingRef.value = lighting
  scene.add(lighting.group)

  // The model lands after the frame drawn on mount. With reduced motion there is
  // no loop to pick it up, so the scene is asked for one more frame.
  const figure = createPeekCharacter(renderer, {
    viewHeight: VIEW_HEIGHT,
    onLoaded: () => {
      figure.setProgress(currentProgress())
      renderOnce()
    }
  })
  figureRef.value = figure
  scene.add(figure.group)

  if (uiStore.prefersReducedMotion) figure.rest()

  const update = (elapsed: number, delta: number): void => {
    const { smoothX, smoothY } = advance()
    figure.update(elapsed, delta, smoothX, smoothY)
  }

  const dispose = (): void => {
    figure.dispose()
    figureRef.value = null
    lightingRef.value = null
  }

  return { update, dispose }
}

const currentProgress = (): number => revealProgress(top.value, height.value, viewportHeight.value)

const { isReady, renderOnce } = useThreeScene({
  container,
  canvas,
  setup: setupScene,
  fov: FOV
})

// Scrubbed, not triggered: the rise follows the scroll position both ways.
// `useElementBounding` already coalesces its reads, so this is not per-frame.
watch([top, height, viewportHeight], () => {
  figureRef.value?.setProgress(currentProgress())
  // Under reduced motion no loop runs, so a moved figure needs a frame asking for.
  if (uiStore.prefersReducedMotion) renderOnce()
})

watch(
  () => uiStore.theme,
  (theme) => lightingRef.value?.setTheme(theme)
)
</script>

<template>
  <!--
    `pointer-events-none`: the figure sits behind the panel and must never take a
    click off the form or the terminal in front of it.
  -->
  <div ref="container" class="pointer-events-none h-full w-full">
    <canvas
      ref="canvas"
      class="h-full w-full transition-opacity duration-700"
      :class="isReady ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    />
  </div>
</template>

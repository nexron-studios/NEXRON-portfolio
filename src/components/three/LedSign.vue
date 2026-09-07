<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { useSceneDrag } from '@/composables/useSceneDrag'
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
 * path over a few seconds. The gesture itself is shared with the hero stage —
 * see `useSceneDrag`.
 */
const { isDragging, dragHandlers } = useSceneDrag({ container, target: () => signRef.value })

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
    v-on="dragHandlers"
  >
    <canvas ref="canvas" class="h-full w-full" />
  </div>
</template>

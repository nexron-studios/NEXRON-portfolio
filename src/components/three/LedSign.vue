<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { Vector3 } from 'three'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { useSceneDrag } from '@/composables/useSceneDrag'
import { useModelLoadState } from '@/composables/useModelLoadState'
import { createSceneLighting } from '@/three/lighting'
import { createLedSign, SIGN_HALF_HEIGHT, SIGN_HALF_WIDTH, type LedSign } from '@/three/ledSign'
import { STAGE_BLEED, bleedRadius, fitBoxDistance } from '@/utils/framing'
import { useUiStore } from '@/stores/ui'
import NxrSceneLoader from '@/components/ui/NxrSceneLoader.vue'

/**
 * The NEXRON LED sign, turning slowly in chrome.
 *
 * The model file is four megabytes, so the component is mounted only once the
 * block is near the viewport — that gate sits in `AboutSection`, since a
 * component cannot defer its own creation.
 */
const FOV = 40

/** Breathing room around the plate. At 1 its edges touch the box. */
const FRAMING_MARGIN = 1.05

const fitCamera = (aspect: number): number =>
  fitBoxDistance(
    bleedRadius(SIGN_HALF_WIDTH),
    bleedRadius(SIGN_HALF_HEIGHT),
    FOV,
    aspect,
    FRAMING_MARGIN
  )

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const signRef = shallowRef<LedSign | null>(null)

const uiStore = useUiStore()

const { isModelLoading, isModelReady, markLoaded, markFailed } = useModelLoadState()

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, renderer } = context

  camera.position.set(0, 0, fitCamera(1))
  camera.lookAt(0, 0, 0)

  scene.add(createSceneLighting())

  // The model lands well after the frame drawn on mount. With reduced motion
  // there is no loop to pick it up, so the scene is asked for one more frame.
  const sign = createLedSign(renderer, {
    onLoaded: () => {
      markLoaded()
      renderOnce()
    },
    onLoadFailed: markFailed
  })
  signRef.value = sign
  scene.add(sign.group)

  // Fit the current rotated plate including depth. A flat box alone clips the
  // near corners when yaw and tilt combine in a wide, short stage.
  const corners = [-1, 1].flatMap((x) =>
    [-1, 1].flatMap((y) =>
      [-1, 1].map((z) => new Vector3(x * SIGN_HALF_WIDTH, y * SIGN_HALF_HEIGHT, z * 0.25))
    )
  )
  const corner = new Vector3()
  const render = (): void => {
    const tangentY = Math.tan((FOV * Math.PI) / 360)
    const tangentX = tangentY * camera.aspect
    let distance = fitCamera(camera.aspect)
    for (const point of corners) {
      corner.copy(point).applyEuler(sign.group.rotation)
      distance = Math.max(
        distance,
        corner.z + (FRAMING_MARGIN * Math.abs(corner.x)) / tangentX,
        corner.z + (FRAMING_MARGIN * Math.abs(corner.y)) / tangentY
      )
    }
    camera.position.z = distance
    renderer.render(scene, camera)
  }

  // `useThreeScene` renders exactly one frame and starts no loop under reduced
  // motion, and the model usually lands after that frame — `rest` therefore
  // sets the pose now and again when the file arrives.
  if (uiStore.prefersReducedMotion) sign.rest()

  const update = (elapsed: number, delta: number): void => {
    sign.update(elapsed, delta)
  }

  // The camera backs off by whichever axis is tighter, as the hero does. This
  // used to be a binary `isCompact ? 5.2 : 4.4`, which happened to work only
  // because the flag was keyed to the container and this box is narrow on
  // every desktop. The canvas overhangs the box by `STAGE_BLEED`, so the sign
  // is fitted to the box and has the overhang to tilt into.
  const resize = (width: number, height: number): void => {
    const aspect = width / Math.max(height, 1)
    camera.position.z = fitCamera(aspect)
    camera.updateProjectionMatrix()
  }

  const dispose = (): void => {
    sign.dispose()
    signRef.value = null
  }

  return { update, resize, render, dispose }
}

/**
 * Dragging turns the sign, and letting go lets it drift back onto its idle
 * path over a few seconds. The gesture itself is shared with the hero stage —
 * see `useSceneDrag`.
 */
const { isDragging, dragHandlers } = useSceneDrag({
  container,
  bleed: STAGE_BLEED,
  target: () => signRef.value
})

const { renderOnce } = useThreeScene({ container, canvas, setup: setupScene, fov: FOV })
</script>

<template>
  <!--
    `touch-action: pan-y` and not `none`: a vertical swipe has to keep scrolling
    the page, or the sign becomes a trap on a phone. Horizontal drags are ours.
  -->
  <div
    ref="container"
    class="absolute -inset-[20%] touch-pan-y select-none"
    :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    v-on="dragHandlers"
  >
    <canvas
      ref="canvas"
      class="h-full w-full transition-opacity duration-700"
      :class="isModelReady ? 'opacity-100' : 'opacity-0'"
    />

    <!-- The bleed is symmetric, so the loader centres on the stage box too. -->
    <Transition name="fade">
      <NxrSceneLoader v-if="isModelLoading" />
    </Transition>
  </div>
</template>

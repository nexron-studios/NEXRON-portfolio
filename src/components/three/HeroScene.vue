<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useThreeScene,
  COMPACT_BREAKPOINT,
  type SceneContext,
  type SceneHandle
} from '@/composables/useThreeScene'
import { usePointerTracker } from '@/composables/usePointerTracker'
import { createSceneLighting } from '@/three/lighting'
import { createHeroCube, type HeroCube } from '@/three/heroCube'
import { useUiStore } from '@/stores/ui'

/**
 * Hero stage: the NEXRON cube, turning slowly and leaning toward the cursor.
 */
/** Camera distance at rest, before the aspect-ratio correction in `resize`. */
const CAMERA_DISTANCE = 4.2
const CAMERA_DISTANCE_COMPACT = 5

const uiStore = useUiStore()
const { t } = useI18n()
const { advance } = usePointerTracker({ damping: 0.06 })

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const cubeRef = shallowRef<HeroCube | null>(null)

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, renderer, isCompact } = context

  camera.position.set(0, 0, isCompact ? CAMERA_DISTANCE_COMPACT : CAMERA_DISTANCE)
  camera.lookAt(0, 0, 0)

  scene.add(createSceneLighting())

  const cube = createHeroCube(renderer, uiStore.theme)
  cubeRef.value = cube
  scene.add(cube.group)

  // `useThreeScene` renders exactly one frame and starts no loop under reduced
  // motion, so the pose that frame catches has to be set deliberately —
  // otherwise the cube is caught face-on and reads as a flat square.
  if (uiStore.prefersReducedMotion) cube.rest()

  const update = (elapsed: number): void => {
    const { smoothX, smoothY } = advance()
    cube.update(elapsed, smoothX, smoothY)
  }

  const resize = (width: number, height: number): void => {
    // Wide-and-short stages crop the cube unless the camera backs off, so
    // distance follows the aspect ratio rather than a breakpoint alone.
    const aspect = width / Math.max(height, 1)
    const base = width < COMPACT_BREAKPOINT ? CAMERA_DISTANCE_COMPACT : CAMERA_DISTANCE
    camera.position.z = aspect > 1.1 ? base * Math.min(aspect, 1.5) : base
    camera.updateProjectionMatrix()
  }

  const dispose = (): void => {
    cube.dispose()
    cubeRef.value = null
  }

  return { update, resize, dispose }
}

watch(
  () => uiStore.theme,
  (theme) => cubeRef.value?.setTheme(theme)
)

const { isReady } = useThreeScene({
  container,
  canvas,
  setup: setupScene,
  fov: 40
})
</script>

<template>
  <div ref="container" class="relative h-full w-full">
    <canvas
      ref="canvas"
      class="h-full w-full transition-opacity duration-700"
      :class="isReady ? 'opacity-100' : 'opacity-0'"
      role="img"
      :aria-label="t('hero.scene_alt')"
    />
  </div>
</template>

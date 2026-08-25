<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Group, MathUtils, type Object3D } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import {
  useThreeScene,
  COMPACT_BREAKPOINT,
  type SceneContext,
  type SceneHandle
} from '@/composables/useThreeScene'
import { usePointerTracker } from '@/composables/usePointerTracker'
import { createSceneLighting } from '@/three/lighting'
import { createVoxelCharacter, type VoxelCharacter } from '@/three/voxelCharacter'
import { useUiStore } from '@/stores/ui'

/**
 * Hero stage.
 *
 * Renders the procedural voxel figure and, if `/models/jonas.glb` has been
 * added, replaces it with that model instead. Nothing else needs changing to
 * swap the character — drop the file in `public/models/` and reload.
 */
const MODEL_URL = '/models/jonas.glb'

/** Camera distance at rest, before the aspect-ratio correction in `resize`. */
const CAMERA_DISTANCE = 4.0
const CAMERA_DISTANCE_COMPACT = 4.6

const uiStore = useUiStore()
const { t } = useI18n()
const { advance } = usePointerTracker({ damping: 0.05 })

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const isModelLoaded = ref(false)

const characterRef = shallowRef<VoxelCharacter | null>(null)
const stageRef = shallowRef<Group | null>(null)
const loadedModelRef = shallowRef<Object3D | null>(null)

/**
 * Tries the custom model without letting a missing file surface as a console
 * error: a HEAD request first, then the loader only if something is there.
 */
const tryLoadCustomModel = async (stage: Group, character: VoxelCharacter): Promise<void> => {
  try {
    const probe = await fetch(MODEL_URL, { method: 'HEAD' })
    if (!probe.ok) return

    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(MODEL_URL)

    stage.remove(character.group)
    character.dispose()
    characterRef.value = null

    gltf.scene.traverse((object) => {
      object.castShadow = true
      object.receiveShadow = true
    })

    stage.add(gltf.scene)
    loadedModelRef.value = gltf.scene
    isModelLoaded.value = true
  } catch {
    // No model yet — the voxel placeholder stays, which is a valid state.
  }
}

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, isCompact } = context

  camera.position.set(0, 0.15, isCompact ? CAMERA_DISTANCE_COMPACT : CAMERA_DISTANCE)
  camera.lookAt(0, 0, 0)

  scene.add(createSceneLighting())

  const stage = new Group()
  stage.rotation.y = -0.35
  scene.add(stage)
  stageRef.value = stage

  const character = createVoxelCharacter(0.1)
  characterRef.value = character
  stage.add(character.group)

  void tryLoadCustomModel(stage, character)

  const update = (elapsed: number): void => {
    const { smoothX, smoothY } = advance()

    // Idle: a slow drift plus a shallow bob, so it reads as alive without
    // ever becoming a spinning-logo animation.
    stage.rotation.y = -0.35 + Math.sin(elapsed * 0.28) * 0.22 + smoothX * 0.34
    stage.position.y = Math.sin(elapsed * 0.7) * 0.045

    const character = characterRef.value
    if (!character) return

    // The head leads the body toward the cursor — clamped so it never
    // reaches an angle a neck could not hold.
    character.head.rotation.y = MathUtils.clamp(smoothX * 0.5, -0.5, 0.5)
    character.head.rotation.x = MathUtils.clamp(-smoothY * 0.32, -0.28, 0.28)
  }

  const resize = (width: number, height: number): void => {
    // Wide-and-short stages crop the figure at the knees unless the camera
    // backs off, so distance follows the aspect ratio rather than a
    // breakpoint alone.
    const aspect = width / Math.max(height, 1)
    const base = width < COMPACT_BREAKPOINT ? CAMERA_DISTANCE_COMPACT : CAMERA_DISTANCE
    camera.position.z = aspect > 1.1 ? base * Math.min(aspect, 1.6) : base
    camera.updateProjectionMatrix()
  }

  const dispose = (): void => {
    characterRef.value?.dispose()
    characterRef.value = null
    stageRef.value = null
    loadedModelRef.value = null
  }

  return { update, resize, dispose }
}

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
      :aria-label="isModelLoaded ? t('hero.scene_alt_model') : t('hero.scene_alt')"
    />

    <!-- Provenance label: it should be obvious this is generated, not stock. -->
    <p
      v-if="!isModelLoaded && !uiStore.prefersReducedMotion"
      class="nx-meta pointer-events-none absolute bottom-3 left-3 text-ink-faint/70"
    >
      voxel · procedural
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Group } from 'three'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { usePointerTracker } from '@/composables/usePointerTracker'
import { createSceneLighting } from '@/three/lighting'
import { createVoxelCharacter, type VoxelCharacter } from '@/three/voxelCharacter'

/**
 * Lab module: the hero's character generator, exposed.
 *
 * Same builder as the hero placeholder — only the palette seed changes, which
 * is the point of showing it here.
 */
const MAX_SEED = 10_000

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const seed = ref(1)

const { t } = useI18n()

const stageRef = shallowRef<Group | null>(null)
const characterRef = shallowRef<VoxelCharacter | null>(null)

const { advance } = usePointerTracker({ damping: 0.07 })

const mountCharacter = (stage: Group, variantSeed: number): void => {
  const previous = characterRef.value
  if (previous) {
    stage.remove(previous.group)
    previous.dispose()
  }

  const character = createVoxelCharacter(0.1, variantSeed)
  stage.add(character.group)
  characterRef.value = character
}

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera } = context

  camera.position.set(0, 0.1, 4.4)
  camera.lookAt(0, 0, 0)
  scene.add(createSceneLighting())

  const stage = new Group()
  scene.add(stage)
  stageRef.value = stage

  mountCharacter(stage, seed.value)

  const update = (elapsed: number): void => {
    const { smoothX, smoothY } = advance()
    stage.rotation.y = elapsed * 0.35 + smoothX * 0.4
    stage.position.y = Math.sin(elapsed * 0.8) * 0.05

    const character = characterRef.value
    if (character) character.head.rotation.x = -smoothY * 0.2
  }

  const dispose = (): void => {
    characterRef.value?.dispose()
    characterRef.value = null
    stageRef.value = null
  }

  return { update, dispose }
}

useThreeScene({ container, canvas, setup: setupScene, fov: 40 })

watch(seed, (value) => {
  const stage = stageRef.value
  if (stage) mountCharacter(stage, value)
})

const regenerate = (): void => {
  seed.value = Math.floor(Math.random() * MAX_SEED) + 1
}
</script>

<template>
  <div ref="container" class="relative h-full w-full">
    <canvas ref="canvas" class="h-full w-full" />

    <button
      type="button"
      class="nx-meta absolute right-3 bottom-3 border border-line bg-void/80 px-3 py-1.5 text-ink-muted transition-colors hover:border-dev hover:text-dev"
      @click="regenerate"
    >
      {{ t('lab.regenerate') }}
    </button>
  </div>
</template>

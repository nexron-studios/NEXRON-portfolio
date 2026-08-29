<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { createSceneLighting } from '@/three/lighting'
import { createChromeMark, type ChromeMark } from '@/three/chromeMark'
import { useUiStore } from '@/stores/ui'

/**
 * The NEXRON mark, turning slowly in chrome.
 *
 * `useThreeScene` already renders exactly one frame and starts no loop when
 * reduced motion is requested, so the mark simply stands still — but the
 * angle it stands at is set here, because frame zero would otherwise show it
 * flat on and unreadable.
 */
const STILL_POSE_Y = 0.6
const STILL_POSE_X = 0.12

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const markRef = shallowRef<ChromeMark | null>(null)

const uiStore = useUiStore()

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, renderer, isCompact } = context

  camera.position.set(0, 0, isCompact ? 5.2 : 4.4)
  camera.lookAt(0, 0, 0)

  scene.add(createSceneLighting())

  const mark = createChromeMark(renderer)
  markRef.value = mark
  scene.add(mark.group)

  if (uiStore.prefersReducedMotion) {
    mark.group.rotation.set(STILL_POSE_X, STILL_POSE_Y, 0)
  }

  const update = (elapsed: number): void => {
    mark.update(elapsed)
  }

  const dispose = (): void => {
    mark.dispose()
    markRef.value = null
  }

  return { update, dispose }
}

useThreeScene({ container, canvas, setup: setupScene, fov: 40 })
</script>

<template>
  <div ref="container" class="relative h-full w-full">
    <canvas ref="canvas" class="h-full w-full" />
  </div>
</template>

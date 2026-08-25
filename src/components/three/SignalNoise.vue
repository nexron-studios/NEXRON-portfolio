<script setup lang="ts">
import { ref } from 'vue'
import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { usePointerTracker } from '@/composables/usePointerTracker'
import { DEV_HEX } from '@/three/palette'
import fragmentShader from '@/shaders/signalNoise.frag?raw'
import vertexShader from '@/shaders/fullscreen.vert?raw'

/**
 * Lab module: a fragment shader that assembles a blueprint grid out of noise
 * and lets it decay again. Pointing at it restores coherence locally.
 */
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const { advance } = usePointerTracker({ damping: 0.1 })

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera } = context

  camera.position.set(0, 0, 1)
  camera.lookAt(0, 0, 0)

  const geometry = new PlaneGeometry(2, 2)
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new Vector2(0.5, 0.5) },
      uColor: { value: new Color(DEV_HEX) }
    }
  })

  const plane = new Mesh(geometry, material)
  scene.add(plane)

  /** Scale the quad so it exactly fills the frustum at its depth. */
  const fitToView = (width: number, height: number): void => {
    const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z
    plane.scale.set((visibleHeight * (width / height)) / 2, visibleHeight / 2, 1)
  }

  const update = (elapsed: number): void => {
    const { smoothX, smoothY } = advance()
    material.uniforms.uTime!.value = elapsed
    // NDC (−1…1) → UV (0…1), which is what the shader samples in.
    ;(material.uniforms.uPointer!.value as Vector2).set(smoothX * 0.5 + 0.5, smoothY * 0.5 + 0.5)
  }

  const dispose = (): void => {
    geometry.dispose()
    material.dispose()
  }

  return { update, resize: fitToView, dispose }
}

useThreeScene({ container, canvas, setup: setupScene, fov: 60 })
</script>

<template>
  <div ref="container" class="h-full w-full">
    <canvas ref="canvas" class="h-full w-full" />
  </div>
</template>

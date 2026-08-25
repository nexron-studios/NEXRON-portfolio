<script setup lang="ts">
import { ref } from 'vue'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Vector2,
  Vector3
} from 'three'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { usePointerTracker } from '@/composables/usePointerTracker'
import { DEV_HEX } from '@/three/palette'
import fragmentShader from '@/shaders/particles.frag?raw'
import vertexShader from '@/shaders/particles.vert?raw'

/**
 * Lab module: a grid of shader points that parts around the cursor.
 *
 * The displacement happens in the vertex shader, so raising the particle
 * count costs GPU fill rate and nothing on the main thread.
 */
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const { advance } = usePointerTracker({ damping: 0.14 })

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, renderer, isCompact } = context

  camera.position.set(0, 0, 7)
  camera.lookAt(0, 0, 0)

  const columns = isCompact ? 44 : 88
  const rows = isCompact ? 26 : 46
  const spacing = 0.16

  const positions = new Float32Array(columns * rows * 3)
  let cursor = 0
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      positions[cursor] = (column - (columns - 1) / 2) * spacing
      positions[cursor + 1] = (row - (rows - 1) / 2) * spacing
      positions[cursor + 2] = 0
      cursor += 3
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPointer: { value: new Vector2(999, 999) },
      uPointerStrength: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      // Idle sits between dev and dev-dim: dark enough to read as a resting
      // grid, still clearly the same hue the cursor lights up.
      uColorIdle: { value: new Color(0x1f6d80) },
      uColorActive: { value: new Color(DEV_HEX) }
    }
  })

  const points = new Points(geometry, material)
  scene.add(points)

  const pointerWorld = new Vector3()

  const update = (elapsed: number): void => {
    const { smoothX, smoothY, hasPointer } = advance()

    pointerWorld.set(smoothX, smoothY, 0.5).unproject(camera).sub(camera.position).normalize()
    pointerWorld.multiplyScalar(-camera.position.z / pointerWorld.z).add(camera.position)

    material.uniforms.uTime!.value = elapsed
    material.uniforms.uPointerStrength!.value = hasPointer ? 1 : 0
    ;(material.uniforms.uPointer!.value as Vector2).set(pointerWorld.x, pointerWorld.y)
  }

  const resize = (): void => {
    material.uniforms.uPixelRatio!.value = renderer.getPixelRatio()
  }

  const dispose = (): void => {
    geometry.dispose()
    material.dispose()
  }

  return { update, resize, dispose }
}

useThreeScene({ container, canvas, setup: setupScene, fov: 45 })
</script>

<template>
  <div ref="container" class="h-full w-full">
    <canvas ref="canvas" class="h-full w-full" />
  </div>
</template>

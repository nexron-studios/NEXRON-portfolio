<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { Vector3 } from 'three'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { usePointerTracker } from '@/composables/usePointerTracker'
import { createSceneLighting } from '@/three/lighting'
import { createOrbField, type OrbField } from '@/three/orbField'
import { orbSkills } from '@/data/skills'
import type { OrbSkillProps } from '@/types/skill.type'

/**
 * The technology field.
 *
 * Labels are HTML positioned from the projected 3D coordinates rather than
 * 3D text: cheaper to render, selectable, and readable by a screen reader.
 * They are written straight to the DOM each frame — routing twelve transform
 * updates per frame through Vue's reactivity would be pure overhead.
 */
/** Clearance between an orb's silhouette and its label, in pixels. */
const LABEL_GAP_PX = 10
/** Below this the pointer ray is parallel to the plane and the divide blows up. */
const MIN_DEPTH = 0.001
/** The orb field is a summary, not the full list — phones show fewer still. */
const COMPACT_ORB_COUNT = 8

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const labelLayer = ref<HTMLElement | null>(null)

const fieldRef = shallowRef<OrbField | null>(null)
const labels = ref<Pick<OrbSkillProps, 'name' | 'domain'>[]>([])

const { pointer, advance } = usePointerTracker({ damping: 0.12 })

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, isCompact } = context

  camera.position.set(0, 0, isCompact ? 7 : 6)
  camera.lookAt(0, 0, 0)

  scene.add(createSceneLighting())

  const skills = isCompact ? orbSkills.slice(0, COMPACT_ORB_COUNT) : orbSkills
  const field = createOrbField(skills, camera, isCompact)
  fieldRef.value = field
  labels.value = skills.map((skill) => ({ name: skill.name, domain: skill.domain }))

  for (const orb of field.orbs) scene.add(orb.mesh)

  const pointerWorld = new Vector3()
  const projected = new Vector3()

  /** Pointer NDC → the world point on the z = 0 plane the orbs live in. */
  const projectPointer = (ndcX: number, ndcY: number): void => {
    pointerWorld.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize()
    const distance = -camera.position.z / pointerWorld.z
    pointerWorld.multiplyScalar(distance).add(camera.position)
  }

  const update = (elapsed: number, delta: number): void => {
    const { smoothX, smoothY, hasPointer } = advance()
    projectPointer(smoothX, smoothY)

    field.update(delta, elapsed, pointerWorld, hasPointer)

    const layer = labelLayer.value
    if (!layer) return

    const width = layer.clientWidth
    const height = layer.clientHeight
    const children = layer.children
    const halfFovTan = Math.tan((camera.fov * Math.PI) / 360)

    field.orbs.forEach((orb, index) => {
      const element = children.item(index)
      if (!(element instanceof HTMLElement)) return

      projected.copy(orb.mesh.position).project(camera)
      const x = (projected.x * 0.5 + 0.5) * width
      const y = (-projected.y * 0.5 + 0.5) * height

      // Sit the label clear of the sphere rather than on top of it: cyan text
      // on a cyan orb is invisible. The offset is the orb's own radius
      // converted to pixels at its current depth, so it stays correct as the
      // orb moves toward or away from the camera.
      const depth = Math.max(camera.position.z - orb.mesh.position.z, MIN_DEPTH)
      const radiusInPixels = (orb.radius * height) / (2 * halfFovTan * depth)
      const labelY = y + radiusInPixels + LABEL_GAP_PX

      element.style.transform = `translate3d(${x.toFixed(1)}px, ${labelY.toFixed(1)}px, 0) translate(-50%, 0)`
    })
  }

  const dispose = (): void => {
    field.dispose()
    fieldRef.value = null
  }

  return { update, dispose }
}

useThreeScene({ container, canvas, setup: setupScene, fov: 45 })
</script>

<template>
  <div ref="container" class="relative h-full w-full">
    <canvas ref="canvas" class="h-full w-full" />

    <!-- Label layer. aria-hidden because the same technologies are listed as
         real text below the scene — this is a second rendering of that list,
         not new information. -->
    <div ref="labelLayer" aria-hidden="true" class="pointer-events-none absolute inset-0">
      <span
        v-for="label in labels"
        :key="label.name"
        class="absolute top-0 left-0 font-mono text-[0.625rem] tracking-[0.16em] whitespace-nowrap uppercase"
        :class="label.domain === 'creative' ? 'text-creative' : 'text-dev'"
        style="text-shadow: 0 0 12px var(--color-void)"
      >
        {{ label.name }}
      </span>
    </div>
  </div>
</template>

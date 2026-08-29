<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Vector3 } from 'three'
import { useThreeScene, type SceneContext, type SceneHandle } from '@/composables/useThreeScene'
import { usePointerTracker } from '@/composables/usePointerTracker'
import { createSceneLighting } from '@/three/lighting'
import { createSkillPit, type SkillPit } from '@/three/skillPit'
import { pitSkills } from '@/data/skills'
import { skillDomainList, type SkillDomain } from '@/types/skill.type'
import { useUiStore } from '@/stores/ui'

/**
 * The tech stack as a ball pit.
 *
 * Four chambers, one per domain, each holding the technologies that belong to
 * it. The balls fall and stack under gravity, the cursor ploughs through them
 * and a click shoves them apart.
 *
 * The chamber labels are HTML rather than 3D text: cheaper and more readable.
 */
const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const pitRef = shallowRef<SkillPit | null>(null)

const uiStore = useUiStore()
const { t } = useI18n()
const { advance } = usePointerTracker({ damping: 0.2 })

const domainClass: Record<SkillDomain, string> = {
  dev: 'text-dev',
  ai: 'text-ai',
  creative: 'text-creative',
  infra: 'text-infra'
}

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, isCompact } = context

  // Close enough that the settled stack fills the frame — further back left
  // two thirds of the canvas as empty sky above the balls.
  camera.position.set(0, 0, isCompact ? 6.4 : 5)
  camera.lookAt(0, 0, 0)

  scene.add(createSceneLighting())

  const pit = createSkillPit(pitSkills, camera, uiStore.theme, isCompact)
  pitRef.value = pit
  scene.add(pit.group)

  const pointerWorld = new Vector3()

  /** Pointer NDC → the world point on the z = 0 plane the pit lives in. */
  const projectPointer = (ndcX: number, ndcY: number): void => {
    pointerWorld.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize()
    const distance = -camera.position.z / pointerWorld.z
    pointerWorld.multiplyScalar(distance).add(camera.position)
  }

  const update = (_elapsed: number, delta: number): void => {
    const { smoothX, smoothY, hasPointer } = advance()

    if (hasPointer) {
      projectPointer(smoothX, smoothY)
      pit.update(delta, pointerWorld)
    } else {
      pit.update(delta, null)
    }
  }

  const resize = (width: number, height: number): void => {
    pit.resize(width, height)
  }

  const dispose = (): void => {
    pit.dispose()
    pitRef.value = null
  }

  return { update, resize, dispose }
}

const handleShove = (event: PointerEvent): void => {
  const pit = pitRef.value
  const element = container.value
  if (!pit || !element) return

  // Click position straight off the event rather than the smoothed pointer:
  // the shove should land where the visitor actually clicked.
  const bounds = element.getBoundingClientRect()
  const ndcX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
  const ndcY = -((event.clientY - bounds.top) / bounds.height) * 2 + 1

  const chamber = pit.chambers[0]
  const height = chamber ? Math.abs(chamber.floor) * 2 : 6
  const width = height * (bounds.width / bounds.height)

  pit.shove(new Vector3((ndcX * width) / 2, (ndcY * height) / 2, 0))
}

watch(
  () => uiStore.theme,
  (theme) => pitRef.value?.setTheme(theme)
)

useThreeScene({ container, canvas, setup: setupScene, fov: 45 })
</script>

<template>
  <div ref="container" class="relative h-full w-full" @pointerdown="handleShove">
    <canvas ref="canvas" class="h-full w-full" />

    <!-- Overlay. aria-hidden because the same technologies are listed as real
         text below the scene — this is a second rendering of that list, not
         new information. -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0">
      <!-- Chamber names sit at the top: the balls pile along the floor, and a
           label down there ends up printed over them. -->
      <div class="absolute inset-x-0 top-10 grid grid-cols-4 gap-px px-[3%]">
        <span
          v-for="domain in skillDomainList"
          :key="domain"
          class="text-center font-mono text-[0.5rem] leading-tight tracking-[0.08em] uppercase sm:text-[0.625rem] sm:tracking-[0.16em]"
          :class="domainClass[domain]"
        >
          {{ t(`stack.domain_${domain}`) }}
        </span>
      </div>
    </div>
  </div>
</template>

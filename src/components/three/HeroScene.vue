<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ACESFilmicToneMapping } from 'three'
import {
  useThreeScene,
  isCompactViewport,
  type SceneContext,
  type SceneHandle
} from '@/composables/useThreeScene'
import { useSceneDrag } from '@/composables/useSceneDrag'
import { createCharacterLighting, type CharacterLightingProps } from '@/three/lighting'
import { createHeroCharacter, CHARACTER_RADIUS, type HeroCharacter } from '@/three/heroCharacter'
import { createBloomComposer, type BloomComposerProps } from '@/three/bloom'
import { STAGE_BLEED, bleedRadius, fitDistance } from '@/utils/framing'
import { useUiStore } from '@/stores/ui'

/**
 * Hero stage: Jonas at his setup, swaying on a fixed path and draggable.
 */
const FOV = 40

/** Slightly above eye level, so the podium reads as a disc rather than a line. */
const CAMERA_HEIGHT = 0.62
const CAMERA_TARGET_Y = -0.08

/** Breathing room around the swept radius. At 1 the diorama touches the edges. */
const FRAMING_MARGIN = 1.02

/**
 * Share of the swept radius the camera fits on a phone — deliberately under 1.
 *
 * `CHARACTER_RADIUS` is the radius of the sphere the *whole diorama* sweeps, and
 * that sphere has to contain the diagonal of the podium disc while the visible
 * silhouette is far narrower. Fitting all of it into a phone-sized stage spends
 * most of the frame on empty sphere and leaves the figure looking like a stamp
 * with a gap under it.
 *
 * Under this share the props at the rim of the disc reach past the *stage*; the
 * canvas overhangs it by `STAGE_BLEED`, which is where they go. The same trade
 * `VISIBLE_SHARE` makes in `three/peekCharacter.ts`.
 */
const COMPACT_FIT_SHARE = 0.72

/**
 * The look-at point rises on a phone, which tilts the camera up and brings the
 * diorama back down the frame.
 *
 * A portrait stage is fitted on its *width*, so there is vertical slack — and
 * `VERTICAL_BIAS` in `three/heroCharacter.ts` has already pushed the model up
 * inside it, so all of that slack collects under the podium. That gap is the
 * other half of "too small with space below"; the fit share alone only fixes
 * the size.
 *
 * Measured rather than guessed, at 390 × 844 with the backdrop hidden: the
 * diorama sits 3.2 % off the top and 3.4 % off the bottom and fills 93 % of the
 * frame's height. A tilt-drag then runs into the canvas overhang, not off the
 * edge.
 */
const COMPACT_TARGET_Y = 0.02

/**
 * The emissive podium runs past white without a tone curve. The renderer belongs
 * to this scene alone — `useThreeScene` builds one per component — so the LED
 * sign and the tech-stack pit keep their own look.
 */
const TONE_MAPPING_EXPOSURE = 1.05

const uiStore = useUiStore()
const { t } = useI18n()

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const characterRef = shallowRef<HeroCharacter | null>(null)
const lightingRef = shallowRef<CharacterLightingProps | null>(null)

const setupScene = (context: SceneContext): SceneHandle => {
  const { scene, camera, renderer, isCompact } = context

  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = TONE_MAPPING_EXPOSURE

  camera.position.set(0, CAMERA_HEIGHT, fitDistance(CHARACTER_RADIUS, FOV, 1, FRAMING_MARGIN))
  camera.lookAt(0, CAMERA_TARGET_Y, 0)

  const lighting = createCharacterLighting(uiStore.theme)
  lightingRef.value = lighting
  scene.add(lighting.group)

  // The model lands well after the frame drawn on mount. With reduced motion
  // there is no loop to pick it up, so the scene is asked for one more frame.
  const character = createHeroCharacter(renderer, uiStore.theme, { onLoaded: () => renderOnce() })
  characterRef.value = character
  scene.add(character.group)

  // `useThreeScene` renders exactly one frame and starts no loop under reduced
  // motion, and the model usually lands after that frame — `rest` therefore
  // sets the pose now and again when the file arrives.
  if (uiStore.prefersReducedMotion) character.rest()

  // Three fullscreen passes are the wrong thing to spend a phone's budget on,
  // and the podium lamps are a few pixels across at that size anyway.
  let bloom: BloomComposerProps | null = isCompact
    ? null
    : createBloomComposer(renderer, scene, camera)

  const update = (elapsed: number, delta: number): void => {
    character.update(elapsed, delta)
  }

  const resize = (width: number, height: number): void => {
    // The stage is portrait on desktop and portrait-ish on a phone, so which
    // axis crops first still flips with the layout. Backing off by whichever is
    // tighter is the only thing that keeps the podium inside the frame on both.
    const aspect = width / Math.max(height, 1)
    // By viewport, not by this stage's width: the stage is a five-column slot
    // and never reaches the breakpoint on a desktop. Keyed to the container,
    // the phone fit and the missing bloom applied to every desktop.
    const isCompactStage = isCompactViewport()
    const fitRadius = CHARACTER_RADIUS * (isCompactStage ? COMPACT_FIT_SHARE : 1)

    // The canvas overhangs the stage by `STAGE_BLEED`; the model is fitted to
    // the stage and the overhang is where it goes when turned or tilted.
    camera.position.z = fitDistance(bleedRadius(fitRadius), FOV, aspect, FRAMING_MARGIN)
    camera.lookAt(0, isCompactStage ? COMPACT_TARGET_Y : CAMERA_TARGET_Y, 0)
    camera.updateProjectionMatrix()

    // A stage that crosses the breakpoint mid-session has to gain or lose the
    // bloom chain with it, not keep whatever it was built with.
    if (isCompactStage && bloom) {
      bloom.dispose()
      bloom = null
    } else if (!isCompactStage && !bloom) {
      bloom = createBloomComposer(renderer, scene, camera)
    }

    bloom?.setSize(width, height, renderer.getPixelRatio())
  }

  const render = (): void => {
    if (bloom) bloom.render()
    else renderer.render(scene, camera)
  }

  const dispose = (): void => {
    bloom?.dispose()
    bloom = null
    character.dispose()
    characterRef.value = null
    lightingRef.value = null
  }

  return { update, resize, render, dispose }
}

const { isDragging, dragHandlers } = useSceneDrag({
  container,
  bleed: STAGE_BLEED,
  target: () => characterRef.value
})

watch(
  () => uiStore.theme,
  (theme) => {
    characterRef.value?.setTheme(theme)
    lightingRef.value?.setTheme(theme)
  }
)

const { isReady, renderOnce } = useThreeScene({
  container,
  canvas,
  setup: setupScene,
  fov: FOV
})
</script>

<template>
  <!--
    `touch-action: pan-y` and not `none`: a vertical swipe has to keep scrolling
    the page, or the stage becomes a trap on a phone. Horizontal drags are ours.
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
      :class="isReady ? 'opacity-100' : 'opacity-0'"
      role="img"
      :aria-label="t('hero.scene_alt')"
    />
  </div>
</template>

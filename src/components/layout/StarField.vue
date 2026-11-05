<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'
import { pageScale } from '@/utils/pageScale'
import { pulse, scatterStars, spawnMeteor, type Meteor, type StarProps } from '@/utils/starField'

/**
 * The page's sky: a fixed field of ASCII stars behind everything, in three
 * depths that slide up at different speeds as the page scrolls, so plain
 * black ground has depth and the scroll has something to move against.
 *
 * Kept faint on purpose; it is ground, not picture. A few stars in violet
 * echo the angel's staff. The stars twinkle out of step, several times a second
 * one flares up, and now and then a shooting star crosses. Where
 * `isDrifting` is set (the links page) the sky also floats up on its own.
 * Under reduced motion it is drawn once, redrawn only on scroll, and stays.
 */
const { isDrifting = false } = defineProps<{ isDrifting?: boolean }>()

const uiStore = useUiStore()
const canvas = ref<HTMLCanvasElement | null>(null)

/** Parallax per depth: the nearest layer moves fastest. */
const DEPTH_SPEED = [0.04, 0.09, 0.16] as const
const DEPTH_ALPHA = [0.26, 0.4, 0.6] as const
const DEPTH_SIZE = [9, 11, 13] as const
const DENSITY = 0.00015
/** Drift as virtual scroll: times the depth speeds, 5 to 19 px a second. */
const DRIFT_PX_PER_S = 120
const TWINKLE_RATE = 1.3
/** How far a twinkling star dims at its faintest. */
const TWINKLE_DEPTH = 0.45
/** Shorter than the flare itself, so several stars are often lit at once. */
const FLARE_GAP_S = [0.25, 0.9] as const
const FLARE_DURATION_S = 1.2
/** How much larger a star grows at the peak of its flare. */
const FLARE_GROWTH = 1.2
/** Longer than a meteor lasts (at most 1.2 s), so one slot is enough. */
const METEOR_GAP_S = [2.5, 6] as const
/** Share of the meteor's path its tail covers. */
const METEOR_TAIL = 0.3
const METEOR_SEGMENTS = 14

let stars: StarProps[] = []
let width = 0
let height = 0
let dpr = 1
let scale = 1
let frame = 0
let ink = '#f3f3f1'
let violet = '#8b5cf6'
/** Flaring stars and when each flare started. */
const flares = new Map<StarProps, number>()
let nextFlareAt = 0
let meteor: Meteor | null = null
let nextMeteorAt = 0

const isAnimated = (): boolean => !uiStore.prefersReducedMotion
const between = ([min, max]: readonly [number, number]): number => min + Math.random() * (max - min)

const advanceEvents = (seconds: number): void => {
  for (const [star, start] of flares) {
    if (seconds - start >= FLARE_DURATION_S) flares.delete(star)
  }
  if (seconds >= nextFlareAt && stars.length) {
    flares.set(stars[Math.floor(Math.random() * stars.length)]!, seconds)
    nextFlareAt = seconds + between(FLARE_GAP_S)
  }
  if (seconds >= nextMeteorAt) {
    meteor = spawnMeteor(width, height, seconds, Math.random)
    nextMeteorAt = seconds + between(METEOR_GAP_S)
  }
}

const drawMeteor = (context: CanvasRenderingContext2D, seconds: number): void => {
  if (!meteor) return
  const progress = (seconds - meteor.start) / meteor.duration
  if (progress >= 1) {
    meteor = null
    return
  }
  // The head runs ahead and the tail follows, fading out towards its end.
  const fade = Math.min(1, (1 - progress) / 0.3)
  const tail = Math.min(progress, METEOR_TAIL)
  context.strokeStyle = ink
  context.lineCap = 'round'
  for (let i = 0; i < METEOR_SEGMENTS; i++) {
    const from = progress - (tail * (i + 1)) / METEOR_SEGMENTS
    const to = progress - (tail * i) / METEOR_SEGMENTS
    const strength = 1 - i / METEOR_SEGMENTS
    context.globalAlpha = 0.85 * fade * strength
    context.lineWidth = (0.5 + 1.2 * strength) * scale
    context.beginPath()
    context.moveTo(meteor.x + meteor.dx * from, meteor.y + meteor.dy * from)
    context.lineTo(meteor.x + meteor.dx * to, meteor.y + meteor.dy * to)
    context.stroke()
  }
}

const draw = (now: number): void => {
  frame = 0
  const context = canvas.value?.getContext('2d')
  if (!context) return
  const seconds = now / 1000
  const animated = isAnimated()
  const drift = animated && isDrifting ? seconds * DRIFT_PX_PER_S * scale : 0
  const scroll = (animated ? window.scrollY : 0) + drift
  if (animated) advanceEvents(seconds)

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, width, height)
  context.textBaseline = 'middle'
  context.textAlign = 'center'

  let font = ''
  for (const star of stars) {
    // Wrap vertically, so the field never runs out however long the page.
    const y = (((star.y - scroll * DEPTH_SPEED[star.depth]!) % height) + height) % height
    // The x position doubles as the star's phase, the brightness varies the
    // rate, so they twinkle out of step.
    const twinkle = animated
      ? 1 -
        TWINKLE_DEPTH *
          (0.5 + 0.5 * Math.sin(seconds * TWINKLE_RATE * (0.6 + star.brightness) + star.x))
      : 1
    const flareStart = animated ? flares.get(star) : undefined
    const flash = flareStart === undefined ? 0 : pulse(seconds - flareStart, FLARE_DURATION_S)
    const alpha = DEPTH_ALPHA[star.depth]! * star.brightness * twinkle
    context.globalAlpha = alpha + (1 - alpha) * flash
    context.fillStyle = star.isAccent ? violet : ink
    const size = DEPTH_SIZE[star.depth]! * scale * (1 + FLARE_GROWTH * flash)
    const nextFont = `500 ${size}px ui-monospace, Consolas, monospace`
    // Setting the font is the slow part of a frame; stars are sorted by depth.
    if (nextFont !== font) context.font = font = nextFont
    context.fillText(flash > 0.3 ? '✦' : star.glyph, star.x, y)
  }
  drawMeteor(context, seconds)
  context.globalAlpha = 1
  if (animated) schedule()
}

const schedule = (): void => {
  if (!frame) frame = requestAnimationFrame(draw)
}

const reset = (): void => {
  const target = canvas.value
  if (!target) return
  width = window.innerWidth
  height = window.innerHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  scale = pageScale()
  target.width = Math.round(width * dpr)
  target.height = Math.round(height * dpr)
  stars = scatterStars(width, height, DENSITY / scale ** 2, Math.random).sort(
    (a, b) => a.depth - b.depth
  )
  flares.clear()
  meteor = null
  const seconds = performance.now() / 1000
  nextFlareAt = seconds + between(FLARE_GAP_S)
  nextMeteorAt = seconds + between(METEOR_GAP_S)
  schedule()
}

watch(() => [isDrifting, uiStore.prefersReducedMotion], schedule)

useEventListener(() => (typeof window === 'undefined' ? null : window), 'scroll', schedule, {
  passive: true
})
// The window, not the document: the page growing as images load must not
// scatter a new sky.
useEventListener(() => (typeof window === 'undefined' ? null : window), 'resize', reset)

onMounted(() => {
  const style = getComputedStyle(document.documentElement)
  ink = style.getPropertyValue('--color-ink').trim() || ink
  violet = style.getPropertyValue('--color-violet').trim() || violet
  reset()
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <canvas
    ref="canvas"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 -z-10 size-full"
  />
</template>

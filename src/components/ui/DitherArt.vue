<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEventListener, useIntersectionObserver, useResizeObserver } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'
import { edgeCells, isWithinReach, levelsOf } from '@/utils/ascii'
import {
  glintBoost,
  halftoneRadius,
  isBayerLit,
  secondsUntilGlint,
  windGust,
  type DitherMode
} from '@/utils/dither'

/**
 * A picture set as print: round halftone dots whose size follows the light,
 * or ordered (Bayer) dithering, square pixels switched on in a fixed pattern.
 * The sibling of `AsciiArt` for the parts of the page that want texture
 * rather than characters.
 *
 * On first sight the dots grow in from the top down. Afterwards a glint
 * runs over it every few seconds like light over metal (see `glintBoost`),
 * and the pointer pushes the dots aside the way it does in `AsciiArt`. Every
 * halftone on the site does both, so the dots behave the same everywhere.
 * With `isWindy`, gusts also roll across the lower part of the picture (see
 * `windGust`). Glint and wind run a few frames a second and only while the
 * picture is on screen. Under reduced motion it is drawn finished
 * and does not move. Sources are light on dark, like `AsciiArt`'s.
 */
const {
  src,
  mode = 'halftone',
  cell = 8,
  tone = 'ink',
  strength = 1,
  white = 1,
  fit = 'contain',
  isWindy = false,
  isOutlined = false
} = defineProps<{
  src: string
  mode?: DitherMode
  /** Side of one grid cell in CSS px. */
  cell?: number
  tone?: 'ink' | 'violet'
  /** Overall opacity, 0 to 1. */
  strength?: number
  /** The source brightness that already counts as full. */
  white?: number
  /** `cover` fills the box and crops, `contain` fits the whole picture. */
  fit?: 'contain' | 'cover'
  /** Gusts of wind roll across the ground of a landscape. */
  isWindy?: boolean
  /** Sets the figure's outline (dots touching empty ground) in dark grey, as on the angels. */
  isOutlined?: boolean
}>()

const uiStore = useUiStore()

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

/** Bayer pixels leave a gap to their neighbours, so the grid stays visible. */
const BAYER_FILL = 0.78
const REVEAL_SWEEP_MS = 700
const REVEAL_GROW_MS = 600
/** Same lens as `AsciiArt`, so both kinds of picture answer the pointer alike. */
const LENS_RADIUS = 140
const LENS_PUSH = 30
const LENS_EASE = 0.15
/** Wind and glint run at about 15 frames a second: enough for drift, cheap on a big grid. */
const AMBIENT_FRAME_MS = 66

let image: HTMLImageElement | null = null
let levels = new Float32Array(0)
let edge = new Uint8Array(0)
let cols = 0
let rows = 0
let revealStart = -1
let frame = 0
let pointerX = -9999
let pointerY = -9999
let lensTarget = 0
let lensAmount = 0
let isOnScreen = false
let ambientTimer: ReturnType<typeof setTimeout> | null = null
/** Read once per resize, not per frame: `getComputedStyle` would force a
    style pass on every frame while the page scrolls. */
let color = ''
let outline = ''

/** One level per cell: the source drawn into a canvas the size of the grid. */
const sample = (): void => {
  const element = root.value
  if (!element || !image?.complete || image.naturalWidth === 0) return
  cols = Math.ceil(element.clientWidth / cell)
  rows = Math.ceil(element.clientHeight / cell)
  if (cols === 0 || rows === 0) return

  const probe = document.createElement('canvas')
  probe.width = cols
  probe.height = rows
  const context = probe.getContext('2d', { willReadFrequently: true })
  if (!context) return
  const pick = fit === 'cover' ? Math.max : Math.min
  const scale = pick(cols / image.naturalWidth, rows / image.naturalHeight)
  const drawW = image.naturalWidth * scale
  const drawH = image.naturalHeight * scale
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, (cols - drawW) / 2, (rows - drawH) / 2, drawW, drawH)
  levels = levelsOf(context.getImageData(0, 0, cols, rows).data, white)
  edge = isOutlined ? edgeCells(levels, cols, rows) : new Uint8Array(levels.length)
  const style = getComputedStyle(element)
  color = style.getPropertyValue(`--color-${tone}`).trim()
  outline = style.getPropertyValue('--color-ink-dim').trim()
}

const easeOut = (t: number): number => 1 - (1 - t) ** 3

/** Paints every cell; returns whether the reveal is still running. */
const draw = (now: number): boolean => {
  const element = root.value
  const target = canvas.value
  const context = target?.getContext('2d')
  if (!element || !target || !context || levels.length === 0) return false

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = element.clientWidth
  const height = element.clientHeight
  // Setting the size reallocates the canvas, so only when it changed.
  const pixelWidth = Math.round(width * dpr)
  const pixelHeight = Math.round(height * dpr)
  if (target.width !== pixelWidth || target.height !== pixelHeight) {
    target.width = pixelWidth
    target.height = pixelHeight
  }
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, width, height)
  context.globalAlpha = strength
  // Two shapes, filled once each: the body in the tone, the rim in grey.
  const body = new Path2D()
  const rim = new Path2D()

  // Before it is first seen nothing is drawn yet, so the reveal has a start.
  const hasStarted = revealStart >= 0
  const elapsed = uiStore.prefersReducedMotion ? Infinity : hasStarted ? now - revealStart : 0
  const pixel = cell * BAYER_FILL
  let isRevealing = false
  lensAmount += (lensTarget - lensAmount) * LENS_EASE
  const isLensMoving = Math.abs(lensTarget - lensAmount) > 0.004
  const isLensOn = lensAmount > 0.01
  const isAmbientOn = !uiStore.prefersReducedMotion && hasStarted
  const isWindOn = isWindy && isAmbientOn
  const seconds = now / 1000

  for (let row = 0; row < rows; row++) {
    const grow = (elapsed - (row / rows) * REVEAL_SWEEP_MS) / REVEAL_GROW_MS
    if (grow < 1) isRevealing = true
    if (grow <= 0) continue
    const shown = easeOut(Math.min(1, grow))
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col
      const base = levels[index]! * shown
      const wind = isWindOn ? windGust(col, row, rows, seconds) : 1
      const glint = isAmbientOn ? glintBoost(col, row, cols, rows, seconds) : 1
      const level = base * wind * glint
      if (level <= 0) continue
      let x = col * cell + cell / 2
      let y = row * cell + cell / 2
      if (isLensOn) {
        const dx = x - pointerX
        const dy = y - pointerY
        const distance = Math.hypot(dx, dy)
        if (distance < LENS_RADIUS) {
          const t = 1 - distance / LENS_RADIUS
          const push = (t * t * (3 - 2 * t) * lensAmount * LENS_PUSH) / Math.max(distance, 1)
          x += dx * push
          y += dy * push
        }
      }
      const shape = edge[index] ? rim : body
      if (mode === 'bayer') {
        if (isBayerLit(level, col, row)) shape.rect(x - pixel / 2, y - pixel / 2, pixel, pixel)
        continue
      }
      const radius = halftoneRadius(level, cell)
      if (radius < 0.35) continue
      shape.moveTo(x + radius, y)
      shape.arc(x, y, radius, 0, Math.PI * 2)
    }
  }
  context.fillStyle = color
  context.fill(body)
  context.fillStyle = outline
  context.fill(rim)
  context.globalAlpha = 1
  return (hasStarted && isRevealing) || isLensMoving
}

const tick = (now: number): void => {
  frame = 0
  if (draw(now)) {
    frame = requestAnimationFrame(tick)
    return
  }
  scheduleAmbient()
}

/**
 * Wind and glint move on their own: the next frame, a little later. Between
 * two glint passes nothing moves without wind, so it sleeps until the next.
 */
const scheduleAmbient = (): void => {
  if (uiStore.prefersReducedMotion || !isOnScreen || ambientTimer || frame) return
  const untilGlint = isWindy ? 0 : secondsUntilGlint(performance.now() / 1000) * 1000
  ambientTimer = setTimeout(
    () => {
      ambientTimer = null
      if (!frame) frame = requestAnimationFrame(tick)
    },
    Math.max(AMBIENT_FRAME_MS, untilGlint)
  )
}

const redraw = (): void => {
  if (frame) cancelAnimationFrame(frame)
  frame = requestAnimationFrame(tick)
}

useEventListener(
  () => (typeof window === 'undefined' ? null : window),
  'pointermove',
  (event: PointerEvent) => {
    if (uiStore.prefersReducedMotion || event.pointerType === 'touch') return
    const bounds = canvas.value?.getBoundingClientRect()
    if (!bounds) return
    pointerX = event.clientX - bounds.left
    pointerY = event.clientY - bounds.top
    const isNear = isWithinReach(pointerX, pointerY, bounds, LENS_RADIUS)
    if (!isNear && lensTarget === 0) return
    lensTarget = isNear ? 1 : 0
    if (!frame) frame = requestAnimationFrame(tick)
  },
  { passive: true }
)

useIntersectionObserver(root, (entries) => {
  isOnScreen = Boolean(entries[0]?.isIntersecting)
  if (!isOnScreen) return
  if (revealStart < 0) revealStart = performance.now()
  redraw()
})

useResizeObserver(root, () => {
  sample()
  redraw()
})

watch(
  () => src,
  (next) => {
    image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      sample()
      redraw()
    }
    image.src = next
  },
  { immediate: true }
)

onMounted(redraw)

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  if (ambientTimer) clearTimeout(ambientTimer)
})
</script>

<template>
  <!-- Decoration only. No position class here: the caller places it. -->
  <div ref="root" aria-hidden="true">
    <canvas ref="canvas" class="pointer-events-none absolute inset-0 size-full" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useIntersectionObserver, useResizeObserver } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'
import { nextDropRow, pickGlyph } from '@/utils/matrixRain'

/**
 * The Matrix rain, as a quiet background: columns of digits, capitals and
 * code symbols drifting down at their own speeds, each with a violet head
 * and an ink trail that fades into the ground.
 *
 * Slow on purpose: 3 to 8 rows a second (the first version ran at up to 27
 * and read as hectic). A head keeps its glyph until it moves to the next
 * row, then leaves exactly that glyph behind in ink, so nothing flickers.
 *
 * Canvas 2D at 20 frames a second, and only while it is on screen. The trail
 * comes from erasing the last frame at low opacity (`destination-out`) rather
 * than tracking every glyph, which is what keeps it cheap. The canvas stays
 * transparent, so the page ground and the stars show through. Painting the
 * ground colour at 4 % instead rounded to pure black on the transparent
 * bitmap, and the masked edges of that black field showed as horizontal
 * bands. Under reduced
 * motion one still frame is drawn and nothing moves.
 *
 * Decoration only: `aria-hidden`, no pointer events.
 */
const { cell = 18 } = defineProps<{
  /** Height of one glyph row in CSS pixels. */
  cell?: number
}>()

const uiStore = useUiStore()

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const FRAME_MS = 1000 / 20
const TRAIL_FADE = 0.04
/** Rows per frame: at 20 fps this is 3 to 8 rows a second. */
const MIN_SPEED = 0.15
const SPEED_SPREAD = 0.25
const STILL_ROWS = 14

let drops: number[] = []
let speeds: number[] = []
let glyphs: string[] = []
let width = 0
let height = 0
let dpr = 1
let frame = 0
let last = 0
let isOnScreen = false
let ink = '#f3f3f1'
let head = '#8b5cf6'

const colWidth = (): number => cell * 0.72

const readColors = (): void => {
  if (!root.value) return
  const style = getComputedStyle(root.value)
  ink = style.getPropertyValue('--color-ink').trim() || ink
  head = style.getPropertyValue('--color-violet').trim() || head
}

const reset = (): void => {
  const element = root.value
  const target = canvas.value
  if (!element || !target) return
  width = element.clientWidth
  height = element.clientHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  target.width = Math.round(width * dpr)
  target.height = Math.round(height * dpr)
  // Resizing the bitmap clears it, which is the empty start we want.

  const columns = Math.ceil(width / colWidth())
  const rows = Math.ceil(height / cell)
  // Start most columns inside the field, so the rain is already falling when
  // it comes into view: at this pace a drop started above it takes seconds
  // to arrive.
  drops = Array.from({ length: columns }, () => Math.random() * rows * 1.5 - rows * 0.5)
  speeds = Array.from({ length: columns }, () => MIN_SPEED + Math.random() * SPEED_SPREAD)
  glyphs = Array.from({ length: columns }, () => pickGlyph(Math.random()))

  const context = target.getContext('2d')
  if (!context) return
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
}

const step = (context: CanvasRenderingContext2D): void => {
  const rows = Math.ceil(height / cell)

  context.globalCompositeOperation = 'destination-out'
  context.globalAlpha = TRAIL_FADE
  context.fillRect(0, 0, width, height)
  context.globalCompositeOperation = 'source-over'
  context.globalAlpha = 1
  context.font = `600 ${cell * 0.8}px ui-monospace, monospace`
  context.textBaseline = 'top'

  for (let column = 0; column < drops.length; column++) {
    const row = Math.floor(drops[column]!)
    drops[column] = nextDropRow(drops[column]!, speeds[column]!, rows, Math.random())
    if (row < 0) continue
    const x = column * colWidth()
    const nextRow = Math.floor(drops[column]!)
    if (nextRow !== row) {
      // The head moves on: its glyph settles into the trail colour, in place.
      context.fillStyle = ink
      context.fillText(glyphs[column]!, x, row * cell)
      glyphs[column] = pickGlyph(Math.random())
      if (nextRow < 0 || nextRow > rows) continue
    }
    context.fillStyle = head
    context.fillText(glyphs[column]!, x, nextRow * cell)
  }
}

const drawStill = (context: CanvasRenderingContext2D): void => {
  context.clearRect(0, 0, width, height)
  context.font = `600 ${cell * 0.8}px ui-monospace, monospace`
  context.textBaseline = 'top'
  for (let column = 0; column < drops.length; column++) {
    const end = Math.floor(Math.random() * (height / cell))
    for (let index = 0; index < STILL_ROWS; index++) {
      const row = end - index
      if (row < 0) break
      context.globalAlpha = 1 - index / STILL_ROWS
      context.fillStyle = index === 0 ? head : ink
      context.fillText(pickGlyph(Math.random()), column * colWidth(), row * cell)
    }
  }
  context.globalAlpha = 1
}

const tick = (now: number): void => {
  frame = 0
  if (!isOnScreen) return
  const context = canvas.value?.getContext('2d')
  if (!context) return
  if (now - last >= FRAME_MS) {
    last = now
    step(context)
  }
  frame = requestAnimationFrame(tick)
}

const start = (): void => {
  const context = canvas.value?.getContext('2d')
  if (!context) return
  if (uiStore.prefersReducedMotion) {
    drawStill(context)
    return
  }
  if (!frame) frame = requestAnimationFrame(tick)
}

useIntersectionObserver(root, (entries) => {
  isOnScreen = Boolean(entries[0]?.isIntersecting)
  if (isOnScreen) start()
})

useResizeObserver(root, () => {
  reset()
  if (isOnScreen) start()
})

onMounted(() => {
  readColors()
  reset()
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="root" aria-hidden="true" class="pointer-events-none">
    <canvas ref="canvas" class="size-full" />
  </div>
</template>

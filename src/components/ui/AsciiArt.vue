<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEventListener, useIntersectionObserver, useResizeObserver } from '@vueuse/core'
import { useUiStore } from '@/stores/ui'
import {
  cellRangeAround,
  detailCells,
  edgeCells,
  glyphForLevel,
  isWithinReach,
  pickShimmer,
  quarterIndex,
  type CellGridProps,
  type CellRangeProps
} from '@/utils/ascii'
import { DEFAULT_PALETTE, probeLevels, readPalette, softenImage } from '@/utils/asciiSource'
import { glintBoost, glintColumns, isGlintPassing } from '@/utils/dither'

/**
 * A picture set as real ASCII art: monospaced characters on a grid, drawn on
 * a canvas so thousands of them stay cheap and crisp.
 *
 * The source is softened before it is sampled (`softness`). Without that, a
 * source that already is character art or halftone (both pieces on the site
 * are) gets sampled on a second, different grid, and the two grids beat into
 * mush. Softened, only the shape and its light are left, and the glyphs are
 * set fresh from that: thin punctuation on the edges, dense symbols at the
 * brightest core.
 *
 * Three things move: on first sight every cell decodes like the Matrix, first
 * a random violet glyph, then its own, top rows a little before bottom ones;
 * afterwards a few glyphs shimmer to a neighbour now and then; and the
 * pointer works as a lens that pushes the glyphs aside and makes the ones
 * near its centre flicker into violet scramble, like the decode replaying
 * under the pointer. (A solid violet disc was tried; it read as a stamp.) The brightest part of the picture (`coreAt`) glows violet
 * too. Under reduced motion it is drawn once, decoded, and holds still.
 *
 * Where a cell holds detail finer than one glyph (`splitAt`), it is set as
 * four glyphs at half the size, so thin lines and spikes keep their tips.
 * Sources are light on dark (white motif, black ground).
 */
const {
  src,
  label = null,
  fontSize = 10,
  softness = 2.2,
  strength = 1,
  white = 0.85,
  coreAt = 2,
  splitAt = 2,
  isOutlined = false
} = defineProps<{
  src: string
  /** Alt text. Null marks it as decoration. */
  label?: string | null
  /** Glyph size in CSS px; the grid follows from it. */
  fontSize?: number
  /** Blur applied to the source before sampling, in source px. */
  softness?: number
  /** Overall opacity of the glyphs, 0 to 1. */
  strength?: number
  /**
   * The softened brightness that already counts as full. Sparse sources
   * (dots or glyphs on black) average out dim once softened; a lower white
   * point gives their body its density back.
   */
  white?: number
  /** Level from which a glyph is set in violet; above 1 means never. */
  coreAt?: number
  /**
   * Contrast inside a cell from which it is drawn as four half-size glyphs,
   * so thin lines and spikes keep their tips; above 1 means never.
   */
  splitAt?: number
  /** Sets the figure's outline (inked cells touching empty ground) in dark grey. */
  isOutlined?: boolean
}>()

const uiStore = useUiStore()

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const FONT = 'ui-monospace, "Cascadia Mono", Consolas, "SF Mono", Menlo, monospace'
const LINE_HEIGHT = 1.15
const LENS_RADIUS = 140
const LENS_THICKEN = 0.2
/** Share of the glyphs at the lens centre that flicker into violet scramble. */
const LENS_SPARK = 0.4
/** How far, in px, the glyphs at the lens centre are pushed aside. */
const LENS_PUSH = 30
/** Decode: how long the top-to-bottom sweep and each cell's own wait run. */
const DECODE_SWEEP_MS = 600
const DECODE_SPREAD_MS = 1100
/** A cell shows scrambled glyphs from this share of its wait onwards. */
const DECODE_APPEAR = 0.35
const SCRAMBLE = '7YJ5PGB#&@$%?!'
const SHIMMER_MS = 110
const SHIMMER_SHARE = 0.008
/**
 * While the glint passes, frames come this often. Ten a second is enough for
 * a soft band; at fifteen the two hero angels kept the page busy enough to lag.
 */
const GLINT_FRAME_MS = 100
/** From this glint boost on, a glyph lights up: only the band's narrow core. */
const SHINE_AT = 1.85
/** Share of the glint's boost that thickens glyphs; the rest is only light. */
const GLINT_DENSITY = 0.2

let image: HTMLImageElement | null = null
let levels = new Float32Array(0)
let jitter = new Int8Array(0)
let resolveAt = new Float32Array(0)
/** Levels on the half-size grid, and which cells are drawn on it. */
let fine = new Float32Array(0)
let split = new Uint8Array(0)
let edge = new Uint8Array(0)
/** Split cells collected while drawing, set in a second pass at half size. */
let queueIndex = new Int32Array(0)
let queueX = new Float32Array(0)
let queueY = new Float32Array(0)
let queueBoost = new Float32Array(0)
let queueCore = new Uint8Array(0)
/** The resting picture, painted once; and the cells shimmering this beat. */
let still: HTMLCanvasElement | null = null
let isStillDirty = true
let shimmered: number[] = []
/** Clock of the glint for live paints, in seconds; -1 while it is off. */
let glintSeconds = -1
let decodeEnd = 0
let cols = 0
let rows = 0
let cellW = 0
let cellH = 0
let offsetX = 0
let offsetY = 0
let dpr = 1
let width = 0
let height = 0

let pointerX = -9999
let pointerY = -9999
let lensTarget = 0
let lensAmount = 0

let introStart = -1
let lastShimmer = 0
let frame = 0
let idleTimer: ReturnType<typeof setTimeout> | null = null
let isOnScreen = false
let palette = DEFAULT_PALETTE

const readColors = (): void => {
  if (!root.value) return
  palette = readPalette(root.value)
  isStillDirty = true
}

const sample = (): void => {
  const element = root.value
  const target = canvas.value
  if (!element || !target || !image?.complete || image.naturalWidth === 0) return

  width = element.clientWidth
  height = element.clientHeight
  if (width === 0 || height === 0) return

  const context = target.getContext('2d')
  if (!context) return
  context.font = `500 ${fontSize}px ${FONT}`
  cellW = context.measureText('M').width
  cellH = fontSize * LINE_HEIGHT

  // Fit the picture into the field ("contain"), then cut that rectangle into
  // cells. A cell is taller than wide, so both axes are counted separately.
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const drawW = image.naturalWidth * scale
  const drawH = image.naturalHeight * scale
  cols = Math.max(1, Math.floor(drawW / cellW))
  rows = Math.max(1, Math.floor(drawH / cellH))
  offsetX = (width - cols * cellW) / 2
  offsetY = (height - rows * cellH) / 2

  // Soften at the source's own size first, then shrink to one pixel per cell.
  const soft = softenImage(image, softness)
  if (!soft) return

  levels = probeLevels(soft, cols, rows, white)
  jitter = new Int8Array(cols * rows)
  resolveAt = new Float32Array(cols * rows)
  for (let index = 0; index < resolveAt.length; index++) {
    const row = Math.floor(index / cols)
    resolveAt[index] = (row / rows) * DECODE_SWEEP_MS + Math.random() * DECODE_SPREAD_MS
  }
  decodeEnd = DECODE_SWEEP_MS + DECODE_SPREAD_MS

  // The half-size grid, only where `splitAt` asks for it.
  const cells = cols * rows
  fine = splitAt > 1 ? new Float32Array(cells * 4) : probeLevels(soft, cols * 2, rows * 2, white)
  split = splitAt > 1 ? new Uint8Array(cells) : detailCells(fine, cols, rows, splitAt)
  queueIndex = new Int32Array(cells)
  queueX = new Float32Array(cells)
  queueY = new Float32Array(cells)
  queueBoost = new Float32Array(cells)
  queueCore = new Uint8Array(cells)
  edge = isOutlined ? edgeCells(levels, cols, rows) : new Uint8Array(cells)

  dpr = Math.min(window.devicePixelRatio || 1, 2)
  target.width = Math.round(width * dpr)
  target.height = Math.round(height * dpr)
  still ??= document.createElement('canvas')
  still.width = target.width
  still.height = target.height
  isStillDirty = true
  shimmered = []
}

/** Violet for core and lens, light under the glint, grey outline, ink otherwise. */
const colorFor = (index: number, level: number, isCore: boolean, shine: number): string => {
  if (isCore || level >= coreAt) return palette.violet
  if (shine > SHINE_AT) return palette.shine
  return edge[index] ? palette.outline : palette.ink
}

/** The glint's boost for a cell in a live paint; 1 while it is off. */
const shineAt = (index: number, isLive: boolean): number =>
  isLive && glintSeconds >= 0
    ? glintBoost(index % cols, Math.floor(index / cols), cols, rows, glintSeconds)
    : 1

/** Second pass: the split cells, each as four glyphs at half the size. */
const drawFine = (context: CanvasRenderingContext2D, queued: number, isLive: boolean): void => {
  if (queued === 0) return
  context.font = `500 ${fontSize / 2}px ${FONT}`
  for (let item = 0; item < queued; item++) {
    const index = queueIndex[item]!
    const isCore = queueCore[item] === 1
    for (let sub = 0; sub < 4; sub++) {
      const quarter = fine[quarterIndex(index, sub, cols)]!
      if (quarter <= 0) continue
      const level = Math.min(1, quarter + queueBoost[item]!)
      context.fillStyle = colorFor(index, level, isCore, shineAt(index, isLive))
      context.fillText(
        glyphForLevel(level, isCore || !isLive ? 0 : jitter[index]!),
        queueX[item]! + ((sub & 1) * cellW) / 2,
        queueY[item]! + ((sub >> 1) * cellH) / 2
      )
    }
  }
}

/**
 * Paints a block of cells: clears it, then sets each glyph, with the lens
 * and the shimmer when live, and the decode while `elapsed` is short of it.
 */
const paintCells = (
  context: CanvasRenderingContext2D,
  range: CellRangeProps,
  isLive: boolean,
  elapsed: number
): void => {
  const { colFrom, colTo, rowFrom, rowTo } = range
  context.clearRect(
    offsetX + colFrom * cellW,
    offsetY + rowFrom * cellH,
    (colTo - colFrom) * cellW,
    (rowTo - rowFrom) * cellH
  )
  context.font = `500 ${fontSize}px ${FONT}`
  context.textBaseline = 'top'
  context.globalAlpha = strength

  const radiusSquared = LENS_RADIUS * LENS_RADIUS
  const isLensOn = isLive && lensAmount > 0.01
  const isDecoding = elapsed < decodeEnd
  let queued = 0

  for (let row = rowFrom; row < rowTo; row++) {
    const y = offsetY + row * cellH
    for (let col = colFrom; col < colTo; col++) {
      const index = row * cols + col
      const shine = shineAt(index, isLive)
      let level = levels[index]! * (1 + (shine - 1) * GLINT_DENSITY)
      const x = offsetX + col * cellW
      let drawX = x
      let drawY = y
      let isCore = false

      if (isLensOn) {
        const dx = x - pointerX
        const dy = y - pointerY
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared < radiusSquared && level > 0) {
          const distance = Math.sqrt(distanceSquared)
          const t = 1 - distance / LENS_RADIUS
          const lens = t * t * (3 - 2 * t) * lensAmount
          level = Math.min(1, level + lens * LENS_THICKEN)
          isCore = Math.random() < lens * LENS_SPARK
          // The glyphs also give way to the pointer, so the lens reads as a
          // touch on the picture rather than a tint over it.
          const push = (lens * LENS_PUSH) / Math.max(distance, 1)
          drawX += dx * push
          drawY += dy * push
        }
      }

      const isResolved = !isDecoding || elapsed >= resolveAt[index]!
      if (split[index] && isResolved) {
        queueIndex[queued] = index
        queueX[queued] = drawX
        queueY[queued] = drawY
        queueBoost[queued] = level - levels[index]!
        queueCore[queued] = isCore ? 1 : 0
        queued++
        continue
      }

      if (level <= 0) continue

      // Still decoding, or sparked by the lens: a violet scramble glyph.
      if (!isResolved && elapsed < resolveAt[index]! * DECODE_APPEAR) continue
      if (!isResolved || isCore) {
        context.fillStyle = palette.violet
        context.fillText(SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]!, drawX, drawY)
        continue
      }

      const nudge = isLive ? jitter[index]! : 0
      context.fillStyle = colorFor(index, level, false, shine)
      context.fillText(glyphForLevel(level, nudge), drawX, drawY)
    }
  }
  drawFine(context, queued, isLive)
  context.globalAlpha = 1
}

/** Every cell of the field. */
const fullRange = (): CellRangeProps => ({ colFrom: 0, colTo: cols, rowFrom: 0, rowTo: rows })

/** The cells the lens can reach, pushed glyphs included, clamped to the grid. */
const lensRange = (): CellRangeProps =>
  cellRangeAround(pointerX, pointerY, LENS_RADIUS + LENS_PUSH, grid())

const grid = (): CellGridProps => ({ cols, rows, offsetX, offsetY, cellW, cellH })

/**
 * The resting picture (no lens, no shimmer) is painted once into `still`.
 * A frame copies it and repaints only what moves: the few shimmering cells
 * and the block under the lens. Repainting every glyph each frame cost tens
 * of milliseconds once the grid got fine.
 */
const draw = (now: number): boolean => {
  const context = canvas.value?.getContext('2d')
  if (!context || !still || levels.length === 0) return false

  const isStill = uiStore.prefersReducedMotion
  let isBusy = false

  // Elapsed decode time; Infinity once done or when motion is off.
  const elapsed = introStart >= 0 && !isStill ? now - introStart : Infinity
  const isDecoding = elapsed < decodeEnd
  if (isDecoding) isBusy = true

  if (!isStill && now - lastShimmer > SHIMMER_MS) {
    lastShimmer = now
    ;({ jitter, picked: shimmered } = pickShimmer(levels, SHIMMER_SHARE, Math.random))
  }
  glintSeconds = isStill ? -1 : now / 1000

  lensAmount += (lensTarget - lensAmount) * 0.15
  if (Math.abs(lensTarget - lensAmount) > 0.004) isBusy = true

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  if (isDecoding) {
    paintCells(context, fullRange(), true, elapsed)
    return isBusy
  }

  if (isStillDirty) {
    const stillContext = still.getContext('2d')
    if (!stillContext) return false
    stillContext.setTransform(dpr, 0, 0, dpr, 0, 0)
    stillContext.clearRect(0, 0, width, height)
    paintCells(stillContext, fullRange(), false, Infinity)
    isStillDirty = false
  }

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, still.width, still.height)
  context.drawImage(still, 0, 0)
  context.setTransform(dpr, 0, 0, dpr, 0, 0)

  // The glint: only the cells under its band, row by row.
  if (glintSeconds >= 0 && isGlintPassing(glintSeconds)) {
    for (let row = 0; row < rows; row++) {
      const [colFrom, colTo] = glintColumns(row, cols, rows, glintSeconds)
      if (colTo > colFrom)
        paintCells(context, { colFrom, colTo, rowFrom: row, rowTo: row + 1 }, true, Infinity)
    }
  }
  for (const index of shimmered) {
    const col = index % cols
    const row = Math.floor(index / cols)
    paintCells(
      context,
      { colFrom: col, colTo: col + 1, rowFrom: row, rowTo: row + 1 },
      true,
      Infinity
    )
  }
  if (lensAmount > 0.01) paintCells(context, lensRange(), true, Infinity)

  return isBusy
}

const tick = (now: number): void => {
  frame = 0
  if (!isOnScreen) return
  if (draw(now)) {
    frame = requestAnimationFrame(tick)
    return
  }
  // Only shimmer and glint move: a slow pulse, not sixty frames a second.
  if (!uiStore.prefersReducedMotion) {
    const delay = isGlintPassing(now / 1000) ? GLINT_FRAME_MS : SHIMMER_MS
    idleTimer = setTimeout(() => {
      idleTimer = null
      wake()
    }, delay)
  }
}

const wake = (): void => {
  if (frame || !isOnScreen) return
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
  frame = requestAnimationFrame(tick)
}

useEventListener(
  () => (typeof window === 'undefined' ? null : window),
  'pointermove',
  (event: PointerEvent) => {
    if (!isOnScreen || event.pointerType === 'touch') return
    const bounds = canvas.value?.getBoundingClientRect()
    if (!bounds) return
    pointerX = event.clientX - bounds.left
    pointerY = event.clientY - bounds.top
    const isNear = isWithinReach(pointerX, pointerY, bounds, LENS_RADIUS)
    if (!isNear && lensTarget === 0) return
    lensTarget = isNear ? 1 : 0
    wake()
  },
  { passive: true }
)

useIntersectionObserver(root, (entries) => {
  isOnScreen = Boolean(entries[0]?.isIntersecting)
  if (isOnScreen && introStart < 0) introStart = performance.now()
  if (isOnScreen) wake()
})

useResizeObserver(root, () => {
  sample()
  wake()
})

watch(
  () => src,
  (next) => {
    image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      sample()
      wake()
    }
    image.src = next
  },
  { immediate: true }
)

onMounted(readColors)

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  if (idleTimer) clearTimeout(idleTimer)
})
</script>

<template>
  <!-- No position class here: the caller places it. -->
  <div
    ref="root"
    :role="label ? 'img' : undefined"
    :aria-label="label ?? undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <canvas ref="canvas" class="pointer-events-none absolute inset-0 size-full" />
  </div>
</template>

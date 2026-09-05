import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { useElementSize, useRafFn } from '@vueuse/core'
import type { Board, TetrominoName } from '@/utils/tetris'
import type { CellViewProps } from '@/utils/tetrisRules'
import {
  PERSPECTIVE_DEPTH,
  insetQuad,
  projectCell,
  type QuadProps,
  type WellLayoutProps
} from '@/utils/tetrisPerspective'
import {
  createRowBurst,
  createRowFlashes,
  shakeOffset,
  shakeStrength,
  stepFlashes,
  stepParticles,
  type ParticleProps,
  type RowFlashProps
} from '@/utils/tetrisEffects'
import { shade } from '@/utils/color'
import { useUiStore } from '@/stores/ui'

/**
 * The well, drawn.
 *
 * A canvas rather than a grid of elements, for the same reason the backdrop is
 * one: bevels, a flash across a whole row and a burst of debris are drawing,
 * not layout, and two hundred elements is a lot to ask CSS to animate.
 *
 * Colours are read off the document with `getComputedStyle`, so they come from
 * the token layer rather than a second copy of it — exactly as
 * `useTetrisField` does for the backdrop.
 */

/** Share of a cell taken by the bevel on each side. */
const BEVEL_RATIO = 0.22
/** Seconds a big clear shakes the well for. Inside the 300 ms motion budget. */
const SHAKE_SECONDS = 0.26
/** Particles are drawn this big relative to a cell. */
const PARTICLE_SIZE = 0.24

interface OptionsProps {
  canvas: Ref<HTMLCanvasElement | null>
  container: Ref<HTMLElement | null>
  cells: Ref<CellViewProps[]>
  columns: number
  rows: number
}

/**
 * Token name per piece — the palette assignment lives here, in one place.
 *
 * These are the game's own colours rather than the site's: see the tetromino
 * block in `tokens.css` for why that exception exists.
 */
const PIECE_TOKEN: Record<TetrominoName, string> = {
  I: '--color-piece-i',
  O: '--color-piece-o',
  T: '--color-piece-t',
  S: '--color-piece-s',
  Z: '--color-piece-z',
  J: '--color-piece-j',
  L: '--color-piece-l'
}

const traceQuad = (context: CanvasRenderingContext2D, quad: QuadProps): void => {
  context.beginPath()
  context.moveTo(quad.topLeft.x, quad.topLeft.y)
  context.lineTo(quad.topRight.x, quad.topRight.y)
  context.lineTo(quad.bottomRight.x, quad.bottomRight.y)
  context.lineTo(quad.bottomLeft.x, quad.bottomLeft.y)
  context.closePath()
}

export const useTetrisBoard = ({ canvas, container, cells, columns, rows }: OptionsProps) => {
  const uiStore = useUiStore()
  const { width, height } = useElementSize(container)

  const pieceColors = ref<Record<TetrominoName, string>>({
    I: '#31c7ef',
    O: '#f7d308',
    T: '#ad4d9c',
    S: '#42b642',
    Z: '#ef2029',
    J: '#5a65ad',
    L: '#ef7921'
  })
  const lineColor = ref('rgb(255 255 255 / 0.07)')
  const wellColor = ref('#0b0910')
  /** The line-clear flash. White on a dark well, in either scheme. */
  const FLASH_COLOR = '#ffffff'

  let particles: ParticleProps[] = []
  let flashes: RowFlashProps[] = []
  /** Current horizontal offset of the well, and what is driving it. */
  let shake = 0
  let shakeStrengthNow = 0
  let shakeElapsed = 0

  const readTokens = (): void => {
    const styles = getComputedStyle(document.documentElement)
    const read = (token: string, fallback: string): string =>
      styles.getPropertyValue(token).trim() || fallback

    pieceColors.value = Object.fromEntries(
      Object.entries(PIECE_TOKEN).map(([name, token]) => [
        name,
        read(token, pieceColors.value[name as TetrominoName])
      ])
    ) as Record<TetrominoName, string>

    // The well keeps its own ground and grid rather than the page's: it stays
    // a dark screen in both schemes, so the pieces stay the colours they are.
    lineColor.value = read('--color-well-line', lineColor.value)
    wellColor.value = read('--color-well', wellColor.value)
  }

  const layoutFor = (): WellLayoutProps => ({
    columns,
    rows,
    width: width.value,
    height: height.value,
    depth: PERSPECTIVE_DEPTH
  })

  /**
   * One block, as a bevelled tile: lit from the top left, shaded to the bottom
   * right, with a gradient across the face.
   *
   * It used to be drawn as a cube with its sides leading back to a vanishing
   * point. That belongs to a shaft in perspective, and on a straight grid it
   * reads as every block leaning towards the middle of the board — the light
   * has to come from one direction for the whole field, not from wherever the
   * centre happens to be.
   */
  const paintBlock = (context: CanvasRenderingContext2D, quad: QuadProps, color: string): void => {
    const face = insetQuad(quad, BEVEL_RATIO)

    // The rim, dark all round; the lit edges are painted back over it.
    traceQuad(context, quad)
    context.fillStyle = shade(color, -0.42)
    context.fill()

    context.fillStyle = shade(color, 0.5)
    context.beginPath()
    context.moveTo(quad.topLeft.x, quad.topLeft.y)
    context.lineTo(quad.topRight.x, quad.topRight.y)
    context.lineTo(face.topRight.x, face.topRight.y)
    context.lineTo(face.topLeft.x, face.topLeft.y)
    context.lineTo(face.bottomLeft.x, face.bottomLeft.y)
    context.lineTo(quad.bottomLeft.x, quad.bottomLeft.y)
    context.closePath()
    context.fill()

    const gradient = context.createLinearGradient(
      face.topLeft.x,
      face.topLeft.y,
      face.bottomRight.x,
      face.bottomRight.y
    )
    gradient.addColorStop(0, shade(color, 0.3))
    gradient.addColorStop(0.45, color)
    gradient.addColorStop(1, shade(color, -0.28))

    traceQuad(context, face)
    context.fillStyle = gradient
    context.fill()
  }

  /** The landing preview: an outline, never a face — it is not really there. */
  const paintGhost = (context: CanvasRenderingContext2D, quad: QuadProps, color: string): void => {
    traceQuad(context, quad)
    context.strokeStyle = color
    context.globalAlpha = 0.4
    context.lineWidth = 1
    context.stroke()
    context.globalAlpha = 1
  }

  const paintEmpty = (context: CanvasRenderingContext2D, quad: QuadProps): void => {
    traceQuad(context, quad)
    context.strokeStyle = lineColor.value
    context.lineWidth = 1
    context.stroke()
  }

  const paintFlash = (
    context: CanvasRenderingContext2D,
    flash: RowFlashProps,
    layout: WellLayoutProps
  ): void => {
    const strength = flash.life / flash.maxLife
    const left = projectCell(0, flash.row, layout)
    const right = projectCell(columns - 1, flash.row, layout)

    traceQuad(context, {
      topLeft: left.topLeft,
      topRight: right.topRight,
      bottomRight: right.bottomRight,
      bottomLeft: left.bottomLeft
    })
    context.fillStyle = FLASH_COLOR
    context.globalAlpha = strength * 0.8
    context.fill()
    context.globalAlpha = 1
  }

  const paintParticles = (context: CanvasRenderingContext2D, layout: WellLayoutProps): void => {
    for (const particle of particles) {
      const column = Math.max(0, Math.min(columns - 1, Math.floor(particle.column)))
      const row = Math.max(0, Math.min(rows - 1, Math.floor(particle.row)))
      const cell = projectCell(column, row, layout)

      const size = (cell.topRight.x - cell.topLeft.x) * PARTICLE_SIZE
      const x = cell.topLeft.x + (particle.column - column) * (cell.topRight.x - cell.topLeft.x)
      const y = cell.topLeft.y + (particle.row - row) * (cell.bottomLeft.y - cell.topLeft.y)

      context.fillStyle = pieceColors.value[particle.fill]
      context.globalAlpha = Math.min(1, particle.life / particle.maxLife)
      context.fillRect(x - size / 2, y - size / 2, size, size)
    }
    context.globalAlpha = 1
  }

  const draw = (): void => {
    const element = canvas.value
    const context = element?.getContext('2d')
    if (!element || !context || width.value === 0 || height.value === 0) return

    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const pixelWidth = Math.round(width.value * ratio)
    const pixelHeight = Math.round(height.value * ratio)

    if (element.width !== pixelWidth || element.height !== pixelHeight) {
      element.width = pixelWidth
      element.height = pixelHeight
    }

    const layout = layoutFor()

    // Scale first, then shift: the shake is authored in CSS pixels, and the
    // translate arguments of `setTransform` are applied after the scale.
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, width.value, height.value)
    context.translate(shake, 0)

    // The shaft itself, so the well reads as a hole rather than as a grid
    // floating on the panel.
    const mouth = projectCell(0, 0, layout)
    const floor = projectCell(columns - 1, rows - 1, layout)
    traceQuad(context, {
      topLeft: mouth.topLeft,
      topRight: { x: width.value - mouth.topLeft.x, y: mouth.topLeft.y },
      bottomRight: floor.bottomRight,
      bottomLeft: { x: width.value - floor.bottomRight.x, y: floor.bottomRight.y }
    })
    context.fillStyle = wellColor.value
    context.fill()

    // Far rows first: a nearer block has to be able to cover the one behind it.
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const cell = cells.value[row * columns + column]
        const quad = projectCell(column, row, layout)

        if (!cell?.fill) {
          paintEmpty(context, quad)
          continue
        }

        const color = pieceColors.value[cell.fill]
        if (cell.isGhost) paintGhost(context, quad, color)
        else paintBlock(context, quad, color)
      }
    }

    flashes.forEach((flash) => paintFlash(context, flash, layout))
    paintParticles(context, layout)
  }

  /** Runs only while something is still moving that `cells` cannot express. */
  const { pause: pauseEffects, resume: resumeEffects } = useRafFn(
    ({ delta }) => {
      // `delta` arrives in milliseconds; everything below this line is seconds.
      // Clamped so a long frame cannot fling the debris across the board.
      const seconds = Math.min(delta, 1000 / 30) / 1000

      particles = stepParticles(particles, seconds)
      flashes = stepFlashes(flashes, seconds)

      if (shakeStrengthNow > 0) {
        shakeElapsed += seconds
        shake = shakeOffset(shakeStrengthNow, shakeElapsed, SHAKE_SECONDS)
        if (shakeElapsed >= SHAKE_SECONDS) shakeStrengthNow = 0
      }

      draw()

      if (particles.length === 0 && flashes.length === 0 && shakeStrengthNow === 0) {
        shake = 0
        pauseEffects()
      }
    },
    { immediate: false }
  )

  /**
   * Kicks off the flash, and — for a big clear — the debris and the knock.
   *
   * Under reduced motion only the flash runs: it is a state change the player
   * needs to see, not decoration, and it moves nothing.
   */
  const celebrateClear = (clearedRows: number[], snapshot: Board | undefined): void => {
    flashes = createRowFlashes(clearedRows)

    if (!uiStore.prefersReducedMotion && snapshot) {
      const strength = shakeStrength(clearedRows.length)

      if (strength > 0) {
        const randoms = Array.from({ length: clearedRows.length * columns * 12 }, Math.random)
        particles = createRowBurst(
          clearedRows,
          columns,
          (row, column) => snapshot[row]?.[column] ?? null,
          randoms
        )
        shakeStrengthNow = strength
        shakeElapsed = 0
      }
    }

    resumeEffects()
  }

  watch(
    () => uiStore.theme,
    () => {
      readTokens()
      draw()
    }
  )

  // `cells` is rebuilt whenever the board or the piece changes, so the
  // reference itself is the signal — a deep watch would walk two hundred
  // objects on every gravity tick to learn the same thing.
  watch([cells, width, height], draw)

  // The size watch above covers everything after the first measurement, but
  // that measurement is asynchronous — without this the well is blank until
  // the first piece moves.
  onMounted(draw)

  onBeforeUnmount(() => {
    pauseEffects()
    particles = []
    flashes = []
  })

  readTokens()

  return { draw, celebrateClear }
}

import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useDocumentVisibility, useElementSize, useRafFn } from '@vueuse/core'
import type { Board, PieceProps } from '@/utils/tetris'
import {
  clearFullRows,
  createBoard,
  createPiece,
  hasCollision,
  lockPiece,
  movePiece,
  occupiedCells,
  pickTetromino,
  rotatePiece,
  spawnColumn
} from '@/utils/tetris'
import { useUiStore } from '@/stores/ui'

const CELL_SIZE = 38
/** One step per this many ms — slow enough to read as ambience, not as a game. */
const STEP_MS = 620
/** A settled cell fades in over this long, so nothing pops. */
const SETTLE_MS = 900
/** Sparse silhouettes keep the field visible above the stack at the floor. */
const AMBIENT_PIECE_DENSITY = 52

interface OptionsProps {
  canvas: Ref<HTMLCanvasElement | null>
  container: Ref<HTMLElement | null>
}

interface DriftingPieceProps {
  piece: PieceProps
  /** Fractional row offset gives the decorative pieces smooth movement. */
  offset: number
  /** Milliseconds required to travel one cell. */
  speed: number
}

/**
 * The self-playing Tetris backdrop.
 *
 * Draws to a 2D canvas rather than WebGL: the page already runs Three.js
 * scenes, and a decorative grid does not deserve a fourth GL context.
 *
 * Colours are read back off the document with `getComputedStyle` whenever the
 * theme changes, so the backdrop follows the tokens instead of duplicating
 * them. Under `prefers-reduced-motion` the board is settled once and drawn as
 * a single still frame — no loop is ever started.
 */
export const useTetrisField = ({ canvas, container }: OptionsProps): void => {
  const uiStore = useUiStore()
  const { width, height } = useElementSize(container)
  const visibility = useDocumentVisibility()

  const board = ref<Board>([])
  const piece = ref<PieceProps | null>(null)
  const columns = ref(0)
  const rows = ref(0)
  const strokeColor = ref('rgba(186, 165, 226, 0.28)')
  const accentColor = ref('#8b5cf6')
  const fieldOpacity = ref(0.28)

  let stepAccumulator = 0
  let settleAges: number[][] = []
  let ambientPieces: PieceProps[] = []
  let driftingPieces: DriftingPieceProps[] = []

  const readTokens = (): void => {
    const styles = getComputedStyle(document.documentElement)
    strokeColor.value = styles.getPropertyValue('--color-line-strong').trim() || strokeColor.value
    accentColor.value = styles.getPropertyValue('--color-dev').trim() || accentColor.value
    fieldOpacity.value = Number(styles.getPropertyValue('--nx-backdrop-opacity')) || 0.28
  }

  const spawn = (): void => {
    piece.value = createPiece(
      pickTetromino(Math.random()),
      spawnColumn(columns.value, Math.random())
    )

    // A quarter of the pieces arrive already turned, so the field does not
    // read as the same seven silhouettes over and over.
    if (Math.random() < 0.25 && piece.value) {
      piece.value = rotatePiece(piece.value)
    }
  }

  const resetField = (): void => {
    columns.value = Math.max(4, Math.ceil(width.value / CELL_SIZE))
    rows.value = Math.max(4, Math.ceil(height.value / CELL_SIZE))
    board.value = createBoard(columns.value, rows.value)
    settleAges = board.value.map((row) => row.map(() => 0))

    const ambientCount = Math.max(
      10,
      Math.ceil((columns.value * rows.value) / AMBIENT_PIECE_DENSITY)
    )
    ambientPieces = Array.from({ length: ambientCount }, () => {
      let ambientPiece = createPiece(
        pickTetromino(Math.random()),
        spawnColumn(columns.value, Math.random()),
        1 + Math.floor(Math.random() * Math.max(1, rows.value - 4))
      )
      const turns = Math.floor(Math.random() * 4)
      for (let turn = 0; turn < turns; turn += 1) {
        ambientPiece = rotatePiece(ambientPiece)
      }
      return ambientPiece
    })

    const driftingCount = Math.max(2, Math.min(8, Math.floor(columns.value / 6)))
    driftingPieces = Array.from({ length: driftingCount }, (_, index) => {
      const laneCenter = Math.floor(((index + 0.5) * columns.value) / driftingCount)
      const laneColumn = Math.max(1, Math.min(columns.value - 3, laneCenter))
      let driftingPiece = createPiece(pickTetromino(Math.random()), laneColumn, -3)
      const turns = Math.floor(Math.random() * 4)
      for (let turn = 0; turn < turns; turn += 1) {
        driftingPiece = rotatePiece(driftingPiece)
      }

      return {
        piece: driftingPiece,
        offset: (index / driftingCount) * rows.value,
        speed: 1080
      }
    })

    spawn()
  }

  const settleRow = (y: number): void => {
    const ages = settleAges[y]
    if (!ages) return
    ages.fill(SETTLE_MS)
  }

  const step = (): void => {
    const current = piece.value
    if (!current) return spawn()

    const dropped = movePiece(current, 0, 1)

    if (!hasCollision(board.value, dropped)) {
      piece.value = dropped
      return
    }

    // Landed above the top edge — the stack reached the ceiling, so wipe and
    // start over rather than freezing on a full board.
    if (occupiedCells(current).some((cell) => cell.y < 0)) {
      resetField()
      return
    }

    const locked = lockPiece(board.value, current)
    const { board: cleared, clearedRows } = clearFullRows(locked)

    board.value = cleared
    settleAges = cleared.map((row, y) => row.map((_, x) => settleAges[y]?.[x] ?? 0))
    occupiedCells(current).forEach((cell) => {
      const ages = settleAges[cell.y]
      if (ages && cell.x >= 0 && cell.x < ages.length) {
        ages[cell.x] = 0
      }
    })
    clearedRows.forEach(settleRow)

    spawn()
  }

  const drawCell = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    alpha: number,
    isFilled = false
  ): void => {
    const size = CELL_SIZE
    const inset = 3
    const radius = 6

    context.globalAlpha = alpha
    context.beginPath()
    // Rounded, like every other surface on the page.
    context.roundRect(
      x * size + inset,
      y * size + inset,
      size - inset * 2,
      size - inset * 2,
      radius
    )

    if (isFilled) {
      context.fill()
      return
    }

    context.stroke()
  }

  const draw = (delta: number): void => {
    const element = canvas.value
    const context = element?.getContext('2d')
    if (!element || !context) return

    context.clearRect(0, 0, element.width, element.height)
    context.setTransform(1, 0, 0, 1, 0, 0)

    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    context.scale(ratio, ratio)
    context.strokeStyle = strokeColor.value
    context.fillStyle = accentColor.value
    context.lineWidth = 1.5

    // A sparse layer of static tetromino silhouettes gives the upper and
    // middle viewport the same quiet texture as the settled stack below.
    ambientPieces.forEach((ambientPiece) => {
      occupiedCells(ambientPiece).forEach((cell) => {
        if (cell.x < 0 || cell.x >= columns.value || cell.y < 0 || cell.y >= rows.value) return
        drawCell(context, cell.x, cell.y, fieldOpacity.value * 0.85)
      })
    })

    driftingPieces.forEach((driftingPiece) => {
      if (!uiStore.prefersReducedMotion) {
        driftingPiece.offset += delta / driftingPiece.speed
      }

      const cells = occupiedCells(driftingPiece.piece)
      const topCell = Math.min(...cells.map((cell) => cell.y)) + driftingPiece.offset
      if (topCell > rows.value) {
        driftingPiece.offset = -Math.max(...cells.map((cell) => cell.y)) - 3
      }

      cells.forEach((cell) => {
        const y = cell.y + driftingPiece.offset
        if (cell.x < 0 || cell.x >= columns.value || y < -1 || y >= rows.value) return
        drawCell(context, cell.x, y, Math.min(1, fieldOpacity.value * 1.05), true)
      })
    })

    board.value.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell == null) return

        const ages = settleAges[y]
        const age = ages?.[x] ?? SETTLE_MS
        if (ages && age < SETTLE_MS) ages[x] = Math.min(SETTLE_MS, age + delta)

        drawCell(context, x, y, fieldOpacity.value * Math.min(1, age / SETTLE_MS))
      })
    })

    if (piece.value) {
      // The falling piece is filled and in the accent colour, not just a
      // brighter outline: something has to be visibly moving or the whole
      // backdrop reads as a static texture.
      const canDrop = !hasCollision(board.value, movePiece(piece.value, 0, 1))
      const glideOffset = canDrop ? stepAccumulator / STEP_MS : 0

      occupiedCells(piece.value).forEach((cell) => {
        const y = cell.y + glideOffset
        if (y <= -1) return
        drawCell(context, cell.x, y, Math.min(1, fieldOpacity.value * 1.3), true)
      })
    }

    context.globalAlpha = 1
  }

  const resizeCanvas = (): void => {
    const element = canvas.value
    if (!element || width.value === 0 || height.value === 0) return

    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    element.width = Math.floor(width.value * ratio)
    element.height = Math.floor(height.value * ratio)
    element.style.width = `${width.value}px`
    element.style.height = `${height.value}px`
  }

  const { pause, resume } = useRafFn(
    ({ delta }) => {
      stepAccumulator += delta

      while (stepAccumulator >= STEP_MS) {
        stepAccumulator -= STEP_MS
        step()
      }

      draw(delta)
    },
    { immediate: false }
  )

  /** Settles a plausible board without animating, for reduced motion. */
  const renderStatic = (): void => {
    for (let index = 0; index < rows.value * 3; index += 1) {
      step()
    }
    settleAges = settleAges.map((row) => row.map(() => SETTLE_MS))
    draw(0)
  }

  watch([width, height], () => {
    if (width.value === 0 || height.value === 0) return

    resizeCanvas()
    resetField()

    if (uiStore.prefersReducedMotion) renderStatic()
  })

  watch(
    () => uiStore.theme,
    () => {
      readTokens()
      if (uiStore.prefersReducedMotion) draw(0)
    },
    { immediate: true }
  )

  // Nothing animates in a hidden tab, and nothing animates when the visitor
  // asked for calm — in that case a single settled frame is the whole render.
  watch(
    [visibility, () => uiStore.prefersReducedMotion],
    ([currentVisibility, prefersReducedMotion]) => {
      if (prefersReducedMotion) {
        pause()
        renderStatic()
        return
      }

      if (currentVisibility === 'visible') resume()
      else pause()
    },
    { immediate: true }
  )
}

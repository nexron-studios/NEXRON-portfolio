import { computed, ref } from 'vue'
import { useDocumentVisibility, useEventListener, useRafFn, useStorage } from '@vueuse/core'
import type { Board, PieceProps, TetrominoName } from '@/utils/tetris'
import {
  clearFullRows,
  createBoard,
  createPiece,
  hasCollision,
  lockPiece,
  movePiece
} from '@/utils/tetris'
import {
  HARD_DROP_POINTS_PER_CELL,
  SOFT_DROP_POINTS_PER_CELL,
  dropDistance,
  flattenBoard,
  gravityIntervalMs,
  levelForLines,
  scoreForClear,
  shuffleBag,
  tryRotate
} from '@/utils/tetrisRules'

export const COLUMNS = 10
export const ROWS = 20

export const tetrisEventList = [
  'move',
  'rotate',
  'drop',
  'lock',
  'clear',
  'gameover',
  'start'
] as const
export type TetrisEventName = (typeof tetrisEventList)[number]

export interface TetrisEventProps {
  type: TetrisEventName
  /** Which rows went, on a `clear`. Empty for every other event. */
  rows: number[]
  /**
   * The board as it stood the instant those rows were complete, piece already
   * locked in. Only a `clear` carries it, and the debris takes its colours
   * from here — by the time anyone could look at the live board, the rows are
   * gone and there is nothing left to know what colour they were.
   */
  snapshot?: Board
}

export interface UseTetrisGameOptionsProps {
  /**
   * Called as the game happens, so sound and effects can react without this
   * composable knowing anything about either. It reports what occurred; what
   * that looks like or sounds like is the consumer's business.
   */
  onEvent?: (event: TetrisEventProps) => void
}

/** Where a piece enters. The shapes span -1..2, so this is as centred as it gets. */
const SPAWN_X = 4
/** Refill the queue below this so the preview never runs dry mid-bag. */
const QUEUE_REFILL_BELOW = 4
const PREVIEW_LENGTH = 3

/**
 * A playable game of Tetris, driven by the keyboard.
 *
 * The rules live in `utils/tetris.ts` (board mechanics) and
 * `utils/tetrisRules.ts` (scoring, gravity, bag, kicks) — both pure and
 * specced. What is left here is the part that genuinely needs Vue: reactive
 * state, a frame loop, key handling and teardown.
 *
 * The consumer is expected to mount this behind a `v-if`, so the key listener
 * exists only while the game is on screen and nothing has to be armed or
 * disarmed by hand.
 */
export const useTetrisGame = (options: UseTetrisGameOptionsProps = {}) => {
  const emit = (type: TetrisEventName, rows: number[] = [], snapshot?: Board): void => {
    options.onEvent?.({ type, rows, snapshot })
  }

  const board = ref<Board>(createBoard(COLUMNS, ROWS))
  const piece = ref<PieceProps | null>(null)
  const queue = ref<TetrominoName[]>([])
  const score = ref(0)
  const lines = ref(0)
  const isPaused = ref(false)
  const isGameOver = ref(false)

  // The only thing that outlives a session. VueUse owns the storage access —
  // the two places that touch `localStorage` directly do so because they run
  // before Pinia exists, which is not the case here.
  const bestScore = useStorage('nexron.tetris.best', 0)
  const visibility = useDocumentVisibility()

  const level = computed(() => levelForLines(lines.value))
  const preview = computed(() => queue.value.slice(0, PREVIEW_LENGTH))
  const ghostOffset = computed(() => (piece.value ? dropDistance(board.value, piece.value) : 0))
  const cells = computed(() => flattenBoard(board.value, piece.value, ghostOffset.value))
  const isActive = computed(() => !isPaused.value && !isGameOver.value)

  let elapsedMs = 0

  const refillQueue = (): void => {
    while (queue.value.length < QUEUE_REFILL_BELOW) {
      const randoms = Array.from({ length: 6 }, () => Math.random())
      queue.value.push(...shuffleBag(randoms))
    }
  }

  /**
   * Takes the next piece from the queue. A spawn that already collides is the
   * game-over condition — the well is full to the ceiling.
   */
  const spawn = (): void => {
    refillQueue()

    const name = queue.value.shift()
    if (!name) return

    const next = createPiece(name, SPAWN_X, 0)

    if (hasCollision(board.value, next)) {
      piece.value = null
      isGameOver.value = true
      pauseLoop()
      if (score.value > bestScore.value) bestScore.value = score.value
      emit('gameover')
      return
    }

    piece.value = next
  }

  const settle = (): void => {
    const current = piece.value
    if (!current) return

    const locked = lockPiece(board.value, current)
    const { board: cleared, clearedRows } = clearFullRows(locked)

    if (clearedRows.length > 0) {
      score.value += scoreForClear(clearedRows.length, level.value)
      lines.value += clearedRows.length
      emit('clear', clearedRows, locked)
    } else {
      emit('lock')
    }

    board.value = cleared

    spawn()
  }

  const move = (dx: number): void => {
    const current = piece.value
    if (!current || !isActive.value) return

    const candidate = movePiece(current, dx, 0)
    if (hasCollision(board.value, candidate)) return

    piece.value = candidate
    emit('move')
  }

  /** One row down. Returns false when the piece had nowhere left to go. */
  const stepDown = (): boolean => {
    const current = piece.value
    if (!current) return false

    const candidate = movePiece(current, 0, 1)
    if (hasCollision(board.value, candidate)) return false

    piece.value = candidate
    return true
  }

  const softDrop = (): void => {
    if (!isActive.value) return

    if (stepDown()) {
      score.value += SOFT_DROP_POINTS_PER_CELL
      // The piece just moved on the player's beat; restarting the clock keeps
      // gravity from yanking it a second row immediately afterwards.
      elapsedMs = 0
      return
    }

    settle()
  }

  const hardDrop = (): void => {
    const current = piece.value
    if (!current || !isActive.value) return

    const distance = dropDistance(board.value, current)
    piece.value = movePiece(current, 0, distance)
    score.value += distance * HARD_DROP_POINTS_PER_CELL
    elapsedMs = 0
    emit('drop')
    settle()
  }

  const rotate = (): void => {
    const current = piece.value
    if (!current || !isActive.value) return

    const rotated = tryRotate(board.value, current)
    if (!rotated) return

    piece.value = rotated
    emit('rotate')
  }

  const togglePause = (): void => {
    if (isGameOver.value) return
    isPaused.value = !isPaused.value
  }

  /**
   * Gravity on a rAF accumulator rather than an interval: the fall speed
   * changes with every level, and re-creating a timer on each change drifts.
   *
   * Declared before `start` because `spawn` pauses it on a topped-out board.
   * `immediate: false` keeps it still until the first `start()`.
   */
  const { pause: pauseLoop, resume: resumeLoop } = useRafFn(
    ({ delta }) => {
      if (!isActive.value) return

      elapsedMs += delta
      if (elapsedMs < gravityIntervalMs(level.value)) return

      elapsedMs = 0
      if (!stepDown()) settle()
    },
    { immediate: false }
  )

  const start = (): void => {
    board.value = createBoard(COLUMNS, ROWS)
    queue.value = []
    score.value = 0
    lines.value = 0
    isPaused.value = false
    isGameOver.value = false
    elapsedMs = 0
    spawn()
    resumeLoop()
    emit('start')
  }

  /**
   * Arrows and WASD both, because both are what people's hands do. Letters are
   * matched case-insensitively so caps lock is not a way to break the game.
   */
  const KEY_ACTIONS: Record<string, () => void> = {
    arrowleft: () => move(-1),
    a: () => move(-1),
    arrowright: () => move(1),
    d: () => move(1),
    arrowdown: softDrop,
    s: softDrop,
    arrowup: rotate,
    w: rotate,
    ' ': hardDrop,
    p: togglePause
  }

  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    // The settings panel has a volume slider, and a focused slider answers to
    // the arrow keys itself. Swallowing those here would move the piece and
    // leave the slider stuck.
    const target = event.target as HTMLElement | null
    if (target?.closest('input, textarea, select')) return

    const action = KEY_ACTIONS[event.key.toLowerCase()]
    if (!action) return

    // Arrows and space scroll the page otherwise, which would drag the board
    // out from under the player mid-game.
    event.preventDefault()
    action()
  })

  // A game left running in a hidden tab is a game already lost. Pausing is the
  // honest behaviour, and it stops the frame loop costing anything.
  useEventListener(document, 'visibilitychange', () => {
    if (visibility.value === 'hidden' && !isGameOver.value) isPaused.value = true
  })

  return {
    board,
    cells,
    piece,
    preview,
    score,
    bestScore,
    lines,
    level,
    isPaused,
    isGameOver,
    start,
    move,
    rotate,
    softDrop,
    hardDrop,
    togglePause,
    pauseLoop,
    resumeLoop
  }
}

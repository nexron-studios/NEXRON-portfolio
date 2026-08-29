/**
 * Tetris rules, as pure functions.
 *
 * The backdrop plays itself — there is no player — so this is deliberately
 * only the board mechanics: what a piece looks like, whether it fits, what
 * happens when it lands. Timing, drawing and the frame loop belong to
 * `useTetrisField`; keeping them out of here is what makes this testable.
 *
 * The board is row-major: `board[y][x]`, y counted downwards from the top.
 * A cell holds `null` for empty, or the id of the piece that filled it.
 */

export const tetrominoNameList = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const
export type TetrominoName = (typeof tetrominoNameList)[number]

/** Offsets from the piece origin, in cells. */
export type Cell = { x: number; y: number }

export interface PieceProps {
  name: TetrominoName
  cells: Cell[]
  x: number
  y: number
}

export type Board = (TetrominoName | null)[][]

/**
 * Spawn shapes, each authored around a rotation origin at `0,0` so that
 * `rotatePiece` can turn them without a per-piece kick table — the backdrop
 * never rotates against a wall, so SRS kicks would be dead weight.
 */
const SHAPES: Record<TetrominoName, Cell[]> = {
  I: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ],
  O: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ],
  T: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ],
  S: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 }
  ],
  Z: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ],
  J: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 }
  ],
  L: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 }
  ]
}

export const createBoard = (columns: number, rows: number): Board =>
  Array.from({ length: rows }, () => Array.from({ length: columns }, () => null))

export const createPiece = (name: TetrominoName, x: number, y = 0): PieceProps => ({
  name,
  cells: SHAPES[name].map((cell) => ({ ...cell })),
  x,
  y
})

/**
 * Quarter turn clockwise about the piece origin.
 *
 * O is returned untouched, as in real Tetris: its origin sits at a corner
 * rather than at its centre, so turning it would shift the square a cell up
 * and left instead of leaving it where it is.
 *
 * The `+ 0` normalises the `-0` that negating zero produces — harmless in
 * arithmetic, but it makes two identical shapes compare unequal.
 */
export const rotatePiece = (piece: PieceProps): PieceProps => {
  if (piece.name === 'O') return { ...piece, cells: piece.cells.map((cell) => ({ ...cell })) }

  return {
    ...piece,
    cells: piece.cells.map((cell) => ({ x: -cell.y + 0, y: cell.x + 0 }))
  }
}

export const movePiece = (piece: PieceProps, dx: number, dy: number): PieceProps => ({
  ...piece,
  x: piece.x + dx,
  y: piece.y + dy
})

/** Absolute board coordinates the piece currently occupies. */
export const occupiedCells = (piece: PieceProps): Cell[] =>
  piece.cells.map((cell) => ({ x: piece.x + cell.x, y: piece.y + cell.y }))

/**
 * True when the piece is off the sides, below the floor, or overlapping a
 * settled cell. Cells above the top edge are allowed — a piece spawns there.
 */
export const hasCollision = (board: Board, piece: PieceProps): boolean => {
  const rows = board.length
  const columns = board[0]?.length ?? 0

  return occupiedCells(piece).some((cell) => {
    if (cell.x < 0 || cell.x >= columns) return true
    if (cell.y >= rows) return true
    if (cell.y < 0) return false

    return board[cell.y]?.[cell.x] != null
  })
}

/** A new board with the piece burned in. Cells above the top edge are dropped. */
export const lockPiece = (board: Board, piece: PieceProps): Board => {
  const next = board.map((row) => [...row])

  for (const cell of occupiedCells(piece)) {
    const row = next[cell.y]
    if (row && cell.x >= 0 && cell.x < row.length) {
      row[cell.x] = piece.name
    }
  }

  return next
}

export interface ClearResultProps {
  board: Board
  /** Row indices that were full, top-down — the caller flashes these. */
  clearedRows: number[]
}

/** Removes every full row and drops the rest down, refilling from the top. */
export const clearFullRows = (board: Board): ClearResultProps => {
  const columns = board[0]?.length ?? 0
  const clearedRows: number[] = []
  const kept: Board = []

  board.forEach((row, index) => {
    if (row.every((cell) => cell != null)) {
      clearedRows.push(index)
      return
    }
    kept.push(row)
  })

  if (clearedRows.length === 0) return { board, clearedRows }

  const refill: Board = Array.from({ length: clearedRows.length }, () =>
    Array.from({ length: columns }, () => null)
  )

  return { board: [...refill, ...kept], clearedRows }
}

/**
 * Column the piece should spawn in so it sits roughly centred, clamped so an
 * I-piece never spawns half outside the board on a narrow viewport.
 */
export const spawnColumn = (columns: number, random: number): number => {
  const usable = Math.max(1, columns - 3)

  return 1 + Math.floor(random * usable)
}

export const pickTetromino = (random: number): TetrominoName => {
  const index = Math.min(tetrominoNameList.length - 1, Math.floor(random * tetrominoNameList.length))

  return tetrominoNameList[index] ?? 'I'
}

/**
 * What a *played* game of Tetris adds on top of the board mechanics.
 *
 * `utils/tetris.ts` knows what a piece is and whether it fits; it was written
 * for the self-playing backdrop, which has no player, no score and never
 * rotates against a wall. None of that is changed here — a spec pins its
 * behaviour, including the object identity `clearFullRows` returns when
 * nothing cleared. Everything a player needs lives in this file instead.
 *
 * Pure, like its neighbour: randomness arrives as numbers, time arrives as a
 * level. Nothing here reads a clock or a `Math.random`.
 */

import type { Board, PieceProps, TetrominoName } from '@/utils/tetris'
import {
  hasCollision,
  movePiece,
  occupiedCells,
  rotatePiece,
  tetrominoNameList
} from '@/utils/tetris'

/**
 * Points per simultaneous clear, indexed by how many rows went at once. The
 * jump from 500 to 800 is what makes a four-row clear worth setting up rather
 * than taking two doubles.
 */
const LINE_SCORES = [0, 100, 300, 500, 800] as const

export const LINES_PER_LEVEL = 10
export const MAX_LEVEL = 15
export const SOFT_DROP_POINTS_PER_CELL = 1
export const HARD_DROP_POINTS_PER_CELL = 2

const BASE_GRAVITY_MS = 800
const GRAVITY_FALLOFF = 0.8
const MIN_GRAVITY_MS = 70

/**
 * Horizontal nudges tried when a rotation lands in a wall or a stack, in the
 * order a player expects: stay put, then one out either way, then two.
 *
 * This is not the full SRS kick table — that needs a rotation-state machine
 * the board mechanics do not carry. Five candidates cover every case a 10-wide
 * well actually produces, including an I-piece turned flat against a side.
 */
const WALL_KICK_X_OFFSETS = [0, -1, 1, -2, 2] as const

export const scoreForClear = (clearedCount: number, level: number): number => {
  const base = LINE_SCORES[clearedCount] ?? 0

  return base * (level + 1)
}

export const levelForLines = (totalLines: number): number =>
  Math.min(MAX_LEVEL, Math.floor(totalLines / LINES_PER_LEVEL))

/** Milliseconds a piece waits before falling one row. */
export const gravityIntervalMs = (level: number): number =>
  Math.max(MIN_GRAVITY_MS, Math.round(BASE_GRAVITY_MS * GRAVITY_FALLOFF ** level))

/**
 * One 7-bag: every tetromino exactly once, in an order the caller's randoms
 * decide. A bag beats picking uniformly each time, which can hand out four
 * S-pieces in a row and makes the game feel unfair rather than hard.
 *
 * Takes the randoms rather than drawing them so the shuffle can be asserted.
 * Missing values count as 0, which simply leaves that swap in place.
 */
export const shuffleBag = (randoms: number[]): TetrominoName[] => {
  const bag = [...tetrominoNameList]

  for (let index = bag.length - 1; index > 0; index -= 1) {
    const random = randoms[bag.length - 1 - index] ?? 0
    const target = Math.min(index, Math.floor(random * (index + 1)))
    const held = bag[index] as TetrominoName

    bag[index] = bag[target] as TetrominoName
    bag[target] = held
  }

  return bag
}

/**
 * Rotates the piece, shifting it sideways if the turn would not otherwise fit.
 * Returns `null` when no offset works — the piece then stays as it was, which
 * is what every Tetris does when you rotate inside a tight well.
 */
export const tryRotate = (board: Board, piece: PieceProps): PieceProps | null => {
  const rotated = rotatePiece(piece)

  for (const offset of WALL_KICK_X_OFFSETS) {
    const candidate = movePiece(rotated, offset, 0)
    if (!hasCollision(board, candidate)) return candidate
  }

  return null
}

/** How far down the piece can go before it would hit something. */
export const dropDistance = (board: Board, piece: PieceProps): number => {
  let distance = 0

  while (!hasCollision(board, movePiece(piece, 0, distance + 1))) {
    distance += 1
  }

  return distance
}

export interface CellViewProps {
  /** The tetromino filling this cell, or `null` for empty. */
  fill: TetrominoName | null
  /** Part of the landing preview rather than something actually there. */
  isGhost: boolean
}

/**
 * The settled board, the falling piece and its landing preview flattened into
 * one row-major list the template can loop over.
 *
 * Pure and here rather than in the composable so the overlay order is pinned
 * by a test: the piece has to win over the ghost where the two overlap, or a
 * piece resting on the floor renders as its own shadow.
 */
export const flattenBoard = (
  board: Board,
  piece: PieceProps | null,
  ghostOffset: number
): CellViewProps[] => {
  const columns = board[0]?.length ?? 0
  const cells: CellViewProps[] = board.flatMap((row) =>
    row.map((fill) => ({ fill, isGhost: false }))
  )

  const paint = (target: PieceProps, isGhost: boolean): void => {
    for (const cell of occupiedCells(target)) {
      if (cell.y < 0 || cell.x < 0 || cell.x >= columns) continue

      const index = cell.y * columns + cell.x
      const view = cells[index]
      if (view) {
        view.fill = target.name
        view.isGhost = isGhost
      }
    }
  }

  if (!piece) return cells

  if (ghostOffset > 0) paint(movePiece(piece, 0, ghostOffset), true)
  paint(piece, false)

  return cells
}

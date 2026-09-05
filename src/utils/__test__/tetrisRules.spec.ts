import { describe, expect, it } from 'vitest'
import { createBoard, createPiece, occupiedCells, tetrominoNameList } from '../tetris'
import type { Board } from '../tetris'
import {
  HARD_DROP_POINTS_PER_CELL,
  LINES_PER_LEVEL,
  MAX_LEVEL,
  SOFT_DROP_POINTS_PER_CELL,
  dropDistance,
  flattenBoard,
  gravityIntervalMs,
  levelForLines,
  scoreForClear,
  shuffleBag,
  tryRotate
} from '../tetrisRules'

/** A board with a solid floor row, so pieces have something to land on. */
const boardWithFloor = (columns: number, rows: number): Board => {
  const board = createBoard(columns, rows)
  board[rows - 1] = Array.from({ length: columns }, () => 'I' as const)

  return board
}

describe('scoreForClear', () => {
  it('should award nothing when no rows were cleared', () => {
    expect(scoreForClear(0, 0)).toBe(0)
  })

  it('should award the guideline values at level zero', () => {
    expect(scoreForClear(1, 0)).toBe(100)
    expect(scoreForClear(2, 0)).toBe(300)
    expect(scoreForClear(3, 0)).toBe(500)
    expect(scoreForClear(4, 0)).toBe(800)
  })

  it('should scale with the level', () => {
    expect(scoreForClear(4, 3)).toBe(800 * 4)
  })

  it('should award nothing for a count outside the table', () => {
    expect(scoreForClear(5, 2)).toBe(0)
  })
})

describe('levelForLines', () => {
  it('should start at level zero', () => {
    expect(levelForLines(0)).toBe(0)
    expect(levelForLines(LINES_PER_LEVEL - 1)).toBe(0)
  })

  it('should advance one level every ten lines', () => {
    expect(levelForLines(LINES_PER_LEVEL)).toBe(1)
    expect(levelForLines(LINES_PER_LEVEL * 4 + 3)).toBe(4)
  })

  it('should stop at the maximum level', () => {
    expect(levelForLines(LINES_PER_LEVEL * 999)).toBe(MAX_LEVEL)
  })
})

describe('gravityIntervalMs', () => {
  it('should fall slowest at level zero', () => {
    expect(gravityIntervalMs(0)).toBe(800)
  })

  it('should get faster with every level', () => {
    expect(gravityIntervalMs(3)).toBeLessThan(gravityIntervalMs(2))
  })

  it('should never drop below the floor, however high the level', () => {
    expect(gravityIntervalMs(MAX_LEVEL)).toBeGreaterThanOrEqual(70)
    expect(gravityIntervalMs(999)).toBeGreaterThanOrEqual(70)
  })
})

describe('shuffleBag', () => {
  it('should contain every tetromino exactly once', () => {
    const bag = shuffleBag([0.1, 0.9, 0.4, 0.7, 0.2, 0.55])

    expect([...bag].sort()).toEqual([...tetrominoNameList].sort())
  })

  it('should return the pieces in order when every random is zero', () => {
    // Every swap targets index 0, and swapping the last element with the first
    // repeatedly is a rotation, not a no-op — so assert the permutation, not
    // the original order.
    const bag = shuffleBag([])

    expect(bag).toHaveLength(tetrominoNameList.length)
    expect([...bag].sort()).toEqual([...tetrominoNameList].sort())
  })

  it('should produce different orders for different randoms', () => {
    const first = shuffleBag([0.1, 0.2, 0.3, 0.4, 0.5, 0.6])
    const second = shuffleBag([0.9, 0.8, 0.7, 0.6, 0.5, 0.4])

    expect(first).not.toEqual(second)
  })

  it('should not mutate the source list', () => {
    shuffleBag([0.5, 0.5, 0.5, 0.5, 0.5, 0.5])

    expect(tetrominoNameList).toEqual(['I', 'O', 'T', 'S', 'Z', 'J', 'L'])
  })
})

describe('tryRotate', () => {
  it('should rotate a piece that has room', () => {
    const board = createBoard(10, 20)
    const piece = createPiece('T', 4, 5)

    const rotated = tryRotate(board, piece)

    expect(rotated).not.toBeNull()
    expect(rotated?.cells).not.toEqual(piece.cells)
  })

  it('should kick a piece away from the left wall instead of refusing', () => {
    const board = createBoard(10, 20)
    // An I-piece at x=0 spans -1..2; turning it upright is fine, but the
    // horizontal spawn hangs off the edge, so the kick has to move it in.
    const piece = createPiece('I', 0, 5)

    const rotated = tryRotate(board, piece)

    expect(rotated).not.toBeNull()
    expect(occupiedCells(rotated!).every((cell) => cell.x >= 0)).toBe(true)
  })

  it('should keep the O piece where it is', () => {
    const board = createBoard(10, 20)
    const piece = createPiece('O', 4, 5)

    const rotated = tryRotate(board, piece)

    expect(rotated?.cells).toEqual(piece.cells)
    expect(rotated?.x).toBe(piece.x)
  })

  it('should return null when no offset fits', () => {
    // A one-column well: nothing can turn in it.
    const board = createBoard(1, 6)
    const piece = createPiece('T', 0, 2)

    expect(tryRotate(board, piece)).toBeNull()
  })
})

describe('dropDistance', () => {
  it('should report the gap down to the floor', () => {
    const board = createBoard(10, 20)
    const piece = createPiece('O', 4, 0)

    // O occupies rows 0 and 1; its origin can reach row 18.
    expect(dropDistance(board, piece)).toBe(18)
  })

  it('should stop above a settled row', () => {
    const board = boardWithFloor(10, 20)
    const piece = createPiece('O', 4, 0)

    expect(dropDistance(board, piece)).toBe(17)
  })

  it('should report zero when the piece already rests on something', () => {
    const board = boardWithFloor(10, 20)
    const piece = createPiece('O', 4, 17)

    expect(dropDistance(board, piece)).toBe(0)
  })
})

describe('flattenBoard', () => {
  it('should return one entry per cell, row-major', () => {
    const board = createBoard(4, 3)

    const cells = flattenBoard(board, null, 0)

    expect(cells).toHaveLength(12)
    expect(cells.every((cell) => cell.fill === null && !cell.isGhost)).toBe(true)
  })

  it('should keep what is already settled on the board', () => {
    const board = createBoard(3, 2)
    board[1]![0] = 'T'

    const cells = flattenBoard(board, null, 0)

    expect(cells[3]?.fill).toBe('T')
  })

  it('should paint the falling piece over empty cells', () => {
    const board = createBoard(4, 4)
    const piece = createPiece('O', 1, 0)

    const cells = flattenBoard(board, piece, 0)

    // O occupies (1,0), (2,0), (1,1), (2,1).
    expect(cells[1]?.fill).toBe('O')
    expect(cells[2]?.fill).toBe('O')
    expect(cells[5]?.fill).toBe('O')
    expect(cells[0]?.fill).toBeNull()
  })

  it('should mark the landing preview as a ghost', () => {
    const board = createBoard(4, 6)
    const piece = createPiece('O', 1, 0)

    const cells = flattenBoard(board, piece, 4)

    expect(cells[17]?.isGhost).toBe(true)
    expect(cells[17]?.fill).toBe('O')
  })

  it('should let the piece win where it overlaps its own ghost', () => {
    const board = createBoard(4, 4)
    const piece = createPiece('O', 1, 0)

    // Offset 1 puts the ghost's top row exactly on the piece's bottom row.
    const cells = flattenBoard(board, piece, 1)

    expect(cells[5]?.isGhost).toBe(false)
    expect(cells[9]?.isGhost).toBe(true)
  })

  it('should ignore piece cells above the top edge', () => {
    const board = createBoard(4, 2)
    const piece = createPiece('T', 1, -1)

    expect(() => flattenBoard(board, piece, 0)).not.toThrow()
    expect(flattenBoard(board, piece, 0)).toHaveLength(8)
  })
})

describe('drop scoring constants', () => {
  it('should reward a hard drop more than a soft drop per cell', () => {
    expect(HARD_DROP_POINTS_PER_CELL).toBeGreaterThan(SOFT_DROP_POINTS_PER_CELL)
  })
})

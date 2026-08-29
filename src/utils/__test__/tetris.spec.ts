import { describe, expect, it } from 'vitest'
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
  spawnColumn,
  tetrominoNameList
} from '../tetris'

describe('createBoard', () => {
  it('should build a board of the requested size filled with nulls', () => {
    const board = createBoard(3, 2)

    expect(board).toHaveLength(2)
    expect(board[0]).toHaveLength(3)
    expect(board.flat().every((cell) => cell === null)).toBe(true)
  })
})

describe('createPiece', () => {
  it('should place the piece at the given origin', () => {
    const piece = createPiece('T', 4, 2)

    expect(piece.name).toBe('T')
    expect(piece.x).toBe(4)
    expect(piece.y).toBe(2)
  })

  it('should default the row to the top of the board', () => {
    expect(createPiece('I', 0).y).toBe(0)
  })

  it('should give every tetromino exactly four cells', () => {
    for (const name of tetrominoNameList) {
      expect(createPiece(name, 0).cells).toHaveLength(4)
    }
  })

  it('should not share cell objects between two pieces of the same kind', () => {
    const first = createPiece('L', 0)
    const second = createPiece('L', 0)

    const firstCell = first.cells[0]
    if (firstCell) firstCell.x = 99

    expect(second.cells[0]?.x).not.toBe(99)
  })
})

describe('rotatePiece', () => {
  it('should turn a quarter clockwise about the origin', () => {
    const piece = createPiece('I', 0)
    const rotated = rotatePiece(piece)

    expect(rotated.cells).toEqual([
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 }
    ])
  })

  it('should return to the original shape after four turns', () => {
    const piece = createPiece('S', 3, 1)
    const turned = rotatePiece(rotatePiece(rotatePiece(rotatePiece(piece))))

    expect(turned.cells).toEqual(piece.cells)
  })

  it('should leave the O piece where it is, since a square has nothing to turn', () => {
    const piece = createPiece('O', 3, 2)
    const rotated = rotatePiece(piece)

    expect(occupiedCells(rotated)).toEqual(occupiedCells(piece))
  })
})

describe('movePiece', () => {
  it('should offset the origin without touching the cells', () => {
    const piece = createPiece('J', 2, 1)
    const moved = movePiece(piece, -1, 3)

    expect(moved.x).toBe(1)
    expect(moved.y).toBe(4)
    expect(moved.cells).toEqual(piece.cells)
  })
})

describe('hasCollision', () => {
  it('should report a collision past the left edge', () => {
    const board = createBoard(6, 6)

    expect(hasCollision(board, createPiece('I', 0, 1))).toBe(true)
  })

  it('should report a collision past the right edge', () => {
    const board = createBoard(6, 6)

    expect(hasCollision(board, createPiece('I', 5, 1))).toBe(true)
  })

  it('should report a collision below the floor', () => {
    const board = createBoard(6, 3)

    expect(hasCollision(board, createPiece('O', 2, 3))).toBe(true)
  })

  it('should allow cells above the top edge so a piece can spawn there', () => {
    const board = createBoard(6, 6)

    expect(hasCollision(board, createPiece('T', 2, -1))).toBe(false)
  })

  it('should report a collision with a settled cell', () => {
    const board = createBoard(6, 6)
    const row = board[2]
    if (row) row[2] = 'O'

    expect(hasCollision(board, createPiece('O', 2, 2))).toBe(true)
  })

  it('should report no collision on empty ground', () => {
    expect(hasCollision(createBoard(6, 6), createPiece('T', 2, 2))).toBe(false)
  })
})

describe('lockPiece', () => {
  it('should burn the piece into a new board without mutating the old one', () => {
    const board = createBoard(6, 6)
    const locked = lockPiece(board, createPiece('O', 1, 1))

    expect(locked[1]?.[1]).toBe('O')
    expect(locked[2]?.[2]).toBe('O')
    expect(board[1]?.[1]).toBeNull()
  })

  it('should drop cells that sit above the top edge', () => {
    const board = createBoard(6, 6)
    const locked = lockPiece(board, createPiece('I', 2, -1))

    expect(locked.flat().filter((cell) => cell !== null)).toHaveLength(0)
  })
})

describe('clearFullRows', () => {
  it('should return the board unchanged when no row is full', () => {
    const board = createBoard(3, 3)
    const result = clearFullRows(board)

    expect(result.clearedRows).toEqual([])
    expect(result.board).toBe(board)
  })

  it('should remove a full row and report its index', () => {
    const board = createBoard(3, 3)
    board[2] = ['I', 'I', 'I']

    const result = clearFullRows(board)

    expect(result.clearedRows).toEqual([2])
    expect(result.board).toHaveLength(3)
    expect(result.board[2]).toEqual([null, null, null])
  })

  it('should drop the rows above a cleared row down by one', () => {
    const board = createBoard(2, 3)
    board[1] = ['T', null]
    board[2] = ['I', 'I']

    const result = clearFullRows(board)

    expect(result.board[2]).toEqual(['T', null])
  })

  it('should clear several full rows at once', () => {
    const board = createBoard(2, 3)
    board[1] = ['I', 'I']
    board[2] = ['O', 'O']

    const result = clearFullRows(board)

    expect(result.clearedRows).toEqual([1, 2])
    expect(result.board.flat().every((cell) => cell === null)).toBe(true)
  })
})

describe('spawnColumn', () => {
  it('should stay inside the board for the lowest random value', () => {
    expect(spawnColumn(10, 0)).toBe(1)
  })

  it('should leave room on the right for a four-wide piece', () => {
    expect(spawnColumn(10, 0.999)).toBeLessThanOrEqual(7)
  })

  it('should not return a negative column on a very narrow board', () => {
    expect(spawnColumn(2, 0.5)).toBeGreaterThanOrEqual(1)
  })
})

describe('pickTetromino', () => {
  it('should return the first tetromino for zero', () => {
    expect(pickTetromino(0)).toBe(tetrominoNameList[0])
  })

  it('should return a valid tetromino at the top of the range', () => {
    expect(tetrominoNameList).toContain(pickTetromino(0.999))
  })

  it('should never fall off the end when handed exactly one', () => {
    expect(tetrominoNameList).toContain(pickTetromino(1))
  })
})

import { describe, expect, it } from 'vitest'
import {
  ASCII_RAMP,
  cellRangeAround,
  edgeCells,
  asciiLevel,
  detailCells,
  glyphForLevel,
  isDetailCell,
  isWithinReach,
  pickShimmer,
  luminanceOf,
  quarterIndex
} from '../ascii'

describe('asciiLevel', () => {
  it('should drop the dark ground to empty', () => {
    expect(asciiLevel(0.03)).toBe(0)
  })

  it('should saturate at the high point', () => {
    expect(asciiLevel(0.95)).toBe(1)
  })

  it('should lift the mid-tones with a gamma below one', () => {
    expect(asciiLevel(0.45)).toBeGreaterThan((0.45 - 0.06) / (0.85 - 0.06))
  })
})

describe('luminanceOf', () => {
  it('should read white as one and black as zero', () => {
    expect(luminanceOf(255, 255, 255)).toBeCloseTo(1)
    expect(luminanceOf(0, 0, 0)).toBe(0)
  })
})

describe('glyphForLevel', () => {
  it('should keep an empty level blank', () => {
    expect(glyphForLevel(0)).toBe(' ')
  })

  it('should give the densest glyph at full level', () => {
    expect(glyphForLevel(1)).toBe(ASCII_RAMP.at(-1))
  })

  it('should never nudge a filled cell into the blank', () => {
    expect(glyphForLevel(0.02, -1)).toBe(ASCII_RAMP[1])
  })

  it('should never nudge past the densest glyph', () => {
    expect(glyphForLevel(1, 1)).toBe(ASCII_RAMP.at(-1))
  })
})

describe('isDetailCell', () => {
  it('should split a cell where a thin line crosses one quarter', () => {
    expect(isDetailCell([0.9, 0, 0, 0.1], 0.5)).toBe(true)
  })

  it('should keep a cell of even tone whole', () => {
    expect(isDetailCell([0.6, 0.7, 0.65, 0.6], 0.5)).toBe(false)
  })
})

describe('quarterIndex', () => {
  it('should find the lower right quarter of the second cell in a two-column grid', () => {
    expect(quarterIndex(1, 3, 2)).toBe(7)
  })
})

describe('detailCells', () => {
  it('should mark only the cell a thin line runs through', () => {
    // Two cells side by side; the half-size grid is 4 × 2, row by row.
    const fine = [0.9, 0, 0.5, 0.5, 0, 0, 0.5, 0.5]
    expect(Array.from(detailCells(fine, 2, 1, 0.5))).toEqual([1, 0])
  })
})

describe('edgeCells', () => {
  it('should mark the ring of a filled block and leave its centre plain', () => {
    // A 3 × 3 block of ink inside a 5 × 5 field.
    const levels = [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]
    expect(Array.from(edgeCells(levels, 5, 5))).toEqual([
      0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0
    ])
  })
})

describe('cellRangeAround', () => {
  it('should clamp the reach of a point near the corner to the grid', () => {
    const grid = { cols: 10, rows: 10, offsetX: 0, offsetY: 0, cellW: 10, cellH: 10 }
    expect(cellRangeAround(5, 5, 20, grid)).toEqual({ colFrom: 0, colTo: 3, rowFrom: 0, rowTo: 3 })
  })
})

describe('pickShimmer', () => {
  it('should nudge only inked cells it lands on', () => {
    const rolls = [0.6, 0.3, 0.1]
    const random = (): number => rolls.shift()!
    const { jitter, picked } = pickShimmer([0, 1, 1, 1], 0.5, random)
    expect(Array.from(jitter)).toEqual([0, 0, -1, 0])
    expect(picked).toEqual([2])
  })
})

describe('isWithinReach', () => {
  it('should count a point just left of the box as near', () => {
    expect(isWithinReach(-5, 10, { width: 100, height: 50 }, 10)).toBe(true)
  })

  it('should count a point beyond the reach as far', () => {
    expect(isWithinReach(-15, 10, { width: 100, height: 50 }, 10)).toBe(false)
  })
})

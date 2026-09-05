import { describe, expect, it } from 'vitest'
import { atlasGridSize, atlasTile } from '../iconAtlas'

describe('atlasGridSize', () => {
  it('should use a single tile for one icon', () => {
    expect(atlasGridSize(1)).toBe(1)
  })

  it('should use an exact square when the count is one', () => {
    expect(atlasGridSize(16)).toBe(4)
    expect(atlasGridSize(25)).toBe(5)
  })

  it('should round up rather than drop the remainder', () => {
    expect(atlasGridSize(17)).toBe(5)
    expect(atlasGridSize(26)).toBe(6)
  })

  it('should never return zero, even for an empty set', () => {
    expect(atlasGridSize(0)).toBe(1)
  })
})

describe('atlasTile', () => {
  it('should place the first icon in the top-left of the canvas', () => {
    const tile = atlasTile(0, 5)

    expect(tile.column).toBe(0)
    expect(tile.row).toBe(0)
  })

  it('should wrap to the next row at the end of a row', () => {
    expect(atlasTile(4, 5)).toMatchObject({ column: 4, row: 0 })
    expect(atlasTile(5, 5)).toMatchObject({ column: 0, row: 1 })
  })

  it('should size the UV window to one tile', () => {
    expect(atlasTile(0, 4).scale).toBe(0.25)
  })

  it('should put the top-left tile at the TOP of the texture, not the bottom', () => {
    // The flip is the point of this module: canvas row 0 is drawn at the top,
    // so its UV offset has to be the highest one, not zero.
    const tile = atlasTile(0, 5)

    expect(tile.offsetX).toBe(0)
    expect(tile.offsetY).toBeCloseTo(0.8)
  })

  it('should put the last tile of a full grid at the bottom right', () => {
    const tile = atlasTile(24, 5)

    expect(tile.column).toBe(4)
    expect(tile.row).toBe(4)
    expect(tile.offsetX).toBeCloseTo(0.8)
    expect(tile.offsetY).toBeCloseTo(0)
  })

  it('should keep every window inside the texture', () => {
    for (let index = 0; index < 25; index += 1) {
      const tile = atlasTile(index, 5)

      expect(tile.offsetX).toBeGreaterThanOrEqual(0)
      expect(tile.offsetY).toBeGreaterThanOrEqual(0)
      expect(tile.offsetX + tile.scale).toBeLessThanOrEqual(1)
      expect(tile.offsetY + tile.scale).toBeLessThanOrEqual(1)
    }
  })

  it('should give every index its own window', () => {
    const seen = new Set(
      Array.from({ length: 25 }, (_, index) => {
        const tile = atlasTile(index, 5)
        return `${tile.offsetX}:${tile.offsetY}`
      })
    )

    expect(seen.size).toBe(25)
  })

  it('should survive a grid size of zero', () => {
    expect(() => atlasTile(0, 0)).not.toThrow()
    expect(atlasTile(0, 0).scale).toBe(1)
  })
})

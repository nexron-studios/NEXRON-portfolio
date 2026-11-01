import { describe, expect, it } from 'vitest'
import { MATRIX_GLYPHS, nextDropRow, pickGlyph } from '../matrixRain'

describe('pickGlyph', () => {
  it('should map 0 to the first glyph', () => {
    expect(pickGlyph(0)).toBe(MATRIX_GLYPHS[0])
  })

  it('should hold no characters outside printable ASCII', () => {
    expect(/^[!-~]+$/.test(MATRIX_GLYPHS)).toBe(true)
  })

  it('should never run past the last glyph', () => {
    expect(pickGlyph(0.999999)).toBe(MATRIX_GLYPHS.at(-1))
  })
})

describe('nextDropRow', () => {
  it('should fall by its speed inside the field', () => {
    expect(nextDropRow(4, 0.5, 20, 0.9)).toBe(4.5)
  })

  it('should wait below the field on most frames', () => {
    expect(nextDropRow(21, 0.5, 20, 0.9)).toBe(21)
  })

  it('should restart above the field now and then', () => {
    expect(nextDropRow(21, 0.5, 20, 0.01)).toBeLessThanOrEqual(0)
  })
})

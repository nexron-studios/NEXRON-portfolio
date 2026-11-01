import { describe, expect, it } from 'vitest'
import { pathProgress } from '../pathProgress'

describe('pathProgress', () => {
  it('should be zero before the track reaches the reading line', () => {
    expect(pathProgress(600, 1000, 500)).toBe(0)
  })

  it('should be the share of the track above the reading line', () => {
    expect(pathProgress(0, 1000, 500)).toBe(0.5)
  })

  it('should be one once the whole track has passed', () => {
    expect(pathProgress(-2000, 1000, 500)).toBe(1)
  })

  it('should be zero for a track with no height', () => {
    expect(pathProgress(0, 0, 500)).toBe(0)
  })
})

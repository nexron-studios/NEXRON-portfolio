import { describe, expect, it } from 'vitest'
import { buildBars, buildRings, hashSeed, pseudoRandom } from '../blueprint'

describe('hashSeed', () => {
  it('should return the same hash for the same seed', () => {
    expect(hashSeed('voxel-forge')).toBe(hashSeed('voxel-forge'))
  })

  it('should return different hashes for different seeds', () => {
    expect(hashSeed('voxel-forge')).not.toBe(hashSeed('signal-noise'))
  })

  it('should return 0 for an empty seed', () => {
    expect(hashSeed('')).toBe(0)
  })
})

describe('pseudoRandom', () => {
  it('should stay within the given bounds', () => {
    const hash = hashSeed('portfolio')

    for (let offset = 0; offset < 20; offset += 1) {
      const value = pseudoRandom(hash, offset, 14, 46)
      expect(value).toBeGreaterThanOrEqual(14)
      expect(value).toBeLessThan(46)
    }
  })

  it('should be deterministic for the same hash and offset', () => {
    expect(pseudoRandom(1234, 3, 0, 1)).toBe(pseudoRandom(1234, 3, 0, 1))
  })
})

describe('buildRings', () => {
  it('should build three rings inside the drawing area', () => {
    const rings = buildRings(hashSeed('nexron'))

    expect(rings).toHaveLength(3)
    rings.forEach((ring) => {
      expect(ring.cx).toBeGreaterThanOrEqual(60)
      expect(ring.cx).toBeLessThan(240)
      expect(ring.r).toBeGreaterThanOrEqual(14)
    })
  })
})

describe('buildBars', () => {
  it('should space five bars evenly from the left datum line', () => {
    const bars = buildBars(hashSeed('nexron'))

    expect(bars).toHaveLength(5)
    expect(bars.map((bar) => bar.x)).toEqual([24, 44, 64, 84, 104])
  })
})

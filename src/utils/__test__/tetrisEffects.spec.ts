import { describe, expect, it } from 'vitest'
import {
  BIG_CLEAR_ROWS,
  createRowBurst,
  createRowFlashes,
  shakeOffset,
  shakeStrength,
  stepFlashes,
  stepParticles,
  type ParticleProps
} from '../tetrisEffects'

/** Every cell filled, so a burst covers the whole row. */
const filled = () => 'T' as const

/** Enough values to serve any burst in these tests, and deterministic. */
const randoms = Array.from({ length: 2000 }, (_, index) => ((index * 37) % 100) / 100)

const buildParticle = (overrides: Partial<ParticleProps> = {}): ParticleProps => ({
  column: 4,
  row: 10,
  vx: 2,
  vy: -3,
  life: 0.5,
  maxLife: 0.5,
  fill: 'I',
  ...overrides
})

describe('createRowFlashes', () => {
  it('should flash every cleared row', () => {
    const flashes = createRowFlashes([4, 5])

    expect(flashes.map((flash) => flash.row)).toEqual([4, 5])
  })

  it('should start each flash at full life', () => {
    const [flash] = createRowFlashes([7])

    expect(flash?.life).toBe(flash?.maxLife)
  })

  it('should produce nothing when no row was cleared', () => {
    expect(createRowFlashes([])).toEqual([])
  })
})

describe('createRowBurst', () => {
  it('should scale the debris with the number of rows', () => {
    const one = createRowBurst([5], 10, filled, randoms)
    const four = createRowBurst([2, 3, 4, 5], 10, filled, randoms)

    expect(four.length).toBe(one.length * 4)
  })

  it('should skip cells that were empty', () => {
    const half = createRowBurst([5], 10, (_row, column) => (column < 5 ? 'O' : null), randoms)
    const full = createRowBurst([5], 10, filled, randoms)

    expect(half.length).toBe(full.length / 2)
  })

  it('should keep the colour of the piece it broke off', () => {
    const particles = createRowBurst([5], 4, () => 'S', randoms)

    expect(particles.every((particle) => particle.fill === 'S')).toBe(true)
  })

  it('should throw the debris upwards first', () => {
    const particles = createRowBurst([5], 10, filled, randoms)

    expect(particles.every((particle) => particle.vy < 0)).toBe(true)
  })

  it('should place the debris inside the row it came from', () => {
    const particles = createRowBurst([5], 10, filled, randoms)

    expect(particles.every((particle) => particle.row >= 5 && particle.row < 6)).toBe(true)
  })

  it('should produce nothing for an empty row list', () => {
    expect(createRowBurst([], 10, filled, randoms)).toEqual([])
  })
})

describe('stepParticles', () => {
  it('should drop a particle once its life runs out', () => {
    const result = stepParticles([buildParticle({ life: 0.1 })], 0.2)

    expect(result).toEqual([])
  })

  it('should keep a particle that still has life', () => {
    const result = stepParticles([buildParticle({ life: 0.5 })], 0.1)

    expect(result).toHaveLength(1)
    expect(result[0]?.life).toBeCloseTo(0.4)
  })

  it('should pull a particle downwards over time', () => {
    const [first] = stepParticles([buildParticle({ vy: 0 })], 0.1)

    expect(first?.vy).toBeGreaterThan(0)
    expect(first?.row).toBeGreaterThan(10)
  })

  it('should slow a particle sideways', () => {
    const [first] = stepParticles([buildParticle({ vx: 4 })], 0.1)

    expect(first?.vx).toBeLessThan(4)
  })

  it('should not mutate the particles it was given', () => {
    const particle = buildParticle()
    stepParticles([particle], 0.1)

    expect(particle.row).toBe(10)
    expect(particle.life).toBe(0.5)
  })

  it('should leave everything alone for a zero delta', () => {
    const particles = [buildParticle()]

    expect(stepParticles(particles, 0)).toBe(particles)
  })
})

describe('stepFlashes', () => {
  it('should let a flash expire', () => {
    expect(stepFlashes(createRowFlashes([3]), 1)).toEqual([])
  })

  it('should keep a flash that is still burning', () => {
    expect(stepFlashes(createRowFlashes([3]), 0.1)).toHaveLength(1)
  })
})

describe('shakeStrength', () => {
  it('should not shake the board for a routine clear', () => {
    expect(shakeStrength(1)).toBe(0)
    expect(shakeStrength(2)).toBe(0)
  })

  it('should shake for a big clear, harder the more rows went', () => {
    expect(shakeStrength(BIG_CLEAR_ROWS)).toBeGreaterThan(0)
    expect(shakeStrength(4)).toBeGreaterThan(shakeStrength(3))
  })
})

describe('shakeOffset', () => {
  it('should be still when nothing shook it', () => {
    expect(shakeOffset(0, 0.1, 0.3)).toBe(0)
  })

  it('should be still again once the shake is over', () => {
    expect(shakeOffset(6, 0.3, 0.3)).toBe(0)
    expect(shakeOffset(6, 0.5, 0.3)).toBe(0)
  })

  it('should decay rather than hold its amplitude', () => {
    const early = Math.abs(shakeOffset(6, 0.02, 0.3))
    const late = Math.abs(shakeOffset(6, 0.26, 0.3))

    expect(late).toBeLessThan(early)
  })

  it('should never exceed the strength it was given', () => {
    for (let elapsed = 0; elapsed < 0.3; elapsed += 0.01) {
      expect(Math.abs(shakeOffset(6, elapsed, 0.3))).toBeLessThanOrEqual(6)
    }
  })
})

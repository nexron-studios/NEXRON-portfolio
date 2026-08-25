/**
 * Geometry for the stand-in artwork projects get while they have no
 * screenshot. Everything here is derived from the project slug, so a project
 * always draws the same figure and no two projects draw the same one.
 */

const HASH_PRIME = 31
const HASH_MODULO = 100_000
/** The two constants every "one-liner noise" snippet on the web carries. */
const NOISE_FACTOR = 12.9898
const NOISE_SCALE = 43_758.5453

const RING_COUNT = 3
const BAR_COUNT = 5
const BAR_SPACING = 20
const BAR_ORIGIN_X = 24
const BAR_BASELINE_Y = 140

export interface BlueprintRingProps {
  cx: number
  cy: number
  r: number
}

export interface BlueprintBarProps {
  x: number
  height: number
}

/** Cheap deterministic hash — only needs to be stable, not uniform. */
export const hashSeed = (seed: string): number => {
  let value = 0
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * HASH_PRIME + seed.charCodeAt(index)) % HASH_MODULO
  }
  return value
}

/** Deterministic value in `[min, max)`, varied by `offset`. */
export const pseudoRandom = (hash: number, offset: number, min: number, max: number): number => {
  const value = Math.sin(hash * (offset + 1) * NOISE_FACTOR) * NOISE_SCALE
  return min + (value - Math.floor(value)) * (max - min)
}

export const buildRings = (hash: number): BlueprintRingProps[] =>
  Array.from({ length: RING_COUNT }, (_, index) => ({
    cx: pseudoRandom(hash, index * 3 + 1, 60, 240),
    cy: pseudoRandom(hash, index * 3 + 2, 40, 120),
    r: pseudoRandom(hash, index * 3 + 3, 14, 46)
  }))

export const buildBars = (hash: number): BlueprintBarProps[] =>
  Array.from({ length: BAR_COUNT }, (_, index) => ({
    x: BAR_ORIGIN_X + index * BAR_SPACING,
    height: pseudoRandom(hash, index + 11, 10, 54)
  }))

export const BLUEPRINT_BAR_BASELINE_Y = BAR_BASELINE_Y

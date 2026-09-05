/**
 * What a cleared row leaves behind, as pure state.
 *
 * The same split as the ball pit: the arithmetic lives here and is specced
 * without a canvas, while `useTetrisBoard` owns the frame loop and the
 * painting. Nothing in this file knows about Vue, colours or the DOM.
 *
 * Positions are in board coordinates — column and row, fractional — so the
 * projection stays the renderer's business and a particle does not have to be
 * recomputed when the canvas is resized.
 */

import type { TetrominoName } from '@/utils/tetris'

export interface ParticleProps {
  column: number
  row: number
  /** Cells per second. */
  vx: number
  vy: number
  /** Seconds left to live, counted down. */
  life: number
  /** What it started with — the renderer fades against this. */
  maxLife: number
  /** Which piece it broke off, so it keeps that piece's colour. */
  fill: TetrominoName
}

export interface RowFlashProps {
  row: number
  life: number
  maxLife: number
}

/** Below this many rows a clear is a quiet event, at or above it a loud one. */
export const BIG_CLEAR_ROWS = 3

/** Cells per second squared. Positive is downwards, matching the board. */
const GRAVITY = 14
/** Share of horizontal speed kept per second. */
const DRAG = 0.35
const PARTICLE_LIFE_SECONDS = 0.85
const FLASH_LIFE_SECONDS = 0.42

/** Particles per cleared cell. Four rows of ten is already a lot of confetti. */
const PARTICLES_PER_CELL = 3

/**
 * The flash every clear gets — one row or four, the line itself always lights
 * up. It is the only feedback under reduced motion.
 */
export const createRowFlashes = (rows: number[]): RowFlashProps[] =>
  rows.map((row) => ({ row, life: FLASH_LIFE_SECONDS, maxLife: FLASH_LIFE_SECONDS }))

/**
 * The debris of a big clear.
 *
 * `randoms` is passed in rather than drawn here, so the spread is testable and
 * this file stays a pure function of its arguments — the same reason
 * `shuffleBag` in `tetrisRules.ts` takes its randomness as an argument.
 */
export const createRowBurst = (
  rows: number[],
  columns: number,
  fillOf: (row: number, column: number) => TetrominoName | null,
  randoms: number[]
): ParticleProps[] => {
  const particles: ParticleProps[] = []
  let cursor = 0

  const next = (): number => {
    const value = randoms[cursor] ?? 0.5
    cursor += 1

    return value
  }

  for (const row of rows) {
    for (let column = 0; column < columns; column += 1) {
      const fill = fillOf(row, column)
      if (!fill) continue

      for (let index = 0; index < PARTICLES_PER_CELL; index += 1) {
        particles.push({
          column: column + next(),
          row: row + next(),
          // Sideways out of the line, and upwards first — debris that only
          // falls reads as the row sagging rather than as it bursting.
          vx: (next() - 0.5) * 9,
          vy: -next() * 6 - 1,
          life: PARTICLE_LIFE_SECONDS,
          maxLife: PARTICLE_LIFE_SECONDS,
          fill
        })
      }
    }
  }

  return particles
}

/**
 * Advances every particle and drops the dead ones. Returns a new array — the
 * renderer swaps it in, which keeps the caller from mutating mid-frame.
 */
export const stepParticles = (particles: ParticleProps[], delta: number): ParticleProps[] => {
  if (delta <= 0) return particles

  const drag = Math.pow(DRAG, delta)
  const alive: ParticleProps[] = []

  for (const particle of particles) {
    const life = particle.life - delta
    if (life <= 0) continue

    const vx = particle.vx * drag
    const vy = particle.vy + GRAVITY * delta

    alive.push({
      ...particle,
      life,
      vx,
      vy,
      column: particle.column + vx * delta,
      row: particle.row + vy * delta
    })
  }

  return alive
}

export const stepFlashes = (flashes: RowFlashProps[], delta: number): RowFlashProps[] => {
  if (delta <= 0) return flashes

  return flashes
    .map((flash) => ({ ...flash, life: flash.life - delta }))
    .filter((flash) => flash.life > 0)
}

/**
 * How hard the well is knocked by a clear, in pixels — zero for one or two
 * rows, so a routine clear does not shove the board the player is aiming at.
 */
export const shakeStrength = (clearedRows: number): number =>
  clearedRows >= BIG_CLEAR_ROWS ? 3 + (clearedRows - BIG_CLEAR_ROWS) * 3 : 0

/**
 * Decaying offset for the shake, in pixels. A sine against a falling envelope:
 * a couple of shudders that are gone well inside the motion budget.
 */
export const shakeOffset = (strength: number, elapsed: number, duration: number): number => {
  if (strength <= 0 || elapsed >= duration) return 0

  const remaining = 1 - elapsed / duration

  return Math.sin(elapsed * 46) * strength * remaining * remaining
}

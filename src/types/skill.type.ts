import type { LocalizedText } from '@/types/i18n.type'

/**
 * Which part of the profile a technology belongs to — one per chamber of the
 * tech-stack pit.
 *
 * Drives colour, and does so without widening the palette: `dev` is the cyan
 * signal, `creative` the violet one, and the two additions sit *between* them
 * on the same axis — `ai` is a dev/creative blend, `infra` a desaturated dev.
 * Four readable chambers, still only two hues. See `tokens.css`.
 */
export const skillDomainList = ['dev', 'ai', 'creative', 'infra'] as const
export type SkillDomain = (typeof skillDomainList)[number]

export interface SkillProps {
  name: string
  /**
   * Playful one-liner revealed on hover — e.g. PostgreSQL showing
   * `SELECT * FROM ideas;`. Null means the tile stays quiet.
   */
  quip: string | null
  /** Marks technologies carried by a shipped project rather than tried once. */
  isCore: boolean
}

export interface SkillGroupProps {
  id: string
  label: LocalizedText
  domain: SkillDomain
  skills: SkillProps[]
}

/**
 * A technology that also appears as a floating object in the orb scene.
 * Kept separate from `SkillProps` because the scene needs far fewer of
 * them — a crowded orb field reads as noise.
 */
export interface OrbSkillProps {
  name: string
  domain: SkillDomain
  /** Relative size, 0.6–1.4. Bigger = more central to the profile. */
  weight: number
  /** One line shown on hover — what it is and what Jonas uses it for. */
  blurb: LocalizedText
}

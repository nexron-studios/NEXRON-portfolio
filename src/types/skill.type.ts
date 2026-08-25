import type { LocalizedText } from '@/types/i18n.type'

/**
 * Which half of the profile a technology belongs to. Drives colour:
 * `dev` renders cyan, `creative` renders violet. Nothing else sets a hue.
 */
export const skillDomainList = ['dev', 'creative'] as const
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
}

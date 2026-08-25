import type { LocalizedText } from '@/types/i18n.type'

export const experienceKindList = ['education', 'work', 'studio'] as const
export type ExperienceKind = (typeof experienceKindList)[number]

export interface ExperienceProps {
  id: string
  kind: ExperienceKind
  /** Institution or company. Never guessed — see `isVerified`. */
  organization: string
  /** Null wherever the exact title could not be confirmed. */
  role: LocalizedText | null
  location: string | null
  /** ISO `YYYY-MM`. Null means the date is not confirmed yet. */
  startedAt: string | null
  /** ISO `YYYY-MM`, or null for "ongoing" — disambiguated by `isOngoing`. */
  endedAt: string | null
  isOngoing: boolean
  summary: LocalizedText | null
  technologies: string[]
  /**
   * False for entries whose details could not be confirmed from a source.
   * The timeline renders these as an explicit gap to be filled rather than
   * inventing a plausible-looking title, company or date.
   */
  isVerified: boolean
}

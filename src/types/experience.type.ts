import type { LocalizedText } from '@/types/i18n.type'

export const experienceKindList = ['education', 'work', 'studio'] as const
export type ExperienceKind = (typeof experienceKindList)[number]

export interface ExperienceProps {
  id: string
  kind: ExperienceKind
  /** Institution or company. */
  organization: string
  role: LocalizedText
  location: string
  /** ISO `YYYY-MM`. */
  startedAt: string
  /** ISO `YYYY-MM`, or null for "ongoing" — disambiguated by `isOngoing`. */
  endedAt: string | null
  isOngoing: boolean
  summary: LocalizedText
  /** Optional canonical page for the programme or position. */
  href?: string
  /**
   * Path to a logo under `public/logos/`. Null falls back to a generated
   * monogram, so an entry never waits on an asset to render.
   */
  logo: string | null
}

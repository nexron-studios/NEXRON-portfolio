import type { LocalizedText } from '@/types/i18n.type'

export const experienceKindList = ['education', 'work', 'studio'] as const
export type ExperienceKind = (typeof experienceKindList)[number]

export interface ExperienceProps {
  id: string
  kind: ExperienceKind
  /** Institution or company. */
  organization: string
  /** Omitted where the title already is the role — a school-leaving certificate. */
  role?: LocalizedText
  /** Omitted where the place adds nothing the organisation does not already say. */
  location?: string
  /** ISO `YYYY-MM`. */
  startedAt: string
  /** ISO `YYYY-MM`, or null for "ongoing" — disambiguated by `isOngoing`. */
  endedAt: string | null
  isOngoing: boolean
  summary: LocalizedText
  /** Optional canonical page for the programme or position. */
  href?: string
  /**
   * An imported image from `src/assets/`. Null falls back to a generated
   * monogram, so an entry never waits on an asset to render.
   */
  logo: string | null
  /**
   * True when the file brings its own ground and fills its frame — it is then
   * cropped to the disc rather than fitted onto a white one.
   *
   * The distinction belongs to the file, not to the layout: a transparent mark
   * needs a light ground to be visible and must not lose its edges to the
   * crop, while a logo already sitting on its own background looks like a
   * stamp when it is inset on a second one.
   */
  isLogoFullBleed?: boolean
}

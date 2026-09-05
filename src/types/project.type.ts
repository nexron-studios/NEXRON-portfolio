import type { LocalizedText } from '@/types/i18n.type'

export const projectCategoryList = ['web', 'desktop', 'ai', 'fullstack', '3d', 'tools'] as const
export type ProjectCategory = (typeof projectCategoryList)[number]

export const projectStatusList = ['shipped', 'building', 'experiment'] as const
export type ProjectStatus = (typeof projectStatusList)[number]

export const projectVisibilityList = ['public', 'private'] as const
export type ProjectVisibility = (typeof projectVisibilityList)[number]

export const shotOrientationList = ['landscape', 'portrait'] as const
export type ShotOrientation = (typeof shotOrientationList)[number]

export interface ProjectShotProps {
  /** Imported from `src/assets/projects/<slug>/`, never a path string. */
  src: string
  /** What the screen shows. Doubles as the caption and the alt text. */
  label: LocalizedText
}

export interface ProjectDetailProps {
  overview: LocalizedText
  /** What was actually annoying enough to build something about. */
  problem: LocalizedText
  idea: LocalizedText
  implementation: LocalizedText
  challenges: LocalizedText[]
  learnings: LocalizedText[]
}

export interface ProjectProps {
  /** URL segment under /projects/ — must be unique and kebab-case. */
  slug: string
  name: string
  tagline: LocalizedText
  categories: ProjectCategory[]
  /** Display order is meaningful: most characteristic technology first. */
  stack: string[]
  year: number
  /**
   * `private` repositories render a badge instead of a repository link —
   * linking them would 404 for every visitor.
   */
  visibility: ProjectVisibility
  /** Always null when `visibility` is `private`. */
  repoUrl: string | null
  liveUrl: string | null
  status: ProjectStatus
  /**
   * Screenshots, in display order — the first one is what the card shows. An
   * empty list renders the generated blueprint instead, so a project never
   * waits on an asset to exist.
   */
  shots: ProjectShotProps[]
  /**
   * Which way the screens are shaped, because it decides how they are framed:
   * a phone-shaped app cropped into a 21:9 strip shows a sliver of itself, and
   * a desktop window lined up like a phone wastes half the row.
   *
   * Per project rather than per shot: a set of screens comes from one app, and
   * an app has one shape.
   */
  shotOrientation: ShotOrientation
  /** Null hides the "open detail" affordance on the card. */
  detail: ProjectDetailProps | null
}

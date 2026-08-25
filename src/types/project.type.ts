import type { LocalizedText } from '@/types/i18n.type'

export const projectCategoryList = ['web', 'desktop', 'ai', 'fullstack', '3d', 'tools'] as const
export type ProjectCategory = (typeof projectCategoryList)[number]

export const projectStatusList = ['shipped', 'building', 'experiment'] as const
export type ProjectStatus = (typeof projectStatusList)[number]

export const projectVisibilityList = ['public', 'private'] as const
export type ProjectVisibility = (typeof projectVisibilityList)[number]

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
  /** File under /images/projects/. Null renders the blueprint placeholder. */
  image: string | null
  /** Null hides the "open detail" affordance on the card. */
  detail: ProjectDetailProps | null
}

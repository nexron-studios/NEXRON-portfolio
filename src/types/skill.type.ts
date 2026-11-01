/**
 * Which part of the profile a technology or a service belongs to. Used to
 * group, no longer to colour: the page has one accent.
 */
export const skillDomainList = ['dev', 'ai', 'creative', 'infra'] as const
export type SkillDomain = (typeof skillDomainList)[number]

export interface SkillProps {
  name: string
  /** Marks technologies carried by a shipped project rather than tried once. */
  isCore: boolean
}

export interface SkillGroupProps {
  id: string
  label: string
  domain: SkillDomain
  skills: SkillProps[]
}

/** One of the four areas with every group that belongs to it, in order. */
export interface SkillDomainSectionProps {
  domain: SkillDomain
  groups: SkillGroupProps[]
}

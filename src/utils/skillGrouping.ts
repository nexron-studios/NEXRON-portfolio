import { skillDomainList } from '@/types/skill.type'
import type { SkillDomainSectionProps, SkillGroupProps } from '@/types/skill.type'

/**
 * Bundles the written skill groups under the four domains of the pit, in
 * `skillDomainList` order.
 *
 * The groups in `data/skills.ts` are finer than the chambers — "Backend &
 * Infrastruktur" and "Desktop & Systems" are both `infra` — and they are
 * authored in reading order, not in chamber order. Rendering them as they come
 * left the list looking like a separate inventory that happened to sit under
 * the scene. Grouped this way it reads as the pit spelled out.
 *
 * A domain nothing belongs to is dropped rather than rendered empty.
 */
export const groupByDomain = (groups: SkillGroupProps[]): SkillDomainSectionProps[] =>
  skillDomainList
    .map((domain) => ({ domain, groups: groups.filter((group) => group.domain === domain) }))
    .filter((section) => section.groups.length > 0)

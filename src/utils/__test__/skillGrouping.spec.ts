import { describe, expect, it } from 'vitest'
import { groupByDomain } from '../skillGrouping'
import type { SkillDomain, SkillGroupProps } from '@/types/skill.type'

const buildGroup = (id: string, domain: SkillDomain): SkillGroupProps => ({
  id,
  label: { de: id, en: id },
  domain,
  skills: [{ name: id, quip: null, isCore: false }]
})

describe('groupByDomain', () => {
  it('should order the sections like the chambers of the pit', () => {
    const sections = groupByDomain([
      buildGroup('creative-tools', 'creative'),
      buildGroup('backend', 'infra'),
      buildGroup('frontend', 'dev'),
      buildGroup('machine-learning', 'ai')
    ])

    expect(sections.map((section) => section.domain)).toEqual(['dev', 'ai', 'creative', 'infra'])
  })

  it('should collect every group that shares a domain', () => {
    const sections = groupByDomain([
      buildGroup('backend', 'infra'),
      buildGroup('frontend', 'dev'),
      buildGroup('desktop', 'infra')
    ])

    const infra = sections.find((section) => section.domain === 'infra')

    expect(infra?.groups.map((group) => group.id)).toEqual(['backend', 'desktop'])
  })

  it('should keep the authored order of the groups within a domain', () => {
    const sections = groupByDomain([buildGroup('desktop', 'infra'), buildGroup('backend', 'infra')])

    expect(sections[0]?.groups.map((group) => group.id)).toEqual(['desktop', 'backend'])
  })

  it('should drop a domain no group belongs to', () => {
    const sections = groupByDomain([buildGroup('frontend', 'dev')])

    expect(sections).toHaveLength(1)
    expect(sections[0]?.domain).toBe('dev')
  })

  it('should lose no group', () => {
    const groups = [
      buildGroup('frontend', 'dev'),
      buildGroup('machine-learning', 'ai'),
      buildGroup('data', 'ai'),
      buildGroup('creative-tools', 'creative'),
      buildGroup('backend', 'infra')
    ]

    const collected = groupByDomain(groups).flatMap((section) => section.groups)

    expect(collected).toHaveLength(groups.length)
  })

  it('should return nothing for an empty list', () => {
    expect(groupByDomain([])).toEqual([])
  })
})

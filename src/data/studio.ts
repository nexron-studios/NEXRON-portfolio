import type { SkillDomain } from '@/types/skill.type'

/**
 * What NEXRON Studios actually does.
 *
 * Prose, not UI chrome, so it lives here rather than in the locale file.
 */
export interface ServiceProps {
  id: string
  label: string
  summary: string
  /** Decides the accent colour, same domains as the tech stack. */
  domain: SkillDomain
}

export const studioIntro: string =
  'This site is my portfolio. NEXRON Studios is the registered trade behind it: if you want one of the four things below built, you hire it here. Fast enough that it actually takes work off your hands.'

export const services: ServiceProps[] = [
  {
    id: 'web',
    label: 'Web & applications',
    summary:
      'Frontend and full-stack, from the requirement through database and API to the release.',
    domain: 'dev'
  },
  {
    id: 'desktop',
    label: 'Desktop tools',
    summary:
      'Standalone programs that run as classic software right on your machine. No browser, no account, works offline.',
    domain: 'infra'
  },
  {
    id: 'ai',
    label: 'AI & data',
    summary:
      'Classification, regression and computer vision with neural networks, plus data analysis and data preparation. For companies also chatbots and RAG systems.',
    domain: 'ai'
  },
  {
    id: 'creative',
    label: '3D & design',
    summary:
      'Logos and graphics of all kinds, visuals and animations in Blender, and interactive 3D in the browser.',
    domain: 'creative'
  }
]

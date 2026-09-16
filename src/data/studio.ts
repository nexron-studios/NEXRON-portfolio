import type { LocalizedText } from '@/types/i18n.type'
import type { SkillDomain } from '@/types/skill.type'

/**
 * What NEXRON Studios actually does.
 *
 * Prose, not UI chrome — so it lives here as `LocalizedText` rather than in
 * the locale files.
 */
export interface ServiceProps {
  id: string
  label: LocalizedText
  summary: LocalizedText
  /** Decides the accent colour, same domains as the tech stack. */
  domain: SkillDomain
}

export const studioIntro: LocalizedText = {
  de: 'NEXRON Studios ist mein eigenes Gewerbe. Angemeldet habe ich es für das, was ich ohnehin am liebsten mache: entwickeln, gestalten und KI-Anwendungen schnell genug an den Markt bringen, dass sie jemandem tatsächlich Arbeit abnehmen.',
  en: 'NEXRON Studios is my own trade. I registered it for the thing I would be doing anyway: building, designing, and getting AI applications to market fast enough that they actually take work off someone’s hands.'
}

export const services: ServiceProps[] = [
  {
    id: 'web',
    label: { de: 'Web & Anwendungen', en: 'Web & applications' },
    summary: {
      de: 'Frontend und Full-Stack, von der Anforderung über Datenbank und API bis zum Release.',
      en: 'Frontend and full-stack, from the requirement through database and API to the release.'
    },
    domain: 'dev'
  },
  {
    id: 'desktop',
    label: { de: 'Desktop-Werkzeuge', en: 'Desktop tools' },
    summary: {
      de: 'Eigenständige Programme, die als klassische Software direkt auf dem Rechner laufen. Ohne Browser, ohne Konto, auch offline.',
      en: 'Standalone programs that run as classic software right on your machine. No browser, no account, works offline.'
    },
    domain: 'infra'
  },
  {
    id: 'ai',
    label: { de: 'KI & Daten', en: 'AI & data' },
    summary: {
      de: 'Klassifikation, Regression und Computer Vision mit neuronalen Netzen, dazu Datenanalyse und Datenaufbereitung. Für Unternehmen außerdem Chatbots und RAG-Systeme.',
      en: 'Classification, regression and computer vision with neural networks, plus data analysis and data preparation. For companies also chatbots and RAG systems.'
    },
    domain: 'ai'
  },
  {
    id: 'creative',
    label: { de: '3D & Gestaltung', en: '3D & design' },
    summary: {
      de: 'Mit 2D-Design beschäftige ich mich schon lange, von Logos bis zu Grafiken aller Art. Dazu kamen Blender und 3D für Visuals, Animationen und interaktive 3D-Inhalte im Browser.',
      en: 'I have been doing 2D design for a long time, from logos to graphics of all kinds. Blender and 3D came later, for visuals, animations and interactive 3D in the browser.'
    },
    domain: 'creative'
  }
]

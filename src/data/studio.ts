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
      de: 'Frontend und Full-Stack — von der Anforderung über Datenbank und API bis zum Release.',
      en: 'Frontend and full-stack — from the requirement through database and API to the release.'
    },
    domain: 'dev'
  },
  {
    id: 'desktop',
    label: { de: 'Desktop-Werkzeuge', en: 'Desktop tools' },
    summary: {
      de: 'Eigene Programme für den Rechner — Werkzeuge, mit denen man wirklich arbeitet: sofort startbereit, offline nutzbar, ohne Konto.',
      en: 'Programs of my own for the desktop — tools you actually work with: ready the moment you open them, usable offline, no account.'
    },
    domain: 'infra'
  },
  {
    id: 'ai',
    label: { de: 'KI & Daten', en: 'AI & data' },
    summary: {
      de: 'Chatbots und RAG-Systeme, Klassifikation und Computer Vision, neuronale Netze für Klassifikation und Regression — dazu Datenanalyse und die Aufbereitung, ohne die nichts davon trägt.',
      en: 'Chatbots and RAG systems, classification and computer vision, neural networks for classification and regression — plus the data analysis and preparation none of it works without.'
    },
    domain: 'ai'
  },
  {
    id: 'creative',
    label: { de: '3D & Gestaltung', en: '3D & design' },
    summary: {
      de: 'Nicht nur 2D: vom Logo über Grafik bis zur 3D-Animation, dazu Bewegtbild und Effekte in After Effects und interaktives 3D im Browser.',
      en: 'Not only 2D: from the logo through graphics to 3D animation, plus motion and effects in After Effects and interactive 3D in the browser.'
    },
    domain: 'creative'
  }
]

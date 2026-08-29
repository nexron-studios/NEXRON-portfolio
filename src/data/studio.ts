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
  de: 'NEXRON Studios ist mein eigenes Gewerbe — der Name, unter dem ich baue, gestalte und veröffentliche. Kleine Werkzeuge, Web-Anwendungen, KI-Prototypen und alles, was zwischen Code und Gestaltung liegt.',
  en: 'NEXRON Studios is my own trade — the name I build, design and publish under. Small tools, web applications, AI prototypes and everything that sits between code and design.'
}

export const services: ServiceProps[] = [
  {
    id: 'web',
    label: { de: 'Web & Anwendungen', en: 'Web & applications' },
    summary: {
      de: 'Von der einzelnen Seite bis zur Full-Stack-Anwendung mit Datenbank, API und Deployment.',
      en: 'From a single page to a full-stack application with database, API and deployment.'
    },
    domain: 'dev'
  },
  {
    id: 'desktop',
    label: { de: 'Desktop-Werkzeuge', en: 'Desktop tools' },
    summary: {
      de: 'Schlanke Programme, die offline laufen, schnell starten und keine Konten brauchen.',
      en: 'Lean programs that run offline, start fast and need no accounts.'
    },
    domain: 'infra'
  },
  {
    id: 'ai',
    label: { de: 'KI & Daten', en: 'AI & data' },
    summary: {
      de: 'Chatbots, LLM-Agents und Multiagentensysteme — dazu Modelle trainieren, Daten aufbereiten und daraus etwas bauen, das man tatsächlich benutzen kann.',
      en: 'Chatbots, LLM agents and multi-agent systems — plus training models, preparing data and building something from it that can actually be used.'
    },
    domain: 'ai'
  },
  {
    id: 'creative',
    label: { de: '3D & Gestaltung', en: '3D & design' },
    summary: {
      de: 'Interaktive 3D-Oberflächen im Browser, dazu Grafik und Bewegtbild aus der Adobe-Ecke.',
      en: 'Interactive 3D interfaces in the browser, plus graphics and motion from the Adobe corner.'
    },
    domain: 'creative'
  }
]

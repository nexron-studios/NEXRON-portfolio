import type { ExperienceProps } from '@/types/experience.type'

/**
 * Journey / experience timeline.
 *
 * LinkedIn (linkedin.com/in/jonasglatz) could not be read programmatically —
 * it answers automated requests with HTTP 429 behind a login wall. Rather
 * than inventing job titles, dates or responsibilities, every unconfirmed
 * value below is `null` and the entry is flagged `isVerified: false`.
 * The timeline renders those as an explicit "to be filled in" state.
 *
 * TO FILL IN — copy the values straight off the LinkedIn profile:
 *   · role, startedAt, endedAt and summary for `avenit`
 *   · startedAt / endedAt for `hs-offenburg`
 *
 * Array order is display order. Do not sort by date — several are null.
 */
export const experience: ExperienceProps[] = [
  {
    id: 'nexron',
    kind: 'studio',
    organization: 'NEXRON Studios',
    role: {
      de: 'Persönliche Entwickler- und Creative-Marke',
      en: 'Personal development & creative brand'
    },
    location: 'Baden-Württemberg, DE',
    startedAt: null,
    endedAt: null,
    isOngoing: true,
    summary: {
      de: 'Eigene Projekte zwischen Software, KI, Web, 3D und Design — von kleinen Desktop-Werkzeugen über Full-Stack-Anwendungen bis zu interaktiven 3D-Oberflächen.',
      en: 'Own projects across software, AI, web, 3D and design — from small desktop tools through full-stack applications to interactive 3D interfaces.'
    },
    technologies: ['Vue 3', 'TypeScript', 'Tauri', 'Rust', 'Three.js', 'PostgreSQL', 'Docker'],
    isVerified: true
  },
  {
    id: 'avenit',
    kind: 'work',
    organization: 'avenit AG',
    role: null,
    location: null,
    startedAt: null,
    endedAt: null,
    isOngoing: false,
    summary: null,
    technologies: [],
    isVerified: false
  },
  {
    id: 'hs-offenburg',
    kind: 'education',
    organization: 'Hochschule Offenburg',
    role: {
      de: 'B.Sc. Angewandte Künstliche Intelligenz',
      en: 'B.Sc. Applied Artificial Intelligence'
    },
    location: 'Offenburg, DE',
    startedAt: null,
    endedAt: null,
    isOngoing: false,
    summary: {
      de: 'Schwerpunkte in Machine Learning, Deep Learning, Natural Language Processing, Computer Vision und Reinforcement Learning.',
      en: 'Focus areas in machine learning, deep learning, natural language processing, computer vision and reinforcement learning.'
    },
    technologies: ['PyTorch', 'TensorFlow', 'scikit-learn', 'NumPy', 'Pandas', 'MATLAB'],
    isVerified: false
  }
]

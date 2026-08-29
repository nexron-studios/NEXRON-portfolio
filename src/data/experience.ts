import type { ExperienceProps } from '@/types/experience.type'

/**
 * Journey / experience timeline.
 *
 * Dates and titles come straight from Jonas, not from a scraped profile.
 * Array order is display order: newest first.
 *
 * NEXRON Studios is deliberately not an entry here — it is the brand the whole
 * site is written under and already has its own block in "Über mich"; listing
 * it again as a station would read as padding.
 *
 * `logo` points at `public/logos/`. Company and university marks are
 * trademarks, so nothing is checked in here that Jonas has not put there
 * himself — until then every entry renders the generated monogram.
 */
export const experience: ExperienceProps[] = [
  {
    id: 'hs-offenburg-master-informatik',
    kind: 'education',
    organization: 'Hochschule Offenburg',
    role: {
      de: 'M.Sc. Informatik',
      en: 'M.Sc. Computer Science'
    },
    location: 'Offenburg, DE',
    startedAt: '2027-03',
    endedAt: '2028-09',
    isOngoing: false,
    summary: {
      de: 'Geplanter Masterstart mit Vertiefungen in Künstlicher Intelligenz und Advanced Software Engineering.',
      en: 'Planned master’s start with focus areas in artificial intelligence and advanced software engineering.'
    },
    href: 'https://www.hs-offenburg.de/studium/master/informatik',
    logo: null
  },
  {
    id: 'avenit-werkstudent',
    kind: 'work',
    organization: 'avenit AG',
    role: {
      de: 'Junior Webentwickler · Werkstudent',
      en: 'Junior web developer · working student'
    },
    location: 'Offenburg, DE',
    startedAt: '2026-04',
    endedAt: '2026-06',
    isOngoing: false,
    summary: {
      de: 'Webentwicklung neben dem Studium — Features umsetzen, Bestehendes pflegen, im Team arbeiten.',
      en: 'Web development alongside my studies — building features, maintaining what exists, working in a team.'
    },
    logo: null
  },
  {
    id: 'avenit-praxissemester',
    kind: 'work',
    organization: 'avenit AG',
    role: {
      de: 'Junior Webentwickler · Praxissemester',
      en: 'Junior web developer · practical semester'
    },
    location: 'Offenburg, DE',
    startedAt: '2025-10',
    endedAt: '2026-03',
    isOngoing: false,
    summary: {
      de: 'Sechs Monate als Junior Webentwickler: von der Anforderung bis zum Release, an echten Kundenprojekten.',
      en: 'Six months as a junior web developer: from requirement to release, on real client work.'
    },
    logo: null
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
    startedAt: '2023-09',
    endedAt: null,
    isOngoing: true,
    summary: {
      de: 'Schwerpunkte in Machine Learning, Deep Learning, Natural Language Processing, Computer Vision und Reinforcement Learning — dazu alles rund um Sprachmodelle, Agents und Multiagentensysteme.',
      en: 'Focus areas in machine learning, deep learning, natural language processing, computer vision and reinforcement learning — plus everything around language models, agents and multi-agent systems.'
    },
    href: 'https://www.hs-offenburg.de/studium/bachelor/angewandte-kuenstliche-intelligenz',
    logo: null
  },
  {
    id: 'fachhochschulreife-lahr',
    kind: 'education',
    organization: 'Fachhochschulreife',
    role: {
      de: 'Abschluss in Lahr',
      en: 'Qualification completed in Lahr'
    },
    location: 'Lahr, DE',
    startedAt: '2022-09',
    endedAt: '2023-07',
    isOngoing: false,
    summary: {
      de: '',
      en: ''
    },
    logo: null
  },
  {
    id: 'design-praktikum',
    kind: 'work',
    organization: '2D-/3D-Design',
    role: {
      de: 'Praktikum 2D-/3D-Design',
      en: 'Internship in 2D/3D design'
    },
    location: 'DE',
    startedAt: '2022-03',
    endedAt: '2022-08',
    isOngoing: false,
    summary: {
      de: 'Gestaltung und 3D hatte ich zu dem Zeitpunkt schon lange nebenher gemacht — hier wurde es professionell vertieft. Später habe ich damit die Social-Media-Kampagne eines Clubs gestalterisch begleitet.',
      en: 'I had been doing design and 3D on my own for a long time by then — this is where it was deepened professionally. Later I used it to support the design of a club’s social media campaign.'
    },
    logo: null
  },
  {
    id: 'mechatronik',
    kind: 'education',
    organization: 'Ausbildung Kältetechnik',
    role: {
      de: 'Mechatroniker für Kältetechnik',
      en: 'Mechatronics technician for refrigeration'
    },
    location: 'DE',
    startedAt: '2018-08',
    endedAt: '2022-01',
    isOngoing: false,
    summary: {
      de: 'Dreieinhalb Jahre an realen Anlagen: messen, Fehler suchen, reparieren. Das Debuggen habe ich hier gelernt, lange bevor es Code war.',
      en: 'Three and a half years on real installations: measuring, fault-finding, repairing. I learned to debug here, long before it was code.'
    },
    logo: null
  }
]

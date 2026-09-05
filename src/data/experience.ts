import type { ExperienceProps } from '@/types/experience.type'
import avenitLogo from '@/assets/companys/avenit.jpg'
import hsOffenburgLogo from '@/assets/companys/hochschule-offenburg-logo-bildmarke.jpg'
import julaboLogo from '@/assets/companys/julabo.png'
import lahrLogo from '@/assets/companys/lahrschule.png'
import visionsboxLogo from '@/assets/companys/visionsbox.png'

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
 * `logo` is an import from `src/assets/`, not a path string: Vite then hashes
 * the file, fails the build if it is ever removed, and inlines the small ones.
 * Company and university marks are trademarks, so only what Jonas put there
 * himself is used — an entry without one renders the generated monogram.
 */
/**
 * The bachelor programme's page. Named here rather than inlined twice: the
 * "Über mich" copy links the same degree, and two copies of a university URL
 * drift the moment one of them is corrected.
 */
export const STUDY_HREF =
  'https://www.hs-offenburg.de/studium/bachelor/angewandte-kuenstliche-intelligenz'

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
    logo: hsOffenburgLogo,
    isLogoFullBleed: true
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
    href: 'https://www.avenit.de',
    logo: avenitLogo,
    isLogoFullBleed: true
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
    href: 'https://www.avenit.de',
    logo: avenitLogo,
    isLogoFullBleed: true
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
    href: STUDY_HREF,
    logo: hsOffenburgLogo,
    isLogoFullBleed: true
  },
  {
    id: 'fachhochschulreife-lahr',
    kind: 'education',
    organization: 'Fachhochschulreife',
    startedAt: '2022-09',
    endedAt: '2023-07',
    isOngoing: false,
    summary: {
      de: 'Nach der Ausbildung nachgeholt — die Zugangsberechtigung für das Studium.',
      en: 'Completed after the apprenticeship — the qualification that opened up the degree.'
    },
    logo: lahrLogo
  },
  {
    id: 'design-praktikum',
    kind: 'work',
    organization: 'visionsbox',
    role: {
      de: 'Praktikum 2D-/3D-Design',
      en: 'Internship in 2D/3D design'
    },
    location: 'Ohlsbach, DE',
    startedAt: '2022-03',
    endedAt: '2022-08',
    isOngoing: false,
    summary: {
      de: 'Gestaltung und 3D hatte ich zu dem Zeitpunkt schon lange nebenher gemacht — hier wurde es professionell vertieft. Später habe ich damit die Social-Media-Kampagne eines Clubs gestalterisch begleitet.',
      en: 'I had been doing design and 3D on my own for a long time by then — this is where it was deepened professionally. Later I used it to support the design of a club’s social media campaign.'
    },
    href: 'https://visionsbox.de',
    logo: visionsboxLogo
  },
  {
    id: 'mechatronik',
    kind: 'education',
    organization: 'JULABO',
    role: {
      de: 'Mechatroniker für Kältetechnik',
      en: 'Mechatronics technician for refrigeration'
    },
    location: 'Seelbach, DE',
    startedAt: '2018-08',
    endedAt: '2022-01',
    isOngoing: false,
    summary: {
      de: 'Abgeschlossene Berufsausbildung: dreieinhalb Jahre an realen Anlagen — messen, Fehler suchen, reparieren. Das Debuggen habe ich hier gelernt, lange bevor es Code war.',
      en: 'A completed vocational apprenticeship: three and a half years on real installations — measuring, fault-finding, repairing. I learned to debug here, long before it was code.'
    },
    href: 'https://www.julabo.com',
    logo: julaboLogo
  }
]

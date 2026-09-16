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
      de: 'Webentwicklung neben dem Studium: Features entwickeln, bestehende Anwendungen pflegen und im Team arbeiten, vor allem mit Scrum.',
      en: 'Web development alongside my studies: building features, maintaining existing applications and working in a team, mostly with Scrum.'
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
      de: 'Sechs Monate als Junior Webentwickler an echten Kundenprojekten: Features entwickeln, Bestehendes pflegen und im Scrum-Team von der Anforderung bis zum Release.',
      en: 'Six months as a junior web developer on real client work: building features, maintaining what exists and working in a Scrum team from requirement to release.'
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
      de: 'Schwerpunkte in Machine Learning, Deep Learning, Natural Language Processing, Computer Vision und Reinforcement Learning, dazu alles rund um Sprachmodelle, Agents und Multiagentensysteme.',
      en: 'Focus areas in machine learning, deep learning, natural language processing, computer vision and reinforcement learning, plus everything around language models, agents and multi-agent systems.'
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
      de: 'Nach der Ausbildung habe ich die Zugangsberechtigung für das Studium nachgeholt.',
      en: 'After the apprenticeship I caught up on the qualification needed for the degree.'
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
      de: '2D und 3D hatte ich mir davor schon selbst beigebracht. Im Praktikum wollte ich professionelles Arbeiten kennenlernen und vertiefen. Daraus entstanden später unter anderem Social-Media-Kampagnen und Visuals für Clubs.',
      en: 'I had already taught myself 2D and 3D before. In the internship I wanted to learn and deepen professional work. Later that led to social media campaigns and visuals for clubs, among other things.'
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
      de: 'Abgeschlossene Berufsausbildung: dreieinhalb Jahre an realen Anlagen, messen, Fehler suchen, reparieren. Das Debuggen habe ich hier gelernt, lange bevor es Code war.',
      en: 'A completed vocational apprenticeship: three and a half years on real installations, measuring, fault-finding, repairing. I learned to debug here, long before it was code.'
    },
    href: 'https://www.julabo.com',
    logo: julaboLogo
  }
]

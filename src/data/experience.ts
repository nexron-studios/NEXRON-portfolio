import type { ExperienceProps } from '@/types/experience.type'
import avenitLogo from '@/assets/companys/avenit.jpg'
import hsOffenburgLogo from '@/assets/companys/hochschule-offenburg-logo-bildmarke.jpg'
import julaboLogo from '@/assets/companys/julabo.png'
import lahrLogo from '@/assets/companys/lahrschule.png'
import thesisCompanyLogo from '@/assets/companys/thesis-company.webp'
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
    id: 'bachelor-thesis',
    kind: 'work',
    organization: 'MACK One',
    role: 'Bachelor thesis · Artificial intelligence & XR',
    location: 'Plobsheim, FR',
    startedAt: '2026-10',
    endedAt: null,
    isOngoing: true,
    summary:
      'My bachelor thesis, part-time and hybrid, at the point where artificial intelligence meets XR.',
    logo: thesisCompanyLogo,
    isLogoFullBleed: true
  },
  {
    // One station, not two: the practical semester ran straight into the
    // working-student job at the same desk.
    id: 'avenit',
    kind: 'work',
    organization: 'avenit AG',
    role: 'Junior web developer · practical semester, then working student',
    location: 'Offenburg, DE',
    startedAt: '2025-10',
    endedAt: '2026-06',
    isOngoing: false,
    summary:
      'Six months of practical semester, then on as a working student: features for client projects, maintaining existing applications, in a Scrum team from requirement to release.',
    href: 'https://www.avenit.de',
    logo: avenitLogo,
    isLogoFullBleed: true
  },
  {
    id: 'hs-offenburg',
    kind: 'education',
    organization: 'Hochschule Offenburg',
    role: 'B.Sc. Applied Artificial Intelligence',
    location: 'Offenburg, DE',
    startedAt: '2023-09',
    endedAt: null,
    isOngoing: true,
    summary:
      'Focus areas in machine learning, deep learning, natural language processing, computer vision and reinforcement learning, plus everything around language models, agents and multi-agent systems.',
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
    summary: 'After the apprenticeship I caught up on the qualification needed for the degree.',
    logo: lahrLogo
  },
  {
    id: 'design-praktikum',
    kind: 'work',
    organization: 'visionsbox',
    role: 'Internship in 2D/3D design',
    location: 'Ohlsbach, DE',
    startedAt: '2022-03',
    endedAt: '2022-08',
    isOngoing: false,
    summary:
      'I had taught myself 2D and 3D. Here I learned to do it professionally, which later led to social media campaigns and visuals for clubs.',
    href: 'https://visionsbox.de',
    logo: visionsboxLogo
  },
  {
    id: 'mechatronik',
    kind: 'education',
    organization: 'JULABO',
    role: 'Mechatronics technician for refrigeration',
    location: 'Seelbach, DE',
    startedAt: '2018-08',
    endedAt: '2022-01',
    isOngoing: false,
    summary:
      'A completed vocational apprenticeship: three and a half years on real installations, measuring, fault-finding, repairing. I learned to debug here, long before it was code.',
    href: 'https://www.julabo.com',
    logo: julaboLogo
  }
]

import type { LocalizedText } from '@/types/i18n.type'

export interface SocialLinkProps {
  id: string
  label: string
  /** Shown next to the label in mono — the handle, not the full URL. */
  handle: string
  href: string
}

export const socials: SocialLinkProps[] = [
  {
    id: 'github',
    label: 'GitHub',
    handle: 'nexron-studios',
    href: 'https://github.com/nexron-studios'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'jonasglatz',
    href: 'https://www.linkedin.com/in/jonasglatz/'
  },
  {
    id: 'website',
    label: 'Web',
    handle: 'nexron-studios.de',
    href: 'https://nexron-studios.de'
  }
]

export interface IdentityProps {
  name: string
  brand: string
  location: string
  /**
   * TO FILL IN — a public contact address. Left null on purpose: no address
   * gets published here without Jonas choosing it. While null, the contact
   * section relies on the form and the social links only.
   */
  email: string | null
  role: LocalizedText
  tagline: LocalizedText
}

export const identity: IdentityProps = {
  name: 'Jonas Glatz',
  brand: 'NEXRON Studios',
  location: 'Baden-Württemberg, DE',
  email: null,
  role: {
    de: 'Developer · KI · Creative Technology',
    en: 'Developer · AI · Creative Technology'
  },
  tagline: {
    de: 'Projekte bauen, Technologie erkunden, durch Machen lernen.',
    en: 'Building projects, exploring technology and learning by doing.'
  }
}

import type { LocalizedText } from '@/types/i18n.type'

export const brandList = ['github', 'linkedin', 'instagram', 'spotify', 'mail'] as const
export type Brand = (typeof brandList)[number]

export interface SocialLinkProps {
  id: string
  label: string
  /** Shown next to the label in mono — the handle, not the full URL. */
  handle: string
  href: string
  /** Picks the mark rendered on the card. */
  brand: Brand
  /** What the account actually is, since two of them are Instagram. */
  note: LocalizedText
}

export const socials: SocialLinkProps[] = [
  {
    id: 'github',
    label: 'GitHub',
    handle: 'nexron-studios',
    href: 'https://github.com/nexron-studios',
    brand: 'github',
    note: { de: 'Code und Projekte', en: 'Code and projects' }
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'jonasglatz',
    href: 'https://de.linkedin.com/in/jonasglatz',
    brand: 'linkedin',
    note: { de: 'Beruflicher Werdegang', en: 'Professional profile' }
  },
  {
    id: 'instagram-nexron',
    label: 'Instagram',
    handle: 'nexronstudios',
    href: 'https://www.instagram.com/nexronstudios/',
    brand: 'instagram',
    note: { de: 'Das Studio', en: 'The studio' }
  },
  {
    id: 'instagram-personal',
    label: 'Instagram',
    handle: 'jonasglatz',
    href: 'https://www.instagram.com/jonasglatz/',
    brand: 'instagram',
    note: { de: 'Privat', en: 'Personal' }
  },
  {
    id: 'spotify',
    label: 'Spotify',
    handle: 'mr_funnykuchen',
    href: 'https://open.spotify.com/user/mr_funnykuchen?si=b9df74e44444464f',
    brand: 'spotify',
    note: { de: 'Was beim Bauen läuft', en: 'What plays while building' }
  },
  {
    id: 'mail',
    label: 'Mail',
    handle: 'nexronstudios@gmail.com',
    href: 'mailto:nexronstudios@gmail.com',
    brand: 'mail',
    note: { de: 'Direkter Draht', en: 'Direct line' }
  }
]

export interface IdentityProps {
  name: string
  brand: string
  location: string
  email: string
  role: LocalizedText
  tagline: LocalizedText
}

export const identity: IdentityProps = {
  name: 'Jonas Glatz',
  brand: 'NEXRON Studios',
  location: 'Baden-Württemberg, DE',
  email: 'nexronstudios@gmail.com',
  role: {
    de: 'Developer · KI · Creative Technology',
    en: 'Developer · AI · Creative Technology'
  },
  tagline: {
    de: 'Projekte bauen, Technologie erkunden, durch Machen lernen.',
    en: 'Building projects, exploring technology and learning by doing.'
  }
}

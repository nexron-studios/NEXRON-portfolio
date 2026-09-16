import type { LocalizedText } from '@/types/i18n.type'

export const brandList = ['github', 'linkedin', 'instagram', 'spotify', 'mail'] as const
export type Brand = (typeof brandList)[number]

export interface SocialLinkProps {
  id: string
  label: string
  /**
   * Shown next to the label in mono — the handle, not the full URL. Omitted
   * where the account name says more about the person than about the work.
   */
  handle?: string
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
    note: { de: 'Firmenaccount', en: 'Company account' }
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
    // No handle, and the `?si=` share token is stripped from the URL: both name
    // the private account rather than the studio, and a share token identifies
    // whoever the link was copied from.
    id: 'spotify',
    label: 'Spotify',
    href: 'https://open.spotify.com/user/mr_funnykuchen',
    brand: 'spotify',
    note: { de: 'Was ich sonst so höre', en: 'What else I listen to' }
  },
  {
    id: 'mail',
    label: 'Mail',
    handle: 'nexronstudios@gmail.com',
    href: 'mailto:nexronstudios@gmail.com',
    brand: 'mail',
    note: { de: 'Firmenmail', en: 'Company mail' }
  }
]

/**
 * The three that belong above the fold. The full set gets its own card grid
 * above the footer; repeating all six in the hero would turn the spec strip
 * into a link dump.
 */
export const heroSocialIds = ['github', 'linkedin', 'mail']

/**
 * What the phone menu shows under the navigation: the ones someone would look
 * for while already on the site. Spotify and the private Instagram stay in
 * the card grid.
 */
export const menuSocialIds = ['github', 'linkedin', 'instagram-nexron', 'mail']

export const socialsById = (ids: string[]): SocialLinkProps[] =>
  ids.flatMap((id) => socials.filter((entry) => entry.id === id))

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
    de: 'Developer · KI · 3D & Design',
    en: 'Developer · AI · 3D & Design'
  },
  tagline: {
    de: 'Projekte bauen, Technologie erkunden, durch Machen lernen.',
    en: 'Building projects, exploring technology and learning by doing.'
  }
}

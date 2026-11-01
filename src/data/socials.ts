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
  note: string
}

export const socials: SocialLinkProps[] = [
  {
    id: 'github',
    label: 'GitHub',
    handle: 'nexron-studios',
    href: 'https://github.com/nexron-studios',
    brand: 'github',
    note: 'Code and projects'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'jonasglatz',
    href: 'https://de.linkedin.com/in/jonasglatz',
    brand: 'linkedin',
    note: 'Professional profile'
  },
  {
    id: 'instagram-nexron',
    label: 'Instagram',
    handle: 'nexronstudios',
    href: 'https://www.instagram.com/nexronstudios/',
    brand: 'instagram',
    note: 'Company account'
  },
  {
    id: 'instagram-personal',
    label: 'Instagram',
    handle: 'jonasglatz',
    href: 'https://www.instagram.com/jonasglatz/',
    brand: 'instagram',
    note: 'Personal'
  },
  {
    // No handle, and the `?si=` share token is stripped from the URL: both name
    // the private account rather than the studio, and a share token identifies
    // whoever the link was copied from.
    id: 'spotify',
    label: 'Spotify',
    href: 'https://open.spotify.com/user/mr_funnykuchen',
    brand: 'spotify',
    note: 'What else I listen to'
  },
  {
    id: 'mail',
    label: 'Mail',
    href: 'mailto:nexronstudios@gmail.com',
    brand: 'mail',
    note: 'Company mail'
  }
]

/**
 * What the phone menu shows under the navigation: the ones someone would look
 * for while already on the site. Spotify and the private Instagram stay in
 * the card grid.
 */
/** The three that sit under the hero sentence. */
export const heroSocialIds = ['github', 'linkedin', 'mail']

export const menuSocialIds = ['github', 'linkedin', 'instagram-nexron', 'mail']

export const socialsById = (ids: string[]): SocialLinkProps[] =>
  ids.flatMap((id) => socials.filter((entry) => entry.id === id))

export interface IdentityProps {
  name: string
  brand: string
  location: string
  email: string
  role: string
  tagline: string
}

export const identity: IdentityProps = {
  name: 'Jonas Glatz',
  brand: 'NEXRON Studios',
  location: 'Baden-Württemberg, DE',
  email: 'nexronstudios@gmail.com',
  role: 'Developer · AI · 3D & Design',
  tagline: 'Building projects, exploring technology and learning by doing.'
}

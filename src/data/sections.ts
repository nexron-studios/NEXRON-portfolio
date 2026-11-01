/**
 * The section register: anchor ids and navigation order of the home page.
 *
 * The order is the argument of the page. Work comes first, because it is the
 * proof that the claim in the hero holds; then who is behind it and what he
 * offers, then the path that led here, then how to reach him.
 */
export interface SectionEntryProps {
  id: string
  /** i18n key under the `nav` namespace. */
  labelKey: string
}

export const navSections: SectionEntryProps[] = [
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'journey', labelKey: 'nav.journey' },
  { id: 'contact', labelKey: 'nav.contact' }
]

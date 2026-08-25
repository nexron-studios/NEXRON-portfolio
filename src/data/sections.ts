/**
 * The section register.
 *
 * Single source for anchor ids, navigation order and the sheet index numbers
 * (`01 / INDEX`). Adding a section here wires up the anchor, the nav entry and
 * the scroll spy at once — nothing else needs touching.
 */
export interface SectionEntryProps {
  id: string
  /** i18n key under the `nav` namespace. */
  labelKey: string
  /** Zero-padded sheet number rendered in mono next to the title. */
  index: string
}

export const sections: SectionEntryProps[] = [
  { id: 'index', labelKey: 'nav.index', index: '01' },
  { id: 'about', labelKey: 'nav.about', index: '02' },
  { id: 'projects', labelKey: 'nav.projects', index: '03' },
  { id: 'journey', labelKey: 'nav.journey', index: '04' },
  { id: 'stack', labelKey: 'nav.stack', index: '05' },
  { id: 'lab', labelKey: 'nav.lab', index: '06' },
  { id: 'contact', labelKey: 'nav.contact', index: '07' }
]

export const sectionIds = sections.map((section) => section.id)

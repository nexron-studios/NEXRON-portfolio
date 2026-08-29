/**
 * The section register.
 *
 * Single source for anchor ids, navigation order and the sheet index numbers
 * (`01 / INDEX`). Adding a section here wires up the anchor, the nav entry, the
 * scroll spy and the frame at once — `HomeView` renders straight off this list,
 * so the numbers cannot drift out of sync with the order any more.
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
  { id: 'journey', labelKey: 'nav.journey', index: '03' },
  { id: 'stack', labelKey: 'nav.stack', index: '04' },
  { id: 'projects', labelKey: 'nav.projects', index: '05' },
  { id: 'contact', labelKey: 'nav.contact', index: '06' }
]

export const sectionIds = sections.map((section) => section.id)

/**
 * The hero owns its own full-bleed layout and heading, so it is the one entry
 * the generic `SectionFrame` does not wrap.
 */
export const framedSections = sections.filter((section) => section.id !== 'index')

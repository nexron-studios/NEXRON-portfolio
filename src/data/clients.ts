import type { LocalizedText } from '@/types/i18n.type'

export interface ClientProps {
  id: string
  name: string
  /** Path to a logo under `public/logos/`, or null for the monogram fallback. */
  logo: string | null
  /** What the collaboration was. */
  note: LocalizedText
}

/**
 * Clients Jonas has worked with.
 *
 * Empty on purpose. The strip is built and wired but stays hidden behind
 * `IS_CLIENTS_VISIBLE` in `ProjectsSection.vue` until there is something real
 * to put in it — naming a client is Jonas's call and, for agency work, often
 * theirs too. Filling this array and flipping that flag is the whole change.
 */
export const clients: ClientProps[] = []

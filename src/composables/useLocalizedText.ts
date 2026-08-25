import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { pickLocalized, resolveLocaleKey } from '@/utils/locale'
import type { LocalizedText } from '@/types/i18n.type'

/**
 * Reads content from `src/data/` in the active language.
 *
 * Content is `LocalizedText` rather than i18n message keys — see
 * `src/types/i18n.type.ts` for why — so every component rendering it needs the
 * active locale narrowed to a key of that record. This is that one place.
 */
export const useLocalizedText = () => {
  const { locale } = useI18n()

  const currentLocale = computed(() => resolveLocaleKey(locale.value))

  const localized = (text: LocalizedText): string => pickLocalized(text, currentLocale.value)

  return { currentLocale, localized }
}

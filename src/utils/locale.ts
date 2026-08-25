import { localeList, type Locale, type LocalizedText } from '@/types/i18n.type'

const FALLBACK_LOCALE: Locale = 'en'

/**
 * Narrows vue-i18n's `string` locale to the two the site actually ships.
 * Anything unexpected falls back rather than indexing a `LocalizedText` with
 * a key that is not there.
 */
export const resolveLocaleKey = (value: string): Locale =>
  localeList.includes(value as Locale) ? (value as Locale) : FALLBACK_LOCALE

export const pickLocalized = (text: LocalizedText, locale: Locale): string => text[locale]

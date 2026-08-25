export const localeList = ['de', 'en'] as const
export type Locale = (typeof localeList)[number]

/**
 * A string that exists in every supported locale.
 *
 * Content in `src/data/` uses this instead of i18n message keys: project
 * descriptions are data, not UI chrome, and keeping both languages next to
 * each other makes it obvious when one of them is missing.
 */
export type LocalizedText = Record<Locale, string>

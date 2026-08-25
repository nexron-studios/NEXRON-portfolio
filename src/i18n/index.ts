import { createI18n } from 'vue-i18n'
import { localeList, type Locale } from '@/types/i18n.type'
import de from '@/i18n/locales/de'
import en from '@/i18n/locales/en'

const STORAGE_KEY = 'nexron.locale'
const FALLBACK_LOCALE: Locale = 'en'

const isLocale = (value: string | null): value is Locale =>
  value !== null && localeList.includes(value as Locale)

/**
 * Stored choice wins, then the browser's preference, then English.
 *
 * localStorage is read by hand here rather than through `useStorage` or a
 * Pinia persistence plugin: this runs at module scope, before the app and its
 * Pinia instance exist, because `createI18n` below needs the answer already.
 */
export const resolveInitialLocale = (): Locale => {
  const stored = typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
  if (isLocale(stored)) return stored

  const browser = typeof navigator === 'undefined' ? '' : navigator.language.slice(0, 2)
  if (isLocale(browser)) return browser

  return FALLBACK_LOCALE
}

export const persistLocale = (locale: Locale): void => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, locale)
}

const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages: { de, en }
})

export default i18n

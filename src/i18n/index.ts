import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'

/**
 * The site is English only (decided 2026-11-01). vue-i18n stays as the one
 * place interface strings live, so copy is not scattered across templates
 * and a second language would be a file, not a refactor.
 */
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en }
})

export default i18n

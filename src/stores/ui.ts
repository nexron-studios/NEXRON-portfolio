import { defineStore } from 'pinia'
import i18n, { persistLocale, resolveInitialLocale } from '@/i18n'
import type { Locale } from '@/types/i18n.type'

interface State {
  locale: Locale
  /**
   * Mirrors `prefers-reduced-motion`. Every animated component reads this
   * one flag instead of querying the media query itself, so the whole site
   * can be calmed down from a single place. Fed by `App.vue`.
   */
  prefersReducedMotion: boolean
  /** Section id currently under the scroll spy — drives the nav highlight. */
  activeSection: string
  isMenuOpen: boolean
}

export const useUiStore = defineStore('ui', {
  state: (): State => ({
    locale: resolveInitialLocale(),
    prefersReducedMotion: false,
    activeSection: 'index',
    isMenuOpen: false
  }),
  actions: {
    setLocale(locale: Locale): void {
      this.locale = locale
      i18n.global.locale.value = locale
      persistLocale(locale)
      document.documentElement.lang = locale
    },

    toggleLocale(): void {
      this.setLocale(this.locale === 'de' ? 'en' : 'de')
    },

    setActiveSection(id: string): void {
      this.activeSection = id
    },

    setMenuOpen(isOpen: boolean): void {
      this.isMenuOpen = isOpen
    },

    setPrefersReducedMotion(prefersReducedMotion: boolean): void {
      this.prefersReducedMotion = prefersReducedMotion
    }
  }
})

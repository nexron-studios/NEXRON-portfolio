import { defineStore } from 'pinia'
import i18n, { persistLocale, resolveInitialLocale } from '@/i18n'
import type { Locale } from '@/types/i18n.type'
import type { Theme } from '@/types/ui.type'
import { applyTheme, persistTheme, resolveInitialTheme } from '@/utils/theme'

interface State {
  locale: Locale
  /**
   * Mirrors `prefers-reduced-motion`. Every animated component reads this
   * one flag instead of querying the media query itself, so the whole site
   * can be calmed down from a single place. Fed by `App.vue`.
   */
  prefersReducedMotion: boolean
  /**
   * The colour scheme, and the source of truth for it — `setTheme` stamps it
   * on `<html data-theme>` and persists it, the same way `setLocale` handles
   * the language. The Three.js scenes read it from here because they cannot
   * read a CSS custom property.
   */
  theme: Theme
  /** Section id currently under the scroll spy — drives the nav highlight. */
  activeSection: string
  isMenuOpen: boolean
}

export const useUiStore = defineStore('ui', {
  state: (): State => ({
    locale: resolveInitialLocale(),
    prefersReducedMotion: false,
    theme: resolveInitialTheme(),
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
    },

    setTheme(theme: Theme): void {
      this.theme = theme
      applyTheme(theme)
      persistTheme(theme)
    },

    toggleTheme(): void {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark')
    }
  }
})

import { defineStore } from 'pinia'

interface State {
  /**
   * Mirrors `prefers-reduced-motion`. Every animated component reads this
   * one flag instead of querying the media query itself, so the whole site
   * can be calmed down from a single place. Fed by `App.vue`.
   */
  prefersReducedMotion: boolean
}

export const useUiStore = defineStore('ui', {
  state: (): State => ({
    prefersReducedMotion: false
  }),
  actions: {
    setPrefersReducedMotion(prefersReducedMotion: boolean): void {
      this.prefersReducedMotion = prefersReducedMotion
    }
  }
})

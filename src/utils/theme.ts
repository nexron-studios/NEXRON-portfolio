import { themeList, type Theme } from '@/types/ui.type'

const STORAGE_KEY = 'nexron.theme'
const FALLBACK_THEME: Theme = 'dark'

export const isTheme = (value: string | null): value is Theme =>
  value !== null && themeList.includes(value as Theme)

/**
 * Stored choice wins, then the system preference, then the dark blueprint.
 *
 * Deliberately mirrors `resolveInitialLocale` in `src/i18n/index.ts`, down to
 * reading localStorage by hand: the theme has to be resolved and stamped on
 * `<html>` before the first paint, which is before Pinia exists. Two VueUse
 * `useColorMode` instances — one in `App.vue`, one in the switcher — each own
 * their own copy of the state and quietly disagree, so the store owns this
 * instead, exactly as it owns the locale.
 */
/**
 * Storage is reached through `window`, not the bare global: Node ships its own
 * `localStorage` that is inert unless the process was started with
 * `--localstorage-file`, and under Vitest that shadows the jsdom one. Going
 * through `window` names the browser's, which is the only one this ever wants.
 */
const readStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    // Storage can be blocked outright — private mode, or a hardened profile.
    return null
  }
}

export const resolveInitialTheme = (): Theme => {
  const stored = readStorage()?.getItem(STORAGE_KEY) ?? null
  if (isTheme(stored)) return stored

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return FALLBACK_THEME
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : FALLBACK_THEME
}

export const persistTheme = (theme: Theme): void => {
  readStorage()?.setItem(STORAGE_KEY, theme)
}

/** The single place the scheme reaches the document. */
export const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

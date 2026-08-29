import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, isTheme, persistTheme, resolveInitialTheme } from '../theme'

const STORAGE_KEY = 'nexron.theme'

/**
 * This jsdom build does not ship `window.localStorage`, so the spec supplies
 * a minimal in-memory one. Only the two methods the unit under test calls
 * need to be real.
 */
const createStorageStub = () => {
  const entries = new Map<string, string>()

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => void entries.set(key, value),
    removeItem: (key: string) => void entries.delete(key),
    clear: () => entries.clear(),
    key: (index: number) => [...entries.keys()][index] ?? null,
    get length() {
      return entries.size
    }
  } satisfies Storage
}

let storage = createStorageStub()

const installStorage = (): void => {
  storage = createStorageStub()
  Object.defineProperty(window, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true
  })
}

/** Stands in for a system that prefers the given scheme. */
const stubPreference = (prefersLight: boolean): void => {
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({ matches: query.includes('light') ? prefersLight : !prefersLight }),
    configurable: true,
    writable: true
  })
}

beforeEach(() => {
  installStorage()
})

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  vi.restoreAllMocks()
})

describe('isTheme', () => {
  it('should accept the two known schemes', () => {
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('light')).toBe(true)
  })

  it('should reject an unknown value', () => {
    expect(isTheme('sepia')).toBe(false)
  })

  it('should reject null', () => {
    expect(isTheme(null)).toBe(false)
  })
})

describe('resolveInitialTheme', () => {
  it('should prefer a stored choice over the system preference', () => {
    storage.setItem(STORAGE_KEY, 'light')
    stubPreference(false)

    expect(resolveInitialTheme()).toBe('light')
  })

  it('should fall back to the system preference when nothing is stored', () => {
    stubPreference(true)

    expect(resolveInitialTheme()).toBe('light')
  })

  it('should fall back to dark when the system prefers dark', () => {
    stubPreference(false)

    expect(resolveInitialTheme()).toBe('dark')
  })

  it('should ignore a stored value that is not a known scheme', () => {
    storage.setItem(STORAGE_KEY, 'sepia')
    stubPreference(false)

    expect(resolveInitialTheme()).toBe('dark')
  })
})

describe('persistTheme', () => {
  it('should write the scheme to storage', () => {
    persistTheme('light')

    expect(storage.getItem(STORAGE_KEY)).toBe('light')
  })

  it('should overwrite a previous choice', () => {
    persistTheme('light')
    persistTheme('dark')

    expect(storage.getItem(STORAGE_KEY)).toBe('dark')
  })
})

describe('applyTheme', () => {
  it('should stamp the scheme on the document element', () => {
    applyTheme('light')

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('should replace a previously stamped scheme', () => {
    applyTheme('light')
    applyTheme('dark')

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})

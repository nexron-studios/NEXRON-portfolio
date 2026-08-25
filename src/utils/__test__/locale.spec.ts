import { describe, expect, it } from 'vitest'
import { pickLocalized, resolveLocaleKey } from '../locale'

describe('resolveLocaleKey', () => {
  it('should return the locale unchanged when it is supported', () => {
    expect(resolveLocaleKey('de')).toBe('de')
  })

  it('should fall back to english for an unsupported locale', () => {
    expect(resolveLocaleKey('fr')).toBe('en')
  })

  it('should fall back to english for an empty value', () => {
    expect(resolveLocaleKey('')).toBe('en')
  })
})

describe('pickLocalized', () => {
  it('should return the text for the given locale', () => {
    const text = { de: 'Bauen', en: 'Building' }

    expect(pickLocalized(text, 'de')).toBe('Bauen')
    expect(pickLocalized(text, 'en')).toBe('Building')
  })
})

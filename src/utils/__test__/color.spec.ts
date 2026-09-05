import { describe, expect, it } from 'vitest'
import { parseHex, shade, toRgbString } from '../color'

describe('parseHex', () => {
  it('should read a six-digit hex', () => {
    expect(parseHex('#8b5cf6')).toEqual({ red: 139, green: 92, blue: 246 })
  })

  it('should expand a three-digit hex', () => {
    expect(parseHex('#abc')).toEqual({ red: 170, green: 187, blue: 204 })
  })

  it('should accept a value without the hash and with surrounding space', () => {
    expect(parseHex('  8b5cf6 ')).toEqual({ red: 139, green: 92, blue: 246 })
  })

  it('should refuse anything that is not a hex colour', () => {
    expect(parseHex('rgb(1 2 3)')).toBeNull()
    expect(parseHex('')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
  })
})

describe('toRgbString', () => {
  it('should leave out the alpha when the colour is opaque', () => {
    expect(toRgbString({ red: 1, green: 2, blue: 3 })).toBe('rgb(1 2 3)')
  })

  it('should carry the alpha when it is not', () => {
    expect(toRgbString({ red: 1, green: 2, blue: 3 }, 0.5)).toBe('rgb(1 2 3 / 0.5)')
  })

  it('should keep channels inside the byte range', () => {
    expect(toRgbString({ red: -20, green: 300, blue: 128.6 })).toBe('rgb(0 255 129)')
  })
})

describe('shade', () => {
  it('should leave the colour alone at zero', () => {
    expect(shade('#8b5cf6', 0)).toBe('rgb(139 92 246)')
  })

  it('should reach white at full lightening', () => {
    expect(shade('#8b5cf6', 1)).toBe('rgb(255 255 255)')
  })

  it('should reach black at full darkening', () => {
    expect(shade('#8b5cf6', -1)).toBe('rgb(0 0 0)')
  })

  it('should move towards white for a positive amount', () => {
    expect(shade('#000000', 0.5)).toBe('rgb(128 128 128)')
  })

  it('should move towards black for a negative amount', () => {
    expect(shade('#ffffff', -0.5)).toBe('rgb(128 128 128)')
  })

  it('should hand back an unparseable colour unchanged', () => {
    expect(shade('currentColor', 0.4)).toBe('currentColor')
  })
})

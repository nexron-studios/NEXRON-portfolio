import { describe, expect, it } from 'vitest'
import { wrapOffset } from '../marquee'

describe('wrapOffset', () => {
  it('should pass travel within one repetition through', () => {
    expect(wrapOffset(120, 500)).toBe(120)
  })

  it('should wrap travel past one repetition', () => {
    expect(wrapOffset(1120, 500)).toBe(120)
  })

  it('should wrap backwards travel into the same range', () => {
    expect(wrapOffset(-120, 500)).toBe(380)
  })

  it('should stay put without a width', () => {
    expect(wrapOffset(300, 0)).toBe(0)
  })
})

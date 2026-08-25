import { describe, expect, it } from 'vitest'
import { formatMonth, formatMonthRange } from '../date'

describe('formatMonth', () => {
  it('should turn an ISO year-month into a dotted month-year', () => {
    expect(formatMonth('2024-09')).toBe('09.2024')
  })

  it('should return null for a null value', () => {
    expect(formatMonth(null)).toBeNull()
  })

  it('should return null when the value carries no month', () => {
    expect(formatMonth('2024')).toBeNull()
  })
})

describe('formatMonthRange', () => {
  it('should render both ends of a closed range', () => {
    expect(formatMonthRange('2022-10', '2024-03', false, 'ongoing')).toBe('10.2022 → 03.2024')
  })

  it('should use the ongoing label instead of the end date when ongoing', () => {
    expect(formatMonthRange('2024-04', null, true, 'laufend')).toBe('04.2024 → laufend')
  })

  it('should ignore the end date entirely when ongoing', () => {
    expect(formatMonthRange('2024-04', '2025-01', true, 'ongoing')).toBe('04.2024 → ongoing')
  })

  it('should mark an unconfirmed start with a dash', () => {
    expect(formatMonthRange(null, '2024-03', false, 'ongoing')).toBe('— → 03.2024')
  })

  it('should collapse to a single dash when neither end is known', () => {
    expect(formatMonthRange(null, null, false, 'ongoing')).toBe('—')
  })
})

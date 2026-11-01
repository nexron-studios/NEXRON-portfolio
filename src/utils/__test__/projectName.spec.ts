import { describe, expect, it } from 'vitest'
import { shortProjectName } from '../projectName'

describe('shortProjectName', () => {
  it('should drop the studio prefix', () => {
    expect(shortProjectName('NEXRON-TokenScope')).toBe('TokenScope')
  })

  it('should leave a name without the prefix alone', () => {
    expect(shortProjectName('Weltenbummler')).toBe('Weltenbummler')
  })

  it('should not strip the word from inside a name', () => {
    expect(shortProjectName('My NEXRON-Tool')).toBe('My NEXRON-Tool')
  })
})

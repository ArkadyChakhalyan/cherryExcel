import { describe, it, expect, vi } from 'vitest'
import { todayDDMMYYYY, parseDDMMYYYY, formatForDisplay } from './dateUtils.js'

describe('todayDDMMYYYY', () => {
  it('returns today in DD.MM.YYYY format', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15'))
    expect(todayDDMMYYYY()).toBe('15.03.2025')
    vi.useRealTimers()
  })
})

describe('parseDDMMYYYY', () => {
  it('parses DD.MM.YYYY to Date object', () => {
    const d = parseDDMMYYYY('15.03.2025')
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(15)
  })
  it('returns null for empty string', () => {
    expect(parseDDMMYYYY('')).toBeNull()
    expect(parseDDMMYYYY(undefined)).toBeNull()
  })
})

describe('formatForDisplay', () => {
  it('formats DD.MM.YYYY as "15 мар"', () => {
    expect(formatForDisplay('15.03.2025')).toBe('15 мар')
  })
  it('returns — for empty', () => {
    expect(formatForDisplay('')).toBe('—')
  })
})

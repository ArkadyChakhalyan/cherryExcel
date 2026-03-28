import { describe, it, expect, vi, beforeAll } from 'vitest'
import { entryToRow } from './sheetWriter.js'

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-06-20'))
})

describe('entryToRow', () => {
  it('formats an expense entry into a 26-element row', () => {
    const entry = {
      type: 'expense',
      sum: -850,
      kak: 'Онлайн',
      kat: 'М',
      chto: 'Бусины  ',
      gde: 'AliExpress',
      oplata: 'Карта Тбанк',
      katOplaty: 'Различные товары',
      cashback: '',
      skidki: '-',
      date: '',
    }
    const row = entryToRow(entry)
    expect(row).toHaveLength(26)
    expect(row[0]).toBe(-850)
    expect(row[1]).toBe('Онлайн')
    expect(row[3]).toBe('Бусины')
    expect(row[9]).toBe('')
    expect(row[18]).toBe('')
    expect(row[24]).toBe('20.06.2025')
    expect(row[25]).toBe('')
  })

  it('formats an income entry', () => {
    const entry = {
      type: 'income',
      sum: 2500,
      chto: 'Колье',
      komu: 'Анна',
      predoplata: '100%',
      dostavka: 'СДЭК',
      gdeZakazali: 'ТГ',
      otkuda: 'Канал',
      otziv: 'Да',
      skidki: '',
      date: '10.06.2025',
      status: 'В работе',
    }
    const row = entryToRow(entry)
    expect(row[0]).toBe('')
    expect(row[9]).toBe(2500)
    expect(row[10]).toBe('Колье')
    expect(row[16]).toBe('Да')
    expect(row[24]).toBe('10.06.2025')
    expect(row[25]).toBe('В работе')
  })

  it('formats a gift entry', () => {
    const entry = {
      type: 'gift',
      sum: 1200,
      chto: 'Серьги',
      komu: 'Маме',
      otziv: '—',
      dostavka: '',
      povod: 'День рождения',
      date: '',
    }
    const row = entryToRow(entry)
    expect(row[18]).toBe(1200)
    expect(row[19]).toBe('Серьги')
    expect(row[23]).toBe('День рождения')
    expect(row[24]).toBe('20.06.2025')
  })
})

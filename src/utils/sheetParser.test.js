import { describe, it, expect } from 'vitest'
import { parseSheetRows } from './sheetParser.js'

const HEADER_ROWS = [
  ['2025 год'],
  ['', 'РАСХОДЫ', '', '', '', '', '', '', '', 'ДОХОДЫ'],
  ['СУММА', 'КАК', 'Категория', 'ЧТО', 'ГДЕ', 'Оплата', 'Кат оплаты', 'Кэшбэк', 'Скидки', 'СУММА', 'ЧТО', 'КОМУ'],
]

const SAMPLE_ROWS = [
  ...HEADER_ROWS,
  ['01 ЯНВАРЬ'],
  ['-420', 'Онлайн', 'Д', 'Доставка фурнитуры', 'СДЭК', 'Карта Тбанк', 'Финансы', '', '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '15.01.2025'],
  ['-6635', 'Онлайн ', 'М', 'Фурнитура', 'ИП Росип', 'По телефону', 'Различные товары', '', '-'],
  ['-13629.5', 'Возврат:', '', '', '', '', '', '65', '0'],
  ['02 ФЕВРАЛЬ'],
  ['', '', '', '', '', '', '', '', '', '2500', 'Колье', 'Анна', '100%', 'СДЭК', 'ТГ', 'Канал', 'Да', '-', '', '', '', '', '', '', '10.02.2025', 'В работе'],
]

describe('parseSheetRows', () => {
  it('skips header rows (first 3)', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    expect(result.every(e => e.type !== undefined)).toBe(true)
  })

  it('parses an expense row correctly', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    const exp = result.find(e => e.type === 'expense' && e.sum === -420)
    expect(exp).toBeDefined()
    expect(exp.kak).toBe('Онлайн')
    expect(exp.kat).toBe('Д')
    expect(exp.chto).toBe('Доставка фурнитуры')
    expect(exp.date).toBe('15.01.2025')
    expect(exp.month).toBe(0)
  })

  it('trims whitespace from string fields', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    const exp = result.find(e => e.type === 'expense' && e.sum === -6635)
    expect(exp.kak).toBe('Онлайн')
    expect(exp.kat).toBe('М')
  })

  it('skips summary (Возврат:) rows', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    expect(result.find(e => e.kak === 'Возврат:')).toBeUndefined()
  })

  it('parses an income row correctly', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    const inc = result.find(e => e.type === 'income')
    expect(inc).toBeDefined()
    expect(inc.sum).toBe(2500)
    expect(inc.chto).toBe('Колье')
    expect(inc.komu).toBe('Анна')
    expect(inc.status).toBe('В работе')
    expect(inc.month).toBe(1)
  })

  it('assigns correct month index from surrounding month header', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    expect(result.filter(e => e.month === 0).length).toBe(2)
    expect(result.filter(e => e.month === 1).length).toBe(1)
  })

  it('stores rowIndex for each entry', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    expect(result[0].rowIndex).toBe(4)
  })
})

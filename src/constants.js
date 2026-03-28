// src/constants.js

// Column indices (0-based) in the Google Sheet
export const COL = {
  // РАСХОДЫ A–I
  EXP_SUM: 0,
  EXP_KAK: 1,
  EXP_KAT: 2,
  EXP_CHTO: 3,
  EXP_GDE: 4,
  EXP_OPLATA: 5,
  EXP_KAT_OPLATY: 6,
  EXP_CASHBACK: 7,
  EXP_SKIDKI: 8,
  // ДОХОДЫ J–R
  INC_SUM: 9,
  INC_CHTO: 10,
  INC_KOMU: 11,
  INC_PREDOPLATA: 12,
  INC_DOSTAVKA: 13,
  INC_GDE_ZAKAZALI: 14,
  INC_OTKUDA: 15,
  INC_OTZIV: 16,
  INC_SKIDKI: 17,
  // ПОДАРКИ S–X
  GIFT_SUM: 18,
  GIFT_CHTO: 19,
  GIFT_KOMU: 20,
  GIFT_OTZIV: 21,
  GIFT_DOSTAVKA: 22,
  GIFT_POVOD: 23,
  // New columns Y–Z
  DATE: 24,
  STATUS: 25,
}

export const MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
]

// Month header prefix patterns in the sheet ("01 ЯНВАРЬ", "02 ФЕВРАЛЬ", …)
export const MONTH_PREFIXES = [
  '01 ЯНВАРЬ','02 ФЕВРАЛЬ','03 МАРТ','04 АПРЕЛЬ','05 МАЙ','06 ИЮНЬ',
  '07 ИЮЛЬ','08 АВГУСТ','09 СЕНТЯБРЬ','10 ОКТЯБРЬ','11 НОЯБРЬ','12 ДЕКАБРЬ',
]

export const TABS = { EXPENSE: 'expense', INCOME: 'income', GIFT: 'gift' }

export const CHIP_KAK = ['Онлайн', 'Магазин РОЗН', 'Магазин ОПТ']
export const CHIP_KAT = ['М', 'О', 'Д', '*']
export const CHIP_KAT_LABELS = { М: 'М — Материалы', О: 'О — Оборудование', Д: 'Д — Доставка', '*': '* — Прочее' }
export const CHIP_GDE_ZAKAZALI = ['ТГ', 'WA', 'Inst', 'Лично']
export const CHIP_OTZIV = ['Да', 'Нет', '—']
export const CHIP_STATUS = ['В работе', 'Завершён', 'Отменён']

export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID

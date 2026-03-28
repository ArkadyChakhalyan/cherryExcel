import { COL, MONTH_PREFIXES } from '../constants.js'

function col(row, idx) {
  const v = row[idx]
  return typeof v === 'string' ? v.trim() : (v ?? '')
}

function numCol(row, idx) {
  const raw = col(row, idx)
  const normalised = String(raw).replace('−', '-')
  const n = parseFloat(normalised)
  return isNaN(n) ? null : n
}

function monthIndexFromPrefix(prefix) {
  const idx = MONTH_PREFIXES.findIndex(p => prefix.startsWith(p.split(' ')[0]))
  return idx >= 0 ? idx : null
}

export function parseSheetRows(rows) {
  const entries = []
  let currentMonth = 0

  rows.forEach((row, rowIndex) => {
    if (rowIndex < 3) return

    const first = col(row, 0)

    if (/^\d{2}\s/.test(first)) {
      const idx = monthIndexFromPrefix(first)
      if (idx !== null) currentMonth = idx
      return
    }

    if (col(row, 1).startsWith('Возврат:')) return

    const expSum = numCol(row, COL.EXP_SUM)
    const incSum = numCol(row, COL.INC_SUM)
    const giftSum = numCol(row, COL.GIFT_SUM)
    const date = col(row, COL.DATE)

    if (expSum !== null) {
      entries.push({
        type: 'expense',
        rowIndex,
        month: currentMonth,
        sum: expSum,
        kak: col(row, COL.EXP_KAK),
        kat: col(row, COL.EXP_KAT),
        chto: col(row, COL.EXP_CHTO),
        gde: col(row, COL.EXP_GDE),
        oplata: col(row, COL.EXP_OPLATA),
        katOplaty: col(row, COL.EXP_KAT_OPLATY),
        cashback: col(row, COL.EXP_CASHBACK),
        skidki: col(row, COL.EXP_SKIDKI),
        date,
      })
    }

    if (incSum !== null) {
      entries.push({
        type: 'income',
        rowIndex,
        month: currentMonth,
        sum: incSum,
        chto: col(row, COL.INC_CHTO),
        komu: col(row, COL.INC_KOMU),
        predoplata: col(row, COL.INC_PREDOPLATA),
        dostavka: col(row, COL.INC_DOSTAVKA),
        gdeZakazali: col(row, COL.INC_GDE_ZAKAZALI),
        otkuda: col(row, COL.INC_OTKUDA),
        otziv: col(row, COL.INC_OTZIV),
        skidki: col(row, COL.INC_SKIDKI),
        date,
        status: col(row, COL.STATUS),
      })
    }

    if (giftSum !== null) {
      entries.push({
        type: 'gift',
        rowIndex,
        month: currentMonth,
        sum: giftSum,
        chto: col(row, COL.GIFT_CHTO),
        komu: col(row, COL.GIFT_KOMU),
        otziv: col(row, COL.GIFT_OTZIV),
        dostavka: col(row, COL.GIFT_DOSTAVKA),
        povod: col(row, COL.GIFT_POVOD),
        date,
      })
    }
  })

  return entries
}

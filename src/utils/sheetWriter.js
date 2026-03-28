import { COL } from '../constants.js'
import { todayDDMMYYYY } from './dateUtils.js'

function trim(v) {
  return typeof v === 'string' ? v.trim() : (v ?? '')
}

export function entryToRow(entry) {
  const row = new Array(26).fill('')
  const date = trim(entry.date) || todayDDMMYYYY()
  row[COL.DATE] = date

  if (entry.type === 'expense') {
    row[COL.EXP_SUM] = entry.sum
    row[COL.EXP_KAK] = trim(entry.kak)
    row[COL.EXP_KAT] = trim(entry.kat)
    row[COL.EXP_CHTO] = trim(entry.chto)
    row[COL.EXP_GDE] = trim(entry.gde)
    row[COL.EXP_OPLATA] = trim(entry.oplata)
    row[COL.EXP_KAT_OPLATY] = trim(entry.katOplaty)
    row[COL.EXP_CASHBACK] = trim(entry.cashback)
    row[COL.EXP_SKIDKI] = trim(entry.skidki)
  } else if (entry.type === 'income') {
    row[COL.INC_SUM] = entry.sum
    row[COL.INC_CHTO] = trim(entry.chto)
    row[COL.INC_KOMU] = trim(entry.komu)
    row[COL.INC_PREDOPLATA] = trim(entry.predoplata)
    row[COL.INC_DOSTAVKA] = trim(entry.dostavka)
    row[COL.INC_GDE_ZAKAZALI] = trim(entry.gdeZakazali)
    row[COL.INC_OTKUDA] = trim(entry.otkuda)
    row[COL.INC_OTZIV] = trim(entry.otziv)
    row[COL.INC_SKIDKI] = trim(entry.skidki)
    row[COL.STATUS] = trim(entry.status)
  } else if (entry.type === 'gift') {
    row[COL.GIFT_SUM] = entry.sum
    row[COL.GIFT_CHTO] = trim(entry.chto)
    row[COL.GIFT_KOMU] = trim(entry.komu)
    row[COL.GIFT_OTZIV] = trim(entry.otziv)
    row[COL.GIFT_DOSTAVKA] = trim(entry.dostavka)
    row[COL.GIFT_POVOD] = trim(entry.povod)
  }

  return row
}

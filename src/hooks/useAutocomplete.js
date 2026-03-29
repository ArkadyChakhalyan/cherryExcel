// src/hooks/useAutocomplete.js
import { useMemo } from 'react'

export function useAutocomplete(entries) {
  return useMemo(() => {
    const sets = {
      expense: { chto: new Set(), gde: new Set(), oplata: new Set(), katOplaty: new Set() },
      income: { chto: new Set(), komu: new Set(), otkuda: new Set(), dostavka: new Set() },
      gift: { chto: new Set(), komu: new Set(), dostavka: new Set(), povod: new Set() },
    }

    entries.forEach(e => {
      const add = (set, val) => { if (val && val !== '-' && val !== '—') set.add(val) }
      if (e.type === 'expense') {
        add(sets.expense.chto, e.chto)
        add(sets.expense.gde, e.gde)
        add(sets.expense.oplata, e.oplata)
        add(sets.expense.katOplaty, e.katOplaty)
      } else if (e.type === 'income') {
        add(sets.income.chto, e.chto)
        add(sets.income.komu, e.komu)
        add(sets.income.otkuda, e.otkuda)
        add(sets.income.dostavka, e.dostavka)
      } else if (e.type === 'gift') {
        add(sets.gift.chto, e.chto)
        add(sets.gift.komu, e.komu)
        add(sets.gift.dostavka, e.dostavka)
        add(sets.gift.povod, e.povod)
      }
    })

    const toArr = set => [...set].sort()
    return {
      expense: Object.fromEntries(Object.entries(sets.expense).map(([k, v]) => [k, toArr(v)])),
      income: Object.fromEntries(Object.entries(sets.income).map(([k, v]) => [k, toArr(v)])),
      gift: Object.fromEntries(Object.entries(sets.gift).map(([k, v]) => [k, toArr(v)])),
    }
  }, [entries])
}

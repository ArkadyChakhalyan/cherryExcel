const SHORT_MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']

export function todayDDMMYYYY() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

export function parseDDMMYYYY(str) {
  if (!str) return null
  const [dd, mm, yyyy] = str.split('.')
  if (!dd || !mm || !yyyy) return null
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
}

export function formatForDisplay(str) {
  if (!str) return '—'
  const d = parseDDMMYYYY(str)
  if (!d) return '—'
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`
}

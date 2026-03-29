import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'

export default function StatCards() {
  const { entries, tab, month } = useApp()
  const monthEntries = entries.filter(e => e.month === month)

  if (tab === TABS.EXPENSE) {
    const total = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.sum, 0)
    const cashback = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + (Number(e.cashback) || 0), 0)
    return (
      <div className="flex gap-3 px-4 pb-2 md:max-w-sm">
        <StatCard label="Расходы" value={`${total.toLocaleString('ru')} ₽`} color="text-red-500" />
        {cashback > 0 && <StatCard label="Кэшбэк" value={`${cashback} ₽`} color="text-brand" />}
      </div>
    )
  }

  if (tab === TABS.INCOME) {
    const total = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.sum, 0)
    const open = monthEntries.filter(e => e.type === 'income' && e.status === 'В работе').length
    return (
      <div className="flex gap-3 px-4 pb-2 md:max-w-sm">
        <StatCard label="Доходы" value={`${total.toLocaleString('ru')} ₽`} color="text-green-500" />
        {open > 0 && <StatCard label="В работе" value={open} color="text-orange-500" />}
      </div>
    )
  }

  if (tab === TABS.GIFT) {
    const count = monthEntries.filter(e => e.type === 'gift').length
    const total = monthEntries.filter(e => e.type === 'gift').reduce((s, e) => s + e.sum, 0)
    return (
      <div className="flex gap-3 px-4 pb-2 md:max-w-sm">
        <StatCard label="Подарков" value={count} color="text-brand" />
        {total > 0 && <StatCard label="Сумма" value={`${total.toLocaleString('ru')} ₽`} color="text-brand" />}
      </div>
    )
  }
  return null
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-2 shadow-sm flex-1 text-center">
      <div className={`text-base font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

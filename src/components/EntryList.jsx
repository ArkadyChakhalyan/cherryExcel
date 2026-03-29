import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'
import EntryCard from './EntryCard.jsx'

export default function EntryList() {
  const { entries, tab, month, loading } = useApp()

  const typeMap = { [TABS.EXPENSE]: 'expense', [TABS.INCOME]: 'income', [TABS.GIFT]: 'gift' }
  const type = typeMap[tab]

  const visible = entries.filter(e => e.type === type && e.month === month)

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Загрузка…</div>
  if (visible.length === 0) return <div className="text-center py-10 text-gray-300 text-sm">Записей нет</div>

  return (
    <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
      {visible.map((e, i) => <EntryCard key={`${e.rowIndex}-${i}`} entry={e} />)}
    </div>
  )
}

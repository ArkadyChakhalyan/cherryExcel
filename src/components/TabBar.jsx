import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'

const TAB_LABELS = { [TABS.EXPENSE]: 'Расходы', [TABS.INCOME]: 'Доходы', [TABS.GIFT]: 'Подарки' }

export default function TabBar() {
  const { tab, setTab } = useApp()
  return (
    <div className="flex bg-gradient-to-r from-brand-dark to-brand-light">
      {Object.values(TABS).map(t => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-all ${
            tab === t ? 'border-white text-white' : 'border-transparent text-white/50'
          }`}
        >
          {TAB_LABELS[t]}
        </button>
      ))}
    </div>
  )
}

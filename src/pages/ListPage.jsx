import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'
import Header from '../components/Header.jsx'
import TabBar from '../components/TabBar.jsx'
import MonthNav from '../components/MonthNav.jsx'
import StatCards from '../components/StatCards.jsx'
import EntryList from '../components/EntryList.jsx'
import Toast from '../components/Toast.jsx'

const ADD_ROUTES = { [TABS.EXPENSE]: 'expense', [TABS.INCOME]: 'income', [TABS.GIFT]: 'gift' }
const ADD_LABELS = { [TABS.EXPENSE]: '+ Добавить расход', [TABS.INCOME]: '+ Добавить доход', [TABS.GIFT]: '+ Добавить подарок' }

export default function ListPage() {
  const { tab, toast } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <Header />
      <TabBar />
      <div className="flex-1 overflow-y-auto">
        <MonthNav />
        <StatCards />
        <EntryList />
      </div>
      <div className="px-4 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => navigate(`/add/${ADD_ROUTES[tab]}`)}
          className="w-full bg-brand text-white rounded-2xl py-3.5 font-bold text-sm active:scale-95 transition-transform shadow-md"
        >
          {ADD_LABELS[tab]}
        </button>
      </div>
      <Toast toast={toast} />
    </div>
  )
}

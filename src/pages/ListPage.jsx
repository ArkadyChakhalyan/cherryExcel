import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'
import Header from '../components/Header.jsx'
import EntryList from '../components/EntryList.jsx'
import Toast from '../components/Toast.jsx'

const ADD_ROUTES = { [TABS.EXPENSE]: 'expense', [TABS.INCOME]: 'income', [TABS.GIFT]: 'gift' }
const ADD_LABELS = { [TABS.EXPENSE]: '+ Добавить расход', [TABS.INCOME]: '+ Добавить доход', [TABS.GIFT]: '+ Добавить подарок' }

export default function ListPage() {
  const { tab, toast } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <EntryList />
        </div>
      </div>
      <div className="px-4 pb-6 pt-2 bg-white">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(`/add/${ADD_ROUTES[tab]}`)}
            style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)', borderRadius: 14, boxShadow: '0 6px 20px rgba(109,40,217,0.4)' }}
            className="w-full text-white py-3.5 font-extrabold text-sm active:scale-95 transition-transform"
          >
            {ADD_LABELS[tab]}
          </button>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  )
}

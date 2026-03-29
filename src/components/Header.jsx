import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Header() {
  const { year, allSheets, setYear, logout, refresh } = useApp()
  const navigate = useNavigate()
  const [showYears, setShowYears] = useState(false)

  const availableYears = allSheets
    .filter(s => /^1\. Общая \d{4}$/.test(s))
    .map(s => Number(s.slice(-4)))
    .sort((a, b) => b - a)

  return (
    <div className="bg-gradient-to-r from-brand-dark to-brand-light text-white px-4 pt-3 pb-0 relative">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-extrabold tracking-wide">🍒 ВИШНЯ</h1>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="text-white/70 text-xs" title="Обновить">↻</button>
          <button onClick={() => navigate('/stats')} className="text-white/70 text-lg" title="Статистика">📊</button>
          <div className="relative">
            <button
              onClick={() => setShowYears(v => !v)}
              className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold"
            >
              {year} ▾
            </button>
            {showYears && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg z-30 overflow-hidden min-w-[120px]">
                {availableYears.map(y => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setShowYears(false) }}
                    className={`block w-full text-left px-4 py-2 text-sm font-semibold ${y === year ? 'text-brand' : 'text-gray-700'} hover:bg-purple-50`}
                  >
                    {y}
                  </button>
                ))}
                <button
                  onClick={() => { setYear(year + 1); setShowYears(false) }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-purple-50"
                >
                  + {year + 1}
                </button>
                <hr className="border-gray-100" />
                <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-50">
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

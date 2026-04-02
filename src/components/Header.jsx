import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { TABS, MONTHS } from '../constants.js'

const TAB_LABELS = { [TABS.EXPENSE]: 'Расходы', [TABS.INCOME]: 'Доходы', [TABS.GIFT]: 'Подарки' }
const HEADER_GRADIENT = { background: 'linear-gradient(145deg, #3b0764 0%, #6d28d9 50%, #a855f7 100%)' }

export default function Header({ variant = 'list', title, onBack, rightSlot }) {
  const { year, allSheets, setYear, logout, refresh, tab, setTab, month, setMonth, entries } = useApp()
  const navigate = useNavigate()
  const [showYears, setShowYears] = useState(false)

  const availableYears = allSheets
    .filter(s => /^1\. Общая \d{4}$/.test(s))
    .map(s => Number(s.slice(-4)))
    .sort((a, b) => b - a)

  if (variant === 'compact') {
    return (
      <div style={HEADER_GRADIENT} className="text-white px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }}
            className="flex items-center justify-center text-base"
          >←</button>
          <h2 className="flex-1 text-base font-bold">{title}</h2>
          {rightSlot}
        </div>
      </div>
    )
  }

  // variant === 'list': compute stats for the frosted card
  const monthEntries = entries.filter(e => e.month === month)
  let mainStat = '', secondaryStat = ''
  if (tab === TABS.EXPENSE) {
    const total = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + Math.abs(e.sum), 0)
    const cashback = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + (Number(e.cashback) || 0), 0)
    mainStat = `${total.toLocaleString('ru')} ₽`
    secondaryStat = cashback > 0 ? `Кэшбэк: ${cashback} ₽` : ''
  } else if (tab === TABS.INCOME) {
    const total = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.sum, 0)
    const open = monthEntries.filter(e => e.type === 'income' && e.status === 'В работе').length
    mainStat = `+${total.toLocaleString('ru')} ₽`
    secondaryStat = open > 0 ? `В работе: ${open}` : ''
  } else {
    const count = monthEntries.filter(e => e.type === 'gift').length
    const total = monthEntries.filter(e => e.type === 'gift').reduce((s, e) => s + e.sum, 0)
    mainStat = `${total.toLocaleString('ru')} ₽`
    secondaryStat = `Подарков: ${count}`
  }

  return (
    <div style={HEADER_GRADIENT} className="text-white px-4 pt-3 pb-3 relative">
      <div className="max-w-6xl mx-auto">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-extrabold tracking-wide">🍒 ВИШНЯ</h1>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="text-white/70 text-xs" title="Обновить">↻</button>
            <button onClick={() => navigate('/stats')} className="text-white/70 text-lg" title="Статистика">📊</button>
            <div className="relative">
              <button
                onClick={() => setShowYears(v => !v)}
                className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold"
              >{year} ▾</button>
              {showYears && (
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg z-30 overflow-hidden min-w-[120px]">
                  {availableYears.map(y => (
                    <button key={y} onClick={() => { setYear(y); setShowYears(false) }}
                      className={`block w-full text-left px-4 py-2 text-sm font-semibold ${y === year ? 'text-brand' : 'text-gray-700'} hover:bg-purple-50`}
                    >{y}</button>
                  ))}
                  <button onClick={() => { setYear(year + 1); setShowYears(false) }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-purple-50"
                  >+ {year + 1}</button>
                  <hr className="border-gray-100" />
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-50">Выйти</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Frosted stat card */}
        <div
          style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 16, backdropFilter: 'blur(16px)' }}
          className="px-4 py-3 mb-3"
        >
          <div className="flex items-center justify-between mb-1">
            <button onClick={() => setMonth((month + 11) % 12)} style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xl px-1">‹</button>
            <span style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs uppercase tracking-widest font-semibold">{MONTHS[month].toUpperCase()}</span>
            <button onClick={() => setMonth((month + 1) % 12)} style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xl px-1">›</button>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white">{mainStat}</div>
            {secondaryStat && <div style={{ color: 'rgba(255,255,255,0.55)' }} className="text-xs mt-0.5">{secondaryStat}</div>}
          </div>
        </div>

        {/* Pill tabs */}
        <div className="flex gap-2">
          {Object.values(TABS).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={tab === t
                ? { background: 'white', color: '#6d28d9', fontWeight: 800, borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                : { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', borderRadius: 20 }
              }
              className="flex-1 py-2 text-xs text-center transition-all"
            >{TAB_LABELS[t]}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

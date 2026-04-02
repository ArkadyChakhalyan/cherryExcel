import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { useApp } from '../context/AppContext.jsx'
import { MONTHS } from '../constants.js'
import Header from '../components/Header.jsx'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function StatsPage() {
  const navigate = useNavigate()
  const { entries, month } = useApp()
  const [view, setView] = useState('year')

  const filtered = view === 'month' ? entries.filter(e => e.month === month) : entries

  const incomeByMonth = Array(12).fill(0)
  const expenseByMonth = Array(12).fill(0)
  entries.forEach(e => {
    if (e.type === 'income') incomeByMonth[e.month] += e.sum
    if (e.type === 'expense') expenseByMonth[e.month] += Math.abs(e.sum)
  })

  const totalIncome = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.sum, 0)
  const totalExpense = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + Math.abs(e.sum), 0)
  const totalCashback = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + (Number(e.cashback) || 0), 0)
  const giftCount = filtered.filter(e => e.type === 'gift').length
  const openOrders = entries.filter(e => e.type === 'income' && e.status === 'В работе').length

  const sourceCounts = {}
  filtered.filter(e => e.type === 'income' && e.otkuda).forEach(e => {
    sourceCounts[e.otkuda] = (sourceCounts[e.otkuda] || 0) + 1
  })
  const sourceLabels = Object.keys(sourceCounts)
  const sourceData = Object.values(sourceCounts)
  const pieColors = ['#7c3aed','#a855f7','#22c55e','#f59e0b','#ef4444','#3b82f6']

  const barData = {
    labels: MONTHS.map(m => m.slice(0, 3)),
    datasets: [
      { label: 'Доходы', data: incomeByMonth, backgroundColor: '#22c55e', borderRadius: 6 },
      { label: 'Расходы', data: expenseByMonth, backgroundColor: '#ef4444', borderRadius: 6 },
    ],
  }
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } },
  }

  const viewToggle = (
    <div className="flex gap-1 bg-white/20 rounded-full p-0.5 text-xs font-semibold shrink-0">
      <button onClick={() => setView('month')} className={`px-3 py-1 rounded-full transition-colors ${view === 'month' ? 'bg-white text-brand' : 'text-white'}`}>Месяц</button>
      <button onClick={() => setView('year')} className={`px-3 py-1 rounded-full transition-colors ${view === 'year' ? 'bg-white text-brand' : 'text-white'}`}>Год</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        variant="compact"
        title="Статистика"
        onBack={() => navigate('/')}
        rightSlot={viewToggle}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <SCard label="Доходы"   value={`${totalIncome.toLocaleString('ru')} ₽`}                  bg="#f0fdf4" color="#22c55e" />
            <SCard label="Расходы"  value={`${totalExpense.toLocaleString('ru')} ₽`}                 bg="#fef2f2" color="#ef4444" />
            <SCard label="Прибыль"  value={`${(totalIncome - totalExpense).toLocaleString('ru')} ₽`} bg="#f3f0ff" color="#7c3aed" />
            <SCard label="Кэшбэк"   value={`${totalCashback.toLocaleString('ru')} ₽`}               bg="#fefce8" color="#ca8a04" />
            <SCard label="Подарков" value={giftCount}                                                bg="#f3f0ff" color="#7c3aed" />
            <SCard label="В работе" value={openOrders}                                               bg="#fff7ed" color="#ea580c" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {view === 'year' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Доходы и расходы по месяцам</h3>
                <div style={{ height: 220 }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            )}
            {sourceLabels.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Откуда пришли клиенты</h3>
                <div style={{ height: 220 }}>
                  <Pie
                    data={{ labels: sourceLabels, datasets: [{ data: sourceData, backgroundColor: pieColors }] }}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SCard({ label, value, bg, color }) {
  return (
    <div style={{ background: bg, borderRadius: 16 }} className="p-3 text-center">
      <div style={{ color, fontWeight: 800 }} className="text-lg">{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

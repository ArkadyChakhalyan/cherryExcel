import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import { useApp } from '../context/AppContext.jsx'
import { MONTHS } from '../constants.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export default function StatsPage() {
  const navigate = useNavigate()
  const { entries, month } = useApp()
  const [view, setView] = useState('year') // 'year' | 'month'

  const filtered = view === 'month' ? entries.filter(e => e.month === month) : entries

  // Monthly income vs expense for bar chart
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

  // Source breakdown for pie chart
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-brand-dark to-brand-light text-white px-4 py-3 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-xl">←</button>
          <h2 className="flex-1 text-base font-bold">Статистика</h2>
          <div className="flex gap-1 bg-white/20 rounded-full p-0.5 text-xs font-semibold">
            <button onClick={() => setView('month')} className={`px-3 py-1 rounded-full ${view==='month'?'bg-white text-brand':''}`}>Месяц</button>
            <button onClick={() => setView('year')} className={`px-3 py-1 rounded-full ${view==='year'?'bg-white text-brand':''}`}>Год</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <SCard label="Доходы" value={`${totalIncome.toLocaleString('ru')} ₽`} color="text-green-500" />
            <SCard label="Расходы" value={`${totalExpense.toLocaleString('ru')} ₽`} color="text-red-500" />
            <SCard label="Чистая прибыль" value={`${(totalIncome - totalExpense).toLocaleString('ru')} ₽`} color="text-brand" />
            <SCard label="Кэшбэк" value={`${totalCashback.toLocaleString('ru')} ₽`} color="text-brand" />
            <SCard label="Подарков" value={giftCount} color="text-brand" />
            <SCard label="В работе" value={openOrders} color="text-orange-500" />
          </div>

          {/* Charts side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {view === 'year' && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Доходы и расходы по месяцам</h3>
                <div style={{ height: 220 }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            )}
            {sourceLabels.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
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

function SCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
      <div className={`text-lg font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

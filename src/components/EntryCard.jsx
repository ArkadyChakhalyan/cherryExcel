import { useNavigate } from 'react-router-dom'
import { formatForDisplay } from '../utils/dateUtils.js'

export default function EntryCard({ entry }) {
  const navigate = useNavigate()

  let title = '', meta = '', amountStr = '', amountColor = ''

  if (entry.type === 'expense') {
    title = entry.chto || entry.gde || '—'
    meta = [entry.kak, entry.kat, entry.gde].filter(Boolean).join(' · ')
    amountStr = `${entry.sum.toLocaleString('ru')} ₽`
    amountColor = 'text-red-500'
  } else if (entry.type === 'income') {
    title = entry.chto || '—'
    meta = [entry.komu, entry.gdeZakazali, entry.status].filter(Boolean).join(' · ')
    amountStr = `+${entry.sum.toLocaleString('ru')} ₽`
    amountColor = 'text-green-500'
  } else {
    title = entry.chto || '—'
    meta = [entry.komu, entry.povod].filter(Boolean).join(' · ')
    amountStr = `${entry.sum.toLocaleString('ru')} ₽`
    amountColor = 'text-brand'
  }

  const dateStr = formatForDisplay(entry.date)

  return (
    <div className="bg-white rounded-2xl px-4 py-3 mb-2 shadow-sm flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{title}</div>
        <div className="text-[11px] text-gray-400 mt-0.5 truncate">{meta}</div>
        {dateStr !== '—' && <div className="text-[10px] text-gray-300 mt-0.5">{dateStr}</div>}
      </div>
      <div className={`text-sm font-extrabold shrink-0 ${amountColor}`}>{amountStr}</div>
      <button
        onClick={() => navigate(`/edit/${entry.type}/${entry.rowIndex}`)}
        className="text-gray-300 hover:text-brand text-lg shrink-0 ml-1"
        title="Редактировать"
      >✏️</button>
    </div>
  )
}

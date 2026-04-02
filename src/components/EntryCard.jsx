import { useNavigate } from 'react-router-dom'
import { formatForDisplay } from '../utils/dateUtils.js'

const STRIPE_COLOR = { expense: '#ef4444', income: '#22c55e', gift: '#7c3aed' }
const TYPE_CHIP_STYLE = {
  expense: { background: '#fef2f2', color: '#ef4444' },
  income:  { background: '#f0fdf4', color: '#22c55e' },
  gift:    { background: '#f3f0ff', color: '#7c3aed' },
}
const SOURCE_CHIP_STYLE = { background: '#f3f0ff', color: '#7c3aed' }
const CHIP_BASE = { borderRadius: 6, padding: '2px 7px', fontSize: 9, fontWeight: 700 }

export default function EntryCard({ entry, onDelete }) {
  const navigate = useNavigate()

  let title = '', typeLabel = '', sourceLabel = '', amountStr = ''

  if (entry.type === 'expense') {
    title = entry.chto || entry.gde || '—'
    typeLabel = entry.kat || entry.kak || ''
    sourceLabel = entry.gde || entry.kak || ''
    amountStr = `${entry.sum.toLocaleString('ru')} ₽`
  } else if (entry.type === 'income') {
    title = entry.chto || '—'
    typeLabel = entry.status || ''
    sourceLabel = entry.gdeZakazali || entry.komu || ''
    amountStr = `+${entry.sum.toLocaleString('ru')} ₽`
  } else {
    title = entry.chto || '—'
    typeLabel = entry.komu || ''
    sourceLabel = entry.povod || ''
    amountStr = `${entry.sum.toLocaleString('ru')} ₽`
  }

  const dateStr = formatForDisplay(entry.date)

  return (
    <div
      style={{ borderRadius: 14, border: '1px solid #f3f0ff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      className="bg-white px-3 py-3 mb-2 flex items-center gap-3"
    >
      {/* Left stripe */}
      <div style={{ width: 3, height: 40, borderRadius: 2, background: STRIPE_COLOR[entry.type], flexShrink: 0 }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div style={{ fontWeight: 700 }} className="text-sm text-gray-800 truncate">{title}</div>
        <div className="flex gap-1 mt-1 flex-wrap">
          {typeLabel && (
            <span style={{ ...CHIP_BASE, ...TYPE_CHIP_STYLE[entry.type] }}>{typeLabel}</span>
          )}
          {sourceLabel && sourceLabel !== typeLabel && (
            <span style={{ ...CHIP_BASE, ...SOURCE_CHIP_STYLE }}>{sourceLabel}</span>
          )}
        </div>
        {dateStr !== '—' && <div className="text-[10px] text-gray-300 mt-1">{dateStr}</div>}
      </div>

      {/* Amount */}
      <div style={{ fontWeight: 900, color: STRIPE_COLOR[entry.type] }} className="text-sm shrink-0">{amountStr}</div>

      {/* Edit button */}
      <button
        onClick={() => navigate(`/edit/${entry.type}/${entry.rowIndex}`)}
        style={{ width: 24, height: 24, borderRadius: 6, background: '#f3f0ff', color: '#7c3aed', flexShrink: 0 }}
        className="flex items-center justify-center text-xs"
        title="Редактировать"
      >✎</button>

      {/* Delete button */}
      <button
        onClick={() => onDelete(entry)}
        style={{ width: 24, height: 24, borderRadius: 6, background: '#fff0f0', color: '#ef4444', flexShrink: 0 }}
        className="flex items-center justify-center text-xs"
        title="Удалить"
      >✕</button>
    </div>
  )
}

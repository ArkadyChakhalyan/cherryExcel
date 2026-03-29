import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { todayDDMMYYYY } from '../utils/dateUtils.js'
import ExpenseForm from '../forms/ExpenseForm.jsx'
import IncomeForm from '../forms/IncomeForm.jsx'
import GiftForm from '../forms/GiftForm.jsx'
import Toast from '../components/Toast.jsx'

const TITLES = { expense: 'расход', income: 'доход', gift: 'подарок' }

export default function FormPage({ mode }) {
  const { type, rowIndex } = useParams()
  const navigate = useNavigate()
  const { entries, saveEntry, editEntry, suggestions, toast, month } = useApp()

  const isEdit = mode === 'edit'

  const existing = isEdit
    ? entries.find(e => e.rowIndex === Number(rowIndex) && e.type === type)
    : null

  const defaultData = useMemo(() => {
    if (existing) return { ...existing }
    const base = { type, date: todayDDMMYYYY(), month }
    if (type === 'expense') return { ...base, sum: '', kak: '', kat: '', chto: '', gde: '', oplata: '', katOplaty: '', cashback: '', skidki: '' }
    if (type === 'income') return { ...base, sum: '', chto: '', komu: '', predoplata: '', dostavka: '', gdeZakazali: '', otkuda: '', otziv: '', skidki: '', status: 'В работе' }
    return { ...base, sum: '', chto: '', komu: '', otziv: '', dostavka: '', povod: '' }
  }, [existing, type, month])

  const [data, setData] = useState(defaultData)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!data.sum) return
    setSaving(true)
    const entry = { ...data, sum: Number(String(data.sum).replace(',', '.')) }
    if (type === 'expense') entry.sum = -Math.abs(entry.sum)
    const ok = isEdit ? await editEntry(entry) : await saveEntry(entry)
    setSaving(false)
    if (ok) navigate('/')
  }

  const FormComponent = type === 'expense' ? ExpenseForm : type === 'income' ? IncomeForm : GiftForm
  const typeSuggestions = suggestions?.[type]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <div className="bg-gradient-to-r from-brand-dark to-brand-light text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/')} className="text-xl">←</button>
        <h2 className="flex-1 text-base font-bold">
          {isEdit ? 'Редактировать' : 'Новый'} {TITLES[type]}
        </h2>
        <button
          onClick={handleSave}
          disabled={saving || !data.sum}
          className="bg-white text-brand rounded-full px-4 py-1.5 text-xs font-bold disabled:opacity-40"
        >
          {saving ? '…' : 'Сохранить'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <FormComponent data={data} onChange={setData} suggestions={typeSuggestions} />
      </div>
      <Toast toast={toast} />
    </div>
  )
}

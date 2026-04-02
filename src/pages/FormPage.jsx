import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { todayDDMMYYYY } from '../utils/dateUtils.js'
import Header from '../components/Header.jsx'
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

  const saveButton = (
    <button
      onClick={handleSave}
      disabled={saving || !data.sum}
      style={{ background: 'white', color: '#6d28d9', fontWeight: 800, borderRadius: 10, padding: '6px 16px', fontSize: 13 }}
      className="disabled:opacity-40 shrink-0"
    >
      {saving ? '…' : 'Сохранить'}
    </button>
  )

  const FormComponent = type === 'expense' ? ExpenseForm : type === 'income' ? IncomeForm : GiftForm
  const typeSuggestions = suggestions?.[type]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        variant="compact"
        title={`${isEdit ? 'Редактировать' : 'Новый'} ${TITLES[type]}`}
        onBack={() => navigate('/')}
        rightSlot={saveButton}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <FormComponent data={data} onChange={setData} suggestions={typeSuggestions} />
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  )
}

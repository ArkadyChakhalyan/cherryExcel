# ВИШНЯ UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved UI redesign — gradient header with frosted stat card, Nunito font, pill tabs, colored entry cards, and updated form/login/stats styles.

**Architecture:** Pure visual redesign — no data logic changes. `Header.jsx` is the anchor: it absorbs `TabBar.jsx`, `MonthNav.jsx`, and `StatCards.jsx` via a `variant` prop (`"list"` for ListPage, `"compact"` for FormPage/StatsPage). All other files are restyled in place.

**Tech Stack:** React 18, Tailwind CSS v3, inline styles for spec-exact values not expressible in Tailwind config.

---

## File Map

| File | Action |
|------|--------|
| `src/index.css` | Add Nunito font import + body rule |
| `src/components/Header.jsx` | Rewrite: gradient + variant prop, absorbs TabBar/MonthNav/StatCards |
| `src/pages/ListPage.jsx` | Remove TabBar/MonthNav/StatCards; white bg; new add button |
| `src/components/EntryCard.jsx` | New design: left stripe, chip tags, square buttons |
| `src/pages/FormPage.jsx` | Use Header variant="compact"; white bg |
| `src/pages/LoginPage.jsx` | Full-screen gradient; frosted Google button |
| `src/pages/StatsPage.jsx` | Use Header variant="compact"; colored stat cards |
| `src/components/ChipSelector.jsx` | Updated active/inactive styles |
| `src/forms/ExpenseForm.jsx` | Updated Field labels, input borders, amount highlight block |
| `src/forms/IncomeForm.jsx` | Same Field + input updates as ExpenseForm |
| `src/forms/GiftForm.jsx` | Same Field + input updates as ExpenseForm |
| `src/components/ConfirmModal.jsx` | border-radius: 20px, gradient confirm button |
| `src/components/TabBar.jsx` | Delete |
| `src/components/MonthNav.jsx` | Delete |
| `src/components/StatCards.jsx` | Delete |

---

### Task 1: Add Nunito Font

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Nunito', sans-serif;
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add Nunito font"
```

---

### Task 2: Rewrite Header.jsx

**Files:**
- Modify: `src/components/Header.jsx`

This component absorbs the logic from `TabBar`, `MonthNav`, and `StatCards`. It accepts a `variant` prop:
- `"list"` (default): title row + frosted stat card with month navigation + pill tabs
- `"compact"`: gradient bar with a frosted back button, title text, and an optional `rightSlot`

For the compact variant, callers pass `title` (string), `onBack` (function), and `rightSlot` (React node).

- [ ] **Step 1: Replace `src/components/Header.jsx`**

```jsx
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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds (TabBar/MonthNav/StatCards still exist at this point — ListPage still imports them).

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat: rewrite Header with gradient, frosted stat card, pill tabs, compact variant"
```

---

### Task 3: Update ListPage.jsx

**Files:**
- Modify: `src/pages/ListPage.jsx`

Remove TabBar, MonthNav, StatCards. Background becomes `bg-white`. Add button gets gradient style.

- [ ] **Step 1: Replace `src/pages/ListPage.jsx`**

```jsx
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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds. TabBar/MonthNav/StatCards still exist as files but are no longer imported anywhere.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ListPage.jsx
git commit -m "feat: update ListPage to use new Header, remove old stat components, new add button"
```

---

### Task 4: Restyle EntryCard.jsx

**Files:**
- Modify: `src/components/EntryCard.jsx`

New layout: left colored stripe (3×40px), content block with title + 2 chip tags + date, right-aligned amount, square 24×24 edit/delete buttons.

- [ ] **Step 1: Replace `src/components/EntryCard.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { formatForDisplay } from '../utils/dateUtils.js'

const STRIPE_COLOR = { expense: '#ef4444', income: '#22c55e', gift: '#7c3aed' }
const AMOUNT_COLOR = { expense: '#ef4444', income: '#22c55e', gift: '#7c3aed' }
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
      <div style={{ fontWeight: 900, color: AMOUNT_COLOR[entry.type] }} className="text-sm shrink-0">{amountStr}</div>

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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/EntryCard.jsx
git commit -m "feat: restyle EntryCard with stripe, chip tags, square action buttons"
```

---

### Task 5: Update FormPage.jsx

**Files:**
- Modify: `src/pages/FormPage.jsx`

Use `<Header variant="compact" ... />`. White background. Save button styled as white pill with brand color text.

- [ ] **Step 1: Replace `src/pages/FormPage.jsx`**

```jsx
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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/FormPage.jsx
git commit -m "feat: update FormPage with compact Header and styled save button"
```

---

### Task 6: Restyle LoginPage.jsx

**Files:**
- Modify: `src/pages/LoginPage.jsx`

Full-screen gradient background, large cherry with drop shadow, white title with letter-spacing, frosted glass Google button.

- [ ] **Step 1: Replace `src/pages/LoginPage.jsx`**

```jsx
import { useGoogleLogin } from '@react-oauth/google'

export default function LoginPage({ onLogin }) {
  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    onSuccess: (response) => onLogin(response.access_token, response.expires_in),
    onError: (err) => console.error('Login failed', err),
  })

  return (
    <div
      style={{ background: 'linear-gradient(145deg, #3b0764 0%, #6d28d9 50%, #a855f7 100%)' }}
      className="min-h-screen flex flex-col items-center justify-center px-8"
    >
      <div style={{ fontSize: 72, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))' }} className="mb-6">🍒</div>
      <h1 style={{ letterSpacing: '0.15em' }} className="text-3xl font-extrabold text-white mb-2">ВИШНЯ</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-10 text-center text-sm">
        Учёт финансов бизнеса по украшениям
      </p>
      <button
        onClick={() => login()}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(12px)',
          borderRadius: 14,
          padding: '14px 24px',
        }}
        className="flex items-center gap-3 text-white font-semibold text-sm active:scale-95 transition-transform"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
        Войти через Google
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LoginPage.jsx
git commit -m "feat: restyle LoginPage with gradient background and frosted glass button"
```

---

### Task 7: Update StatsPage.jsx

**Files:**
- Modify: `src/pages/StatsPage.jsx`

Use `<Header variant="compact" ... />` with view toggle as `rightSlot`. Colored stat card backgrounds per metric type. White page background.

- [ ] **Step 1: Replace `src/pages/StatsPage.jsx`**

```jsx
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
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/StatsPage.jsx
git commit -m "feat: update StatsPage with compact Header and colored stat cards"
```

---

### Task 8: Update ChipSelector.jsx

**Files:**
- Modify: `src/components/ChipSelector.jsx`

Active: `background: #6d28d9, color: white, border: 1px solid #6d28d9`.
Inactive: `background: #f3f0ff, color: #6d28d9, border: 1px solid #ddd6fe`.

- [ ] **Step 1: Replace `src/components/ChipSelector.jsx`**

```jsx
export default function ChipSelector({ options, value, onChange, labelMap }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === value ? '' : opt)}
          style={value === opt
            ? { background: '#6d28d9', color: 'white', border: '1px solid #6d28d9' }
            : { background: '#f3f0ff', color: '#6d28d9', border: '1px solid #ddd6fe' }
          }
          className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
        >
          {labelMap ? labelMap[opt] ?? opt : opt}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChipSelector.jsx
git commit -m "feat: update ChipSelector active/inactive chip styles"
```

---

### Task 9: Update Form Field Styles

**Files:**
- Modify: `src/forms/ExpenseForm.jsx`
- Modify: `src/forms/IncomeForm.jsx`
- Modify: `src/forms/GiftForm.jsx`

Changes in each file:
- `Field` label: `fontSize: 9, fontWeight: 800, color: '#888', letterSpacing: '1.5px'`
- Regular inputs: `border: 1.5px solid #ede9fe, borderRadius: 10` via inline style
- Amount field: wrapped in gradient highlight block (`background: linear-gradient(135deg, #f3f0ff, #ede9fe)`, `border: 1.5px solid #ddd6fe`, `borderRadius: 14`)

- [ ] **Step 1: Replace `src/forms/ExpenseForm.jsx`**

```jsx
import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_KAK, CHIP_KAT, CHIP_KAT_LABELS } from '../constants.js'

export default function ExpenseForm({ data, onChange, suggestions }) {
  const f = (key) => data[key] ?? ''
  const set = (key) => (val) => onChange({ ...data, [key]: val })

  return (
    <div className="space-y-4">
      <div style={{ background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)', border: '1.5px solid #ddd6fe', borderRadius: 14 }} className="p-3">
        <Field label="Сумма (₽)">
          <input type="number" inputMode="decimal" value={f('sum')} onChange={e => set('sum')(e.target.value)}
            placeholder="0" className="w-full bg-transparent focus:outline-none text-xl font-extrabold text-brand placeholder-brand/40" />
        </Field>
      </div>
      <Field label="КАК">
        <ChipSelector options={CHIP_KAK} value={f('kak')} onChange={set('kak')} />
      </Field>
      <Field label="Категория">
        <ChipSelector options={CHIP_KAT} value={f('kat')} onChange={set('kat')} labelMap={CHIP_KAT_LABELS} />
      </Field>
      <Field label="ЧТО">
        <AutocompleteInput value={f('chto')} onChange={set('chto')} suggestions={suggestions?.chto} placeholder="Фурнитура, бусины…" />
      </Field>
      <Field label="ГДЕ">
        <AutocompleteInput value={f('gde')} onChange={set('gde')} suggestions={suggestions?.gde} placeholder="AliExpress, WB…" />
      </Field>
      <Field label="Оплата">
        <AutocompleteInput value={f('oplata')} onChange={set('oplata')} suggestions={suggestions?.oplata} placeholder="Карта Тбанк…" />
      </Field>
      <Field label="Категория оплаты">
        <AutocompleteInput value={f('katOplaty')} onChange={set('katOplaty')} suggestions={suggestions?.katOplaty} placeholder="Различные товары…" />
      </Field>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Кэшбэк">
            <input type="number" inputMode="decimal" value={f('cashback')} onChange={e => set('cashback')(e.target.value)}
              placeholder="0" style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Скидки">
            <input type="text" value={f('skidki')} onChange={e => set('skidki')(e.target.value)}
              placeholder="-" style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </Field>
        </div>
      </div>
      <Field label="Дата">
        <input type="date" value={dateToDMY(f('date'))} onChange={e => set('date')(dmyFromDate(e.target.value))}
          style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 9, fontWeight: 800, color: '#888', letterSpacing: '1.5px' }} className="block uppercase mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function dateToDMY(str) {
  if (!str) return ''
  const [d, m, y] = str.split('.')
  return d && m && y ? `${y}-${m}-${d}` : ''
}
function dmyFromDate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}.${m}.${y}`
}
```

- [ ] **Step 2: Replace `src/forms/IncomeForm.jsx`**

```jsx
import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_GDE_ZAKAZALI, CHIP_OTZIV, CHIP_STATUS } from '../constants.js'

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 9, fontWeight: 800, color: '#888', letterSpacing: '1.5px' }} className="block uppercase mb-1.5">{label}</label>
      {children}
    </div>
  )
}
function dateToDMY(str) { if (!str) return ''; const [d,m,y]=str.split('.'); return d&&m&&y?`${y}-${m}-${d}`:''; }
function dmyFromDate(str) { if (!str) return ''; const [y,m,d]=str.split('-'); return `${d}.${m}.${y}`; }

export default function IncomeForm({ data, onChange, suggestions }) {
  const f = (key) => data[key] ?? ''
  const set = (key) => (val) => onChange({ ...data, [key]: val })

  return (
    <div className="space-y-4">
      <div style={{ background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)', border: '1.5px solid #ddd6fe', borderRadius: 14 }} className="p-3">
        <Field label="Сумма (₽)">
          <input type="number" inputMode="decimal" value={f('sum')} onChange={e => set('sum')(e.target.value)}
            placeholder="0" className="w-full bg-transparent focus:outline-none text-xl font-extrabold text-brand placeholder-brand/40" />
        </Field>
      </div>
      <Field label="Статус">
        <ChipSelector options={CHIP_STATUS} value={f('status')} onChange={set('status')} />
      </Field>
      <Field label="ЧТО (изделие)">
        <AutocompleteInput value={f('chto')} onChange={set('chto')} suggestions={suggestions?.chto} placeholder="Колье, серьги…" />
      </Field>
      <Field label="КОМУ">
        <AutocompleteInput value={f('komu')} onChange={set('komu')} suggestions={suggestions?.komu} placeholder="Анна Николаевна…" />
      </Field>
      <Field label="Предоплата">
        <input type="text" value={f('predoplata')} onChange={e => set('predoplata')(e.target.value)}
          placeholder="100%, 50%…" style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
      <Field label="Доставка">
        <AutocompleteInput value={f('dostavka')} onChange={set('dostavka')} suggestions={suggestions?.dostavka} placeholder="СДЭК, Почта…" />
      </Field>
      <Field label="ГДЕ заказали">
        <ChipSelector options={CHIP_GDE_ZAKAZALI} value={f('gdeZakazali')} onChange={set('gdeZakazali')} />
      </Field>
      <Field label="Откуда пришли">
        <AutocompleteInput value={f('otkuda')} onChange={set('otkuda')} suggestions={suggestions?.otkuda} placeholder="Канал, рекомендация…" />
      </Field>
      <Field label="Отзыв">
        <ChipSelector options={CHIP_OTZIV} value={f('otziv')} onChange={set('otziv')} />
      </Field>
      <Field label="Скидки">
        <input type="text" value={f('skidki')} onChange={e => set('skidki')(e.target.value)}
          placeholder="-" style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
      <Field label="Дата">
        <input type="date" value={dateToDMY(f('date'))} onChange={e => set('date')(dmyFromDate(e.target.value))}
          style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}
```

- [ ] **Step 3: Replace `src/forms/GiftForm.jsx`**

```jsx
import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_OTZIV } from '../constants.js'

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 9, fontWeight: 800, color: '#888', letterSpacing: '1.5px' }} className="block uppercase mb-1.5">{label}</label>
      {children}
    </div>
  )
}
function dateToDMY(str) { if (!str) return ''; const [d,m,y]=str.split('.'); return d&&m&&y?`${y}-${m}-${d}`:''; }
function dmyFromDate(str) { if (!str) return ''; const [y,m,d]=str.split('-'); return `${d}.${m}.${y}`; }

export default function GiftForm({ data, onChange, suggestions }) {
  const f = (key) => data[key] ?? ''
  const set = (key) => (val) => onChange({ ...data, [key]: val })

  return (
    <div className="space-y-4">
      <div style={{ background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)', border: '1.5px solid #ddd6fe', borderRadius: 14 }} className="p-3">
        <Field label="Сумма (₽)">
          <input type="number" inputMode="decimal" value={f('sum')} onChange={e => set('sum')(e.target.value)}
            placeholder="0" className="w-full bg-transparent focus:outline-none text-xl font-extrabold text-brand placeholder-brand/40" />
        </Field>
      </div>
      <Field label="ЧТО">
        <AutocompleteInput value={f('chto')} onChange={set('chto')} suggestions={suggestions?.chto} placeholder="Серьги, колье…" />
      </Field>
      <Field label="КОМУ">
        <AutocompleteInput value={f('komu')} onChange={set('komu')} suggestions={suggestions?.komu} placeholder="Маме, подруге…" />
      </Field>
      <Field label="Отзыв">
        <ChipSelector options={CHIP_OTZIV} value={f('otziv')} onChange={set('otziv')} />
      </Field>
      <Field label="Доставка">
        <AutocompleteInput value={f('dostavka')} onChange={set('dostavka')} suggestions={suggestions?.dostavka} placeholder="СДЭК, лично…" />
      </Field>
      <Field label="Повод">
        <AutocompleteInput value={f('povod')} onChange={set('povod')} suggestions={suggestions?.povod} placeholder="День рождения…" />
      </Field>
      <Field label="Дата">
        <input type="date" value={dateToDMY(f('date'))} onChange={e => set('date')(dmyFromDate(e.target.value))}
          style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}
```

- [ ] **Step 4: Verify build and tests pass**

```bash
npm run build && npm test
```
Expected: Build succeeds, all existing tests pass (tests cover data logic, not UI styles).

- [ ] **Step 5: Commit**

```bash
git add src/forms/ExpenseForm.jsx src/forms/IncomeForm.jsx src/forms/GiftForm.jsx
git commit -m "feat: update form field styles — gradient amount block, new input borders"
```

---

### Task 10: Restyle ConfirmModal.jsx

**Files:**
- Modify: `src/components/ConfirmModal.jsx`

Modal card: `borderRadius: 20px`. Confirm button: gradient. Cancel button: outlined with brand border/text.

- [ ] **Step 1: Replace `src/components/ConfirmModal.jsx`**

```jsx
export default function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        style={{ borderRadius: 20 }}
        className="bg-white shadow-xl px-6 py-5 mx-4 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-gray-800 font-semibold text-base mb-4 text-center">Удалить запись?</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            style={{ border: '1.5px solid #ddd6fe', borderRadius: 10, color: '#7c3aed' }}
            className="flex-1 py-2 text-sm font-semibold hover:bg-purple-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)', borderRadius: 10 }}
            className="flex-1 py-2 text-white text-sm font-semibold"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ConfirmModal.jsx
git commit -m "feat: restyle ConfirmModal with rounded corners and gradient confirm button"
```

---

### Task 11: Delete Old Components

**Files:**
- Delete: `src/components/TabBar.jsx`
- Delete: `src/components/MonthNav.jsx`
- Delete: `src/components/StatCards.jsx`

These are now dead code — their logic lives in `Header.jsx`. No file imports them anymore.

- [ ] **Step 1: Delete the three files**

```bash
rm src/components/TabBar.jsx src/components/MonthNav.jsx src/components/StatCards.jsx
```

- [ ] **Step 2: Verify build and tests still pass**

```bash
npm run build && npm test
```
Expected: Build succeeds, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove TabBar, MonthNav, StatCards (merged into Header)"
```

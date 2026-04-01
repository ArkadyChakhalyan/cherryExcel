# Delete Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to delete (clear) an entry row via a confirm modal on the list page.

**Architecture:** Deletion clears the Google Sheets row using the existing `updateRow` hook with an empty array. `AppContext` gets a `deleteEntry` action; `EntryList` owns the modal state; a new `ConfirmModal` component handles the overlay UI.

**Tech Stack:** React 18, Vite, Tailwind CSS, Vitest, Google Sheets API v4

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/context/AppContext.jsx` | Modify | Add `DELETE_ENTRY` reducer case + `deleteEntry` callback |
| `src/components/ConfirmModal.jsx` | Create | Reusable confirm overlay modal |
| `src/components/EntryList.jsx` | Modify | Own `pendingDelete` state, render modal, pass `onDelete` to cards |
| `src/components/EntryCard.jsx` | Modify | Accept `onDelete` prop, add delete button |

---

### Task 1: Add `DELETE_ENTRY` to AppContext

**Files:**
- Modify: `src/context/AppContext.jsx`

- [ ] **Step 1: Add `DELETE_ENTRY` reducer case**

In `src/context/AppContext.jsx`, add the case inside `function reducer`:

```js
case 'DELETE_ENTRY': return {
  ...state,
  entries: state.entries.filter(e => e.rowIndex !== action.rowIndex),
}
```

Full updated reducer:

```js
function reducer(state, action) {
  switch (action.type) {
    case 'SET_YEAR': return { ...state, year: action.year, entries: [], loading: true }
    case 'SET_DATA': return { ...state, entries: action.entries, allSheets: action.allSheets, loading: false, error: null }
    case 'SET_TAB': return { ...state, tab: action.tab }
    case 'SET_MONTH': return { ...state, month: action.month }
    case 'SET_LOADING': return { ...state, loading: action.loading }
    case 'SET_ERROR': return { ...state, error: action.error, loading: false }
    case 'ADD_ENTRY': return { ...state, entries: [...state.entries, action.entry] }
    case 'UPDATE_ENTRY': return {
      ...state,
      entries: state.entries.map(e => e.rowIndex === action.entry.rowIndex ? action.entry : e),
    }
    case 'DELETE_ENTRY': return {
      ...state,
      entries: state.entries.filter(e => e.rowIndex !== action.rowIndex),
    }
    default: return state
  }
}
```

- [ ] **Step 2: Write a unit test for the reducer**

Create `src/context/AppContext.test.js`:

```js
import { describe, it, expect } from 'vitest'

// Extract reducer for testing — copy the function here since it's not exported
function reducer(state, action) {
  switch (action.type) {
    case 'SET_YEAR': return { ...state, year: action.year, entries: [], loading: true }
    case 'SET_DATA': return { ...state, entries: action.entries, allSheets: action.allSheets, loading: false, error: null }
    case 'SET_TAB': return { ...state, tab: action.tab }
    case 'SET_MONTH': return { ...state, month: action.month }
    case 'SET_LOADING': return { ...state, loading: action.loading }
    case 'SET_ERROR': return { ...state, error: action.error, loading: false }
    case 'ADD_ENTRY': return { ...state, entries: [...state.entries, action.entry] }
    case 'UPDATE_ENTRY': return {
      ...state,
      entries: state.entries.map(e => e.rowIndex === action.entry.rowIndex ? action.entry : e),
    }
    case 'DELETE_ENTRY': return {
      ...state,
      entries: state.entries.filter(e => e.rowIndex !== action.rowIndex),
    }
    default: return state
  }
}

describe('reducer DELETE_ENTRY', () => {
  const baseState = {
    entries: [
      { rowIndex: 5, type: 'expense', sum: 100 },
      { rowIndex: 8, type: 'income', sum: 200 },
      { rowIndex: 12, type: 'gift', sum: 300 },
    ],
  }

  it('removes the entry with the matching rowIndex', () => {
    const next = reducer(baseState, { type: 'DELETE_ENTRY', rowIndex: 8 })
    expect(next.entries).toHaveLength(2)
    expect(next.entries.find(e => e.rowIndex === 8)).toBeUndefined()
  })

  it('leaves other entries untouched', () => {
    const next = reducer(baseState, { type: 'DELETE_ENTRY', rowIndex: 8 })
    expect(next.entries[0].rowIndex).toBe(5)
    expect(next.entries[1].rowIndex).toBe(12)
  })

  it('is a no-op when rowIndex does not exist', () => {
    const next = reducer(baseState, { type: 'DELETE_ENTRY', rowIndex: 99 })
    expect(next.entries).toHaveLength(3)
  })
})
```

- [ ] **Step 3: Run the test to verify it passes**

```bash
cd /Users/arkady/StudioProjects/alenaExcel && npm test -- src/context/AppContext.test.js
```

Expected: 3 tests pass.

- [ ] **Step 4: Add `deleteEntry` callback to `AppProvider`**

In `src/context/AppContext.jsx`, add after the `editEntry` callback:

```js
const deleteEntry = useCallback(async (entry) => {
  try {
    await updateRow(sheetName, entry.rowIndex, [])
    dispatch({ type: 'DELETE_ENTRY', rowIndex: entry.rowIndex })
    localStorage.removeItem(CACHE_KEY)
    showToast('Удалено ✓')
    return true
  } catch (err) {
    showToast(`Ошибка удаления: ${err.message}`, true)
    return false
  }
}, [updateRow, sheetName, showToast])
```

- [ ] **Step 5: Expose `deleteEntry` via context**

In the `AppContext.Provider` value object, add `deleteEntry`:

```jsx
<AppContext.Provider value={{
  ...state,
  sheetName,
  setYear,
  setTab,
  setMonth,
  saveEntry,
  editEntry,
  deleteEntry,
  refresh,
  logout,
  suggestions,
  toast,
}}>
```

- [ ] **Step 6: Commit**

```bash
git add src/context/AppContext.jsx src/context/AppContext.test.js
git commit -m "feat: add deleteEntry action to AppContext"
```

---

### Task 2: Create `ConfirmModal` component

**Files:**
- Create: `src/components/ConfirmModal.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/ConfirmModal.jsx`:

```jsx
export default function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl px-6 py-5 mx-4 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-gray-800 font-semibold text-base mb-4 text-center">Удалить запись?</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConfirmModal.jsx
git commit -m "feat: add ConfirmModal component"
```

---

### Task 3: Update `EntryList` to manage delete state

**Files:**
- Modify: `src/components/EntryList.jsx`

- [ ] **Step 1: Update `EntryList`**

Replace the full contents of `src/components/EntryList.jsx`:

```jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'
import EntryCard from './EntryCard.jsx'
import ConfirmModal from './ConfirmModal.jsx'

export default function EntryList() {
  const { entries, tab, month, loading, deleteEntry } = useApp()
  const [pendingDelete, setPendingDelete] = useState(null)

  const typeMap = { [TABS.EXPENSE]: 'expense', [TABS.INCOME]: 'income', [TABS.GIFT]: 'gift' }
  const type = typeMap[tab]

  const visible = entries.filter(e => e.type === type && e.month === month)

  const handleConfirmDelete = async () => {
    await deleteEntry(pendingDelete)
    setPendingDelete(null)
  }

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Загрузка…</div>
  if (visible.length === 0) return <div className="text-center py-10 text-gray-300 text-sm">Записей нет</div>

  return (
    <>
      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {visible.map((e, i) => (
          <EntryCard key={`${e.rowIndex}-${i}`} entry={e} onDelete={setPendingDelete} />
        ))}
      </div>
      {pendingDelete && (
        <ConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EntryList.jsx
git commit -m "feat: add delete modal state to EntryList"
```

---

### Task 4: Add delete button to `EntryCard`

**Files:**
- Modify: `src/components/EntryCard.jsx`

- [ ] **Step 1: Add `onDelete` prop and delete button**

Replace the full contents of `src/components/EntryCard.jsx`:

```jsx
import { useNavigate } from 'react-router-dom'
import { formatForDisplay } from '../utils/dateUtils.js'

export default function EntryCard({ entry, onDelete }) {
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
      <button
        onClick={() => onDelete(entry)}
        className="text-gray-300 hover:text-red-400 text-lg shrink-0"
        title="Удалить"
      >🗑️</button>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests to confirm nothing broken**

```bash
cd /Users/arkady/StudioProjects/alenaExcel && npm test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/EntryCard.jsx
git commit -m "feat: add delete button to EntryCard"
```

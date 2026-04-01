// src/context/AppContext.jsx
import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { useSheets } from '../hooks/useSheets.js'
import { useAutocomplete } from '../hooks/useAutocomplete.js'
import { parseSheetRows } from '../utils/sheetParser.js'
import { entryToRow } from '../utils/sheetWriter.js'
import { TABS, MONTH_PREFIXES } from '../constants.js'

const CACHE_KEY = 'vishnya_data'
const CACHE_TTL = 5 * 60 * 1000

const AppContext = createContext(null)

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

export function AppProvider({ token, logout, children }) {
  const { readSheet, listSheets, insertRow, updateRow, clearRow, addSheet } = useSheets(token)
  const [sheetName, setSheetName] = useState(() => `1. Общая ${new Date().getFullYear()}`)
  const [toast, setToast] = useState(null)

  const [state, dispatch] = useReducer(reducer, {
    year: new Date().getFullYear(),
    tab: TABS.EXPENSE,
    month: new Date().getMonth(),
    entries: [],
    allSheets: [],
    loading: true,
    error: null,
  })

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadData = useCallback(async (name) => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
      if (cached && cached.sheet === name && Date.now() - cached.ts < CACHE_TTL) {
        const allSheets = await listSheets()
        dispatch({ type: 'SET_DATA', entries: cached.entries, allSheets })
        return
      }
    } catch (_) {}

    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const [rows, allSheets] = await Promise.all([readSheet(name), listSheets()])
      const entries = parseSheetRows(rows)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ sheet: name, entries, ts: Date.now() }))
      dispatch({ type: 'SET_DATA', entries, allSheets })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message })
      showToast('Ошибка загрузки данных', true)
    }
  }, [readSheet, listSheets, showToast])

  useEffect(() => { loadData(sheetName) }, [sheetName, loadData])

  const setYear = useCallback(async (year) => {
    const name = `1. Общая ${year}`
    if (!state.allSheets.includes(name)) {
      try {
        const prevName = `1. Общая ${year - 1}`
        await addSheet(name, prevName)
        showToast(`Создан лист ${name}`)
      } catch (err) {
        showToast(`Не удалось создать лист: ${err.message}`, true)
        return
      }
    }
    setSheetName(name)
    dispatch({ type: 'SET_YEAR', year })
  }, [state.allSheets, addSheet, showToast])

  const findInsertIndex = useCallback(async () => {
    const rows = await readSheet(sheetName)
    const targetPrefix = MONTH_PREFIXES[state.month]
    let inTargetMonth = false
    let firstEmptyInMonth = null
    for (let i = 3; i < rows.length; i++) {
      const cell0 = (rows[i][0] || '').toString().trim()
      const cell1 = (rows[i][1] || '').toString().trim()
      if (cell0.startsWith(targetPrefix.split(' ')[0] + ' ')) inTargetMonth = true
      if (inTargetMonth) {
        if (cell1.startsWith('Возврат:')) {
          // Prefer reusing an existing empty row over inserting a new one
          if (firstEmptyInMonth !== null) return { index: firstEmptyInMonth, reuse: true }
          return { index: i, reuse: false }
        }
        // Track first truly empty row in this month's section
        const rowIsEmpty = (rows[i] || []).every(cell => (cell ?? '').toString().trim() === '')
        if (rowIsEmpty && firstEmptyInMonth === null) firstEmptyInMonth = i
      }
    }
    if (firstEmptyInMonth !== null) return { index: firstEmptyInMonth, reuse: true }
    return { index: rows.length, reuse: false }
  }, [readSheet, sheetName, state.month])

  const saveEntry = useCallback(async (entry) => {
    const row = entryToRow(entry)
    try {
      const { index, reuse } = await findInsertIndex()
      if (reuse) {
        await updateRow(sheetName, index, row)
      } else {
        await insertRow(sheetName, index, row)
      }
      const newEntry = { ...entry, rowIndex: index }
      dispatch({ type: 'ADD_ENTRY', entry: newEntry })
      localStorage.removeItem(CACHE_KEY)
      showToast('Сохранено ✓')
      return true
    } catch (err) {
      showToast(`Ошибка сохранения: ${err.message}`, true)
      return false
    }
  }, [insertRow, updateRow, sheetName, findInsertIndex, showToast])

  const editEntry = useCallback(async (entry) => {
    const row = entryToRow(entry)
    try {
      await updateRow(sheetName, entry.rowIndex, row)
      dispatch({ type: 'UPDATE_ENTRY', entry })
      localStorage.removeItem(CACHE_KEY)
      showToast('Обновлено ✓')
      return true
    } catch (err) {
      showToast(`Ошибка обновления: ${err.message}`, true)
      return false
    }
  }, [updateRow, sheetName, showToast])

  const deleteEntry = useCallback(async (entry) => {
    try {
      await clearRow(sheetName, entry.rowIndex)
      dispatch({ type: 'DELETE_ENTRY', rowIndex: entry.rowIndex })
      localStorage.removeItem(CACHE_KEY)
      showToast('Удалено ✓')
      return true
    } catch (err) {
      showToast(`Ошибка удаления: ${err.message}`, true)
      return false
    }
  }, [clearRow, sheetName, showToast])

  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY)
    loadData(sheetName)
  }, [loadData, sheetName])

  const suggestions = useAutocomplete(state.entries)

  const setTab = useCallback((tab) => dispatch({ type: 'SET_TAB', tab }), [])
  const setMonth = useCallback((month) => dispatch({ type: 'SET_MONTH', month }), [])

  return (
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
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

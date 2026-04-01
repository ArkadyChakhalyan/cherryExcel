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

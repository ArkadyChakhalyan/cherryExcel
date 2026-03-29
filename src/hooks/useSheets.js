// src/hooks/useSheets.js
import { useCallback } from 'react'
import { SPREADSHEET_ID } from '../constants.js'

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

export function useSheets(token) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  /** Fetch all rows from a named sheet tab as string[][] */
  const readSheet = useCallback(async (sheetName) => {
    const range = encodeURIComponent(`${sheetName}!A:Z`)
    const url = `${BASE}/${SPREADSHEET_ID}/values/${range}?valueRenderOption=FORMATTED_VALUE`
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Sheets read failed: ${res.status}`)
    const data = await res.json()
    return data.values ?? []
  }, [token])

  /** List all sheet tab names */
  const listSheets = useCallback(async () => {
    const url = `${BASE}/${SPREADSHEET_ID}?fields=sheets.properties.title`
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`listSheets failed: ${res.status}`)
    const data = await res.json()
    return (data.sheets ?? []).map(s => s.properties.title)
  }, [token])

  /**
   * Overwrite a specific row (0-based rowIndex) with rowData.
   * IMPORTANT: declared before insertRow so insertRow can reference it.
   */
  const updateRow = useCallback(async (sheetName, rowIndex, rowData) => {
    const a1Row = rowIndex + 1  // Sheets API is 1-based
    const range = encodeURIComponent(`${sheetName}!A${a1Row}:Z${a1Row}`)
    const url = `${BASE}/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ range: `${sheetName}!A${a1Row}:Z${a1Row}`, majorDimension: 'ROWS', values: [rowData] }),
    })
    if (!res.ok) throw new Error(`updateRow failed: ${res.status}`)
  }, [token])

  /**
   * Insert a blank row at `rowIndex` (0-based sheet row) then write `rowData` there.
   * rowIndex is the 0-based index to insert BEFORE (i.e. the Возврат: row index).
   */
  const insertRow = useCallback(async (sheetName, rowIndex, rowData) => {
    // 1. Get sheetId for batchUpdate
    const metaRes = await fetch(`${BASE}/${SPREADSHEET_ID}?fields=sheets.properties`, { headers })
    const metaData = await metaRes.json()
    const sheet = metaData.sheets.find(s => s.properties.title === sheetName)
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`)
    const sheetId = sheet.properties.sheetId

    // 2. Insert blank row above rowIndex
    const insertRes = await fetch(`${BASE}/${SPREADSHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requests: [{
          insertDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
            inheritFromBefore: true,
          },
        }],
      }),
    })
    if (!insertRes.ok) throw new Error(`insertDimension failed: ${insertRes.status}`)

    // 3. Write data to the new row
    await updateRow(sheetName, rowIndex, rowData)
  }, [token, updateRow])

  /**
   * Create a new sheet tab by copying headers from `sourceSheetName`.
   */
  const addSheet = useCallback(async (newSheetName, sourceSheetName) => {
    // Read headers from source (first 3 rows)
    const sourceRows = await readSheet(sourceSheetName)

    const res = await fetch(`${BASE}/${SPREADSHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requests: [
          { addSheet: { properties: { title: newSheetName } } },
        ],
      }),
    })
    if (!res.ok) throw new Error(`addSheet failed: ${res.status}`)

    // Write header rows to new sheet
    const range = encodeURIComponent(`${newSheetName}!A1:Z3`)
    const url = `${BASE}/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`
    const writeRes = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ range: `${newSheetName}!A1:Z3`, majorDimension: 'ROWS', values: sourceRows.slice(0, 3) }),
    })
    if (!writeRes.ok) throw new Error(`addSheet header write failed: ${writeRes.status}`)
  }, [token, readSheet])

  return { readSheet, listSheets, insertRow, updateRow, addSheet }
}

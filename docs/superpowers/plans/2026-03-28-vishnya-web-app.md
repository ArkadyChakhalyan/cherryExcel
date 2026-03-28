# ВИШНЯ Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first React PWA that reads and writes a Google Sheets spreadsheet for tracking handmade jewelry business finances (expenses, income, gifts).

**Architecture:** React 18 + Vite SPA with three tabs (Расходы/Доходы/Подарки). Google Sheets API v4 used directly via REST fetch with Google OAuth 2.0 token. All sheet data loaded on startup and cached in localStorage (5-min TTL). New entries inserted before the month's `Возврат:` summary row using Sheets `batchUpdate` + `values.update`.

**Tech Stack:** React 18, Vite 5, Tailwind CSS v3, React Router v6, Chart.js + react-chartjs-2, @react-oauth/google, vite-plugin-pwa, gh-pages

---

## File Map

```
alenaExcel/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example                        # VITE_GOOGLE_CLIENT_ID=...
├── public/
│   ├── manifest.json
│   └── cherry-192.png                  # PWA icon (placeholder)
└── src/
    ├── main.jsx                        # App entry, GoogleOAuthProvider wrapper
    ├── App.jsx                         # Router + AppContext provider
    ├── index.css                       # Tailwind directives
    ├── constants.js                    # Column indices, chip options, month names
    ├── context/
    │   └── AppContext.jsx              # Global state: auth, sheetData, year, tab, month
    ├── hooks/
    │   ├── useAuth.js                  # Google OAuth login/logout/token
    │   ├── useSheets.js               # Sheets API: read, insertRow, updateRow, listSheets, addSheet
    │   └── useAutocomplete.js         # Extract unique non-empty values per field from loaded data
    ├── utils/
    │   ├── sheetParser.js             # Parse raw string[][] rows → typed Entry objects
    │   ├── sheetWriter.js             # Format Entry → string[] row for the sheet
    │   └── dateUtils.js               # Today as DD.MM.YYYY, parse DD.MM.YYYY, format for display
    ├── components/
    │   ├── Header.jsx                  # App title + year pill dropdown + stats icon
    │   ├── TabBar.jsx                  # Расходы / Доходы / Подарки tabs
    │   ├── MonthNav.jsx               # ← Январь → navigator
    │   ├── StatCards.jsx              # Summary cards for selected month/tab
    │   ├── EntryList.jsx              # Scrollable list of EntryCard items
    │   ├── EntryCard.jsx              # Single entry row with pencil edit button
    │   ├── ChipSelector.jsx           # Multi-option chip row (single-select)
    │   ├── AutocompleteInput.jsx      # Text input + dropdown of historical suggestions
    │   └── Toast.jsx                  # Error/success floating toast
    └── pages/
        ├── LoginPage.jsx              # Google sign-in button, shown when not authenticated
        ├── ListPage.jsx               # Main list: Header + TabBar + MonthNav + StatCards + EntryList + add button
        ├── FormPage.jsx               # Add/edit full-screen form with back button
        └── StatsPage.jsx              # Chart.js charts + summary cards
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `.env.example`, `public/manifest.json`

- [ ] **Step 1: Initialise Vite React project**

```bash
cd /Users/arkady/StudioProjects/alenaExcel
npm create vite@latest . -- --template react
```
Answer prompts: framework = React, variant = JavaScript.

- [ ] **Step 2: Install all dependencies**

```bash
npm install
npm install react-router-dom@6 @react-oauth/google
npm install chart.js react-chartjs-2
npm install -D tailwindcss@3 postcss autoprefixer vite-plugin-pwa gh-pages
npx tailwindcss init -p
```

- [ ] **Step 3: Configure Tailwind**

Replace `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#7c3aed', dark: '#5b21b6', light: '#a855f7' },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Configure Vite with PWA plugin**

Replace `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/vishnya/',          // GitHub Pages repo name
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ВИШНЯ',
        short_name: 'ВИШНЯ',
        theme_color: '#7c3aed',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: 'cherry-192.png', sizes: '192x192', type: 'image/png' }],
      },
    }),
  ],
})
```

- [ ] **Step 5: Set up Tailwind CSS entry**

Replace `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Create `.env.example`**

```
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE
VITE_SPREADSHEET_ID=1-71UF4l4V7kR2ibxU08wk3uLo8V3BvYTBgtbykxiObk
```

Copy to `.env.local` and fill in real CLIENT_ID.

- [ ] **Step 7: Create minimal `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
```

- [ ] **Step 8: Create placeholder `src/App.jsx`**

```jsx
export default function App() {
  return <div className="p-4 text-brand font-bold">🍒 ВИШНЯ loading…</div>
}
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```
Expected: browser opens, shows purple "🍒 ВИШНЯ loading…" text. No console errors.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold React + Vite + Tailwind + PWA"
```

---

## Task 2: Constants

**Files:**
- Create: `src/constants.js`

- [ ] **Step 1: Write constants file**

```js
// src/constants.js

// Column indices (0-based) in the Google Sheet
export const COL = {
  // РАСХОДЫ A–I
  EXP_SUM: 0,
  EXP_KAK: 1,
  EXP_KAT: 2,
  EXP_CHTO: 3,
  EXP_GDE: 4,
  EXP_OPLATA: 5,
  EXP_KAT_OPLATY: 6,
  EXP_CASHBACK: 7,
  EXP_SKIDKI: 8,
  // ДОХОДЫ J–R
  INC_SUM: 9,
  INC_CHTO: 10,
  INC_KOMU: 11,
  INC_PREDOPLATA: 12,
  INC_DOSTAVKA: 13,
  INC_GDE_ZAKAZALI: 14,
  INC_OTKUDA: 15,
  INC_OTZIV: 16,
  INC_SKIDKI: 17,
  // ПОДАРКИ S–X
  GIFT_SUM: 18,
  GIFT_CHTO: 19,
  GIFT_KOMU: 20,
  GIFT_OTZIV: 21,
  GIFT_DOSTAVKA: 22,
  GIFT_POVOD: 23,
  // New columns Y–Z
  DATE: 24,
  STATUS: 25,
}

export const MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
]

// Month header prefix patterns in the sheet ("01 ЯНВАРЬ", "02 ФЕВРАЛЬ", …)
export const MONTH_PREFIXES = [
  '01 ЯНВАРЬ','02 ФЕВРАЛЬ','03 МАРТ','04 АПРЕЛЬ','05 МАЙ','06 ИЮНЬ',
  '07 ИЮЛЬ','08 АВГУСТ','09 СЕНТЯБРЬ','10 ОКТЯБРЬ','11 НОЯБРЬ','12 ДЕКАБРЬ',
]

export const TABS = { EXPENSE: 'expense', INCOME: 'income', GIFT: 'gift' }

export const CHIP_KAK = ['Онлайн', 'Магазин РОЗН', 'Магазин ОПТ']
export const CHIP_KAT = ['М', 'О', 'Д', '*']
export const CHIP_KAT_LABELS = { М: 'М — Материалы', О: 'О — Оборудование', Д: 'Д — Доставка', '*': '* — Прочее' }
export const CHIP_GDE_ZAKAZALI = ['ТГ', 'WA', 'Inst', 'Лично']
export const CHIP_OTZIV = ['Да', 'Нет', '—']
export const CHIP_STATUS = ['В работе', 'Завершён', 'Отменён']

export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID
```

- [ ] **Step 2: Commit**

```bash
git add src/constants.js
git commit -m "feat: add sheet column constants and chip options"
```

---

## Task 3: Date Utilities (with tests)

**Files:**
- Create: `src/utils/dateUtils.js`
- Create: `src/utils/dateUtils.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/utils/dateUtils.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { todayDDMMYYYY, parseDDMMYYYY, formatForDisplay } from './dateUtils.js'

describe('todayDDMMYYYY', () => {
  it('returns today in DD.MM.YYYY format', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-15'))
    expect(todayDDMMYYYY()).toBe('15.03.2025')
    vi.useRealTimers()
  })
})

describe('parseDDMMYYYY', () => {
  it('parses DD.MM.YYYY to Date object', () => {
    const d = parseDDMMYYYY('15.03.2025')
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(15)
  })
  it('returns null for empty string', () => {
    expect(parseDDMMYYYY('')).toBeNull()
    expect(parseDDMMYYYY(undefined)).toBeNull()
  })
})

describe('formatForDisplay', () => {
  it('formats DD.MM.YYYY as "15 мар"', () => {
    expect(formatForDisplay('15.03.2025')).toBe('15 мар')
  })
  it('returns — for empty', () => {
    expect(formatForDisplay('')).toBe('—')
  })
})
```

- [ ] **Step 2: Add Vitest to project and run failing test**

Add to `vite.config.js` inside `defineConfig`:
```js
test: { environment: 'node' },
```

Add to `package.json` scripts:
```json
"test": "vitest run"
```

```bash
npm run test
```
Expected: FAIL — `todayDDMMYYYY is not a function`

- [ ] **Step 3: Implement dateUtils**

```js
// src/utils/dateUtils.js
const SHORT_MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']

export function todayDDMMYYYY() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

export function parseDDMMYYYY(str) {
  if (!str) return null
  const [dd, mm, yyyy] = str.split('.')
  if (!dd || !mm || !yyyy) return null
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
}

export function formatForDisplay(str) {
  if (!str) return '—'
  const d = parseDDMMYYYY(str)
  if (!d) return '—'
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm run test
```
Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/dateUtils.js src/utils/dateUtils.test.js vite.config.js package.json
git commit -m "feat: date utilities with tests"
```

---

## Task 4: Sheet Parser (with tests)

**Files:**
- Create: `src/utils/sheetParser.js`
- Create: `src/utils/sheetParser.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/utils/sheetParser.test.js
import { describe, it, expect } from 'vitest'
import { parseSheetRows } from './sheetParser.js'

const HEADER_ROWS = [
  ['2025 год'],
  ['', 'РАСХОДЫ', '', '', '', '', '', '', '', 'ДОХОДЫ'],
  ['СУММА', 'КАК', 'Категория', 'ЧТО', 'ГДЕ', 'Оплата', 'Кат оплаты', 'Кэшбэк', 'Скидки', 'СУММА', 'ЧТО', 'КОМУ'],
]

const SAMPLE_ROWS = [
  ...HEADER_ROWS,
  ['01 ЯНВАРЬ'],                                                      // month header
  ['-420', 'Онлайн', 'Д', 'Доставка фурнитуры', 'СДЭК', 'Карта Тбанк', 'Финансы', '', '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '15.01.2025'],
  ['-6635', 'Онлайн ', 'М', 'Фурнитура', 'ИП Росип', 'По телефону', 'Различные товары', '', '-'],
  ['-13629.5', 'Возврат:', '', '', '', '', '', '65', '0'],             // summary row
  ['02 ФЕВРАЛЬ'],
  ['', '', '', '', '', '', '', '', '', '2500', 'Колье', 'Анна', '100%', 'СДЭК', 'ТГ', 'Канал', 'Да', '-', '', '', '', '', '', '', '10.02.2025', 'В работе'],
]

describe('parseSheetRows', () => {
  it('skips header rows (first 3)', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    expect(result.every(e => e.type !== undefined)).toBe(true)
  })

  it('parses an expense row correctly', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    const exp = result.find(e => e.type === 'expense' && e.sum === -420)
    expect(exp).toBeDefined()
    expect(exp.kak).toBe('Онлайн')
    expect(exp.kat).toBe('Д')
    expect(exp.chto).toBe('Доставка фурнитуры')
    expect(exp.date).toBe('15.01.2025')
    expect(exp.month).toBe(0)   // January index
  })

  it('trims whitespace from string fields', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    const exp = result.find(e => e.type === 'expense' && e.sum === -6635)
    expect(exp.kak).toBe('Онлайн')  // trimmed
    expect(exp.kat).toBe('М')       // trimmed
  })

  it('skips summary (Возврат:) rows', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    expect(result.find(e => e.kak === 'Возврат:')).toBeUndefined()
  })

  it('parses an income row correctly', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    const inc = result.find(e => e.type === 'income')
    expect(inc).toBeDefined()
    expect(inc.sum).toBe(2500)
    expect(inc.chto).toBe('Колье')
    expect(inc.komu).toBe('Анна')
    expect(inc.status).toBe('В работе')
    expect(inc.month).toBe(1)   // February index
  })

  it('assigns correct month index from surrounding month header', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    expect(result.filter(e => e.month === 0).length).toBe(2) // 2 expense rows in Jan
    expect(result.filter(e => e.month === 1).length).toBe(1) // 1 income row in Feb
  })

  it('stores rowIndex for each entry', () => {
    const result = parseSheetRows(SAMPLE_ROWS)
    // first expense is at sheet row index 4 (0-based)
    expect(result[0].rowIndex).toBe(4)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test -- sheetParser
```
Expected: FAIL — `parseSheetRows is not a function`

- [ ] **Step 3: Implement sheetParser**

```js
// src/utils/sheetParser.js
import { COL, MONTH_PREFIXES } from '../constants.js'

function col(row, idx) {
  const v = row[idx]
  return typeof v === 'string' ? v.trim() : (v ?? '')
}

function numCol(row, idx) {
  const raw = col(row, idx)
  // handle em-dash negatives like "−420"
  const normalised = raw.replace('−', '-')
  const n = parseFloat(normalised)
  return isNaN(n) ? null : n
}

function monthIndexFromPrefix(prefix) {
  const idx = MONTH_PREFIXES.findIndex(p => prefix.startsWith(p.split(' ')[0]))
  return idx >= 0 ? idx : null
}

export function parseSheetRows(rows) {
  const entries = []
  let currentMonth = 0

  rows.forEach((row, rowIndex) => {
    // Skip the first 3 structural header rows
    if (rowIndex < 3) return

    const first = col(row, 0)

    // Month header row: starts with "01", "02", … "12"
    if (/^\d{2}\s/.test(first)) {
      const idx = monthIndexFromPrefix(first)
      if (idx !== null) currentMonth = idx
      return
    }

    // Summary row: col[1] starts with "Возврат:"
    if (col(row, 1).startsWith('Возврат:')) return

    const expSum = numCol(row, COL.EXP_SUM)
    const incSum = numCol(row, COL.INC_SUM)
    const giftSum = numCol(row, COL.GIFT_SUM)
    const date = col(row, COL.DATE)

    if (expSum !== null) {
      entries.push({
        type: 'expense',
        rowIndex,
        month: currentMonth,
        sum: expSum,
        kak: col(row, COL.EXP_KAK),
        kat: col(row, COL.EXP_KAT),
        chto: col(row, COL.EXP_CHTO),
        gde: col(row, COL.EXP_GDE),
        oplata: col(row, COL.EXP_OPLATA),
        katOplaty: col(row, COL.EXP_KAT_OPLATY),
        cashback: col(row, COL.EXP_CASHBACK),
        skidki: col(row, COL.EXP_SKIDKI),
        date,
      })
    }

    if (incSum !== null) {
      entries.push({
        type: 'income',
        rowIndex,
        month: currentMonth,
        sum: incSum,
        chto: col(row, COL.INC_CHTO),
        komu: col(row, COL.INC_KOMU),
        predoplata: col(row, COL.INC_PREDOPLATA),
        dostavka: col(row, COL.INC_DOSTAVKA),
        gdeZakazali: col(row, COL.INC_GDE_ZAKAZALI),
        otkuda: col(row, COL.INC_OTKUDA),
        otziv: col(row, COL.INC_OTZIV),
        skidki: col(row, COL.INC_SKIDKI),
        date,
        status: col(row, COL.STATUS),
      })
    }

    if (giftSum !== null) {
      entries.push({
        type: 'gift',
        rowIndex,
        month: currentMonth,
        sum: giftSum,
        chto: col(row, COL.GIFT_CHTO),
        komu: col(row, COL.GIFT_KOMU),
        otziv: col(row, COL.GIFT_OTZIV),
        dostavka: col(row, COL.GIFT_DOSTAVKA),
        povod: col(row, COL.GIFT_POVOD),
        date,
      })
    }
  })

  return entries
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -- sheetParser
```
Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/sheetParser.js src/utils/sheetParser.test.js
git commit -m "feat: sheet row parser with tests"
```

---

## Task 5: Sheet Writer (with tests)

**Files:**
- Create: `src/utils/sheetWriter.js`
- Create: `src/utils/sheetWriter.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/utils/sheetWriter.test.js
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { entryToRow } from './sheetWriter.js'

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-06-20'))
})

describe('entryToRow', () => {
  it('formats an expense entry into a 26-element row', () => {
    const entry = {
      type: 'expense',
      sum: -850,
      kak: 'Онлайн',
      kat: 'М',
      chto: 'Бусины  ',          // trailing whitespace should be trimmed
      gde: 'AliExpress',
      oplata: 'Карта Тбанк',
      katOplaty: 'Различные товары',
      cashback: '',
      skidki: '-',
      date: '',                    // empty → today
    }
    const row = entryToRow(entry)
    expect(row).toHaveLength(26)
    expect(row[0]).toBe(-850)          // EXP_SUM
    expect(row[1]).toBe('Онлайн')     // EXP_KAK
    expect(row[3]).toBe('Бусины')     // EXP_CHTO trimmed
    expect(row[9]).toBe('')           // INC_SUM empty
    expect(row[18]).toBe('')          // GIFT_SUM empty
    expect(row[24]).toBe('20.06.2025') // DATE = today
    expect(row[25]).toBe('')          // STATUS empty for expense
  })

  it('formats an income entry', () => {
    const entry = {
      type: 'income',
      sum: 2500,
      chto: 'Колье',
      komu: 'Анна',
      predoplata: '100%',
      dostavka: 'СДЭК',
      gdeZakazali: 'ТГ',
      otkuda: 'Канал',
      otziv: 'Да',
      skidki: '',
      date: '10.06.2025',
      status: 'В работе',
    }
    const row = entryToRow(entry)
    expect(row[0]).toBe('')          // EXP_SUM empty
    expect(row[9]).toBe(2500)        // INC_SUM
    expect(row[10]).toBe('Колье')   // INC_CHTO
    expect(row[16]).toBe('Да')      // INC_OTZIV
    expect(row[24]).toBe('10.06.2025') // DATE
    expect(row[25]).toBe('В работе')   // STATUS
  })

  it('formats a gift entry', () => {
    const entry = {
      type: 'gift',
      sum: 1200,
      chto: 'Серьги',
      komu: 'Маме',
      otziv: '—',
      dostavka: '',
      povod: 'День рождения',
      date: '',
    }
    const row = entryToRow(entry)
    expect(row[18]).toBe(1200)       // GIFT_SUM
    expect(row[19]).toBe('Серьги')  // GIFT_CHTO
    expect(row[23]).toBe('День рождения') // GIFT_POVOD
    expect(row[24]).toBe('20.06.2025')   // DATE today
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test -- sheetWriter
```
Expected: FAIL — `entryToRow is not a function`

- [ ] **Step 3: Implement sheetWriter**

```js
// src/utils/sheetWriter.js
import { COL } from '../constants.js'
import { todayDDMMYYYY } from './dateUtils.js'

function trim(v) {
  return typeof v === 'string' ? v.trim() : (v ?? '')
}

/**
 * Converts a typed entry object into a 26-element string/number array
 * matching the sheet column layout (A=0 … Z=25).
 */
export function entryToRow(entry) {
  const row = new Array(26).fill('')
  const date = trim(entry.date) || todayDDMMYYYY()
  row[COL.DATE] = date

  if (entry.type === 'expense') {
    row[COL.EXP_SUM] = entry.sum
    row[COL.EXP_KAK] = trim(entry.kak)
    row[COL.EXP_KAT] = trim(entry.kat)
    row[COL.EXP_CHTO] = trim(entry.chto)
    row[COL.EXP_GDE] = trim(entry.gde)
    row[COL.EXP_OPLATA] = trim(entry.oplata)
    row[COL.EXP_KAT_OPLATY] = trim(entry.katOplaty)
    row[COL.EXP_CASHBACK] = trim(entry.cashback)
    row[COL.EXP_SKIDKI] = trim(entry.skidki)
  } else if (entry.type === 'income') {
    row[COL.INC_SUM] = entry.sum
    row[COL.INC_CHTO] = trim(entry.chto)
    row[COL.INC_KOMU] = trim(entry.komu)
    row[COL.INC_PREDOPLATA] = trim(entry.predoplata)
    row[COL.INC_DOSTAVKA] = trim(entry.dostavka)
    row[COL.INC_GDE_ZAKAZALI] = trim(entry.gdeZakazali)
    row[COL.INC_OTKUDA] = trim(entry.otkuda)
    row[COL.INC_OTZIV] = trim(entry.otziv)
    row[COL.INC_SKIDKI] = trim(entry.skidki)
    row[COL.STATUS] = trim(entry.status)
  } else if (entry.type === 'gift') {
    row[COL.GIFT_SUM] = entry.sum
    row[COL.GIFT_CHTO] = trim(entry.chto)
    row[COL.GIFT_KOMU] = trim(entry.komu)
    row[COL.GIFT_OTZIV] = trim(entry.otziv)
    row[COL.GIFT_DOSTAVKA] = trim(entry.dostavka)
    row[COL.GIFT_POVOD] = trim(entry.povod)
  }

  return row
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -- sheetWriter
```
Expected: 3 tests PASS

- [ ] **Step 5: Run all tests**

```bash
npm run test
```
Expected: all 14 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/sheetWriter.js src/utils/sheetWriter.test.js
git commit -m "feat: sheet row writer with tests"
```

---

## Task 6: Google Auth Hook

**Files:**
- Create: `src/hooks/useAuth.js`
- Create: `src/pages/LoginPage.jsx`

- [ ] **Step 1: Implement useAuth**

```js
// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react'

const TOKEN_KEY = 'vishnya_access_token'
const EXPIRY_KEY = 'vishnya_token_expiry'

export function useAuth() {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    const expiry = Number(localStorage.getItem(EXPIRY_KEY) || 0)
    return stored && Date.now() < expiry ? stored : null
  })

  const saveToken = useCallback((accessToken, expiresIn) => {
    const expiry = Date.now() + expiresIn * 1000 - 60_000 // 1 min safety margin
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(EXPIRY_KEY, String(expiry))
    setToken(accessToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRY_KEY)
    setToken(null)
  }, [])

  return { token, isLoggedIn: !!token, saveToken, logout }
}
```

- [ ] **Step 2: Implement LoginPage**

```jsx
// src/pages/LoginPage.jsx
import { useGoogleLogin } from '@react-oauth/google'

export default function LoginPage({ onLogin }) {
  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    onSuccess: (response) => onLogin(response.access_token, response.expires_in),
    onError: (err) => console.error('Login failed', err),
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-8">
      <div className="text-6xl mb-4">🍒</div>
      <h1 className="text-3xl font-extrabold text-brand mb-2">ВИШНЯ</h1>
      <p className="text-gray-500 mb-10 text-center">Учёт финансов бизнеса по украшениям</p>
      <button
        onClick={() => login()}
        className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-6 py-3 shadow-sm text-gray-700 font-semibold text-sm active:scale-95 transition-transform"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
        Войти через Google
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Wire into App.jsx**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  const { isLoggedIn, saveToken, logout, token } = useAuth()

  if (!isLoggedIn) {
    return <LoginPage onLogin={saveToken} />
  }

  return (
    <BrowserRouter basename="/vishnya">
      <Routes>
        <Route path="/" element={<div className="p-4 text-brand font-bold">🍒 Logged in! token={token?.slice(0,10)}…</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Manually verify**

```bash
npm run dev
```
- Open browser, expect login page with Google button
- Click login, complete OAuth flow
- After login, expect "🍒 Logged in! token=ya29…" on screen

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAuth.js src/pages/LoginPage.jsx src/App.jsx
git commit -m "feat: Google OAuth login with token persistence"
```

---

## Task 7: Sheets API Hook

**Files:**
- Create: `src/hooks/useSheets.js`

- [ ] **Step 1: Implement useSheets**

```js
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
    return data.sheets.map(s => s.properties.title)
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

    // 3. Write data to the new row (rowIndex + 1 in A1 notation = sheet row rowIndex+1, 1-based)
    await updateRow(sheetName, rowIndex, rowData)
  }, [token])

  /**
   * Overwrite a specific row (0-based rowIndex) with rowData.
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
   * Create a new sheet tab by copying headers from `sourceSheetName`.
   */
  const addSheet = useCallback(async (newSheetName, sourceSheetName) => {
    // Read headers from source (first 3 rows)
    const sourceRows = await readSheet(sourceSheetName)
    const headerRows = sourceRows.slice(0, 3).map(r => r.map(cell => ({ userEnteredValue: { stringValue: String(cell) } })))

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
    await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ range: `${newSheetName}!A1:Z3`, majorDimension: 'ROWS', values: sourceRows.slice(0, 3) }),
    })
  }, [token, readSheet])

  return { readSheet, listSheets, insertRow, updateRow, addSheet }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSheets.js
git commit -m "feat: Google Sheets API hook (read/insert/update/addSheet)"
```

---

## Task 8: App Context & Data Loading

**Files:**
- Create: `src/context/AppContext.jsx`
- Create: `src/hooks/useAutocomplete.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement useAutocomplete**

```js
// src/hooks/useAutocomplete.js
import { useMemo } from 'react'

/**
 * Given all parsed entries, returns Maps of field → unique non-empty string values
 * for each section type.
 */
export function useAutocomplete(entries) {
  return useMemo(() => {
    const sets = {
      expense: { chto: new Set(), gde: new Set(), oplata: new Set(), katOplaty: new Set() },
      income: { chto: new Set(), komu: new Set(), otkuda: new Set(), dostavka: new Set() },
      gift: { chto: new Set(), komu: new Set(), dostavka: new Set(), povod: new Set() },
    }

    entries.forEach(e => {
      const add = (set, val) => { if (val && val !== '-' && val !== '—') set.add(val) }
      if (e.type === 'expense') {
        add(sets.expense.chto, e.chto)
        add(sets.expense.gde, e.gde)
        add(sets.expense.oplata, e.oplata)
        add(sets.expense.katOplaty, e.katOplaty)
      } else if (e.type === 'income') {
        add(sets.income.chto, e.chto)
        add(sets.income.komu, e.komu)
        add(sets.income.otkuda, e.otkuda)
        add(sets.income.dostavka, e.dostavka)
      } else if (e.type === 'gift') {
        add(sets.gift.chto, e.chto)
        add(sets.gift.komu, e.komu)
        add(sets.gift.dostavka, e.dostavka)
        add(sets.gift.povod, e.povod)
      }
    })

    // Convert Sets to sorted arrays
    const toArr = set => [...set].sort()
    return {
      expense: Object.fromEntries(Object.entries(sets.expense).map(([k, v]) => [k, toArr(v)])),
      income: Object.fromEntries(Object.entries(sets.income).map(([k, v]) => [k, toArr(v)])),
      gift: Object.fromEntries(Object.entries(sets.gift).map(([k, v]) => [k, toArr(v)])),
    }
  }, [entries])
}
```

- [ ] **Step 2: Implement AppContext**

```jsx
// src/context/AppContext.jsx
import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { useSheets } from '../hooks/useSheets.js'
import { useAutocomplete } from '../hooks/useAutocomplete.js'
import { parseSheetRows } from '../utils/sheetParser.js'
import { entryToRow } from '../utils/sheetWriter.js'
import { TABS } from '../constants.js'

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
    default: return state
  }
}

export function AppProvider({ token, logout, children }) {
  const sheets = useSheets(token)
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
    // Check cache
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
      if (cached && cached.sheet === name && Date.now() - cached.ts < CACHE_TTL) {
        const allSheets = await sheets.listSheets()
        dispatch({ type: 'SET_DATA', entries: cached.entries, allSheets })
        return
      }
    } catch (_) {}

    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const [rows, allSheets] = await Promise.all([sheets.readSheet(name), sheets.listSheets()])
      const entries = parseSheetRows(rows)
      localStorage.setItem(CACHE_KEY, JSON.stringify({ sheet: name, entries, ts: Date.now() }))
      dispatch({ type: 'SET_DATA', entries, allSheets })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message })
      showToast('Ошибка загрузки данных', true)
    }
  }, [sheets, showToast])

  useEffect(() => { loadData(sheetName) }, [sheetName])

  const setYear = useCallback(async (year) => {
    const name = `1. Общая ${year}`
    // Create sheet if needed
    if (!state.allSheets.includes(name)) {
      try {
        const prevName = `1. Общая ${year - 1}`
        await sheets.addSheet(name, prevName)
        showToast(`Создан лист ${name}`)
      } catch (err) {
        showToast(`Не удалось создать лист: ${err.message}`, true)
        return
      }
    }
    setSheetName(name)
    dispatch({ type: 'SET_YEAR', year })
  }, [state.allSheets, sheets, showToast])

  /**
   * Find the row index of the Возврат: row for a given month index in the raw sheet data.
   * Falls back to appending at the last row if not found.
   */
  const findInsertIndex = useCallback(async () => {
    const rows = await sheets.readSheet(sheetName)
    const { MONTH_PREFIXES } = await import('../constants.js')
    const targetPrefix = MONTH_PREFIXES[state.month]
    let inTargetMonth = false
    for (let i = 3; i < rows.length; i++) {
      const cell0 = (rows[i][0] || '').toString().trim()
      const cell1 = (rows[i][1] || '').toString().trim()
      if (cell0.startsWith(targetPrefix.split(' ')[0] + ' ')) inTargetMonth = true
      if (inTargetMonth && cell1.startsWith('Возврат:')) return i
    }
    return rows.length // fallback: append at end
  }, [sheets, sheetName, state.month])

  const saveEntry = useCallback(async (entry) => {
    const row = entryToRow(entry)
    try {
      const insertIdx = await findInsertIndex()
      await sheets.insertRow(sheetName, insertIdx, row)
      const newEntry = { ...entry, rowIndex: insertIdx }
      dispatch({ type: 'ADD_ENTRY', entry: newEntry })
      localStorage.removeItem(CACHE_KEY) // invalidate cache
      showToast('Сохранено ✓')
      return true
    } catch (err) {
      showToast(`Ошибка сохранения: ${err.message}`, true)
      return false
    }
  }, [sheets, sheetName, findInsertIndex, showToast])

  const editEntry = useCallback(async (entry) => {
    const row = entryToRow(entry)
    try {
      await sheets.updateRow(sheetName, entry.rowIndex, row)
      dispatch({ type: 'UPDATE_ENTRY', entry })
      localStorage.removeItem(CACHE_KEY)
      showToast('Обновлено ✓')
      return true
    } catch (err) {
      showToast(`Ошибка обновления: ${err.message}`, true)
      return false
    }
  }, [sheets, sheetName, showToast])

  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY)
    loadData(sheetName)
  }, [loadData, sheetName])

  const suggestions = useAutocomplete(state.entries)

  return (
    <AppContext.Provider value={{
      ...state,
      sheetName,
      setYear,
      setTab: (tab) => dispatch({ type: 'SET_TAB', tab }),
      setMonth: (month) => dispatch({ type: 'SET_MONTH', month }),
      saveEntry,
      editEntry,
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
```

- [ ] **Step 3: Update App.jsx to use AppProvider**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { AppProvider } from './context/AppContext.jsx'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  const { isLoggedIn, saveToken, logout, token } = useAuth()

  if (!isLoggedIn) {
    return <LoginPage onLogin={saveToken} />
  }

  return (
    <AppProvider token={token} logout={logout}>
      <BrowserRouter basename="/vishnya">
        <Routes>
          <Route path="/" element={<div className="p-4 text-brand font-bold">🍒 Context ready</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
```

- [ ] **Step 4: Verify data loads in browser console**

```bash
npm run dev
```
Open DevTools → Console. After login should see no errors and data loading from Sheets.

- [ ] **Step 5: Commit**

```bash
git add src/context/AppContext.jsx src/hooks/useAutocomplete.js src/App.jsx
git commit -m "feat: app context with data loading, caching, save/edit"
```

---

## Task 9: UI Primitives

**Files:**
- Create: `src/components/Toast.jsx`
- Create: `src/components/ChipSelector.jsx`
- Create: `src/components/AutocompleteInput.jsx`

- [ ] **Step 1: Implement Toast**

```jsx
// src/components/Toast.jsx
export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold transition-all ${toast.isError ? 'bg-red-500' : 'bg-brand'}`}>
      {toast.msg}
    </div>
  )
}
```

- [ ] **Step 2: Implement ChipSelector**

```jsx
// src/components/ChipSelector.jsx
export default function ChipSelector({ options, value, onChange, labelMap }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === value ? '' : opt)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
            value === opt
              ? 'bg-brand text-white border-brand'
              : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          {labelMap ? labelMap[opt] ?? opt : opt}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Implement AutocompleteInput**

```jsx
// src/components/AutocompleteInput.jsx
import { useState, useRef } from 'react'

export default function AutocompleteInput({ value, onChange, suggestions = [], placeholder, inputMode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase()) && s !== value
  ).slice(0, 6)

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-44 overflow-y-auto">
          {filtered.map(s => (
            <li
              key={s}
              onMouseDown={() => { onChange(s); setOpen(false) }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 cursor-pointer"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Toast.jsx src/components/ChipSelector.jsx src/components/AutocompleteInput.jsx
git commit -m "feat: Toast, ChipSelector, AutocompleteInput components"
```

---

## Task 10: Header, TabBar, MonthNav, StatCards

**Files:**
- Create: `src/components/Header.jsx`
- Create: `src/components/TabBar.jsx`
- Create: `src/components/MonthNav.jsx`
- Create: `src/components/StatCards.jsx`

- [ ] **Step 1: Implement Header**

```jsx
// src/components/Header.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Header() {
  const { year, allSheets, setYear, logout, refresh } = useApp()
  const navigate = useNavigate()
  const [showYears, setShowYears] = useState(false)

  const availableYears = allSheets
    .filter(s => /^1\. Общая \d{4}$/.test(s))
    .map(s => Number(s.slice(-4)))
    .sort((a, b) => b - a)

  return (
    <div className="bg-gradient-to-r from-brand-dark to-brand-light text-white px-4 pt-3 pb-0 relative">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-extrabold tracking-wide">🍒 ВИШНЯ</h1>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="text-white/70 text-xs" title="Обновить">↻</button>
          <button onClick={() => navigate('/stats')} className="text-white/70 text-lg" title="Статистика">📊</button>
          <div className="relative">
            <button
              onClick={() => setShowYears(v => !v)}
              className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold"
            >
              {year} ▾
            </button>
            {showYears && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg z-30 overflow-hidden min-w-[120px]">
                {availableYears.map(y => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setShowYears(false) }}
                    className={`block w-full text-left px-4 py-2 text-sm font-semibold ${y === year ? 'text-brand' : 'text-gray-700'} hover:bg-purple-50`}
                  >
                    {y}
                  </button>
                ))}
                <button
                  onClick={() => { setYear(year + 1); setShowYears(false) }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-purple-50"
                >
                  + {year + 1}
                </button>
                <hr className="border-gray-100" />
                <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-50">
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Implement TabBar**

```jsx
// src/components/TabBar.jsx
import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'

const TAB_LABELS = { [TABS.EXPENSE]: 'Расходы', [TABS.INCOME]: 'Доходы', [TABS.GIFT]: 'Подарки' }

export default function TabBar() {
  const { tab, setTab } = useApp()
  return (
    <div className="flex bg-gradient-to-r from-brand-dark to-brand-light">
      {Object.values(TABS).map(t => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-all ${
            tab === t ? 'border-white text-white' : 'border-transparent text-white/50'
          }`}
        >
          {TAB_LABELS[t]}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Implement MonthNav**

```jsx
// src/components/MonthNav.jsx
import { useApp } from '../context/AppContext.jsx'
import { MONTHS } from '../constants.js'

export default function MonthNav() {
  const { month, setMonth } = useApp()
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <button
        onClick={() => setMonth((month + 11) % 12)}
        className="text-brand text-2xl font-light px-2"
      >‹</button>
      <span className="text-sm font-bold text-gray-800">{MONTHS[month]}</span>
      <button
        onClick={() => setMonth((month + 1) % 12)}
        className="text-brand text-2xl font-light px-2"
      >›</button>
    </div>
  )
}
```

- [ ] **Step 4: Implement StatCards**

```jsx
// src/components/StatCards.jsx
import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'

export default function StatCards() {
  const { entries, tab, month } = useApp()
  const monthEntries = entries.filter(e => e.month === month)

  if (tab === TABS.EXPENSE) {
    const total = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.sum, 0)
    const cashback = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + (Number(e.cashback) || 0), 0)
    return (
      <div className="flex gap-3 px-4 pb-2">
        <StatCard label="Расходы" value={`${total.toLocaleString('ru')} ₽`} color="text-red-500" />
        {cashback > 0 && <StatCard label="Кэшбэк" value={`${cashback} ₽`} color="text-brand" />}
      </div>
    )
  }

  if (tab === TABS.INCOME) {
    const total = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.sum, 0)
    const open = monthEntries.filter(e => e.type === 'income' && e.status === 'В работе').length
    return (
      <div className="flex gap-3 px-4 pb-2">
        <StatCard label="Доходы" value={`${total.toLocaleString('ru')} ₽`} color="text-green-500" />
        {open > 0 && <StatCard label="В работе" value={open} color="text-orange-500" />}
      </div>
    )
  }

  if (tab === TABS.GIFT) {
    const count = monthEntries.filter(e => e.type === 'gift').length
    const total = monthEntries.filter(e => e.type === 'gift').reduce((s, e) => s + e.sum, 0)
    return (
      <div className="flex gap-3 px-4 pb-2">
        <StatCard label="Подарков" value={count} color="text-brand" />
        {total > 0 && <StatCard label="Сумма" value={`${total.toLocaleString('ru')} ₽`} color="text-brand" />}
      </div>
    )
  }
  return null
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-2 shadow-sm flex-1 text-center">
      <div className={`text-base font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.jsx src/components/TabBar.jsx src/components/MonthNav.jsx src/components/StatCards.jsx
git commit -m "feat: Header, TabBar, MonthNav, StatCards components"
```

---

## Task 11: Entry List

**Files:**
- Create: `src/components/EntryCard.jsx`
- Create: `src/components/EntryList.jsx`
- Create: `src/pages/ListPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement EntryCard**

```jsx
// src/components/EntryCard.jsx
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
```

- [ ] **Step 2: Implement EntryList**

```jsx
// src/components/EntryList.jsx
import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'
import EntryCard from './EntryCard.jsx'

export default function EntryList() {
  const { entries, tab, month, loading } = useApp()

  const typeMap = { [TABS.EXPENSE]: 'expense', [TABS.INCOME]: 'income', [TABS.GIFT]: 'gift' }
  const type = typeMap[tab]

  const visible = entries.filter(e => e.type === type && e.month === month)

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Загрузка…</div>
  if (visible.length === 0) return <div className="text-center py-10 text-gray-300 text-sm">Записей нет</div>

  return (
    <div className="px-4 pb-4">
      {visible.map((e, i) => <EntryCard key={`${e.rowIndex}-${i}`} entry={e} />)}
    </div>
  )
}
```

- [ ] **Step 3: Implement ListPage**

```jsx
// src/pages/ListPage.jsx
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { TABS } from '../constants.js'
import Header from '../components/Header.jsx'
import TabBar from '../components/TabBar.jsx'
import MonthNav from '../components/MonthNav.jsx'
import StatCards from '../components/StatCards.jsx'
import EntryList from '../components/EntryList.jsx'
import Toast from '../components/Toast.jsx'

const ADD_ROUTES = { [TABS.EXPENSE]: 'expense', [TABS.INCOME]: 'income', [TABS.GIFT]: 'gift' }
const ADD_LABELS = { [TABS.EXPENSE]: '+ Добавить расход', [TABS.INCOME]: '+ Добавить доход', [TABS.GIFT]: '+ Добавить подарок' }

export default function ListPage() {
  const { tab, toast } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <Header />
      <TabBar />
      <div className="flex-1 overflow-y-auto">
        <MonthNav />
        <StatCards />
        <EntryList />
      </div>
      <div className="px-4 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => navigate(`/add/${ADD_ROUTES[tab]}`)}
          className="w-full bg-brand text-white rounded-2xl py-3.5 font-bold text-sm active:scale-95 transition-transform shadow-md"
        >
          {ADD_LABELS[tab]}
        </button>
      </div>
      <Toast toast={toast} />
    </div>
  )
}
```

- [ ] **Step 4: Update App.jsx with ListPage route**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { AppProvider } from './context/AppContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ListPage from './pages/ListPage.jsx'

export default function App() {
  const { isLoggedIn, saveToken, logout, token } = useAuth()

  if (!isLoggedIn) return <LoginPage onLogin={saveToken} />

  return (
    <AppProvider token={token} logout={logout}>
      <BrowserRouter basename="/vishnya">
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
```

- [ ] **Step 5: Manually verify list renders entries**

```bash
npm run dev
```
Expected: List page shows entries from the current month with edit buttons. Tabs switch between expense/income/gift. Month nav changes the month.

- [ ] **Step 6: Commit**

```bash
git add src/components/EntryCard.jsx src/components/EntryList.jsx src/pages/ListPage.jsx src/App.jsx
git commit -m "feat: list page with entry cards and month navigation"
```

---

## Task 12: Forms (Expense, Income, Gift) + FormPage

**Files:**
- Create: `src/pages/FormPage.jsx`
- Create: `src/forms/ExpenseForm.jsx`
- Create: `src/forms/IncomeForm.jsx`
- Create: `src/forms/GiftForm.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement ExpenseForm**

```jsx
// src/forms/ExpenseForm.jsx
import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_KAK, CHIP_KAT, CHIP_KAT_LABELS } from '../constants.js'

export default function ExpenseForm({ data, onChange, suggestions }) {
  const f = (key) => data[key] ?? ''
  const set = (key) => (val) => onChange({ ...data, [key]: val })

  return (
    <div className="space-y-4">
      <Field label="Сумма (₽)">
        <input type="number" inputMode="decimal" value={f('sum')} onChange={e => set('sum')(e.target.value)}
          placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
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
        <div className="flex-1"><Field label="Кэшбэк">
          <input type="number" inputMode="decimal" value={f('cashback')} onChange={e => set('cashback')(e.target.value)}
            placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
        </Field></div>
        <div className="flex-1"><Field label="Скидки">
          <input type="text" value={f('skidki')} onChange={e => set('skidki')(e.target.value)}
            placeholder="-" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
        </Field></div>
      </div>
      <Field label="Дата">
        <input type="date" value={dateToDMY(f('date'))} onChange={e => set('date')(dmyFromDate(e.target.value))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// Convert DD.MM.YYYY → YYYY-MM-DD for <input type="date">
function dateToDMY(str) {
  if (!str) return ''
  const [d, m, y] = str.split('.')
  return d && m && y ? `${y}-${m}-${d}` : ''
}
// Convert YYYY-MM-DD → DD.MM.YYYY
function dmyFromDate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}.${m}.${y}`
}
```

- [ ] **Step 2: Implement IncomeForm**

```jsx
// src/forms/IncomeForm.jsx
import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_GDE_ZAKAZALI, CHIP_OTZIV, CHIP_STATUS } from '../constants.js'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
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
      <Field label="Сумма (₽)">
        <input type="number" inputMode="decimal" value={f('sum')} onChange={e => set('sum')(e.target.value)}
          placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
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
          placeholder="100%, 50%…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
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
          placeholder="-" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
      <Field label="Дата">
        <input type="date" value={dateToDMY(f('date'))} onChange={e => set('date')(dmyFromDate(e.target.value))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}
```

- [ ] **Step 3: Implement GiftForm**

```jsx
// src/forms/GiftForm.jsx
import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_OTZIV } from '../constants.js'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
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
      <Field label="Сумма (₽)">
        <input type="number" inputMode="decimal" value={f('sum')} onChange={e => set('sum')(e.target.value)}
          placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
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
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}
```

- [ ] **Step 4: Implement FormPage**

```jsx
// src/pages/FormPage.jsx
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
```

- [ ] **Step 5: Add form routes to App.jsx**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import { AppProvider } from './context/AppContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ListPage from './pages/ListPage.jsx'
import FormPage from './pages/FormPage.jsx'

export default function App() {
  const { isLoggedIn, saveToken, logout, token } = useAuth()
  if (!isLoggedIn) return <LoginPage onLogin={saveToken} />
  return (
    <AppProvider token={token} logout={logout}>
      <BrowserRouter basename="/vishnya">
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/add/:type" element={<FormPage mode="add" />} />
          <Route path="/edit/:type/:rowIndex" element={<FormPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
```

- [ ] **Step 6: Manually verify forms**

```bash
npm run dev
```
- Tap "Добавить расход" → expense form with all fields, chips, autocomplete
- Fill in and save → entry appears in list, check Google Sheet updated
- Tap edit pencil → form pre-filled, save → row updated in sheet

- [ ] **Step 7: Commit**

```bash
git add src/forms/ src/pages/FormPage.jsx src/App.jsx
git commit -m "feat: add/edit forms for expense, income, gift"
```

---

## Task 13: Statistics Page

**Files:**
- Create: `src/pages/StatsPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implement StatsPage**

```jsx
// src/pages/StatsPage.jsx
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
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      <div className="bg-gradient-to-r from-brand-dark to-brand-light text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/')} className="text-xl">←</button>
        <h2 className="flex-1 text-base font-bold">Статистика</h2>
        <div className="flex gap-1 bg-white/20 rounded-full p-0.5 text-xs font-semibold">
          <button onClick={() => setView('month')} className={`px-3 py-1 rounded-full ${view==='month'?'bg-white text-brand':''}`}>Месяц</button>
          <button onClick={() => setView('year')} className={`px-3 py-1 rounded-full ${view==='year'?'bg-white text-brand':''}`}>Год</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <SCard label="Доходы" value={`${totalIncome.toLocaleString('ru')} ₽`} color="text-green-500" />
          <SCard label="Расходы" value={`${totalExpense.toLocaleString('ru')} ₽`} color="text-red-500" />
          <SCard label="Чистая прибыль" value={`${(totalIncome - totalExpense).toLocaleString('ru')} ₽`} color="text-brand" />
          <SCard label="Кэшбэк" value={`${totalCashback.toLocaleString('ru')} ₽`} color="text-brand" />
          <SCard label="Подарков" value={giftCount} color="text-brand" />
          <SCard label="В работе" value={openOrders} color="text-orange-500" />
        </div>

        {/* Bar chart — only meaningful for year view */}
        {view === 'year' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Доходы и расходы по месяцам</h3>
            <div style={{ height: 200 }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        )}

        {/* Pie — sources */}
        {sourceLabels.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Откуда пришли клиенты</h3>
            <div style={{ height: 180 }}>
              <Pie
                data={{ labels: sourceLabels, datasets: [{ data: sourceData, backgroundColor: pieColors }] }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }}
              />
            </div>
          </div>
        )}
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
```

- [ ] **Step 2: Add stats route to App.jsx**

Add import and route in `src/App.jsx`:
```jsx
import StatsPage from './pages/StatsPage.jsx'
// inside <Routes>:
<Route path="/stats" element={<StatsPage />} />
```

- [ ] **Step 3: Verify stats page**

```bash
npm run dev
```
- Tap 📊 icon in header → stats page with bar chart and summary cards
- Toggle month/year → numbers update

- [ ] **Step 4: Commit**

```bash
git add src/pages/StatsPage.jsx src/App.jsx
git commit -m "feat: statistics page with Chart.js bar and pie charts"
```

---

## Task 14: PWA & GitHub Pages Deploy

**Files:**
- Modify: `vite.config.js` (PWA already configured in Task 1)
- Modify: `package.json`
- Create: `public/cherry-192.png` (icon placeholder)

- [ ] **Step 1: Add deploy script to package.json**

Add to `package.json` scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

- [ ] **Step 2: Create a Google Cloud project and OAuth Client**

1. Go to https://console.cloud.google.com
2. Create a new project named "ВИШНЯ"
3. Enable **Google Sheets API**
4. Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: **Web application**
6. Authorised JavaScript origins: `http://localhost:5173` and `https://<your-github-username>.github.io`
7. Copy the Client ID into `.env.local` as `VITE_GOOGLE_CLIENT_ID=...`

- [ ] **Step 3: Update vite.config.js base path**

Replace `base: '/vishnya/'` with your actual GitHub Pages repo path.
If your repo is `github.com/arkady/vishnya` then keep `/vishnya/`.

- [ ] **Step 4: Build and verify locally**

```bash
npm run build
npm run preview
```
Expected: production build serves at http://localhost:4173/vishnya/ with no errors.

- [ ] **Step 5: Deploy to GitHub Pages**

```bash
git init  # if not already a git remote
git remote add origin https://github.com/<username>/vishnya.git
git branch -M main
git push -u origin main
npm run deploy
```
Expected: site live at `https://<username>.github.io/vishnya/`

- [ ] **Step 6: Add OAuth origin for production**

In Google Cloud Console → OAuth Client → add `https://<username>.github.io` to Authorised JavaScript origins. Save.

- [ ] **Step 7: Test on mobile**

Open `https://<username>.github.io/vishnya/` on iPhone/Android.
Tap Share → Add to Home Screen → app installs as PWA.
Test: login, view entries, add an expense, check Google Sheet.

- [ ] **Step 8: Final commit**

```bash
git add package.json
git commit -m "feat: GitHub Pages deploy + PWA setup"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Covered in |
|-----------------|-----------|
| Three tabs: Расходы/Доходы/Подарки | Task 10 (TabBar) |
| Month navigator | Task 10 (MonthNav) |
| Year switcher pill | Task 10 (Header) |
| List of entries with edit button | Task 11 (EntryCard, EntryList) |
| Add entry full-screen form | Task 12 (FormPage, forms) |
| Smart autocomplete | Task 8 (useAutocomplete, AutocompleteInput) |
| Chip selectors | Task 9 (ChipSelector) |
| Date field (new col Y) | Task 5 (sheetWriter), Task 12 (forms) |
| Статус field for income (new col Z) | Task 5, Task 12 |
| Whitespace trimming | Task 5 (entryToRow trim) |
| Edit mode (pre-filled form) | Task 12 (FormPage mode=edit) |
| Statistics with Chart.js | Task 13 |
| Open orders count | Task 13 (StatsPage) |
| Income by source pie | Task 13 |
| Year creation (new sheet) | Task 7 (useSheets.addSheet), Task 8 (AppContext.setYear) |
| Google OAuth | Task 6 |
| Sheets API read/write | Task 7 |
| localStorage cache 5min TTL | Task 8 (AppContext.loadData) |
| Error toast on failure | Task 9 (Toast), Task 8 (AppContext) |
| PWA installable | Task 1 (VitePWA), Task 14 |
| GitHub Pages hosting | Task 14 |
| Insert before Возврат: row | Task 8 (AppContext.findInsertIndex) |

All spec requirements covered. ✓

### Placeholder scan

No TBDs, TODOs, or vague requirements found. All steps include actual code. ✓

### Type consistency

- `entryToRow` in Task 5 produces `row[COL.DATE]` at index 24, matching `COL.DATE = 24` from Task 2. ✓
- `parseSheetRows` produces `entry.month` as 0-based index; `MonthNav`, `StatCards`, `EntryList` all filter by `e.month === month` using the same 0-based index. ✓
- `saveEntry` in AppContext calls `entryToRow(entry)` → matches `entryToRow` signature in sheetWriter. ✓
- `useSheets.insertRow(sheetName, rowIndex, rowData)` called with `rowData = entryToRow(entry)` — both are `string[]`. ✓

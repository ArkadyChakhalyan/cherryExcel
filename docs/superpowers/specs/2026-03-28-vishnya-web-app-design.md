# ВИШНЯ — Web App Design Spec

**Date:** 2026-03-28
**Owner:** Алена (alenalevin7@gmail.com)
**Stack:** React 18 + Vite · Google Sheets API v4 · Tailwind CSS · Chart.js
**Hosting:** GitHub Pages (free, static)

---

## Overview

A mobile-first personal web app for tracking the ВИШНЯ handmade jewelry business finances. Syncs bidirectionally with an existing Google Sheets file. Replaces direct spreadsheet editing on mobile with a fast, smart form-based UI.

**Spreadsheet ID:** `1-71UF4l4V7kR2ibxU08wk3uLo8V3BvYTBgtbykxiObk`
**Sheet pattern:** `1. Общая <YYYY>` (e.g. `1. Общая 2025`, `1. Общая 2026`)

---

## User & Access

- Single user (Алена). No multi-user auth or role management needed.
- Authentication: Google OAuth 2.0 (sign in with Google account). One-time login per device, token stored in localStorage.
- Scope required: `https://www.googleapis.com/auth/spreadsheets`

---

## Screens & Navigation

### Top tab bar (always visible)
Three tabs: **Расходы** · **Доходы** · **Подарки**

Each tab shows:
1. Month navigator (← Январь →) — arrows cycle through months; default = current month
2. Summary stats for the selected month
3. Scrollable list of entries for that month
4. "Добавить" button at the bottom → navigates to full-screen add form

Year switcher pill in the app header (e.g. `2025 ▾`) — tap to switch year. Default = current year.

### Screens
| Screen | Route | Description |
|--------|-------|-------------|
| List (Расходы) | `/` | Default screen, Расходы tab active |
| List (Доходы) | `/` tab=доходы | Доходы tab |
| List (Подарки) | `/` tab=подарки | Подарки tab |
| Add entry | `/add/:type` | Full-screen form, type = expense/income/gift |
| Edit entry | `/edit/:type/:row` | Same form pre-filled, saves to existing row |
| Statistics | `/stats` | Charts & summary — accessible via stats icon in header |

---

## Data Model

### Google Sheets Structure
The active sheet (`1. Общая <YYYY>`) contains three horizontal sections side by side on the same rows.

**Existing columns (unchanged — do NOT shift):**

| Cols | Section | Fields |
|------|---------|--------|
| A–I | РАСХОДЫ | СУММА, КАК, Категория, ЧТО, ГДЕ, Оплата, Категория оплаты, Кэшбэк, Скидки |
| J–R | ДОХОДЫ | СУММА, ЧТО, КОМУ, Предоплата, Доставка, ГДЕ заказали, Откуда пришли, Отзыв, Скидки |
| S–X | ПОДАРКИ | СУММА, ЧТО, КОМУ, Отзыв, Доставка, Повод |

**New columns appended after X (do not shift existing data):**

| Col | Field | Used by |
|-----|-------|---------|
| Y | Дата (DD.MM.YYYY) | All sections — date of the entry |
| Z | Статус | ДОХОДЫ only — В работе / Завершён / Отменён |

### Row Structure in the Sheet
- Row 1: `<YYYY> год` title
- Row 2: Section headers (РАСХОДЫ, ДОХОДЫ, ПОДАРКИ)
- Row 3: Column headers (including new Y=Дата, Z=Статус headers)
- Row 4+: Month header rows (e.g. `01 ЯНВАРЬ`), data rows, `Возврат:` summary rows per month

**Important:** Some existing rows have data in multiple sections simultaneously (e.g. an expense and income on the same row). The web app adds new entries one section per row — it never writes to multiple sections in one row. When reading, the app checks which section columns have a non-empty СУММА and shows the entry under the appropriate tab.

New entries are inserted before the `Возврат:` summary row of the correct month block. Column Y (Дата) is filled with today's date. Existing rows without a Дата value display `—` in the list.

---

## Forms

### Smart Autocomplete Strategy
On app load, read all existing data rows and extract unique values per field. Store in memory. Apply:
- **Chip selectors** (fixed options): КАК, Категория (М/О/Д/*), ГДЕ заказали, Отзыв, Статус
- **Autocomplete inputs** (free text + suggestions from history): ЧТО, ГДЕ, Оплата, Категория оплаты, КОМУ, Откуда пришли, Повод, Доставка
- **Number inputs**: СУММА, Кэшбэк
- **Date picker**: Дата (default = today)
- All values are trimmed before write to prevent whitespace pollution

### Form: Расходы
Fields (in order): Сумма · КАК (чипы) · Категория (чипы: М/О/Д/*) · ЧТО · ГДЕ · Оплата · Категория оплаты · Кэшбэк · Скидки · Дата

### Form: Доходы
Fields: Сумма · ЧТО · КОМУ · Предоплата · Доставка · ГДЕ заказали (чипы) · Откуда пришли · Отзыв (чипы) · Скидки · Дата · Статус (чипы: В работе/Завершён/Отменён)

### Form: Подарки
Fields: Сумма · ЧТО · КОМУ · Отзыв (чипы) · Доставка · Повод · Дата

### Edit Mode
Each list entry has an edit button (pencil icon). Tapping navigates to the same form pre-filled with the row's data. On save, the app overwrites that specific row in the sheet (by row index). On cancel, returns to list without changes.

---

## Statistics Screen

Accessible via icon in the app header. Contains:
- Toggle: **По месяцам** / **Весь год**
- **Bar chart** — monthly income vs expenses (Chart.js)
- **Summary cards**: Total income, Total expenses, Net profit, Total cashback, Gift count
- **Income by source** — breakdown of "Откуда пришли" (pie or bar)
- **Open orders** — count of Доходы entries with Статус = "В работе"

---

## Year Management

- Year switcher in header shows current year by default
- Dropdown lists available years (sheet tabs matching `1. Общая YYYY` pattern)
- When user adds a record in a new year that has no sheet yet:
  1. App detects the new year
  2. Creates a new sheet tab `1. Общая <YYYY>` by copying the structure (headers) from the previous year's sheet
  3. Adds the entry to the new sheet

---

## Data Sync

- **Read**: On app load and on tab switch, fetch the active year's sheet via Sheets API (`values.get`)
- **Write**: On form submit, append row via `values.append` to the correct position (before `Возврат:` of the current month)
- **Edit**: On edit save, update row via `values.update` using the stored row index
- **Cache**: Data cached in localStorage with a 5-minute TTL. Manual refresh button available.
- **Error handling**: If write fails, show error toast and keep form open with data intact

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Charts | Chart.js + react-chartjs-2 |
| Auth | Google OAuth 2.0 (gapi / `@react-oauth/google`) |
| Sheets API | Google Sheets API v4 via REST fetch |
| Routing | React Router v6 |
| State | React Context + useReducer |
| Hosting | GitHub Pages (via `gh-pages` npm package) |
| PWA | Vite PWA plugin — installable on home screen, offline read via cache |

---

## Non-Goals (out of scope)

- Multi-user access or sharing
- Push notifications
- Editing column structure / adding new columns from the UI
- Deleting entries (to protect data integrity)
- Dark mode

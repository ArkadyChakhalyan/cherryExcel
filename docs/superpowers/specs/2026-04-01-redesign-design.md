# ВИШНЯ — UI Redesign Design Spec

**Date:** 2026-04-01
**Status:** Approved

---

## Overview

Redesign the ВИШНЯ financial tracking app to be modern, neat, and user-friendly. The app is mobile-first (but responsive to desktop), Russian-language, used for jewelry business finance tracking.

**Core direction:** Vibrant gradient header with frosted glass stat card, Nunito font, pill-shaped tabs, colored entry cards.

---

## Typography

- **Font family:** Nunito (Google Fonts) — load weights 400, 600, 700, 800, 900
- **Import:** `https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap`
- Apply globally via `body { font-family: 'Nunito', sans-serif; }`

---

## Color Palette

No changes to brand colors. Existing Tailwind config stays:

```js
brand: { DEFAULT: '#7c3aed', dark: '#5b21b6', light: '#a855f7' }
```

Additional semantic colors used in components:
- Expense stripe/amount: `#ef4444` (red-500)
- Income stripe/amount: `#22c55e` (green-500)
- Gift stripe/amount: `#7c3aed` (brand)
- Expense chip bg: `#fef2f2`, text: `#ef4444`
- Income chip bg: `#f0fdf4`, text: `#22c55e`
- Category chip bg: `#f3f0ff`, text: `#7c3aed`

---

## Components

### Header (all screens)

- Background: `linear-gradient(145deg, #3b0764 0%, #6d28d9 50%, #a855f7 100%)`
- `Header.jsx` accepts a `variant` prop: `"list"` (default for ListPage) or `"compact"` (FormPage, StatsPage)
- `variant="list"`: renders title row + frosted stat card + pill tabs
- `variant="compact"`: renders title row only (back button left, actions right)
- `TabBar.jsx`, `MonthNav.jsx`, and `StatCards.jsx` are deleted — their logic moves inside `Header.jsx` under `variant="list"`

### Frosted Stat Card (ListPage only, inside header)

- Background: `rgba(255,255,255,0.13)`
- Border: `1px solid rgba(255,255,255,0.25)`
- Border radius: `16px`
- Backdrop filter: `blur(16px)`
- Contents:
  - Month navigation: `‹ АПРЕЛЬ ›` — arrows are `rgba(255,255,255,0.55)`, month label uppercase small
  - Total amount: large, `font-weight: 900`, white
  - Secondary stat below (cashback for expenses, open orders for income, gift count for gifts) — small, `rgba(255,255,255,0.55)`

### Pill Tabs (ListPage, inside header below stat card)

- 3 pills: Расходы / Доходы / Подарки
- Active: `background: white`, `color: #6d28d9`, `font-weight: 800`, subtle shadow
- Inactive: `background: rgba(255,255,255,0.15)`, `color: rgba(255,255,255,0.75)`
- Border radius: `20px`, equal flex width

### EntryCard

Replace current card design:
- Container: `border-radius: 14px`, `border: 1px solid #f3f0ff`, `box-shadow: 0 2px 12px rgba(0,0,0,0.06)`
- Left colored stripe: `width: 3px`, `height: 40px`, `border-radius: 2px`
  - Expense: `#ef4444`, Income: `#22c55e`, Gift: `#7c3aed`
- Content: title (font-weight 700) + row of 2 chip tags + date (small, gray)
- Amount: right-aligned, `font-weight: 900`, color by type
- Edit button: `24×24px` rounded square, `background: #f3f0ff`, `color: #7c3aed`, icon `✎`
- Delete button: `24×24px` rounded square, `background: #fff0f0`, `color: #ef4444`, icon `✕`
- Chip tags: `border-radius: 6px`, `padding: 2px 7px`, `font-size: 9px`, `font-weight: 700`
  - Type chip (category): red/green/purple bg+text per entry type
  - Source chip (gde/gdeZakazali/komu): `background: #f3f0ff`, `color: #7c3aed`

### Add Button (ListPage, pinned to bottom)

- Full width, `background: linear-gradient(135deg, #6d28d9, #a855f7)`
- `border-radius: 14px`, `padding: 14px`
- `box-shadow: 0 6px 20px rgba(109,40,217,0.4)`
- `font-weight: 800`, white text

### FormPage Header

- Same gradient as ListPage header, but compact (no stat card, no tabs)
- Back button: `30×30px` rounded square (`border-radius: 10px`), `background: rgba(255,255,255,0.15)`, `border: 1px solid rgba(255,255,255,0.25)`, shows `←`
- Save button: white pill, `color: #6d28d9`, `font-weight: 800`, `border-radius: 10px`

### Form Fields

- Amount field: highlighted block with `background: linear-gradient(135deg, #f3f0ff, #ede9fe)`, `border: 1.5px solid #ddd6fe`, `border-radius: 14px` — visually most prominent
- Label: `font-size: 9px`, `font-weight: 800`, `color: #888`, `letter-spacing: 1.5px`, uppercase
- Input border: `1.5px solid #ede9fe` default, `1.5px solid #7c3aed` on focus
- Input `border-radius: 10px`
- ChipSelector — active chip: `background: #6d28d9`, `color: white`; inactive: `background: #f3f0ff`, `color: #6d28d9`, `border: 1px solid #ddd6fe`

### LoginPage

- Full-screen gradient background (same as header gradient)
- Cherry emoji large with drop shadow
- Title white, letter-spacing
- Subtitle `rgba(255,255,255,0.6)`
- Google button: frosted glass — `background: rgba(255,255,255,0.15)`, `border: 1px solid rgba(255,255,255,0.3)`, `backdrop-filter: blur(12px)`, `border-radius: 14px`, white text

### StatsPage

- Same compact gradient header as FormPage
- Summary stat cards: colored backgrounds per type (green/red/purple/yellow)
- Charts unchanged (existing Chart.js setup kept)

---

## Layout

- Max width on desktop: `max-w-2xl` for forms/stats, `max-w-6xl` for list (existing)
- Background color for content area: `white` (replacing `bg-gray-50`)
- ListPage: `flex flex-col min-h-screen` — header at top, scrollable list, add button pinned to bottom

---

## Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Import Nunito font, set body font-family |
| `src/components/Header.jsx` | New gradient header with frosted stat card + pill tabs moved here from TabBar/MonthNav/StatCards |
| `src/components/TabBar.jsx` | Merge into Header or restyle as pills |
| `src/components/MonthNav.jsx` | Merge into frosted stat card inside Header |
| `src/components/StatCards.jsx` | Merge into frosted stat card inside Header |
| `src/components/EntryCard.jsx` | New card design with stripe, chips, square buttons |
| `src/pages/ListPage.jsx` | Update layout, remove separate TabBar/MonthNav/StatCards sections |
| `src/pages/FormPage.jsx` | New header style, amount field highlight |
| `src/pages/LoginPage.jsx` | Full gradient bg, frosted glass button |
| `src/pages/StatsPage.jsx` | New header style, colored stat cards |
| `src/forms/ExpenseForm.jsx` | Updated field styles |
| `src/forms/IncomeForm.jsx` | Updated field styles |
| `src/forms/GiftForm.jsx` | Updated field styles |
| `src/components/ChipSelector.jsx` | Updated active/inactive styles |
| `tailwind.config.js` | No changes needed |

---

## What Does NOT Change

- All data logic, context, API calls — untouched
- Route structure — untouched
- Form field names and data model — untouched
- Chart.js charts in StatsPage — kept as-is, just header restyled
- ConfirmModal: restyle to match — white background, `border-radius: 20px`, gradient confirm button, cancel button outlined

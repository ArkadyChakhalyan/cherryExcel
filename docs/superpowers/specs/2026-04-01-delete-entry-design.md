# Delete Entry — Design Spec

**Date:** 2026-04-01

## Overview

Add the ability to delete an entry from the list. Deletion clears the row in Google Sheets (overwrites with empty data) rather than physically removing it, preserving row structure. A custom modal confirms the action before it executes.

## Data Flow

1. User taps 🗑️ on an `EntryCard`
2. `EntryCard` calls `onDelete(entry)` prop
3. `EntryList` receives the call, sets `pendingDelete` state to that entry
4. `ConfirmModal` renders as an overlay
5. User confirms → `deleteEntry(entry)` called from `AppContext`
6. `updateRow(sheetName, entry.rowIndex, [])` clears the row in Sheets
7. `DELETE_ENTRY` dispatched → entry removed from local state
8. Cache invalidated, toast "Удалено ✓" shown
9. User cancels → modal closes, nothing changes

## Files Changed

### `src/hooks/useSheets.js`
No changes. `updateRow` with an empty array handles the clear.

### `src/context/AppContext.jsx`
- Add `DELETE_ENTRY` reducer case: filters out the entry by `rowIndex`
- Add `deleteEntry(entry)` callback:
  - Calls `updateRow(sheetName, entry.rowIndex, [])`
  - Dispatches `{ type: 'DELETE_ENTRY', rowIndex: entry.rowIndex }`
  - Clears localStorage cache
  - Shows toast "Удалено ✓" on success, error toast on failure
- Expose `deleteEntry` via context value

### `src/components/ConfirmModal.jsx` (new)
- Props: `onConfirm`, `onCancel`
- Renders a fixed overlay (semi-transparent backdrop)
- Centered card with text "Удалить запись?" and two buttons: "Отмена" (cancel) and "Удалить" (confirm, red)
- Closes on backdrop click (triggers `onCancel`)

### `src/components/EntryList.jsx`
- Add `pendingDelete` state (entry or null)
- Pass `onDelete={(entry) => setPendingDelete(entry)}` to each `EntryCard`
- Render `<ConfirmModal>` when `pendingDelete !== null`
  - `onConfirm`: calls `deleteEntry(pendingDelete)`, then `setPendingDelete(null)`
  - `onCancel`: `setPendingDelete(null)`

### `src/components/EntryCard.jsx`
- Accept `onDelete` prop
- Add 🗑️ button next to ✏️ that calls `onDelete(entry)`

## Non-Goals

- No undo / restore functionality
- No bulk delete
- Physical row deletion (rows shifting) is out of scope

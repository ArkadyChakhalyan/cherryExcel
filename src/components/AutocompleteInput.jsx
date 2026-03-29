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

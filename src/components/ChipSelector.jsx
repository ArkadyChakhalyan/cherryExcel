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

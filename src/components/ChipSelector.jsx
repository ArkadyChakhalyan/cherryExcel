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

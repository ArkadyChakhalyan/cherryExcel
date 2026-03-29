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

import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_OTZIV } from '../constants.js'

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 9, fontWeight: 800, color: '#888', letterSpacing: '1.5px' }} className="block uppercase mb-1.5">{label}</label>
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
      <div style={{ background: 'linear-gradient(135deg, #f3f0ff, #ede9fe)', border: '1.5px solid #ddd6fe', borderRadius: 14 }} className="p-3">
        <Field label="Сумма (₽)">
          <input type="number" inputMode="decimal" value={f('sum')} onChange={e => set('sum')(e.target.value)}
            placeholder="0" className="w-full bg-transparent focus:outline-none text-xl font-extrabold text-brand placeholder-brand/40" />
        </Field>
      </div>
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
          style={{ borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm border border-[#ede9fe] focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}

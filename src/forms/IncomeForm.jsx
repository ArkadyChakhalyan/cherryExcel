import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_GDE_ZAKAZALI, CHIP_OTZIV, CHIP_STATUS } from '../constants.js'

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

export default function IncomeForm({ data, onChange, suggestions }) {
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
          placeholder="100%, 50%…" style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
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
          placeholder="-" style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
      <Field label="Дата">
        <input type="date" value={dateToDMY(f('date'))} onChange={e => set('date')(dmyFromDate(e.target.value))}
          style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}

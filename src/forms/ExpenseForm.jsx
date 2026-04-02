import ChipSelector from '../components/ChipSelector.jsx'
import AutocompleteInput from '../components/AutocompleteInput.jsx'
import { CHIP_KAK, CHIP_KAT, CHIP_KAT_LABELS } from '../constants.js'

export default function ExpenseForm({ data, onChange, suggestions }) {
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
        <div className="flex-1">
          <Field label="Кэшбэк">
            <input type="number" inputMode="decimal" value={f('cashback')} onChange={e => set('cashback')(e.target.value)}
              placeholder="0" style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Скидки">
            <input type="text" value={f('skidki')} onChange={e => set('skidki')(e.target.value)}
              placeholder="-" style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </Field>
        </div>
      </div>
      <Field label="Дата">
        <input type="date" value={dateToDMY(f('date'))} onChange={e => set('date')(dmyFromDate(e.target.value))}
          style={{ border: '1.5px solid #ede9fe', borderRadius: 10 }} className="w-full px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
      </Field>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 9, fontWeight: 800, color: '#888', letterSpacing: '1.5px' }} className="block uppercase mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function dateToDMY(str) {
  if (!str) return ''
  const [d, m, y] = str.split('.')
  return d && m && y ? `${y}-${m}-${d}` : ''
}
function dmyFromDate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}.${m}.${y}`
}

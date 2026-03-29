export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold transition-all ${toast.isError ? 'bg-red-500' : 'bg-brand'}`}>
      {toast.msg}
    </div>
  )
}

export default function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        style={{ borderRadius: 20 }}
        className="bg-white shadow-xl px-6 py-5 mx-4 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-gray-800 font-semibold text-base mb-4 text-center">Удалить запись?</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            style={{ border: '1.5px solid #ddd6fe', borderRadius: 10, color: '#7c3aed' }}
            className="flex-1 py-2 text-sm font-semibold hover:bg-purple-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            style={{ background: 'linear-gradient(135deg, #6d28d9, #a855f7)', borderRadius: 10 }}
            className="flex-1 py-2 text-white text-sm font-semibold"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

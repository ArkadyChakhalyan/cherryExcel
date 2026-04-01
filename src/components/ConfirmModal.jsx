export default function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl px-6 py-5 mx-4 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-gray-800 font-semibold text-base mb-4 text-center">Удалить запись?</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

let _addToast = null

export function toast(message, type = 'success') {
  if (_addToast) _addToast({ message, type, id: Date.now() })
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _addToast = (t) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
    }
    return () => { _addToast = null }
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-fadeIn"
          style={{
            background: t.type === 'error' ? '#fee2e2' : '#d1fae5',
            border: `1px solid ${t.type === 'error' ? '#fca5a5' : '#6ee7b7'}`,
            color: t.type === 'error' ? '#b91c1c' : '#065f46',
          }}
        >
          {t.type === 'error'
            ? <XCircle className="w-4 h-4 shrink-0" />
            : <CheckCircle2 className="w-4 h-4 shrink-0" />
          }
          <span className="text-sm font-medium">{t.message}</span>
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

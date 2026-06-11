import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * FilterPanel — reusable dropdown filter panel
 *
 * filters: Array of { key, label, type: 'chips'|'date-range', options?: [{value,label}] }
 * values: { [key]: value }
 * onChange: (key, value) => void
 * onClose: () => void
 * onReset: () => void
 */
export default function FilterPanel({ filters = [], values = {}, onChange, onClose, onReset }) {
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose?.()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 z-30 bg-white rounded-2xl shadow-xl border p-5 min-w-72"
      style={{ borderColor: '#dde7c8' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>Filters</h3>
        <div className="flex items-center gap-2">
          {onReset && (
            <button onClick={onReset} className="text-xs underline" style={{ color: '#5a6b5c' }}>Reset</button>
          )}
          <button onClick={onClose} className="hover:opacity-70">
            <X className="w-4 h-4" style={{ color: '#5a6b5c' }} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filters.map(f => (
          <div key={f.key}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a6b5c' }}>{f.label}</p>

            {f.type === 'chips' && (
              <div className="flex flex-wrap gap-1.5">
                {f.options.map(opt => {
                  const active = values[f.key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => onChange(f.key, active ? '' : opt.value)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                      style={{
                        background: active ? '#1b3520' : '#f5f7ee',
                        color: active ? 'white' : '#5a6b5c',
                        borderColor: active ? '#1b3520' : '#dde7c8',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}

            {f.type === 'date-range' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={values[f.key + '_from'] || ''}
                  onChange={e => onChange(f.key + '_from', e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-xs outline-none"
                  style={{ borderColor: '#dde7c8' }}
                  placeholder="From"
                />
                <input
                  type="date"
                  value={values[f.key + '_to'] || ''}
                  onChange={e => onChange(f.key + '_to', e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-xs outline-none"
                  style={{ borderColor: '#dde7c8' }}
                  placeholder="To"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

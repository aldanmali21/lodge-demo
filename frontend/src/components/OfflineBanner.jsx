import { useEffect, useState } from 'react'
import { WifiOff, X } from 'lucide-react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const goOffline = () => { setOffline(true); setDismissed(false) }
    const goOnline = () => setOffline(false)
    window.addEventListener('api:offline', goOffline)
    window.addEventListener('api:online', goOnline)
    return () => {
      window.removeEventListener('api:offline', goOffline)
      window.removeEventListener('api:online', goOnline)
    }
  }, [])

  if (!offline || dismissed) return null

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium"
      style={{ background: '#fef3c7', borderBottom: '1px solid #fcd34d', color: '#92400e' }}>
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>Backend server is offline — run <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">npm run dev</code> in the <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">backend/</code> folder.</span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

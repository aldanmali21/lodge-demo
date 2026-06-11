import { useEffect, useRef, useState } from 'react'
import { Search, Plus, Minus, SendHorizonal, Check, ChevronDown } from 'lucide-react'
import api from '../lib/api'

const CATEGORIES = ['Starters', 'Mains', 'Grill & Fire', 'Drinks', 'Desserts']

export default function POS() {
  const [menu, setMenu] = useState({})
  const [category, setCategory] = useState('Starters')
  const [cart, setCart] = useState([])
  const [guestSearch, setGuestSearch] = useState('')
  const [guestFocused, setGuestFocused] = useState(false)
  const [reservations, setReservations] = useState([])
  const [selectedFolio, setSelectedFolio] = useState(null)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [routeSuccess, setRouteSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const guestRef = useRef(null)

  useEffect(() => {
    api.get('/pos/menu').then(r => setMenu(r.data))
    api.get('/reservations?status=checked_in').then(r => setReservations(r.data))
  }, [])

  function addToCart(item) {
    setCart(c => {
      const existing = c.find(i => i.id === item.id)
      if (existing) return c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { ...item, qty: 1 }]
    })
  }

  function updateQty(id, delta) {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0))
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const tax = subtotal * 0.10
  const total = subtotal + tax

  const filteredReservations = reservations.filter(r => {
    const q = guestSearch.trim().toLowerCase()
    if (!q) return true
    return r.guestName.toLowerCase().includes(q) || r.reservationRooms?.some(rr => rr.room?.number.includes(q))
  })

  async function routeToFolio() {
    if (!selectedFolio) return
    setLoading(true)
    try {
      await api.post('/pos/orders', {
        items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
        folioId: selectedFolio,
        currency: 'USD',
      })
      setRouteSuccess(true)
      setCart([])
      setTimeout(() => setRouteSuccess(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const items = menu[category] || []

  return (
    <div>
      <div className="mb-5 stagger-1">
        <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Restaurant POS</h1>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-180px)]">
        {/* Left — order panel */}
        <div className="flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden stagger-2" style={{ borderColor: '#dde7c8' }}>
          <div className="p-4 border-b" style={{ borderColor: '#dde7c8' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a6b5c' }}>Choose Guest</p>
            <div className="relative mb-1" ref={guestRef}>
              {selectedFolio ? (
                <div className="flex items-center justify-between w-full pl-3 pr-3 py-2.5 border rounded-xl text-sm" style={{ borderColor: '#16a34a', background: '#f0fdf4' }}>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" style={{ color: '#16a34a' }} />
                    <span className="font-medium truncate" style={{ color: '#14532d' }}>{selectedLabel}</span>
                  </div>
                  <button type="button" onClick={() => { setSelectedFolio(null); setSelectedLabel(''); setGuestSearch('') }} className="text-xs ml-2 shrink-0" style={{ color: '#5a6b5c' }}>Change</button>
                </div>
              ) : (
                <>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10" style={{ color: '#9db87a' }} />
                  <input
                    placeholder="Search guest name or room…"
                    value={guestSearch}
                    onChange={e => { setGuestSearch(e.target.value) }}
                    onFocus={() => setGuestFocused(true)}
                    onBlur={() => setTimeout(() => setGuestFocused(false), 150)}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none"
                    style={{ borderColor: '#dde7c8' }}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9db87a' }} />
                  {guestFocused && (
                    <div className="absolute top-full left-0 right-0 mt-1 border rounded-xl overflow-hidden shadow-lg z-50 bg-white" style={{ borderColor: '#dde7c8' }}>
                      <div className="px-3 py-1.5 border-b text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: '#eef2e4', color: '#9db87a', background: '#f5f7ee' }}>
                        Checked-in Guests ({filteredReservations.length})
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredReservations.length === 0 ? (
                          <p className="px-3 py-3 text-sm" style={{ color: '#5a6b5c' }}>No checked-in guests found.</p>
                        ) : filteredReservations.map(r => (
                          <button key={r.id}
                            onMouseDown={() => {
                              setSelectedFolio(r.folio?.id)
                              setSelectedLabel(`${r.guestName} — Room ${r.reservationRooms?.[0]?.room?.number || '?'}`)
                              setGuestSearch('')
                              setGuestFocused(false)
                            }}
                            className="w-full text-left px-3 py-2.5 hover:bg-sage-50 text-sm border-b last:border-0 transition-colors"
                            style={{ borderColor: '#f0f4e8' }}>
                            <div className="font-medium" style={{ color: '#1c2b1e' }}>{r.guestName}</div>
                            <div className="text-xs mt-0.5" style={{ color: '#5a6b5c' }}>
                              Room {r.reservationRooms?.map(rr => rr.room?.number).filter(Boolean).join(', ') || '—'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {!selectedFolio && reservations.length === 0 && (
              <p className="text-xs mt-1" style={{ color: '#9db87a' }}>No guests currently checked in.</p>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-sm" style={{ color: '#9db87a' }}>Add items from the menu</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wider pb-2 border-b" style={{ color: '#5a6b5c', borderColor: '#dde7c8' }}>
                  <span className="col-span-1">Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Price</span>
                </div>
                {cart.map(item => (
                  <div key={item.id} className="grid grid-cols-3 items-center py-2 border-b" style={{ borderColor: '#f0f4e8' }}>
                    <div className="col-span-1">
                      <p className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>{item.name}</p>
                      {item.notes && <p className="text-xs" style={{ color: '#d97706' }}>{item.notes}</p>}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 rounded-full border flex items-center justify-center hover:bg-sage-50" style={{ borderColor: '#dde7c8' }}>
                        <Minus className="w-3 h-3" style={{ color: '#5a6b5c' }} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center" style={{ color: '#1c2b1e' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 rounded-full border flex items-center justify-center hover:bg-sage-50" style={{ borderColor: '#dde7c8' }}>
                        <Plus className="w-3 h-3" style={{ color: '#5a6b5c' }} />
                      </button>
                    </div>
                    <p className="text-right text-sm font-medium" style={{ color: '#1c2b1e' }}>${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Totals */}
          <div className="p-4 border-t" style={{ borderColor: '#dde7c8' }}>
            <div className="flex justify-between text-sm mb-1" style={{ color: '#5a6b5c' }}>
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3" style={{ color: '#5a6b5c' }}>
              <span>Tax (10%)</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mb-4" style={{ color: '#1c2b1e' }}>
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={routeToFolio}
              disabled={!cart.length || !selectedFolio || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
              style={{ background: routeSuccess ? '#16a34a' : '#1b3520' }}
            >
              {routeSuccess ? <><Check className="w-4 h-4" /> Charged to Folio!</> : <><SendHorizonal className="w-4 h-4" /> {loading ? 'Charging…' : 'Charge to Guest Folio'}</>}
            </button>
          </div>
        </div>

        {/* Right — menu */}
        <div className="flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden stagger-3" style={{ borderColor: '#dde7c8' }}>
          {/* Category tabs */}
          <div className="flex gap-2 p-3 border-b overflow-x-auto" style={{ borderColor: '#dde7c8' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  background: category === cat ? '#1b3520' : '#f5f7ee',
                  color: category === cat ? 'white' : '#5a6b5c',
                }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map(item => (
                <button key={item.id} onClick={() => addToCart(item)}
                  className="p-4 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-forest-900"
                  style={{ borderColor: '#dde7c8', background: '#fafaf7' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1b3520'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#dde7c8'}
                >
                  <p className="font-semibold text-sm leading-tight mb-1" style={{ color: '#1c2b1e' }}>{item.name}</p>
                  {item.notes && <p className="text-xs mb-1" style={{ color: '#5a6b5c' }}>{item.notes}</p>}
                  <p className="font-bold text-sm" style={{ color: '#2d5a22' }}>${item.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

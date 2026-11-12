import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarDays, Users, Search, BedDouble, Maximize2, Check } from 'lucide-react'
import api from '../lib/api'
import { ROOM_INFO, fallbackInfo, money, toInputDate, addDays, nightsBetween, stamp, slugOf } from './catalog'

// Stay dates + guests live in the URL so they carry across pages.
export function useStay() {
  const [sp, setSp] = useSearchParams()
  const today = toInputDate(new Date())
  const from = sp.get('from') || today
  const to = sp.get('to') || toInputDate(addDays(new Date(), 2))
  const guests = Number(sp.get('guests') || 2)
  const set = (patch) => {
    const n = { from, to, guests, ...patch }
    if (n.to <= n.from) n.to = toInputDate(addDays(n.from, 1))
    setSp({ from: n.from, to: n.to, guests: String(n.guests) }, { replace: true })
  }
  return { from, to, guests, nights: nightsBetween(from, to), today, set }
}
export const stayQuery = (s) => `from=${s.from}&to=${s.to}&guests=${s.guests}`

export function useAvailability(from, to) {
  const [rooms, setRooms] = useState(null)
  useEffect(() => {
    if (!from || !to || nightsBetween(from, to) < 1) { setRooms([]); return }
    let live = true
    setRooms(null)
    api.get('/rooms/available', { params: { from: stamp(from, 14), to: stamp(to, 10) } })
      .then(r => live && setRooms(r.data)).catch(() => live && setRooms([]))
    return () => { live = false }
  }, [from, to])
  return rooms
}

export function useRoomTypes(from, to, guests = 1) {
  const available = useAvailability(from, to)
  return useMemo(() => {
    if (!available) return null
    const map = new Map()
    available.forEach(r => {
      const t = map.get(r.type) || { type: r.type, rate: r.defaultRate, capacity: r.capacity, count: 0 }
      t.count += 1; map.set(r.type, t)
    })
    return [...map.values()].filter(t => t.capacity >= guests).sort((a, b) => a.rate - b.rate)
  }, [available, guests])
}

const field = 'w-full bg-transparent outline-none text-forest-950 text-[15px] font-medium'
export function SearchBar({ stay, onSubmit, cta = 'Check availability', className = '' }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit?.() }}
      className={`bg-white rounded-2xl shadow-2xl p-3 md:p-4 grid gap-3 md:grid-cols-[1fr_1fr_.7fr_auto] ${className}`}>
      <label className="flex items-center gap-3 px-4 py-2 rounded-xl border border-sage-200">
        <CalendarDays className="w-5 h-5 text-forest-600 shrink-0" />
        <span className="flex-1 min-w-0"><span className="block text-[11px] uppercase tracking-wider text-forest-600/80">Check-in</span>
          <input id="site-from" type="date" min={stay.today} value={stay.from} onChange={e => stay.set({ from: e.target.value })} className={field} /></span>
      </label>
      <label className="flex items-center gap-3 px-4 py-2 rounded-xl border border-sage-200">
        <CalendarDays className="w-5 h-5 text-forest-600 shrink-0" />
        <span className="flex-1 min-w-0"><span className="block text-[11px] uppercase tracking-wider text-forest-600/80">Check-out</span>
          <input id="site-to" type="date" min={stay.from} value={stay.to} onChange={e => stay.set({ to: e.target.value })} className={field} /></span>
      </label>
      <label className="flex items-center gap-3 px-4 py-2 rounded-xl border border-sage-200">
        <Users className="w-5 h-5 text-forest-600 shrink-0" />
        <span className="flex-1"><span className="block text-[11px] uppercase tracking-wider text-forest-600/80">Guests</span>
          <select value={stay.guests} onChange={e => stay.set({ guests: Number(e.target.value) })} className={field}>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
          </select></span>
      </label>
      <button type="submit" className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-forest-950 font-semibold hover:brightness-105 transition" style={{ background: '#c8a96e' }}>
        <Search className="w-4 h-4" /> {cta}
      </button>
    </form>
  )
}

export function RoomCard({ t, stay }) {
  const navigate = useNavigate()
  const info = ROOM_INFO[t.type] || fallbackInfo
  const q = stayQuery(stay)
  return (
    <article data-room-card className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col">
      <Link to={`/site/rooms/${slugOf(t.type)}?${q}`} className="relative block overflow-hidden group">
        <img src={info.photo} alt={t.type} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        <span className="absolute top-3 left-3 bg-white/95 text-forest-800 text-xs font-medium px-3 py-1 rounded-full">
          {t.count <= 1 ? 'Last room available' : `${t.count} rooms available`}
        </span>
      </Link>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-2xl text-forest-900">{t.type}</h3>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest-950/60 mt-2">
          <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {info.beds}</span>
          <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> {info.size}</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Sleeps {t.capacity}</span>
        </p>
        <p className="text-sm text-forest-950/70 mt-3 leading-relaxed">{info.blurb}</p>
        <ul className="mt-4 space-y-1.5">
          {info.perks.map(p => <li key={p} className="text-sm flex items-center gap-2 text-forest-950/75"><Check className="w-4 h-4 text-forest-600" />{p}</li>)}
        </ul>
        <div className="mt-auto pt-6 flex items-end justify-between gap-3">
          <div><span className="font-display text-2xl text-forest-900">{money(t.rate)}</span><span className="text-xs text-forest-950/60"> / night</span>
            <p className="text-[11px] text-forest-950/50">taxes &amp; levies extra</p></div>
          <div className="flex gap-2">
            <Link to={`/site/rooms/${slugOf(t.type)}?${q}`} className="px-4 py-2.5 rounded-full border border-forest-900/25 text-forest-900 text-sm font-medium hover:bg-sage-50">Details</Link>
            <button onClick={() => navigate(`/site/book?type=${encodeURIComponent(t.type)}&${q}`)} className="px-4 py-2.5 rounded-full bg-forest-900 text-white text-sm font-medium hover:bg-forest-800 transition">Book</button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function SectionHead({ kicker, title, sub, light, center = true }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className={`tracking-[.25em] text-xs uppercase mb-3 ${light ? 'text-gold-light' : 'text-gold-dark'}`}>{kicker}</p>
      <h2 className={`font-display text-3xl md:text-4xl leading-tight ${light ? 'text-white' : 'text-forest-900'}`}>{title}</h2>
      {sub && <p className={`mt-3 max-w-2xl ${center ? 'mx-auto' : ''} ${light ? 'text-white/75' : 'text-forest-950/65'}`}>{sub}</p>}
    </div>
  )
}

export function PageHero({ img, kicker, title, sub }) {
  return (
    <section className="relative h-[46vh] min-h-[320px] flex items-end" style={{ background: '#1b3520' }}>
      <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,26,15,.6) 0%, rgba(13,26,15,.35) 40%, rgba(13,26,15,.85) 100%)' }} />
      <div className="relative max-w-6xl mx-auto px-5 pb-10 w-full">
        <p className="text-gold-light tracking-[.3em] text-xs uppercase mb-3">{kicker}</p>
        <h1 className="font-display text-white text-4xl md:text-6xl">{title}</h1>
        {sub && <p className="text-white/85 mt-3 max-w-xl">{sub}</p>}
      </div>
    </section>
  )
}

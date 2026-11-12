import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, Search, BedDouble, Maximize2, Check, Binoculars, Waves, Sunset } from 'lucide-react'
import api from '../lib/api'
import SiteLayout from './SiteLayout'
import { ROOM_INFO, fallbackInfo, money, toInputDate, addDays, nightsBetween, stamp, fmtDate } from './catalog'

function useAvailability(from, to) {
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

export default function SiteHome() {
  const navigate = useNavigate()
  const today = toInputDate(new Date())
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(toInputDate(addDays(new Date(), 2)))
  const [guests, setGuests] = useState(2)
  const available = useAvailability(from, to)
  const nights = nightsBetween(from, to)

  const types = useMemo(() => {
    if (!available) return null
    const map = new Map()
    available.forEach(r => {
      const t = map.get(r.type) || { type: r.type, rate: r.defaultRate, capacity: r.capacity, count: 0 }
      t.count += 1; map.set(r.type, t)
    })
    return [...map.values()].filter(t => t.capacity >= guests).sort((a, b) => a.rate - b.rate)
  }, [available, guests])

  const book = (type) => navigate(`/site/book?type=${encodeURIComponent(type)}&from=${from}&to=${to}&guests=${guests}`)
  const field = 'w-full bg-transparent outline-none text-forest-950 text-[15px] font-medium'

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative min-h-[640px] h-[88vh] flex items-center" style={{ background: '#1b3520' }}>
        <img src="/site/hero.jpg" alt="Acacia tree at sunset over the savannah" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,26,15,.55) 0%, rgba(13,26,15,.25) 45%, rgba(13,26,15,.75) 100%)' }} />
        <div className="relative max-w-6xl mx-auto px-5 w-full pt-16">
          <p className="text-gold-light tracking-[.3em] text-xs uppercase mb-5">Safari Lodge · Western Uganda</p>
          <h1 className="font-display text-white text-5xl md:text-7xl leading-[1.05] max-w-3xl">Where the savannah meets the lake</h1>
          <p className="text-white/85 text-lg mt-6 max-w-xl">Wake to hippos at the water’s edge, spend your days on game drives and your evenings around the fire.</p>

          <form onSubmit={e => { e.preventDefault(); document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="mt-10 bg-white rounded-2xl shadow-2xl p-3 md:p-4 grid gap-3 md:grid-cols-[1fr_1fr_.7fr_auto] max-w-4xl">
            <label className="flex items-center gap-3 px-4 py-2 rounded-xl border border-sage-200">
              <CalendarDays className="w-5 h-5 text-forest-600 shrink-0" />
              <span className="flex-1"><span className="block text-[11px] uppercase tracking-wider text-forest-600/80">Check-in</span>
                <input id="site-from" type="date" min={today} value={from} onChange={e => { setFrom(e.target.value); if (e.target.value >= to) setTo(toInputDate(addDays(e.target.value, 1))) }} className={field} /></span>
            </label>
            <label className="flex items-center gap-3 px-4 py-2 rounded-xl border border-sage-200">
              <CalendarDays className="w-5 h-5 text-forest-600 shrink-0" />
              <span className="flex-1"><span className="block text-[11px] uppercase tracking-wider text-forest-600/80">Check-out</span>
                <input id="site-to" type="date" min={from} value={to} onChange={e => setTo(e.target.value)} className={field} /></span>
            </label>
            <label className="flex items-center gap-3 px-4 py-2 rounded-xl border border-sage-200">
              <Users className="w-5 h-5 text-forest-600 shrink-0" />
              <span className="flex-1"><span className="block text-[11px] uppercase tracking-wider text-forest-600/80">Guests</span>
                <select value={guests} onChange={e => setGuests(Number(e.target.value))} className={field}>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
                </select></span>
            </label>
            <button type="submit" className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-forest-950 font-semibold hover:brightness-105 transition" style={{ background: '#c8a96e' }}>
              <Search className="w-4 h-4" /> Check availability
            </button>
          </form>
        </div>
      </section>

      {/* Intro strip */}
      <section className="max-w-6xl mx-auto px-5 py-20 grid gap-12 md:grid-cols-2 items-center">
        <div>
          <p className="text-gold-dark tracking-[.25em] text-xs uppercase mb-3">Welcome</p>
          <h2 className="font-display text-4xl text-forest-900 leading-tight">A quiet corner of Africa, thoughtfully hosted</h2>
          <p className="mt-5 text-forest-950/70 leading-relaxed">Ten rooms and suites, an infinity pool above the lake, a restaurant serving what the garden grew that morning, and guides who have walked these plains all their lives. Small on purpose, so you are never a number.</p>
          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            {[['10', 'Rooms & suites'], ['4.9', 'Guest rating'], ['24/7', 'Guide on call']].map(([a, b]) => (
              <div key={b}><p className="font-display text-3xl text-forest-700">{a}</p><p className="text-xs text-forest-950/60 mt-1">{b}</p></div>
            ))}
          </div>
        </div>
        <img src="/site/lodge.jpg" alt="Lodge deck and pool" className="rounded-2xl shadow-xl w-full h-[380px] object-cover" />
      </section>

      {/* Rooms */}
      <section id="rooms" className="bg-sage-50 py-20 scroll-mt-4">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-gold-dark tracking-[.25em] text-xs uppercase mb-3 text-center">Stay with us</p>
          <h2 className="font-display text-4xl text-forest-900 text-center">Rooms &amp; suites</h2>
          <p className="text-center text-forest-950/65 mt-3">
            {nights > 0 ? <>Showing availability for <strong>{fmtDate(from)}</strong> – <strong>{fmtDate(to)}</strong> ({nights} night{nights > 1 ? 's' : ''}) · {guests} guest{guests > 1 ? 's' : ''}</> : 'Choose a check-out date after your check-in date.'}
          </p>

          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {types === null && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[420px] rounded-2xl bg-white/70 animate-pulse" />)}
            {types?.map(t => {
              const info = ROOM_INFO[t.type] || fallbackInfo
              return (
                <article key={t.type} data-room-card className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                  <div className="relative">
                    <img src={info.photo} alt={t.type} className="w-full h-56 object-cover" loading="lazy" />
                    <span className="absolute top-3 left-3 bg-white/95 text-forest-800 text-xs font-medium px-3 py-1 rounded-full">
                      {t.count <= 1 ? 'Last room available' : `${t.count} rooms available`}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display text-2xl text-forest-900">{t.type}</h3>
                    <p className="flex gap-4 text-xs text-forest-950/60 mt-2">
                      <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {info.beds}</span>
                      <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> {info.size}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Sleeps {t.capacity}</span>
                    </p>
                    <p className="text-sm text-forest-950/70 mt-3 leading-relaxed">{info.blurb}</p>
                    <ul className="mt-4 space-y-1.5">
                      {info.perks.map(p => <li key={p} className="text-sm flex items-center gap-2 text-forest-950/75"><Check className="w-4 h-4 text-forest-600" />{p}</li>)}
                    </ul>
                    <div className="mt-auto pt-6 flex items-end justify-between">
                      <div><span className="font-display text-3xl text-forest-900">{money(t.rate)}</span><span className="text-xs text-forest-950/60"> / night</span>
                        <p className="text-[11px] text-forest-950/50">taxes &amp; levies extra</p></div>
                      <button onClick={() => book(t.type)} className="px-5 py-2.5 rounded-full bg-forest-900 text-white text-sm font-medium hover:bg-forest-800 transition">Book this room</button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          {types && types.length === 0 && nights > 0 && (
            <p className="text-center mt-10 text-forest-950/70">Sorry — we are fully booked for those dates. Try different dates and we’ll find you a room.</p>
          )}
        </div>
      </section>

      {/* Experiences */}
      <section id="experiences" className="max-w-6xl mx-auto px-5 py-20 scroll-mt-4">
        <p className="text-gold-dark tracking-[.25em] text-xs uppercase mb-3 text-center">Beyond your room</p>
        <h2 className="font-display text-4xl text-forest-900 text-center">Experiences</h2>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {[
            ['/site/safari.jpg', Binoculars, 'Guided game drives', 'Dawn and dusk drives with expert guides through open savannah and acacia woodland.'],
            ['/site/deck.jpg', Waves, 'Lakeside deck & pool', 'Slow afternoons on the deck, cold drinks from the bar and the lake all to yourself.'],
            ['/site/lake.jpg', Sunset, 'Sundowners & campfire', 'Evenings finish with a fire on the shore and a three-course dinner under the stars.'],
          ].map(([img, Icon, title, text]) => (
            <div key={title} className="group relative rounded-2xl overflow-hidden h-80">
              <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(13,26,15,.88) 100%)' }} />
              <div className="absolute bottom-0 p-6 text-white">
                <Icon className="w-5 h-5 text-gold-light mb-2" />
                <h3 className="font-display text-2xl">{title}</h3>
                <p className="text-sm text-white/80 mt-1">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20" style={{ background: '#1b3520' }}>
        <div className="max-w-3xl mx-auto px-5 text-center text-white">
          <p className="font-display text-2xl md:text-3xl leading-snug">“We booked on the website in two minutes, paid with mobile money, and a driver was waiting when we landed. The best stay of our trip.”</p>
          <p className="mt-6 text-gold-light text-sm tracking-wide">Eleanor V. · Stayed in the Executive Suite</p>
        </div>
      </section>
    </SiteLayout>
  )
}

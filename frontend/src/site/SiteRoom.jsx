import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BedDouble, Maximize2, Users, Check, ChevronLeft } from 'lucide-react'
import SiteLayout from './SiteLayout'
import { SearchBar, useStay, useRoomTypes, stayQuery } from './shared'
import { typeFromSlug, ROOM_INFO, ALL_AMENITIES, money, TAX_RATE, fmtDate } from './catalog'

export default function SiteRoom() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const stay = useStay()
  const type = typeFromSlug(slug)
  const types = useRoomTypes(stay.from, stay.to, 1)
  const [active, setActive] = useState(0)
  if (!type) return <SiteLayout solid><div className="py-32 text-center"><Link to="/site/rooms" className="underline">Back to all rooms</Link></div></SiteLayout>
  const info = ROOM_INFO[type]
  const t = types?.find(x => x.type === type)
  const sub = t ? t.rate * stay.nights : 0
  return (
    <SiteLayout solid>
      <div className="max-w-6xl mx-auto px-5 py-8">
        <Link to={`/site/rooms?${stayQuery(stay)}`} className="inline-flex items-center gap-1 text-sm text-forest-700 hover:underline"><ChevronLeft className="w-4 h-4" />All rooms</Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
          <div>
            <img src={info.gallery[active]} alt={type} className="w-full h-[300px] md:h-[460px] object-cover rounded-2xl" />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {info.gallery.map((g, i) => <button key={g} onClick={() => setActive(i)} className={`rounded-xl overflow-hidden border-2 ${i === active ? 'border-gold' : 'border-transparent'}`}><img src={g} alt="" className="w-full h-16 md:h-24 object-cover" /></button>)}
            </div>
            <h1 className="font-display text-4xl text-forest-900 mt-8">{type}</h1>
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-forest-950/65 mt-3">
              <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4" />{info.beds}</span>
              <span className="flex items-center gap-1.5"><Maximize2 className="w-4 h-4" />{info.size}</span>
              {t && <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />Sleeps {t.capacity}</span>}
            </p>
            <p className="mt-5 text-forest-950/75 leading-relaxed text-lg">{info.blurb} Every room has crisp linen, hot-water rain showers and a quiet spot to watch the light change over the lake.</p>
            <h2 className="font-display text-2xl text-forest-900 mt-8">What’s included</h2>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2.5">
              {[...info.perks, ...ALL_AMENITIES.filter(a => !info.perks.includes(a))].slice(0, 10).map(p => <li key={p} className="flex items-center gap-2 text-forest-950/80"><Check className="w-4 h-4 text-forest-600" />{p}</li>)}
            </ul>
            <div className="mt-8 rounded-2xl bg-sage-50 p-5 text-sm text-forest-950/70">Check-in from 2:00 pm · Check-out by 10:00 am · Free cancellation up to 48 hours before arrival · Children welcome.</div>
          </div>

          <aside className="bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-24">
            <p className="font-display text-3xl text-forest-900">{t ? money(t.rate) : '—'}<span className="text-sm text-forest-950/55 font-sans"> / night</span></p>
            <SearchBar stay={stay} cta="Update" className="!shadow-none !p-0 mt-5 md:!grid-cols-1" />
            {types === null ? <p className="mt-5 text-sm text-forest-950/60">Checking availability…</p> : t ? (
              <>
                <div className="mt-5 pt-5 border-t border-sage-200 text-sm space-y-2 text-forest-950/75">
                  <div className="flex justify-between"><span>{stay.nights} night{stay.nights > 1 ? 's' : ''}</span><span>{money(sub)}</span></div>
                  <div className="flex justify-between"><span>Levy &amp; VAT</span><span>{money(sub * TAX_RATE)}</span></div>
                  <div className="flex justify-between font-semibold text-forest-900 text-base pt-2 border-t border-sage-200"><span>Total</span><span>{money(sub * (1 + TAX_RATE))}</span></div>
                  <p className="text-xs text-forest-950/50">{fmtDate(stay.from)} → {fmtDate(stay.to)} · only 30% deposit to reserve</p>
                </div>
                <button onClick={() => navigate(`/site/book?type=${encodeURIComponent(type)}&${stayQuery(stay)}`)} className="mt-5 w-full py-4 rounded-xl font-semibold text-forest-950 hover:brightness-105" style={{ background: '#c8a96e' }}>Book this room</button>
              </>
            ) : <p className="mt-5 text-sm text-red-700">Not available for these dates. Try different dates above.</p>}
          </aside>
        </div>
      </div>
    </SiteLayout>
  )
}

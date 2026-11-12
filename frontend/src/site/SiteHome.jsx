import { Link, useNavigate } from 'react-router-dom'
import { Star, Waves, Utensils, Binoculars, Wifi, Smartphone, ArrowRight } from 'lucide-react'
import SiteLayout from './SiteLayout'
import { SearchBar, RoomCard, SectionHead, useStay, useRoomTypes, stayQuery } from './shared'
import { LODGE, EXPERIENCES, ugx } from './catalog'

export default function SiteHome() {
  const navigate = useNavigate()
  const stay = useStay()
  const types = useRoomTypes(stay.from, stay.to, stay.guests)
  const go = () => navigate(`/site/rooms?${stayQuery(stay)}`)

  return (
    <SiteLayout>
      <section className="relative min-h-[680px] h-[92vh] flex items-center" style={{ background: '#1b3520' }}>
        <img src="/site/hero.jpg" alt="Acacia tree at sunset over the savannah" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,26,15,.6) 0%, rgba(13,26,15,.25) 45%, rgba(13,26,15,.8) 100%)' }} />
        <div className="relative max-w-6xl mx-auto px-5 w-full pt-20">
          <p className="text-gold-light tracking-[.3em] text-xs uppercase mb-5">Safari Lodge · Western Uganda</p>
          <h1 className="font-display text-white text-5xl md:text-7xl leading-[1.05] max-w-3xl">{LODGE.tagline}</h1>
          <p className="text-white/85 text-lg mt-6 max-w-xl">Wake to hippos at the water’s edge, spend your days on game drives and your evenings around the fire.</p>
          <SearchBar stay={stay} onSubmit={go} className="mt-10 max-w-4xl" />
          <p className="mt-4 text-white/70 text-sm flex items-center gap-2"><Smartphone className="w-4 h-4 text-gold-light" /> Book online · Pay a 30% deposit with MTN MoMo, Airtel Money or card</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20 grid gap-12 md:grid-cols-2 items-center">
        <div>
          <p className="text-gold-dark tracking-[.25em] text-xs uppercase mb-3">Welcome</p>
          <h2 className="font-display text-3xl md:text-4xl text-forest-900 leading-tight">A quiet corner of Africa, thoughtfully hosted</h2>
          <p className="mt-5 text-forest-950/70 leading-relaxed">Ten rooms and suites, an infinity pool above the lake, a restaurant serving what the garden grew that morning, and guides who have walked these plains all their lives. Small on purpose, so you are never a number.</p>
          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            {[['10', 'Rooms & suites'], ['4.9', 'Guest rating'], ['24/7', 'Guide on call']].map(([a, b]) => (
              <div key={b}><p className="font-display text-3xl text-forest-700">{a}</p><p className="text-xs text-forest-950/60 mt-1">{b}</p></div>
            ))}
          </div>
          <Link to="/site/about" className="inline-flex items-center gap-2 mt-8 text-forest-800 font-medium hover:underline">Our story <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <img src="/site/lodge.jpg" alt="Lodge deck and pool" className="rounded-2xl shadow-xl w-full h-[340px] md:h-[420px] object-cover" />
      </section>

      <section className="bg-forest-950 py-12">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
          {[[Waves, 'Infinity pool', 'Above the lake'], [Utensils, 'Farm-to-table', 'Restaurant & bar'], [Binoculars, 'Game drives', 'Expert local guides'], [Wifi, 'Free Wi-Fi', 'In every room']].map(([I, a, b]) => (
            <div key={a} className="flex items-center gap-3"><span className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10"><I className="w-5 h-5 text-gold-light" /></span><span><span className="block font-medium">{a}</span><span className="text-xs text-white/60">{b}</span></span></div>
          ))}
        </div>
      </section>

      <section className="bg-sage-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <SectionHead kicker="Stay with us" title="Rooms & suites" sub="Live availability for your dates. Prices per room per night, in Ugandan shillings." />
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {types === null && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[420px] rounded-2xl bg-white/70 animate-pulse" />)}
            {types?.slice(0, 3).map(t => <RoomCard key={t.type} t={t} stay={stay} />)}
          </div>
          <div className="text-center mt-10"><Link to={`/site/rooms?${stayQuery(stay)}`} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-forest-900 text-white font-medium hover:bg-forest-800">See all rooms &amp; suites <ArrowRight className="w-4 h-4" /></Link></div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <SectionHead kicker="Beyond your room" title="Experiences" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {EXPERIENCES.slice(0, 3).map(e => (
            <Link to="/site/experiences" key={e.id} className="group relative rounded-2xl overflow-hidden h-80">
              <img src={e.img} alt={e.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(13,26,15,.9) 100%)' }} />
              <div className="absolute bottom-0 p-6 text-white">
                <h3 className="font-display text-2xl">{e.title}</h3>
                <p className="text-sm text-white/80 mt-1 line-clamp-2">{e.text}</p>
                <p className="text-xs text-gold-light mt-2">{e.price ? `from ${ugx(e.price)} pp` : 'Included'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ background: '#1b3520' }}>
        <div className="max-w-6xl mx-auto px-5">
          <SectionHead light kicker="Guest stories" title="Loved by travellers" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[['We booked on the website in two minutes, paid with mobile money, and a driver was waiting when we landed. The best stay of our trip.', 'Eleanor V.', 'Executive Suite'],
              ['The guides are extraordinary. We saw lions on our first morning drive and the dinner by the fire was unforgettable.', 'Daniel & Ruth K.', 'Honeymoon Suite'],
              ['Spotless, calm and so well run. Our kids still talk about the boat cruise. Easy deposit payment with Airtel Money too.', 'The Okello family', 'Family Room']].map(([q, a, r]) => (
              <figure key={a} className="bg-white/5 border border-white/10 rounded-2xl p-7 text-white">
                <div className="flex gap-0.5 text-gold">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                <blockquote className="mt-4 text-white/90 leading-relaxed">“{q}”</blockquote>
                <figcaption className="mt-5 text-sm text-gold-light">{a} <span className="text-white/50">· {r}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-forest-900">Ready for the savannah?</h2>
        <p className="mt-3 text-forest-950/65">Reserve in minutes. Free cancellation up to 48 hours before arrival.</p>
        <Link to={`/site/rooms?${stayQuery(stay)}`} className="inline-block mt-7 px-8 py-4 rounded-full font-semibold text-forest-950 hover:brightness-105" style={{ background: '#c8a96e' }}>Check availability</Link>
      </section>
    </SiteLayout>
  )
}

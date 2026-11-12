import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import SiteLayout, { waLink } from './SiteLayout'
import { PageHero, SectionHead } from './shared'
import { EXPERIENCES, ugx } from './catalog'

export default function SiteExperiences() {
  return (
    <SiteLayout>
      <PageHero img="/site/safari.jpg" kicker="Beyond your room" title="Experiences" sub="Guided by people who grew up here. Book with your room, or ask the front desk when you arrive." />
      <section className="max-w-6xl mx-auto px-5 py-16">
        <SectionHead kicker="Safari & more" title="Make every day different" sub="Prices are per person. In-house guests can add any experience to their room bill and pay at check-out." />
        <div className="mt-12 grid gap-7 md:grid-cols-2">
          {EXPERIENCES.map((e, i) => (
            <article key={e.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
              <img src={e.img} alt={e.title} className={`sm:w-5/12 h-56 sm:h-auto object-cover ${i % 2 ? 'sm:order-2' : ''}`} loading="lazy" />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-2xl text-forest-900">{e.title}</h3>
                <p className="text-xs text-forest-950/55 flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" />{e.time}</p>
                <p className="text-sm text-forest-950/70 mt-3 leading-relaxed">{e.text}</p>
                <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                  <span className="font-display text-xl text-forest-800">{e.price ? <>{ugx(e.price)}<span className="text-xs text-forest-950/50 font-sans"> / person</span></> : 'Included'}</span>
                  <a href={waLink(`Hello, I'd like to add "${e.title}" to my stay.`)} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full bg-forest-900 text-white text-sm">Ask on WhatsApp</a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center mt-12"><Link to="/site/rooms" className="inline-block px-8 py-4 rounded-full font-semibold text-forest-950" style={{ background: '#c8a96e' }}>Book your stay</Link></div>
      </section>
    </SiteLayout>
  )
}

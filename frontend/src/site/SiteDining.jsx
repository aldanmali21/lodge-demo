import { Link } from 'react-router-dom'
import SiteLayout from './SiteLayout'
import { PageHero, SectionHead } from './shared'
import { MENU, ugxRaw } from './catalog'

export default function SiteDining() {
  return (
    <SiteLayout>
      <PageHero img="/site/food-meat.jpg" kicker="Restaurant & bar" title="Dining at the lake" sub="Seasonal, local and cooked over fire. Open to in-house guests and day visitors." />
      <section className="max-w-6xl mx-auto px-5 py-16 grid gap-12 lg:grid-cols-[1fr_1.2fr] items-start">
        <div>
          <SectionHead center={false} kicker="From our kitchen" title="What the garden grew this morning" />
          <p className="mt-5 text-forest-950/70 leading-relaxed">Our chefs cook with vegetables from the lodge garden, fish from the lake and meat from neighbouring farms. Dinner is served on the deck or around the fire, and we happily cater for vegetarian, vegan and gluten-free guests.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <img src="/site/food-grill.jpg" alt="Grilled skewers" className="rounded-xl h-44 w-full object-cover" loading="lazy" />
            <img src="/site/food-rice.jpg" alt="Spiced rice and plantain" className="rounded-xl h-44 w-full object-cover" loading="lazy" />
          </div>
          <div className="mt-6 rounded-2xl bg-sage-50 p-5 text-sm text-forest-950/75 space-y-1">
            <p><strong>Breakfast</strong> 6:30 – 10:00 am</p><p><strong>Lunch</strong> 12:30 – 3:00 pm</p><p><strong>Dinner</strong> 6:30 – 9:30 pm</p>
            <p className="pt-2 text-forest-950/55">Pay at the table with cash, mobile money or card, or charge it to your room.</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-7 md:p-9 shadow-sm">
          {MENU.map(m => (
            <div key={m.course} className="mb-8 last:mb-0">
              <h3 className="font-display text-2xl text-forest-900 border-b border-sage-200 pb-2">{m.course}</h3>
              <ul className="mt-4 space-y-4">
                {m.items.map(([n, d, p]) => (
                  <li key={n} className="flex justify-between gap-4"><span><span className="font-medium text-forest-900">{n}</span><span className="block text-sm text-forest-950/60">{d}</span></span><span className="text-sm text-forest-800 whitespace-nowrap">{ugxRaw(p)}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <div className="text-center pb-16"><Link to="/site/rooms" className="inline-block px-8 py-4 rounded-full font-semibold text-forest-950" style={{ background: '#c8a96e' }}>Stay with us and dine on us</Link></div>
    </SiteLayout>
  )
}

import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Phone, Mail, MapPin, Leaf, Menu, X, MessageCircle } from 'lucide-react'
import { LODGE } from './catalog'

export function Logo({ light }) {
  return (
    <Link to="/site" className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#c8a96e' }}>
        <Leaf className="w-5 h-5 text-forest-950" />
      </span>
      <span className={`font-display text-lg sm:text-xl font-semibold tracking-wide leading-tight ${light ? 'text-white' : 'text-forest-900'}`}>{LODGE.name}</span>
    </Link>
  )
}

const NAV = [
  ['/site/rooms', 'Rooms & Suites'],
  ['/site/experiences', 'Experiences'],
  ['/site/dining', 'Dining'],
  ['/site/gallery', 'Gallery'],
  ['/site/about', 'About & Contact'],
]
export const waLink = (text = `Hello ${LODGE.name}, I'd like to enquire about a stay.`) => `https://wa.me/${LODGE.whatsapp}?text=${encodeURIComponent(text)}`

export default function SiteLayout({ children, solid }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { window.scrollTo(0, 0); setOpen(false) }, [pathname])
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  const filled = solid || scrolled || open
  const link = ({ isActive }) => `text-sm tracking-wide transition-colors ${isActive ? 'text-gold-light' : 'text-white/85 hover:text-white'}`
  return (
    <div className="min-h-screen bg-cream text-forest-950 pb-16 md:pb-0" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <header className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${filled ? 'bg-forest-950/95 backdrop-blur shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-5 h-16 md:h-20 flex items-center justify-between gap-4">
          <Logo light />
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map(([to, t]) => <NavLink key={to} to={to} className={link}>{t}</NavLink>)}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/site/rooms" className="hidden sm:inline-block px-5 py-2.5 rounded-full text-sm font-medium text-forest-950 hover:brightness-105 transition" style={{ background: '#c8a96e' }}>Book now</Link>
            <button className="lg:hidden text-white p-1" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}</button>
          </div>
        </div>
        {open && (
          <nav className="lg:hidden bg-forest-950 border-t border-white/10 px-5 pb-6 pt-2 grid">
            {NAV.map(([to, t]) => <NavLink key={to} to={to} className={({ isActive }) => `py-3.5 text-lg font-display border-b border-white/10 ${isActive ? 'text-gold-light' : 'text-white'}`}>{t}</NavLink>)}
            <Link to="/dashboard" className="py-3.5 text-sm text-white/60">Staff portal (demo system) →</Link>
          </nav>
        )}
      </header>
      {solid && <div className="h-16 md:h-20 bg-forest-950" />}
      {children}

      <footer className="bg-forest-950 text-white/70">
        <div className="max-w-6xl mx-auto px-5 py-14 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed max-w-sm">A small safari lodge on the shore of a quiet crater lake. {LODGE.name} is a sample lodge made for demonstration purposes.</p>
          </div>
          <div className="text-sm space-y-3">
            <p className="font-display text-white text-lg mb-1">Get in touch</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /> {LODGE.phone}</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> {LODGE.email}</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> {LODGE.place}</p>
            <a href={waLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-gold-light hover:text-gold"><MessageCircle className="w-4 h-4" /> Chat on WhatsApp</a>
          </div>
          <div className="text-sm space-y-2.5">
            <p className="font-display text-white text-lg mb-1">Explore</p>
            {NAV.map(([to, t]) => <Link key={to} to={to} className="block hover:text-white">{t}</Link>)}
            <Link to="/dashboard" className="block text-gold-light hover:text-gold pt-1">Staff portal →</Link>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 px-5 text-center text-xs text-white/40">© {new Date().getFullYear()} {LODGE.name} · Demo website by Lodgely — payments are simulated, no money is charged. Photos: Pexels.</div>
      </footer>

      {/* Mobile sticky action bar + desktop WhatsApp button */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-forest-950 border-t border-white/10 p-2.5 flex gap-2.5">
        <a href={waLink()} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white" style={{ background: '#25D366' }}><MessageCircle className="w-4 h-4" />WhatsApp</a>
        <Link to="/site/rooms" className="flex-1 flex items-center justify-center rounded-full py-3 text-sm font-semibold text-forest-950" style={{ background: '#c8a96e' }}>Book now</Link>
      </div>
      <a href={waLink()} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="hidden md:flex fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full items-center justify-center text-white shadow-xl hover:scale-105 transition" style={{ background: '#25D366' }}><MessageCircle className="w-7 h-7" /></a>
    </div>
  )
}

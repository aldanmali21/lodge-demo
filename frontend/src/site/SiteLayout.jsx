import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Phone, Mail, MapPin, Leaf } from 'lucide-react'

export function Logo({ light }) {
  return (
    <Link to="/site" className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#c8a96e' }}>
        <Leaf className="w-5 h-5 text-forest-950" />
      </span>
      <span className={`font-display text-xl font-semibold tracking-wide ${light ? 'text-white' : 'text-forest-900'}`}>Lodge Demo</span>
    </Link>
  )
}

export default function SiteLayout({ children, solid }) {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const link = ({ isActive }) => `text-sm tracking-wide transition-colors ${isActive ? 'text-gold-light' : 'text-white/85 hover:text-white'}`
  return (
    <div className="min-h-screen bg-cream text-forest-950" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <header className={`${solid ? 'bg-forest-950' : 'absolute inset-x-0 top-0 z-20'}`}>
        <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          <Logo light />
          <nav className="hidden md:flex items-center gap-8">
            <a href="/site#rooms" className="text-sm tracking-wide text-white/85 hover:text-white">Rooms &amp; Suites</a>
            <a href="/site#experiences" className="text-sm tracking-wide text-white/85 hover:text-white">Experiences</a>
            <a href="/site#contact" className="text-sm tracking-wide text-white/85 hover:text-white">Contact</a>
            <NavLink to="/dashboard" className={link}>Staff portal</NavLink>
          </nav>
          <a href="/site#rooms" className="px-5 py-2.5 rounded-full text-sm font-medium text-forest-950 hover:brightness-105 transition" style={{ background: '#c8a96e' }}>Book now</a>
        </div>
      </header>
      {children}
      <footer id="contact" className="bg-forest-950 text-white/70">
        <div className="max-w-6xl mx-auto px-5 py-14 grid gap-10 md:grid-cols-3">
          <div>
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed max-w-xs">An award-winning safari lodge on the shores of a quiet crater lake. Sample lodge used for demonstration purposes.</p>
          </div>
          <div className="text-sm space-y-3">
            <p className="font-display text-white text-lg mb-1">Get in touch</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /> +256 700 000 000</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> stay@lodgedemo.example</p>
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> Western Uganda</p>
          </div>
          <div className="text-sm space-y-3">
            <p className="font-display text-white text-lg mb-1">Good to know</p>
            <p>Check-in from 2:00 pm · Check-out by 10:00 am</p>
            <p>Free cancellation up to 48 hours before arrival</p>
            <Link to="/dashboard" className="inline-block text-gold-light hover:text-gold">Staff portal →</Link>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">© {new Date().getFullYear()} Lodge Demo · Demo website — payments are simulated, no money is charged.</div>
      </footer>
    </div>
  )
}

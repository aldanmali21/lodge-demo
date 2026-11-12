import { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2, Clock, Plane } from 'lucide-react'
import api from '../lib/api'
import SiteLayout, { waLink } from './SiteLayout'
import { PageHero, SectionHead } from './shared'
import { LODGE } from './catalog'

const input = 'w-full px-4 py-3 rounded-xl border border-sage-300 bg-white outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-600/15 text-[15px]'

export default function SiteAbout() {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' })
  const [state, setState] = useState('idle')
  const [err, setErr] = useState('')
  async function send(e) {
    e.preventDefault(); setErr('')
    if (!f.name.trim() || !f.message.trim()) return setErr('Please add your name and a message.')
    setState('sending')
    try { await api.post('/public/enquiries', f); setState('sent') } catch { setState('idle'); setErr('Could not send. Please try again.') }
  }
  return (
    <SiteLayout>
      <PageHero img="/site/lodge.jpg" kicker="Our story" title="About & contact" />
      <section className="max-w-6xl mx-auto px-5 py-16 grid gap-12 md:grid-cols-2 items-center">
        <div>
          <SectionHead center={false} kicker="Who we are" title="A family-run lodge, small on purpose" />
          <p className="mt-5 text-forest-950/70 leading-relaxed">{LODGE.name} began as a single guest house on the lake shore, built by a family who wanted visitors to see their home the way they do. Today we have ten rooms, a team of 30 from the surrounding villages, and the same promise: warm hosting, honest food and time in the wild.</p>
          <ul className="mt-6 space-y-3 text-forest-950/75 text-sm">
            <li className="flex gap-3"><Clock className="w-5 h-5 text-forest-600 shrink-0" />Check-in from 2:00 pm · Check-out by 10:00 am</li>
            <li className="flex gap-3"><Plane className="w-5 h-5 text-forest-600 shrink-0" />Airport and Kampala transfers arranged on request</li>
            <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0" />Free cancellation up to 48 hours before arrival; 30% deposit secures your room</li>
          </ul>
        </div>
        <img src="/site/safari.jpg" alt="Game drive" className="rounded-2xl shadow-xl w-full h-[380px] object-cover" />
      </section>

      <section className="bg-sage-50 py-16">
        <div className="max-w-6xl mx-auto px-5 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHead center={false} kicker="Get in touch" title="We reply fast" sub="Message us on WhatsApp for the quickest answer, or send an enquiry below." />
            <div className="mt-6 space-y-4 text-forest-950/80">
              <p className="flex items-center gap-3"><Phone className="w-5 h-5 text-forest-600" />{LODGE.phone}</p>
              <p className="flex items-center gap-3"><Mail className="w-5 h-5 text-forest-600" />{LODGE.email}</p>
              <p className="flex items-center gap-3"><MapPin className="w-5 h-5 text-forest-600" />{LODGE.place}</p>
            </div>
            <a href={waLink()} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-medium" style={{ background: '#25D366' }}><MessageCircle className="w-5 h-5" />Chat on WhatsApp</a>
            <div className="mt-8 rounded-2xl overflow-hidden relative h-56" style={{ background: 'linear-gradient(135deg,#dde7c8,#c5d6a0)' }}>
              <svg viewBox="0 0 400 220" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <path d="M-10 150 C80 110 140 190 230 140 S360 100 420 130 L420 230 L-10 230Z" fill="#9fc3d1" opacity=".75" />
                <path d="M0 60 C60 30 120 70 190 40 S330 20 400 50" stroke="#fff" strokeWidth="6" fill="none" opacity=".7" />
                <path d="M130 0 L170 220" stroke="#fff" strokeWidth="5" opacity=".6" />
              </svg>
              <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <MapPin className="w-10 h-10 text-red-600 fill-red-600/20" /><span className="bg-white rounded-full px-3 py-1 text-xs font-medium shadow">{LODGE.name}</span>
              </div>
              <p className="absolute bottom-2 right-3 text-[11px] text-forest-950/50">Illustrative map (demo)</p>
            </div>
          </div>
          <form onSubmit={send} className="bg-white rounded-2xl p-7 shadow-sm self-start">
            {state === 'sent' ? (
              <div className="text-center py-10"><CheckCircle2 className="w-14 h-14 mx-auto text-forest-600" /><h3 className="font-display text-2xl text-forest-900 mt-3">Thank you, {f.name.split(' ')[0]}</h3><p className="text-forest-950/65 mt-2">We’ll reply to your enquiry within a few hours. (Demo: it now appears in the lodge system’s activity log.)</p></div>
            ) : (
              <>
                <h3 className="font-display text-2xl text-forest-900 mb-5">Send an enquiry</h3>
                <div className="grid gap-4">
                  <input className={input} placeholder="Your name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input className={input} type="email" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
                    <input className={input} placeholder="Phone / WhatsApp" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
                  </div>
                  <textarea className={input} rows={5} placeholder="Tell us about your trip: dates, group size, anything special…" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} />
                  {err && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-4 py-2.5">{err}</p>}
                  <button disabled={state === 'sending'} className="py-3.5 rounded-xl font-semibold text-forest-950 disabled:opacity-60" style={{ background: '#c8a96e' }}>{state === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>
    </SiteLayout>
  )
}

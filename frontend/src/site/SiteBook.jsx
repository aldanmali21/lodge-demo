import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, Smartphone, CreditCard, CheckCircle2, ShieldCheck, CalendarDays, BedDouble, Loader2, Printer } from 'lucide-react'
import api from '../lib/api'
import SiteLayout from './SiteLayout'
import { ROOM_INFO, fallbackInfo, TAX_RATE, money, ugx, fmtDate, nightsBetween, stamp } from './catalog'

const METHODS = [
  { id: 'MTN Mobile Money', label: 'MTN MoMo', sub: 'Pay from your phone', icon: Smartphone, color: '#ffcc00', ink: '#1a1a1a', mobile: true },
  { id: 'Airtel Money', label: 'Airtel Money', sub: 'Pay from your phone', icon: Smartphone, color: '#e40000', ink: '#fff', mobile: true },
  { id: 'Visa Card', label: 'Card', sub: 'Visa or Mastercard', icon: CreditCard, color: '#1b3520', ink: '#fff', mobile: false },
]

const input = 'w-full px-4 py-3 rounded-xl border border-sage-300 bg-white outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-600/15 text-[15px]'
const label = 'block text-xs font-medium uppercase tracking-wider text-forest-950/60 mb-1.5'

export default function SiteBook() {
  const [sp] = useSearchParams()
  const type = sp.get('type') || ''
  const from = sp.get('from') || ''
  const to = sp.get('to') || ''
  const guests = Number(sp.get('guests') || 2)
  const nights = nightsBetween(from, to)

  const [room, setRoom] = useState(null)
  const [d, setD] = useState({ name: '', email: '', phone: '' })
  const [method, setMethod] = useState(METHODS[0])
  const [momoPhone, setMomoPhone] = useState('')
  const [card, setCard] = useState({ number: '', exp: '', cvc: '' })
  const [phase, setPhase] = useState('form') // form | paying | done
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!from || !to || !type) return
    api.get('/rooms/available', { params: { from: stamp(from, 14), to: stamp(to, 10) } })
      .then(r => setRoom(r.data.find(x => x.type === type) || false)).catch(() => setRoom(false))
  }, [type, from, to])

  const info = ROOM_INFO[type] || fallbackInfo
  const rate = room?.defaultRate || 0
  const subtotal = rate * nights
  const taxes = subtotal * TAX_RATE
  const total = subtotal + taxes

  function demoFill() {
    setD({ name: 'Grace Namukasa', email: 'grace.namukasa@example.com', phone: '0772 123 456' })
    setMomoPhone('0772 123 456')
    setCard({ number: '4242 4242 4242 4242', exp: '12/28', cvc: '123' })
  }

  async function pay(e) {
    e.preventDefault()
    setError('')
    if (!d.name.trim() || !d.phone.trim() || !d.email.trim()) return setError('Please complete your name, email and phone number.')
    if (method.mobile && !(momoPhone || d.phone).trim()) return setError('Enter the mobile money number to charge.')
    if (!method.mobile && (card.number.replace(/\s/g, '').length < 12 || !card.exp || !card.cvc)) return setError('Enter your card details.')
    setPhase('paying'); setStep(0)
    const wait = (ms) => new Promise(r => setTimeout(r, ms))
    try {
      await wait(1400); setStep(1)
      await wait(method.mobile ? 2200 : 1200); setStep(2)
      const res = await api.post('/public/bookings', {
        guestName: d.name.trim(), guestEmail: d.email.trim(), guestPhone: d.phone.trim(), guests,
        checkinDate: stamp(from, 14), checkoutDate: stamp(to, 10), roomType: type, paymentMethod: method.id,
      })
      await wait(900)
      setResult(res.data); setPhase('done')
    } catch (err) {
      setPhase('form')
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    }
  }

  if (!from || !to || !type || nights < 1) {
    return <SiteLayout solid><div className="max-w-xl mx-auto py-32 text-center px-5"><p className="font-display text-3xl text-forest-900">Choose your dates and room first</p><Link to="/site#rooms" className="inline-block mt-6 px-6 py-3 rounded-full bg-forest-900 text-white">Browse rooms</Link></div></SiteLayout>
  }

  if (phase === 'done' && result) {
    return (
      <SiteLayout solid>
        <div className="max-w-2xl mx-auto px-5 py-16">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="text-center px-8 pt-12 pb-8" style={{ background: 'linear-gradient(180deg,#eef2e4,#fff)' }}>
              <CheckCircle2 className="w-16 h-16 mx-auto text-forest-600" />
              <h1 className="font-display text-4xl text-forest-900 mt-4">Booking confirmed</h1>
              <p className="text-forest-950/70 mt-2">Thank you, {d.name.split(' ')[0]}. A confirmation has been sent to <strong>{d.email}</strong>.</p>
              <p className="mt-5 inline-block px-5 py-2 rounded-full text-sm font-semibold tracking-widest text-forest-900" style={{ background: '#c8a96e33' }}>REF {result.reference}</p>
            </div>
            <div className="px-8 pb-10 grid gap-3 text-[15px]">
              <Row k="Room" v={`${result.room.type} · Room ${result.room.number}`} />
              <Row k="Arrival" v={`${fmtDate(from)} · from 2:00 pm`} />
              <Row k="Departure" v={`${fmtDate(to)} · by 10:00 am`} />
              <Row k="Guests" v={`${guests}`} />
              <hr className="border-sage-200 my-2" />
              <Row k={`Room (${result.nights} night${result.nights > 1 ? 's' : ''})`} v={money(result.subtotal)} />
              <Row k="Tourism levy & VAT" v={money(result.taxes)} />
              <Row k={`Paid with ${result.paymentMethod}`} v={money(result.total)} bold />
              <p className="text-xs text-forest-950/50 mt-3">Demo payment — no real money was charged.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/site" className="px-6 py-3 rounded-full bg-forest-900 text-white text-sm font-medium">Back to the lodge</Link>
                <button onClick={() => window.print()} className="px-6 py-3 rounded-full border border-forest-900/30 text-forest-900 text-sm font-medium flex items-center gap-2"><Printer className="w-4 h-4" />Print</button>
                <Link to="/dashboard" className="px-6 py-3 rounded-full text-sm font-medium text-forest-950" style={{ background: '#c8a96e' }}>See it in the lodge system →</Link>
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    )
  }

  const steps = method.mobile
    ? ['Sending payment request…', `Waiting for approval on ${momoPhone || d.phone}…`, 'Payment received — confirming your room…']
    : ['Contacting your bank…', 'Authorising card…', 'Payment received — confirming your room…']

  return (
    <SiteLayout solid>
      <div className="max-w-6xl mx-auto px-5 py-12">
        <Link to="/site#rooms" className="text-sm text-forest-700 hover:underline">← Back to rooms</Link>
        <h1 className="font-display text-4xl text-forest-900 mt-3">Complete your booking</h1>

        <form onSubmit={pay} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] items-start">
          <div className="space-y-6">
            <section className="bg-white rounded-2xl p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl text-forest-900">1. Your details</h2>
                <button type="button" onClick={demoFill} className="text-xs text-forest-700 hover:underline">Use sample details</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className={label}>Full name</label><input id="guest-name" className={input} value={d.name} onChange={e => setD({ ...d, name: e.target.value })} placeholder="e.g. Grace Namukasa" /></div>
                <div><label className={label}>Email</label><input id="guest-email" type="email" className={input} value={d.email} onChange={e => setD({ ...d, email: e.target.value })} placeholder="you@example.com" /></div>
                <div><label className={label}>Phone</label><input id="guest-phone" className={input} value={d.phone} onChange={e => setD({ ...d, phone: e.target.value })} placeholder="07xx xxx xxx" /></div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-7 shadow-sm">
              <h2 className="font-display text-2xl text-forest-900 mb-5">2. Payment</h2>
              <div className="grid grid-cols-3 gap-3">
                {METHODS.map(m => (
                  <button type="button" key={m.id} onClick={() => setMethod(m)}
                    className={`rounded-xl border-2 p-4 text-left transition ${method.id === m.id ? 'border-forest-700 bg-sage-50' : 'border-sage-200 hover:border-sage-300'}`}>
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: m.color, color: m.ink }}><m.icon className="w-5 h-5" /></span>
                    <span className="block text-sm font-semibold text-forest-900">{m.label}</span>
                    <span className="block text-xs text-forest-950/55">{m.sub}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                {method.mobile ? (
                  <div>
                    <label className={label}>{method.label} number</label>
                    <input id="momo-phone" className={input} value={momoPhone} onChange={e => setMomoPhone(e.target.value)} placeholder={d.phone || '07xx xxx xxx'} />
                    <p className="text-xs text-forest-950/55 mt-2">You’ll get a prompt on this phone to approve {ugx(total)}.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><label className={label}>Card number</label><input className={input} value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" /></div>
                    <div><label className={label}>Expiry</label><input className={input} value={card.exp} onChange={e => setCard({ ...card, exp: e.target.value })} placeholder="MM/YY" /></div>
                    <div><label className={label}>CVC</label><input className={input} value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} placeholder="123" /></div>
                  </div>
                )}
              </div>
              {error && <p className="mt-4 text-sm text-red-700 bg-red-50 rounded-lg px-4 py-2.5">{error}</p>}
              <button id="pay-button" type="submit" disabled={!room} className="mt-6 w-full py-4 rounded-xl text-forest-950 font-semibold text-lg flex items-center justify-center gap-2 hover:brightness-105 transition disabled:opacity-50" style={{ background: '#c8a96e' }}>
                <Lock className="w-5 h-5" /> Pay {money(total)}
              </button>
              <p className="text-xs text-forest-950/50 mt-3 flex items-center gap-1.5 justify-center"><ShieldCheck className="w-4 h-4" /> Secure checkout · Demo only — no money is charged</p>
            </section>
          </div>

          <aside className="bg-white rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-6">
            <img src={info.photo} alt={type} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="font-display text-2xl text-forest-900">{type}</h3>
              <p className="text-sm text-forest-950/60 flex items-center gap-1.5 mt-1"><BedDouble className="w-4 h-4" />{info.beds}</p>
              <p className="text-sm text-forest-950/75 mt-4 flex items-start gap-2"><CalendarDays className="w-4 h-4 mt-0.5 text-forest-600" /><span>{fmtDate(from)} → {fmtDate(to)}<br /><span className="text-forest-950/55">{nights} night{nights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}</span></span></p>
              {room === false ? <p className="mt-5 text-sm text-red-700">This room type is no longer available for those dates. <Link to="/site#rooms" className="underline">Choose another</Link></p> : (
                <div className="mt-5 pt-5 border-t border-sage-200 space-y-2 text-[15px]">
                  <Row k={`${money(rate)} × ${nights} night${nights > 1 ? 's' : ''}`} v={money(subtotal)} />
                  <Row k="Tourism levy (5%) & VAT (18%)" v={money(taxes)} />
                  <div className="pt-3 mt-2 border-t border-sage-200"><Row k="Total" v={money(total)} bold /><p className="text-right text-xs text-forest-950/50">≈ {ugx(total)}</p></div>
                </div>
              )}
            </div>
          </aside>
        </form>
      </div>

      {phase === 'paying' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: 'rgba(13,26,15,.72)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl p-9 w-full max-w-md text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: method.color, color: method.ink }}><method.icon className="w-8 h-8" /></div>
            <h3 className="font-display text-2xl text-forest-900 mt-5">{method.mobile ? `Approve on your phone` : 'Processing payment'}</h3>
            <p className="text-forest-950/65 text-sm mt-1">{method.mobile ? `Enter your ${method.label} PIN to pay ${money(total)}` : `Charging ${money(total)} to your card`}</p>
            <ul className="mt-7 space-y-3 text-left text-sm">
              {steps.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 ${i > step ? 'opacity-30' : ''}`}>
                  {i < step ? <CheckCircle2 className="w-5 h-5 text-forest-600" /> : i === step ? <Loader2 className="w-5 h-5 text-forest-700 animate-spin" /> : <span className="w-5 h-5 rounded-full border border-sage-300" />}
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </SiteLayout>
  )
}

function Row({ k, v, bold }) {
  return <div className={`flex justify-between gap-4 ${bold ? 'font-semibold text-forest-900 text-lg' : 'text-forest-950/75'}`}><span>{k}</span><span>{v}</span></div>
}

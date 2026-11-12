import SiteLayout from './SiteLayout'
import { SearchBar, RoomCard, PageHero, useStay, useRoomTypes } from './shared'
import { fmtDate } from './catalog'
import { Link } from 'react-router-dom'

export default function SiteRooms() {
  const stay = useStay()
  const types = useRoomTypes(stay.from, stay.to, stay.guests)
  return (
    <SiteLayout>
      <PageHero img="/site/canopy.jpg" kicker="Stay with us" title="Rooms & suites" sub="Seven room styles, from garden-view doubles to a private-deck honeymoon suite." />
      <section className="bg-sage-50 pb-20">
        <div className="max-w-6xl mx-auto px-5">
          <SearchBar stay={stay} cta="Update" className="-mt-10 relative z-10 max-w-4xl mx-auto" />
          <p className="text-center text-forest-950/65 mt-8">
            {stay.nights > 0 ? <>Availability for <strong>{fmtDate(stay.from)}</strong> – <strong>{fmtDate(stay.to)}</strong> ({stay.nights} night{stay.nights > 1 ? 's' : ''}) · {stay.guests} guest{stay.guests > 1 ? 's' : ''}</> : 'Choose a check-out date after your check-in date.'}
          </p>
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {types === null && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[420px] rounded-2xl bg-white/70 animate-pulse" />)}
            {types?.map(t => <RoomCard key={t.type} t={t} stay={stay} />)}
          </div>
          {types && types.length === 0 && stay.nights > 0 && (
            <p className="text-center mt-10 text-forest-950/70">Sorry, we are fully booked for those dates. Try different dates, or <Link to="/site/about" className="underline">message us</Link> and we’ll find you a room.</p>
          )}
        </div>
      </section>
    </SiteLayout>
  )
}

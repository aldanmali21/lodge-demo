import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import SiteLayout from './SiteLayout'
import { PageHero } from './shared'
import { GALLERY } from './catalog'

const CATS = ['All', 'Rooms', 'Dining', 'Wildlife', 'Lodge', 'Landscape']
export default function SiteGallery() {
  const [cat, setCat] = useState('All')
  const [lb, setLb] = useState(null)
  const list = GALLERY.filter(g => cat === 'All' || g.cat === cat)
  useEffect(() => {
    const k = (e) => { if (lb === null) return; if (e.key === 'Escape') setLb(null); if (e.key === 'ArrowRight') setLb((lb + 1) % list.length); if (e.key === 'ArrowLeft') setLb((lb - 1 + list.length) % list.length) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [lb, list.length])
  return (
    <SiteLayout>
      <PageHero img="/site/giraffe.jpg" kicker="A look around" title="Gallery" />
      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="flex flex-wrap justify-center gap-2">
          {CATS.map(c => <button key={c} onClick={() => setCat(c)} className={`px-5 py-2 rounded-full text-sm border ${cat === c ? 'bg-forest-900 text-white border-forest-900' : 'border-forest-900/25 text-forest-900 hover:bg-sage-50'}`}>{c}</button>)}
        </div>
        <div className="mt-10 columns-2 md:columns-3 gap-4 [&>*]:mb-4">
          {list.map((g, i) => (
            <button key={g.src} onClick={() => setLb(i)} className="block w-full overflow-hidden rounded-xl group break-inside-avoid">
              <img src={g.src} alt={g.alt} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            </button>
          ))}
        </div>
      </section>
      {lb !== null && list[lb] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLb(null)}>
          <button className="absolute top-4 right-4 text-white p-2" aria-label="Close"><X className="w-8 h-8" /></button>
          <button className="absolute left-3 text-white p-2" aria-label="Previous" onClick={e => { e.stopPropagation(); setLb((lb - 1 + list.length) % list.length) }}><ChevronLeft className="w-9 h-9" /></button>
          <img src={list[lb].src} alt={list[lb].alt} className="max-h-[85vh] max-w-full rounded-lg" onClick={e => e.stopPropagation()} />
          <button className="absolute right-3 text-white p-2" aria-label="Next" onClick={e => { e.stopPropagation(); setLb((lb + 1) % list.length) }}><ChevronRight className="w-9 h-9" /></button>
          <p className="absolute bottom-5 text-white/80 text-sm">{list[lb].alt}</p>
        </div>
      )}
    </SiteLayout>
  )
}

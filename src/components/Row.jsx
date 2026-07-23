import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AnimeCard from './AnimeCard.jsx'
import { RowSkeleton } from './Skeleton.jsx'

export default function Row({ title, icon, items, loading }) {
  const scroller = useRef(null)

  const scroll = (dir) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: 'smooth' })
  }

  return (
    <section className="group/row relative py-4">
      <div className="mb-3 flex items-center gap-2 px-4 sm:px-8">
        {icon}
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
          {title}
        </h2>
      </div>

      {loading ? (
        <RowSkeleton />
      ) : (
        <div className="relative">
          {/* Arrow buttons */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-1 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur transition hover:bg-brand hover:text-black group-hover/row:opacity-100 sm:flex"
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute right-1 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur transition hover:bg-brand hover:text-black group-hover/row:opacity-100 sm:flex"
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>

          <div
            ref={scroller}
            className="no-scrollbar flex gap-4 overflow-x-auto scroll-px-8 px-4 pb-2 sm:px-8"
            style={{ scrollSnapType: 'x proximity' }}
          >
            {items?.map((a, i) => (
              <div key={a.id} style={{ scrollSnapAlign: 'start' }}>
                <AnimeCard anime={a} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

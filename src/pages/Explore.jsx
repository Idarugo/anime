import { useCallback, useEffect, useRef, useState } from 'react'
import { Compass, SlidersHorizontal, Loader2, X } from 'lucide-react'
import AnimeCard from '../components/AnimeCard.jsx'
import { CardSkeleton } from '../components/Skeleton.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { api, GENRES } from '../api/jikan.js'

const TYPES = [
  { v: '', l: 'Todos' }, { v: 'tv', l: 'TV' }, { v: 'movie', l: 'Película' },
  { v: 'ova', l: 'OVA' }, { v: 'ona', l: 'ONA' }, { v: 'special', l: 'Especial' },
]
const STATUSES = [
  { v: '', l: 'Cualquiera' }, { v: 'airing', l: 'En emisión' },
  { v: 'complete', l: 'Finalizado' }, { v: 'upcoming', l: 'Próximo' },
]
const ORDERS = [
  { v: 'members', l: 'Popularidad' }, { v: 'score', l: 'Puntuación' },
  { v: 'start_date', l: 'Más reciente' }, { v: 'title', l: 'Título (A-Z)' },
]

const DEFAULTS = { genre: '', type: '', status: '', orderBy: 'members', minScore: '' }

export default function Explore() {
  const [filters, setFilters] = useState(DEFAULTS)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasNext, setHasNext] = useState(false)
  const [error, setError] = useState(false)
  const sentinel = useRef(null)
  const reqId = useRef(0)

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }))
  const activeCount = Object.entries(filters).filter(([k, v]) => v && DEFAULTS[k] !== v).length

  // Reload when filters change (page resets to 1).
  useEffect(() => {
    const id = ++reqId.current
    setLoading(true)
    setError(false)
    setItems([])
    setPage(1)
    api
      .explore({ ...filters, sort: filters.orderBy === 'title' ? 'asc' : 'desc', page: 1 })
      .then((r) => {
        if (id !== reqId.current) return
        setItems(r.items)
        setHasNext(r.hasNext)
      })
      .catch(() => id === reqId.current && setError(true))
      .finally(() => id === reqId.current && setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadMore = useCallback(() => {
    if (loading || !hasNext) return
    const next = page + 1
    const id = reqId.current
    setLoading(true)
    api
      .explore({ ...filters, sort: filters.orderBy === 'title' ? 'asc' : 'desc', page: next })
      .then((r) => {
        if (id !== reqId.current) return
        setItems((prev) => {
          const seen = new Set(prev.map((x) => x.id))
          return [...prev, ...r.items.filter((x) => !seen.has(x.id))]
        })
        setHasNext(r.hasNext)
        setPage(next)
      })
      .finally(() => id === reqId.current && setLoading(false))
  }, [loading, hasNext, page, filters])

  // IntersectionObserver for infinite scroll.
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore])

  const Select = ({ label, value, onChange, options }) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border border-white/10 bg-panel px-3 text-sm text-white outline-none transition focus:border-brand/60"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v} className="bg-panel">{o.l}</option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-20 pt-24 sm:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-black">
          <Compass size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Explorar</h1>
          <p className="text-sm text-white/50">Filtra el catálogo completo</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-8 rounded-2xl border border-white/5 bg-panel/50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <SlidersHorizontal size={16} className="text-brand" /> Filtros
          {activeCount > 0 && (
            <button
              onClick={() => setFilters(DEFAULTS)}
              className="ml-auto flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60 transition hover:bg-white/10"
            >
              <X size={12} /> Limpiar ({activeCount})
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Select label="Género" value={filters.genre} onChange={(v) => set('genre', v)}
            options={[{ v: '', l: 'Todos' }, ...GENRES.map((g) => ({ v: String(g.id), l: g.name }))]} />
          <Select label="Tipo" value={filters.type} onChange={(v) => set('type', v)} options={TYPES} />
          <Select label="Estado" value={filters.status} onChange={(v) => set('status', v)} options={STATUSES} />
          <Select label="Ordenar por" value={filters.orderBy} onChange={(v) => set('orderBy', v)} options={ORDERS} />
          <Select label="Nota mínima" value={filters.minScore} onChange={(v) => set('minScore', v)}
            options={[{ v: '', l: 'Cualquiera' }, { v: '9', l: '9+' }, { v: '8', l: '8+' }, { v: '7', l: '7+' }, { v: '6', l: '6+' }]} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((a, i) => <AnimeCard key={a.id} anime={a} index={i % 24} />)}
        {loading && Array.from({ length: 12 }).map((_, i) => (
          <div key={`s${i}`} className="w-[150px] sm:w-[170px]"><CardSkeleton /></div>
        ))}
      </div>

      {!loading && error && items.length === 0 && (
        <ErrorState onRetry={() => setFilters((f) => ({ ...f }))} />
      )}
      {!loading && !error && items.length === 0 && (
        <p className="py-20 text-center text-white/40">No hay resultados con estos filtros.</p>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinel} className="h-10" />
      {hasNext && loading && items.length > 0 && (
        <div className="flex justify-center py-6 text-white/40">
          <Loader2 className="animate-spin" size={22} />
        </div>
      )}
    </div>
  )
}

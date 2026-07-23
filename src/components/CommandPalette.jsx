import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Star, CornerDownLeft, Loader2, Sparkles, Compass, Bookmark, TrendingUp } from 'lucide-react'
import { api } from '../api/jikan.js'

const QUICK = [
  { label: 'Explorar catálogo', to: '/explore', icon: Compass },
  { label: 'Populares', to: '/browse/popular', icon: TrendingUp },
  { label: 'Sorpréndeme', to: '/surprise', icon: Sparkles },
  { label: 'Mi Lista', to: '/mylist', icon: Bookmark },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Global open shortcut (⌘K / Ctrl+K) and "/" to focus.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const openEvt = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', openEvt)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', openEvt)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQ('')
      setResults([])
      setActive(0)
    }
  }, [open])

  // Debounced search.
  useEffect(() => {
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(() => {
      api
        .search(q.trim())
        .then((d) => {
          setResults(d.items.slice(0, 7))
          setActive(0)
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  const go = (to) => {
    setOpen(false)
    navigate(to)
  }

  const items = q.trim()
    ? results.map((r) => ({ type: 'anime', data: r }))
    : QUICK.map((qc) => ({ type: 'quick', data: qc }))

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, items.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') {
      const it = items[active]
      if (!it) return
      go(it.type === 'anime' ? `/anime/${it.data.id}` : it.data.to)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              {loading ? (
                <Loader2 size={20} className="animate-spin text-brand" />
              ) : (
                <Search size={20} className="text-white/40" />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Buscar anime o ir a…"
                className="h-14 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/30"
              />
              <kbd className="hidden rounded border border-white/15 px-1.5 py-0.5 text-[11px] text-white/40 sm:block">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[52vh] overflow-y-auto p-2">
              {!q.trim() && (
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-white/30">
                  Acciones rápidas
                </p>
              )}
              {items.length === 0 && q.trim() && !loading && (
                <p className="px-3 py-8 text-center text-sm text-white/40">
                  Sin resultados para “{q}”.
                </p>
              )}
              {items.map((it, i) =>
                it.type === 'anime' ? (
                  <button
                    key={it.data.id}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(`/anime/${it.data.id}`)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                      active === i ? 'bg-brand/15 ring-1 ring-brand/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <img src={it.data.imageSmall || it.data.image} alt="" className="h-14 w-10 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-white">{it.data.title}</p>
                      <p className="line-clamp-1 text-xs text-white/40">
                        {[it.data.year, it.data.type, it.data.episodes ? `${it.data.episodes} eps` : null].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                    {it.data.score ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-brand2">
                        <Star size={12} className="fill-brand2" /> {it.data.score}
                      </span>
                    ) : null}
                    {active === i && <CornerDownLeft size={15} className="text-white/30" />}
                  </button>
                ) : (
                  <button
                    key={it.data.to}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(it.data.to)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      active === i ? 'bg-brand/15 ring-1 ring-brand/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <it.data.icon size={18} className="text-brand" />
                    <span className="text-sm font-medium text-white">{it.data.label}</span>
                  </button>
                ),
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-white/30">
              <span className="flex items-center gap-1"><kbd className="rounded bg-white/10 px-1">↑↓</kbd> navegar</span>
              <span className="flex items-center gap-1"><kbd className="rounded bg-white/10 px-1">↵</kbd> abrir</span>
              <span className="ml-auto flex items-center gap-1"><kbd className="rounded bg-white/10 px-1">⌘K</kbd> alternar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Plus, Check, Star, Info } from 'lucide-react'
import { useMyList } from '../context/MyList.jsx'

export default function HeroCarousel({ items = [] }) {
  const [i, setI] = useState(0)
  const { has, toggle } = useMyList()
  const slides = items.slice(0, 6)

  const next = useCallback(
    () => setI((v) => (v + 1) % (slides.length || 1)),
    [slides.length],
  )

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [next, slides.length])

  if (!slides.length) {
    return <div className="h-[62vh] min-h-[440px] w-full animate-pulse bg-panel2 sm:h-[78vh]" />
  }

  const a = slides[i]
  const backdrop = a.trailerImage || a.image
  const saved = has(a.id)

  return (
    <section className="relative h-[68vh] min-h-[480px] w-full overflow-hidden sm:h-[82vh]">
      {/* Background */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={a.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={backdrop}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent sm:via-ink/30" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-end px-4 pb-16 sm:items-center sm:px-8 sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-md brand-gradient px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-black">
                #{i + 1} Destacado
              </span>
              {a.score ? (
                <span className="flex items-center gap-1 text-sm font-semibold text-brand2">
                  <Star size={14} className="fill-brand2" /> {a.score}
                </span>
              ) : null}
              {a.year ? <span className="text-sm text-white/60">{a.year}</span> : null}
              {a.episodes ? (
                <span className="text-sm text-white/60">{a.episodes} eps</span>
              ) : null}
            </div>

            <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl">
              {a.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              {a.genres?.slice(0, 4).map((g) => (
                <span
                  key={g.id}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              {a.synopsis || 'Sinopsis no disponible.'}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={`/watch/${a.id}`}
                className="flex h-12 items-center gap-2 rounded-xl brand-gradient px-7 text-base font-bold text-black transition-transform hover:scale-105 active:scale-95"
              >
                <Play size={20} className="fill-black" /> Ver ahora
              </Link>
              <Link
                to={`/anime/${a.id}`}
                className="flex h-12 items-center gap-2 rounded-xl glass border border-white/15 px-6 text-base font-semibold text-white transition hover:bg-white/10"
              >
                <Info size={19} /> Más info
              </Link>
              <button
                onClick={() => toggle(a)}
                className="flex h-12 w-12 items-center justify-center rounded-xl glass border border-white/15 text-white transition hover:bg-white/10"
                aria-label="Mi lista"
              >
                {saved ? <Check size={20} className="text-brand" /> : <Plus size={20} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:left-8 sm:translate-x-0">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === i ? 'w-8 bg-brand' : 'w-4 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Ir al destacado ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

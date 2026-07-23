import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Dices, Play, Info, Star, RefreshCw } from 'lucide-react'
import { api, GENRES } from '../api/jikan.js'
import ErrorState from '../components/ErrorState.jsx'

export default function Surprise() {
  const [pool, setPool] = useState([])
  const [pick, setPick] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [reel, setReel] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [tick, setTick] = useState(0)
  const spinTimer = useRef(null)

  // Build a big pool from several endpoints.
  useEffect(() => {
    let alive = true
    setStatus('loading')
    Promise.all([api.topPopular(), api.topFavorites(), api.seasonNow()])
      .then((lists) => {
        if (!alive) return
        const merged = []
        const seen = new Set()
        lists.flat().forEach((a) => {
          if (a && !seen.has(a.id)) { seen.add(a.id); merged.push(a) }
        })
        setPool(merged)
        setStatus(merged.length ? 'ready' : 'error')
      })
      .catch(() => alive && setStatus('error'))
    return () => { alive = false; clearInterval(spinTimer.current) }
  }, [tick])

  if (status === 'error') {
    return (
      <div className="pt-24">
        <ErrorState onRetry={() => setTick((t) => t + 1)} />
      </div>
    )
  }

  const spin = () => {
    if (!pool.length || spinning) return
    setSpinning(true)
    setPick(null)
    let ticks = 0
    const total = 22
    clearInterval(spinTimer.current)
    spinTimer.current = setInterval(() => {
      ticks++
      const rnd = pool[Math.floor((ticks * 2654435761) % pool.length)]
      setReel([rnd])
      if (ticks >= total) {
        clearInterval(spinTimer.current)
        const chosen = pool[Math.floor((ticks * 40503 + 7) % pool.length)]
        setPick(chosen)
        setSpinning(false)
      }
    }, 90)
  }

  const shown = pick || reel[0]

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-8">
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand2">
          <Sparkles size={15} /> Descubrimiento aleatorio
        </div>
        <h1 className="text-balance text-3xl font-black sm:text-5xl">
          ¿No sabes qué ver?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-white/50">
          Gira la ruleta y deja que AniBox elija por ti entre los títulos más
          aclamados de la comunidad.
        </p>
      </div>

      {/* Reel window */}
      <div className="relative mx-auto mt-10 aspect-[16/10] max-w-md overflow-hidden rounded-3xl border border-white/10 bg-panel ring-1 ring-white/5">
        <AnimatePresence mode="popLayout">
          {shown ? (
            <motion.div
              key={shown.id + (spinning ? '-spin' : '-final')}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: spinning ? 0.08 : 0.4 }}
              className="absolute inset-0"
            >
              <img src={shown.trailerImage || shown.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </motion.div>
          ) : (
            <div className="grid h-full place-items-center text-white/30">
              <Dices size={64} className={pool.length ? 'animate-float' : 'animate-pulse'} />
            </div>
          )}
        </AnimatePresence>

        {/* Spin overlay label */}
        {shown && (
          <div className="absolute inset-x-0 bottom-0 p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={shown.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end justify-between gap-3"
              >
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-xl font-black drop-shadow sm:text-2xl">{shown.title}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/70">
                    {shown.score ? (
                      <span className="flex items-center gap-1 text-brand2"><Star size={12} className="fill-brand2" /> {shown.score}</span>
                    ) : null}
                    {shown.year ? <span>{shown.year}</span> : null}
                    {shown.genres?.slice(0, 2).map((g) => <span key={g.id}>· {g.name}</span>)}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {spinning && (
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-brand2 backdrop-blur">
            Girando…
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={spin}
          disabled={spinning || !pool.length}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl brand-gradient px-8 py-3.5 text-base font-bold text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 sm:w-auto"
        >
          {pick ? <RefreshCw size={19} /> : <Dices size={20} />}
          {pool.length ? (pick ? 'Girar otra vez' : 'Girar la ruleta') : 'Cargando…'}
        </button>

        {pick && !spinning && (
          <div className="flex w-full gap-3 sm:w-auto">
            <Link to={`/watch/${pick.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 font-semibold transition hover:bg-white/15">
              <Play size={18} className="fill-current" /> Ver
            </Link>
            <Link to={`/anime/${pick.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 font-semibold transition hover:bg-white/15">
              <Info size={18} /> Info
            </Link>
          </div>
        )}
      </div>

      {/* Genre shortcuts */}
      <div className="mt-12 text-center">
        <p className="mb-3 text-sm text-white/40">O explora por lo que te apetece hoy:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {GENRES.slice(0, 10).map((g) => (
            <Link
              key={g.id}
              to={`/genre/${g.id}?name=${encodeURIComponent(g.name)}`}
              className="rounded-full border border-white/10 bg-panel px-3.5 py-1.5 text-sm text-white/70 transition hover:border-brand/50 hover:text-white"
            >
              {g.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

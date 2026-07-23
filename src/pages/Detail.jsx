import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play, Plus, Check, Star, Calendar, Clock, Tv2, Users, Trophy, Film,
} from 'lucide-react'
import { api } from '../api/jikan.js'
import { useFetch } from '../hooks/useFetch.js'
import { useMyList } from '../context/MyList.jsx'
import Row from '../components/Row.jsx'
import { Skeleton } from '../components/Skeleton.jsx'

function Stat({ icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="rounded-xl border border-white/5 bg-panel p-3">
      <div className="mb-1 flex items-center gap-1.5 text-white/40">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  )
}

export default function Detail() {
  const { id } = useParams()
  const { data: a, loading } = useFetch(() => api.detail(id), [id])
  const chars = useFetch(() => api.characters(id), [id])
  const recs = useFetch(() => api.recommendations(id), [id])
  const { has, toggle } = useMyList()

  if (loading || !a) {
    return (
      <div className="pt-16">
        <Skeleton className="h-[46vh] w-full rounded-none" />
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="mt-4 h-24 w-full" />
        </div>
      </div>
    )
  }

  const saved = has(a.id)
  const backdrop = a.trailerImage || a.image

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-[52vh] min-h-[380px] w-full overflow-hidden">
        <img src={backdrop} alt="" className="animate-kenburns h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
        <div className="relative z-10 -mt-52 flex flex-col gap-8 sm:-mt-40 sm:flex-row">
          {/* Poster */}
          <motion.img
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            src={a.image}
            alt={a.title}
            className="mx-auto w-44 shrink-0 rounded-2xl ring-1 ring-white/10 shadow-2xl shadow-black/60 sm:mx-0 sm:w-60"
          />

          {/* Info */}
          <div className="flex-1 pt-2 sm:pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-balance text-3xl font-black leading-tight sm:text-5xl">
                {a.title}
              </h1>
              {a.titleJp && (
                <p className="mt-1 text-sm text-white/40">{a.titleJp}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                {a.score ? (
                  <span className="flex items-center gap-1 rounded-full bg-brand/15 px-3 py-1 font-bold text-brand2">
                    <Star size={14} className="fill-brand2" /> {a.score}
                  </span>
                ) : null}
                {a.rank ? <span className="text-white/60">#{a.rank} ranking</span> : null}
                {a.status ? (
                  <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">
                    {a.status}
                  </span>
                ) : null}
                {a.rating ? <span className="text-white/50">{a.rating}</span> : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {a.genres?.map((g) => (
                  <Link
                    key={g.id}
                    to={`/genre/${g.id}?name=${encodeURIComponent(g.name)}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:border-brand/60 hover:text-brand"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to={`/watch/${a.id}`}
                  className="flex h-12 items-center gap-2 rounded-xl brand-gradient px-7 font-bold text-black transition-transform hover:scale-105 active:scale-95"
                >
                  <Play size={20} className="fill-black" /> Ver ahora
                </Link>
                <button
                  onClick={() => toggle(a)}
                  className="flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 font-semibold text-white transition hover:bg-white/10"
                >
                  {saved ? <Check size={19} className="text-brand" /> : <Plus size={19} />}
                  {saved ? 'En mi lista' : 'Mi lista'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats + synopsis */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-3 text-xl font-bold">Sinopsis</h2>
            <p className="max-w-3xl leading-relaxed text-white/70">
              {a.synopsis || 'Sinopsis no disponible.'}
            </p>

            {a.studios?.length ? (
              <p className="mt-4 text-sm text-white/50">
                <span className="text-white/70">Estudio:</span> {a.studios.join(', ')}
              </p>
            ) : null}
            {a.source ? (
              <p className="mt-1 text-sm text-white/50">
                <span className="text-white/70">Fuente:</span> {a.source}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 self-start">
            <Stat icon={<Tv2 size={14} />} label="Tipo" value={a.type} />
            <Stat icon={<Film size={14} />} label="Episodios" value={a.episodes} />
            <Stat icon={<Calendar size={14} />} label="Año" value={a.year} />
            <Stat icon={<Clock size={14} />} label="Duración" value={a.duration} />
            <Stat icon={<Trophy size={14} />} label="Popularidad" value={a.popularity ? `#${a.popularity}` : null} />
            <Stat icon={<Users size={14} />} label="Miembros" value={a.members ? a.members.toLocaleString() : null} />
          </div>
        </div>

        {/* Characters */}
        {!chars.loading && chars.data?.length ? (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Personajes</h2>
            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
              {chars.data.map((c) => (
                <div key={c.id} className="w-28 shrink-0 text-center">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="aspect-[3/4] w-full rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <p className="mt-2 line-clamp-1 text-sm font-semibold">{c.name}</p>
                  {c.va && <p className="line-clamp-1 text-xs text-white/40">{c.va}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Recommendations */}
      {!recs.loading && recs.data?.length ? (
        <div className="mt-6">
          <Row
            title="Recomendados si te gustó esto"
            icon={<Star className="fill-brand text-brand" size={20} />}
            items={recs.data}
            loading={false}
          />
        </div>
      ) : null}

      <div className="h-8" />
    </div>
  )
}

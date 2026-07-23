import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Star, Plus, Check } from 'lucide-react'
import { useMyList } from '../context/MyList.jsx'

export default function AnimeCard({ anime, index = 0, progress, resumeEp }) {
  const { has, toggle } = useMyList()
  const saved = has(anime.id)
  const hasProgress = typeof progress === 'number' && progress > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative w-[150px] shrink-0 sm:w-[170px]"
    >
      <Link to={hasProgress ? `/watch/${anime.id}` : `/anime/${anime.id}`} className="block">
        <div className="card-shine relative aspect-[2/3] overflow-hidden rounded-xl bg-panel2 ring-1 ring-white/5 transition-all duration-300 group-hover:ring-brand/60 group-hover:brand-glow">
          <img
            src={anime.image}
            alt={anime.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Score badge */}
          {anime.score ? (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-brand2 backdrop-blur">
              <Star size={11} className="fill-brand2 text-brand2" />
              {anime.score.toFixed(1)}
            </div>
          ) : null}

          {/* Type tag */}
          {anime.type ? (
            <div className="absolute right-2 top-2 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur">
              {anime.type}
            </div>
          ) : null}

          {/* Progress bar (continue watching) */}
          {hasProgress && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
              <div className="h-full brand-gradient" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
            </div>
          )}

          {/* Hover controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <span className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg brand-gradient text-sm font-bold text-black">
              <Play size={15} className="fill-black" /> {hasProgress ? 'Seguir' : 'Ver'}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault()
                toggle(anime)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
              aria-label={saved ? 'Quitar de mi lista' : 'Añadir a mi lista'}
            >
              {saved ? <Check size={16} /> : <Plus size={16} />}
            </button>
          </div>
        </div>

        <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-white/90 transition-colors group-hover:text-brand2">
          {anime.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-white/40">
          {hasProgress && resumeEp
            ? `Episodio ${resumeEp} • ${Math.round(progress * 100)}%`
            : [anime.year, anime.episodes ? `${anime.episodes} eps` : anime.type]
                .filter(Boolean)
                .join(' • ')}
        </p>
      </Link>
    </motion.div>
  )
}

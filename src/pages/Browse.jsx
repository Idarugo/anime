import { useParams } from 'react-router-dom'
import { Flame, TrendingUp, CalendarClock, Clapperboard } from 'lucide-react'
import Grid from '../components/Grid.jsx'
import { api } from '../api/jikan.js'
import { useFetch } from '../hooks/useFetch.js'

const CONFIG = {
  airing: { title: 'En emisión ahora', icon: Flame, fn: () => api.topAiring() },
  popular: { title: 'Más populares', icon: TrendingUp, fn: () => api.topPopular() },
  season: { title: 'Temporada actual', icon: CalendarClock, fn: () => api.seasonNow() },
  movies: { title: 'Películas', icon: Clapperboard, fn: () => api.movies() },
}

export default function Browse() {
  const { category } = useParams()
  const cfg = CONFIG[category] || CONFIG.popular
  const { data, loading } = useFetch(() => cfg.fn(), [category])
  const Icon = cfg.icon

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-black">
          <Icon size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">{cfg.title}</h1>
          <p className="text-sm text-white/50">
            {loading ? 'Cargando...' : `${data?.length || 0} títulos`}
          </p>
        </div>
      </div>
      <Grid items={data} loading={loading} />
    </div>
  )
}

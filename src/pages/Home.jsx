import { Flame, TrendingUp, Sparkles, Clapperboard, Heart, CalendarClock, History } from 'lucide-react'
import HeroCarousel from '../components/HeroCarousel.jsx'
import Row from '../components/Row.jsx'
import AnimeCard from '../components/AnimeCard.jsx'
import { GENRES } from '../api/jikan.js'
import { api } from '../api/jikan.js'
import { useFetch } from '../hooks/useFetch.js'
import { useWatchProgress } from '../context/WatchProgress.jsx'
import ErrorState from '../components/ErrorState.jsx'
import { Link } from 'react-router-dom'

export default function Home() {
  const airing = useFetch(() => api.topAiring(), [])
  const popular = useFetch(() => api.topPopular(), [])
  const season = useFetch(() => api.seasonNow(), [])
  const favorites = useFetch(() => api.topFavorites(), [])
  const movies = useFetch(() => api.movies(), [])
  const upcoming = useFetch(() => api.upcoming(), [])
  const { continueList } = useWatchProgress()

  // If the primary feed fails (e.g. Jikan outage), show a recoverable error.
  if (airing.error && !airing.data) {
    return (
      <div className="pt-24">
        <ErrorState onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div>
      <HeroCarousel items={airing.data || []} />

      <div className="relative z-10 -mt-8 space-y-2 pb-8">
        {continueList.length > 0 && (
          <section className="py-4">
            <div className="mb-3 flex items-center gap-2 px-4 sm:px-8">
              <History className="text-brand" size={22} />
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Continuar viendo</h2>
            </div>
            <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 sm:px-8">
              {continueList.map((a, i) => (
                <div key={a.id}>
                  <AnimeCard anime={a} index={i} progress={a.progress} resumeEp={a.ep} />
                </div>
              ))}
            </div>
          </section>
        )}

        <Row
          title="En emisión ahora"
          icon={<Flame className="text-brand" size={22} />}
          items={airing.data}
          loading={airing.loading}
        />
        <Row
          title="Temporada actual"
          icon={<CalendarClock className="text-grape" size={22} />}
          items={season.data}
          loading={season.loading}
        />
        <Row
          title="Más populares"
          icon={<TrendingUp className="text-brand" size={22} />}
          items={popular.data}
          loading={popular.loading}
        />

        {/* Genre pills */}
        <div className="px-4 py-6 sm:px-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Sparkles className="text-brand2" size={22} /> Explora por género
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {GENRES.map((g) => (
              <Link
                key={g.id}
                to={`/genre/${g.id}?name=${encodeURIComponent(g.name)}`}
                className="rounded-full border border-white/10 bg-panel px-4 py-2 text-sm font-medium text-white/80 transition-all hover:border-brand/60 hover:bg-brand hover:text-black"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>

        <Row
          title="Favoritos de la comunidad"
          icon={<Heart className="fill-brand text-brand" size={22} />}
          items={favorites.data}
          loading={favorites.loading}
        />
        <Row
          title="Películas destacadas"
          icon={<Clapperboard className="text-grape" size={22} />}
          items={movies.data}
          loading={movies.loading}
        />
        <Row
          title="Próximamente"
          icon={<CalendarClock className="text-brand" size={22} />}
          items={upcoming.data}
          loading={upcoming.loading}
        />
      </div>
    </div>
  )
}

import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Tag } from 'lucide-react'
import Grid from '../components/Grid.jsx'
import { api, GENRES } from '../api/jikan.js'
import { useFetch } from '../hooks/useFetch.js'

export default function Genre() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const name = params.get('name') || GENRES.find((g) => g.id === Number(id))?.name || 'Género'
  const { data, loading } = useFetch(() => api.byGenre(id), [id])

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-black">
          <Tag size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">{name}</h1>
          <p className="text-sm text-white/50">
            {loading ? 'Cargando...' : `${data?.length || 0} títulos`}
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <Link
            key={g.id}
            to={`/genre/${g.id}?name=${encodeURIComponent(g.name)}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              String(g.id) === String(id)
                ? 'border-brand bg-brand text-black'
                : 'border-white/10 bg-panel text-white/70 hover:border-brand/50 hover:text-white'
            }`}
          >
            {g.name}
          </Link>
        ))}
      </div>

      <Grid items={data} loading={loading} />
    </div>
  )
}

import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SearchX } from 'lucide-react'
import Grid from '../components/Grid.jsx'
import { api } from '../api/jikan.js'
import { useFetch } from '../hooks/useFetch.js'

export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const { data, loading } = useFetch(() => api.search(q), [q])
  const items = data?.items || []

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8">
      <div className="mb-8 flex items-center gap-3">
        <SearchIcon className="text-brand" size={26} />
        <h1 className="text-2xl font-black sm:text-3xl">
          Resultados para “<span className="text-brand">{q}</span>”
        </h1>
      </div>

      {!loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <SearchX size={56} className="mb-4 text-white/20" />
          <p className="text-lg font-semibold text-white/70">Sin resultados</p>
          <p className="mt-1 text-sm text-white/40">
            Prueba con otro título o revisa la ortografía.
          </p>
        </div>
      ) : (
        <Grid items={items} loading={loading} />
      )}
    </div>
  )
}

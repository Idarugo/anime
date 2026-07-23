import { Link } from 'react-router-dom'
import { Bookmark, BookmarkX } from 'lucide-react'
import AnimeCard from '../components/AnimeCard.jsx'
import { useMyList } from '../context/MyList.jsx'

export default function MyList() {
  const { list } = useMyList()

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-black">
          <Bookmark size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Mi Lista</h1>
          <p className="text-sm text-white/50">{list.length} títulos guardados</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookmarkX size={56} className="mb-4 text-white/20" />
          <p className="text-lg font-semibold text-white/70">Tu lista está vacía</p>
          <p className="mt-1 text-sm text-white/40">
            Añade animes con el botón <span className="text-brand">+</span> para verlos aquí.
          </p>
          <Link
            to="/"
            className="mt-6 rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-black"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((a, i) => (
            <AnimeCard key={a.id} anime={a} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

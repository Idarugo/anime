import AnimeCard from './AnimeCard.jsx'
import { CardSkeleton } from './Skeleton.jsx'

export default function Grid({ items, loading, skeletonCount = 18 }) {
  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="w-[150px] sm:w-[170px]">
              <CardSkeleton />
            </div>
          ))
        : items?.map((a, i) => <AnimeCard key={a.id} anime={a} index={i} />)}
    </div>
  )
}

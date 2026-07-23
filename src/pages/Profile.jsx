import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Clock, Film, Flame, TrendingUp, Trophy, Sparkles } from 'lucide-react'
import { useMyList } from '../context/MyList.jsx'
import { useWatchProgress } from '../context/WatchProgress.jsx'
import DonutChart from '../components/DonutChart.jsx'
import AnimeCard from '../components/AnimeCard.jsx'

const PALETTE = ['#f47521', '#ff9a3d', '#7c5cff', '#38bdf8', '#34d399', '#f472b6', '#facc15']

function StatCard({ icon, label, value, sub, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      className="rounded-2xl border border-white/5 bg-panel p-5"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
        {icon}
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-sm font-medium text-white/70">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-white/40">{sub}</p>}
    </motion.div>
  )
}

export default function Profile() {
  const { list } = useMyList()
  const { continueList, map } = useWatchProgress()

  // Genre distribution from saved list.
  const genreCount = {}
  list.forEach((a) => (a.genres || []).forEach((g) => {
    genreCount[g.name] = (genreCount[g.name] || 0) + 1
  }))
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))

  const watched = Object.values(map)
  const epsWatched = watched.reduce((s, x) => s + (x.ep || 0), 0)
  // ~24 min per episode estimate.
  const hours = Math.round((epsWatched * 24) / 60)
  const avgScore = list.length
    ? (list.reduce((s, a) => s + (a.score || 0), 0) / list.filter((a) => a.score).length || 0)
    : 0

  const empty = list.length === 0 && watched.length === 0

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient text-2xl font-black text-black">
          A
        </div>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">Tu perfil</h1>
          <p className="text-sm text-white/50">Otaku nivel {Math.max(1, Math.floor(epsWatched / 5) + list.length)}</p>
        </div>
      </div>

      {empty ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Sparkles size={54} className="mb-4 text-white/20" />
          <p className="text-lg font-semibold text-white/70">Aún no hay estadísticas</p>
          <p className="mt-1 text-sm text-white/40">Guarda animes y empieza a ver para llenar tu perfil.</p>
          <Link to="/" className="mt-6 rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-black">Explorar</Link>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard i={0} icon={<Bookmark size={20} />} label="En tu lista" value={list.length} />
            <StatCard i={1} icon={<Film size={20} />} label="Episodios vistos" value={epsWatched} sub="entre todas las series" />
            <StatCard i={2} icon={<Clock size={20} />} label="Horas (aprox.)" value={`${hours}h`} sub="~24 min/episodio" />
            <StatCard i={3} icon={<Trophy size={20} />} label="Nota media" value={avgScore ? avgScore.toFixed(1) : '—'} sub="de tu lista" />
          </div>

          {/* Genres donut */}
          {topGenres.length > 0 && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-panel p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
                  <TrendingUp size={18} className="text-brand" /> Tus géneros favoritos
                </h2>
                <DonutChart data={topGenres} />
              </div>

              <div className="rounded-2xl border border-white/5 bg-panel p-6">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
                  <Flame size={18} className="text-brand" /> Resumen
                </h2>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex justify-between border-b border-white/5 pb-3">
                    <span>Series en seguimiento</span>
                    <span className="font-bold text-white">{continueList.length}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-3">
                    <span>Género principal</span>
                    <span className="font-bold text-brand2">{topGenres[0]?.label || '—'}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-3">
                    <span>Títulos únicos vistos</span>
                    <span className="font-bold text-white">{watched.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Diversidad de géneros</span>
                    <span className="font-bold text-white">{Object.keys(genreCount).length} géneros</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Continue watching */}
          {continueList.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold">Continuar viendo</h2>
              <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {continueList.map((a, i) => (
                  <AnimeCard key={a.id} anime={a} index={i} progress={a.progress} resumeEp={a.ep} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Star, Play, ListVideo, Info, Volume2, Youtube, MonitorPlay } from 'lucide-react'
import { api } from '../api/jikan.js'
import { useFetch } from '../hooks/useFetch.js'
import { Skeleton } from '../components/Skeleton.jsx'
import VideoPlayer from '../components/VideoPlayer.jsx'
import { useWatchProgress } from '../context/WatchProgress.jsx'

// Royalty-free / Creative Commons demo clips used as stand-in "episodes" so
// the custom player has something real to stream (verified reachable + CORS-ok).
const DEMO_CLIPS = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
]

export default function Watch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: a, loading } = useFetch(() => api.detail(id), [id])
  const { get, save } = useWatchProgress()
  const [ep, setEp] = useState(1)
  const [mode, setMode] = useState('player') // 'player' | 'trailer'

  const saved = get(id)

  // Resume last watched episode when the detail loads.
  useEffect(() => {
    if (a && saved?.ep) setEp(saved.ep)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a?.id])

  const episodes = useMemo(() => {
    const n = a?.episodes && a.episodes > 0 ? Math.min(a.episodes, 120) : 12
    return Array.from({ length: n }, (_, i) => i + 1)
  }, [a])

  if (loading || !a) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 pt-20 sm:px-8">
        <Skeleton className="aspect-video w-full" />
      </div>
    )
  }

  const clip = DEMO_CLIPS[(Number(id) + ep) % DEMO_CLIPS.length]
  const startAt = saved && saved.ep === ep ? saved.position || 0 : 0

  const goToEp = (n) => {
    setEp(n)
    setMode('player')
    save(a, { ep: n, progress: 0, position: 0 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasNext = ep < episodes.length

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8">
        <Link
          to={`/anime/${a.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-brand"
        >
          <ChevronLeft size={16} /> Volver a detalles
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Player */}
          <div>
            {mode === 'player' ? (
              <VideoPlayer
                key={`${id}-${ep}`}
                src={clip}
                poster={a.trailerImage || a.image}
                title={`${a.title} — Episodio ${ep}`}
                startAt={startAt}
                onProgress={(p) => save(a, { ep, ...p })}
                onEnded={() => { save(a, { ep, progress: 1, position: 0 }); if (hasNext) goToEp(ep + 1) }}
                onNext={hasNext ? () => goToEp(ep + 1) : undefined}
              />
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-panel2 ring-1 ring-white/10">
                {a.trailer ? (
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${a.trailer}?rel=0&modestbranding=1`}
                    title={`${a.title} tráiler`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="grid h-full place-items-center text-white/50">Tráiler no disponible.</div>
                )}
              </div>
            )}

            {/* Mode toggle */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setMode('player')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === 'player' ? 'brand-gradient text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <MonitorPlay size={16} /> Reproductor
              </button>
              <button
                onClick={() => setMode('trailer')}
                disabled={!a.trailer}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                  mode === 'trailer' ? 'brand-gradient text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Youtube size={16} /> Tráiler oficial
              </button>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-black sm:text-3xl">{a.title}</h1>
              <p className="mt-1 text-sm text-white/50">
                Episodio {ep}
                {a.episodes ? ` de ${a.episodes}` : ''} · {a.type}
                {a.score ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-brand2">
                    <Star size={12} className="fill-brand2" /> {a.score}
                  </span>
                ) : null}
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand/20 bg-brand/5 p-3 text-sm text-white/70">
              <Info size={16} className="mt-0.5 shrink-0 text-brand" />
              <p>
                Demo educativa: el reproductor usa clips libres de derechos como
                marcador de posición y el tráiler oficial vía YouTube. AniBox no
                aloja ni transmite episodios con derechos de autor. Atajos:
                <b> espacio</b> play, <b>←/→</b> ±10s, <b>F</b> pantalla completa,
                <b> M</b> silencio.
              </p>
            </div>

            <p className="mt-4 line-clamp-4 max-w-3xl text-sm leading-relaxed text-white/60">
              {a.synopsis}
            </p>
          </div>

          {/* Episode list */}
          <aside className="rounded-2xl border border-white/5 bg-panel/60">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <ListVideo size={18} className="text-brand" />
              <h2 className="font-bold">Episodios</h2>
              <span className="ml-auto text-xs text-white/40">{episodes.length}</span>
            </div>
            <div className="no-scrollbar max-h-[560px] overflow-y-auto p-2">
              {episodes.map((n) => (
                <button
                  key={n}
                  onClick={() => goToEp(n)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    ep === n ? 'bg-brand/15 ring-1 ring-brand/40' : 'hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      ep === n ? 'brand-gradient text-black' : 'bg-white/5 text-white/70'
                    }`}
                  >
                    {ep === n ? <Volume2 size={15} /> : n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${ep === n ? 'text-brand2' : ''}`}>
                      Episodio {n}
                    </p>
                    <p className="truncate text-xs text-white/40">{a.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

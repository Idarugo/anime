import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, RotateCw, SkipForward, Loader2, Settings,
} from 'lucide-react'

const fmt = (s) => {
  if (!s || Number.isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// A fully custom HTML5 video player: keyboard shortcuts, seek, volume,
// buffering, playback speed, fullscreen, and progress callbacks.
export default function VideoPlayer({
  src, poster, title, startAt = 0, onProgress, onEnded, onNext,
}) {
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [buffering, setBuffering] = useState(false)
  const [fs, setFs] = useState(false)
  const [ui, setUi] = useState(true)
  const [rate, setRate] = useState(1)
  const [showRate, setShowRate] = useState(false)
  const hideTimer = useRef(null)
  const lastSave = useRef(0)

  const showUi = useCallback(() => {
    setUi(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setUi(false)
    }, 2600)
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }, [])

  const seek = useCallback((t) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(Math.max(t, 0), v.duration || 0)
    showUi()
  }, [showUi])

  const toggleFs = useCallback(() => {
    const el = wrapRef.current
    if (!document.fullscreenElement) el?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      const v = videoRef.current
      if (!v) return
      switch (e.key.toLowerCase()) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break
        case 'arrowright': seek(v.currentTime + 10); break
        case 'arrowleft': seek(v.currentTime - 10); break
        case 'arrowup': e.preventDefault(); setVolume((x) => Math.min(1, x + 0.1)); break
        case 'arrowdown': e.preventDefault(); setVolume((x) => Math.max(0, x - 0.1)); break
        case 'f': toggleFs(); break
        case 'm': setMuted((m) => !m); break
        default: break
      }
      showUi()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, seek, toggleFs, showUi])

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (v) {
      v.volume = volume
      v.muted = muted
    }
  }, [volume, muted])

  useEffect(() => {
    const v = videoRef.current
    if (v) v.playbackRate = rate
  }, [rate])

  // Apply resume position once metadata is ready.
  const onLoaded = () => {
    const v = videoRef.current
    setDur(v.duration)
    if (startAt > 0 && startAt < v.duration - 5) v.currentTime = startAt
  }

  const onTime = () => {
    const v = videoRef.current
    if (!v) return
    setCur(v.currentTime)
    if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1))
    // Throttle progress persistence to ~every 3s.
    const now = Date.now()
    if (onProgress && now - lastSave.current > 3000 && v.duration) {
      lastSave.current = now
      onProgress({ position: v.currentTime, duration: v.duration, progress: v.currentTime / v.duration })
    }
  }

  const pct = dur ? (cur / dur) * 100 : 0
  const bufPct = dur ? (buffered / dur) * 100 : 0

  return (
    <div
      ref={wrapRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 select-none"
      onMouseMove={showUi}
      onMouseLeave={() => playing && setUi(false)}
      onClick={(e) => { if (e.target === videoRef.current) togglePlay() }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full"
        playsInline
        onLoadedMetadata={onLoaded}
        onTimeUpdate={onTime}
        onPlay={() => { setPlaying(true); showUi() }}
        onPause={() => { setPlaying(false); setUi(true) }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={() => { setPlaying(false); onEnded?.() }}
      />

      {/* Buffering spinner */}
      {buffering && (
        <div className="absolute inset-0 grid place-items-center">
          <Loader2 className="animate-spin text-brand" size={44} />
        </div>
      )}

      {/* Center play button when paused */}
      {!playing && !buffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 grid place-items-center bg-black/20"
          aria-label="Reproducir"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full brand-gradient brand-glow transition-transform hover:scale-110">
            <Play size={34} className="ml-1 fill-black text-black" />
          </span>
        </button>
      )}

      {/* Controls */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-3 pt-16 transition-opacity duration-300 sm:px-5 ${
          ui ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {title && (
          <p className="mb-2 line-clamp-1 px-1 text-sm font-semibold text-white/90 drop-shadow">
            {title}
          </p>
        )}

        {/* Seek bar */}
        <div
          className="group/seek relative h-1.5 w-full cursor-pointer rounded-full bg-white/20"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            seek(((e.clientX - r.left) / r.width) * dur)
          }}
        >
          <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: `${bufPct}%` }} />
          <div className="absolute inset-y-0 left-0 rounded-full brand-gradient" style={{ width: `${pct}%` }} />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand opacity-0 shadow transition-opacity group-hover/seek:opacity-100"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Buttons row */}
        <div className="mt-2 flex items-center gap-2 sm:gap-3">
          <button onClick={togglePlay} className="text-white transition hover:text-brand" aria-label="Play/Pausa">
            {playing ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current" />}
          </button>
          <button onClick={() => seek(cur - 10)} className="hidden text-white transition hover:text-brand sm:block" aria-label="Retroceder 10s">
            <RotateCcw size={19} />
          </button>
          <button onClick={() => seek(cur + 10)} className="hidden text-white transition hover:text-brand sm:block" aria-label="Adelantar 10s">
            <RotateCw size={19} />
          </button>
          {onNext && (
            <button onClick={onNext} className="text-white transition hover:text-brand" aria-label="Siguiente episodio">
              <SkipForward size={20} className="fill-current" />
            </button>
          )}

          {/* Volume */}
          <div className="group/vol flex items-center gap-1">
            <button onClick={() => setMuted((m) => !m)} className="text-white transition hover:text-brand" aria-label="Silenciar">
              {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false) }}
              className="h-1 w-0 cursor-pointer accent-brand transition-all duration-300 group-hover/vol:w-16"
              aria-label="Volumen"
            />
          </div>

          <span className="ml-1 text-xs font-medium tabular-nums text-white/80">
            {fmt(cur)} <span className="text-white/40">/ {fmt(dur)}</span>
          </span>

          <div className="flex-1" />

          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setShowRate((s) => !s)}
              className="flex items-center gap-1 text-xs font-semibold text-white transition hover:text-brand"
              aria-label="Velocidad"
            >
              <Settings size={17} /> {rate}x
            </button>
            {showRate && (
              <div className="absolute bottom-8 right-0 flex flex-col gap-0.5 rounded-lg glass p-1 ring-1 ring-white/10">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRate(r); setShowRate(false) }}
                    className={`rounded px-3 py-1 text-xs ${r === rate ? 'bg-brand text-black' : 'text-white/80 hover:bg-white/10'}`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleFs} className="text-white transition hover:text-brand" aria-label="Pantalla completa">
            {fs ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}

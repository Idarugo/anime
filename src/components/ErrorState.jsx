import { CloudOff, RefreshCw } from 'lucide-react'

// Friendly fallback shown when the Jikan API is unreachable or errors out.
export default function ErrorState({ onRetry, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'py-24'}`}>
      <CloudOff size={compact ? 36 : 52} className="mb-4 text-white/25" />
      <p className="text-lg font-semibold text-white/70">No se pudieron cargar los datos</p>
      <p className="mt-1 max-w-sm text-sm text-white/40">
        La API de anime (Jikan) puede estar saturada o sin conexión. Vuelve a
        intentarlo en unos segundos.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
        >
          <RefreshCw size={16} /> Reintentar
        </button>
      )}
    </div>
  )
}

import { Tv, Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-panel/40">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-black">
                <Tv size={18} strokeWidth={2.5} />
              </span>
              <span className="text-xl font-extrabold">
                Ani<span className="text-brand">Box</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Proyecto demo de streaming de anime construido con React, Vite y
              Tailwind. Los datos provienen de la API pública de Jikan
              (MyAnimeList). No aloja ni distribuye contenido con derechos de
              autor.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="mb-3 font-semibold text-white">Explorar</h4>
              <ul className="space-y-2 text-white/50">
                <li>En emisión</li>
                <li>Popular</li>
                <li>Temporada actual</li>
                <li>Películas</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-white">Info</h4>
              <ul className="space-y-2 text-white/50">
                <li>Sobre el proyecto</li>
                <li>API: Jikan v4</li>
                <li>Términos</li>
                <li>Privacidad</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} AniBox — Demo educativo.</p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart size={13} className="fill-brand text-brand" /> y
            React <Github size={15} className="ml-1" />
          </p>
        </div>
      </div>
    </footer>
  )
}

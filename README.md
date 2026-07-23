# 📺 AniBox — Anime Streaming (demo)

Una app estilo **Crunchyroll / AnimeFLV** construida con React. Catálogo,
búsqueda, fichas detalladas, reproductor con tráiler y "Mi Lista" persistente.
Los datos son **reales**, servidos por la [API pública de Jikan](https://jikan.moe)
(MyAnimeList). No aloja ni distribuye contenido con derechos de autor.

## ✨ Características

- **Hero carousel** auto-rotativo con los animes en emisión.
- **Filas horizontales** por categoría: en emisión, temporada, populares,
  favoritos, películas y próximamente — con flechas y scroll-snap.
- **Command Palette (⌘K / Ctrl+K)** estilo Spotlight: búsqueda instantánea
  con _debounce_, navegación por teclado (↑↓/↵) y acciones rápidas.
- **Reproductor de vídeo propio** (HTML5): controles custom, barra de progreso
  con _buffer_, volumen, velocidad de reproducción, pantalla completa,
  _skip_ ±10 s, atajos de teclado (espacio, ←/→, F, M) y **guardado de
  posición** para reanudar.
- **Continuar viendo**: fila en el inicio y barras de progreso en las tarjetas,
  con reanudación del último episodio.
- **Explorar** con filtros avanzados (género, tipo, estado, orden, nota mínima)
  y **scroll infinito** (IntersectionObserver).
- **Sorpréndeme**: ruleta de descubrimiento aleatorio animada.
- **Mi Perfil**: dashboard con tarjetas de estadísticas y un **gráfico donut**
  (SVG propio, sin librerías) de tus géneros favoritos.
- **Explorar por género** (14 géneros de MAL) y **buscador** con página de
  resultados.
- **Ficha de detalle**: backdrop con efecto ken-burns, sinopsis, estadísticas,
  personajes con seiyū y recomendaciones + tráiler oficial (YouTube).
- **Mi Lista** guardada en `localStorage`.
- **Resiliencia total**: cliente API con caché, _rate-limit_, reintentos con
  _backoff_ ante 429/5xx y **circuit breaker**. Si Jikan está caído, la app
  degrada a un **catálogo local de respaldo** (87 títulos reales, snapshot de
  MAL) — inicio, búsqueda, filtros y detalle **siguen funcionando offline**.
- **Responsive** y **dark mode** nativo, animaciones con Framer Motion.

## 🛠️ Stack

| | |
|---|---|
| Framework | React 18 + React Router 6 |
| Build | Vite 5 |
| Estilos | Tailwind CSS v4 |
| Animación | Framer Motion |
| Iconos | lucide-react |
| Datos | Jikan API v4 (sin API key) |

## 🚀 Uso

```bash
npm install
npm run dev      # http://localhost:5177
npm run build    # build de producción en dist/
npm run preview  # sirve el build
```

## 📁 Estructura

Regenerar el catálogo de respaldo (snapshot de Jikan): `npm run build-fallback`.

```
src/
├── api/jikan.js              # cliente API: caché, rate-limit, reintentos, circuit-breaker
├── api/fallbackData.js       # snapshot offline (auto-generado, 87 títulos)
├── context/
│   ├── MyList.jsx            # estado global de "Mi Lista"
│   └── WatchProgress.jsx     # progreso de visionado + "continuar viendo"
├── hooks/useFetch.js         # hook async genérico
├── components/               # Navbar, Hero, Row, Card, Grid, Footer, Skeleton,
│                             # VideoPlayer, CommandPalette, DonutChart, ErrorState
└── pages/                    # Home, Browse, Genre, Search, Detail, Watch,
                              # MyList, Explore, Surprise, Profile
```

> Proyecto educativo. Toda la metadata e imágenes pertenecen a sus respectivos
> autores vía MyAnimeList.
# anime
# anime

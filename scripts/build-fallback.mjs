// One-off: snapshot real Jikan data into a static fallback catalog so the app
// always has rich content even when the live API is down. Run: node scripts/build-fallback.mjs
import { writeFileSync } from 'node:fs'

const BASE = 'https://api.jikan.moe/v4'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(path, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${BASE}${path}`)
      if (res.ok) return res.json()
      if (res.status === 429 || res.status >= 500) {
        await sleep(1500 * (i + 1))
        continue
      }
      throw new Error(`HTTP ${res.status}`)
    } catch (e) {
      await sleep(1500 * (i + 1))
    }
  }
  console.warn(`  ! giving up on ${path}`)
  return { data: [] }
}

function youtubeId(trailer) {
  if (!trailer) return null
  if (trailer.youtube_id) return trailer.youtube_id
  const m = (trailer.embed_url || trailer.url || '').match(/(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function norm(a) {
  if (!a || !a.mal_id) return null
  return {
    id: a.mal_id,
    title: a.title_english || a.title || a.title_japanese,
    titleJp: a.title_japanese || null,
    synopsis: a.synopsis || null,
    image: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url || a.images?.jpg?.image_url,
    imageSmall: a.images?.webp?.image_url || a.images?.jpg?.image_url,
    trailer: youtubeId(a.trailer),
    trailerImage: a.trailer?.images?.maximum_image_url || null,
    score: a.score || null,
    rank: a.rank || null,
    popularity: a.popularity || null,
    members: a.members || null,
    episodes: a.episodes || null,
    status: a.status || null,
    airing: !!a.airing,
    year: a.year || a.aired?.prop?.from?.year || null,
    season: a.season || null,
    rating: a.rating || null,
    duration: a.duration || null,
    type: a.type || null,
    source: a.source || null,
    studios: (a.studios || []).map((s) => s.name),
    genres: (a.genres || []).map((g) => ({ id: g.mal_id, name: g.name })),
    url: a.url || null,
  }
}

const ENDPOINTS = [
  '/top/anime?filter=bypopularity&limit=25',
  '/top/anime?filter=airing&limit=25',
  '/top/anime?filter=favorite&limit=25',
  '/seasons/now?limit=25',
  '/top/anime?type=movie&limit=25',
  '/top/anime?limit=25&page=2',
]

const byId = new Map()

for (const ep of ENDPOINTS) {
  process.stdout.write(`Fetching ${ep} ... `)
  const json = await get(ep)
  const items = (json.data || []).map(norm).filter(Boolean)
  items.forEach((it) => { if (!byId.has(it.id)) byId.set(it.id, it) })
  console.log(`${items.length} items (total ${byId.size})`)
  await sleep(700)
}

const catalog = [...byId.values()].sort((a, b) => (b.members || 0) - (a.members || 0))

const out = `// AUTO-GENERATED snapshot of Jikan data (build-fallback.mjs).
// Used as an offline catalog so the app always shows real content when the
// live API is unreachable. Regenerate with: node scripts/build-fallback.mjs
export const FALLBACK_CATALOG = ${JSON.stringify(catalog, null, 0)}
`

writeFileSync(new URL('../src/api/fallbackData.js', import.meta.url), out)
console.log(`\nWrote ${catalog.length} anime to src/api/fallbackData.js`)

// Lightweight client for the Jikan API (unofficial MyAnimeList REST API).
// Free, no API key. Docs: https://docs.api.jikan.moe/
// We add an in-memory cache + a tiny request queue so we stay polite with
// Jikan's rate limits (~3 req/s, 60/min), plus an offline fallback catalog so
// the app keeps working when the live API is down.
import { FALLBACK_CATALOG } from './fallbackData.js'

const BASE = 'https://api.jikan.moe/v4'

const cache = new Map()
const inflight = new Map()

// Serialize requests with a small gap to avoid hammering the API.
let chain = Promise.resolve()
const GAP = 380 // ms between network calls

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// Circuit breaker: after a few consecutive failures we assume the API is down
// and short-circuit straight to the offline fallback for a cooldown window,
// so the UI doesn't sit through retries on every request.
let consecutiveFailures = 0
let circuitOpenUntil = 0
const FAIL_THRESHOLD = 2
const COOLDOWN = 30000

function circuitOpen() {
  return Date.now() < circuitOpenUntil
}
function noteSuccess() {
  consecutiveFailures = 0
  circuitOpenUntil = 0
}
function noteFailure() {
  consecutiveFailures += 1
  if (consecutiveFailures >= FAIL_THRESHOLD) circuitOpenUntil = Date.now() + COOLDOWN
}

async function raw(path) {
  const url = `${BASE}${path}`
  const run = chain.then(async () => {
    // Retry on rate-limit (429) and transient server errors (5xx, e.g. Jikan
    // occasionally returns 504 under load) with exponential backoff.
    const MAX = 3
    let lastErr
    for (let attempt = 0; attempt < MAX; attempt++) {
      try {
        const res = await fetch(url)
        await sleep(GAP)
        if (res.ok) return res.json()
        if (res.status === 429 || res.status >= 500) {
          lastErr = new Error(`Jikan ${res.status}`)
          await sleep(600 * 2 ** attempt + 200) // ~0.8s, 1.4s, 2.6s
          continue
        }
        throw new Error(`Jikan ${res.status}`)
      } catch (err) {
        lastErr = err
        await sleep(600 * 2 ** attempt + 200)
      }
    }
    throw lastErr || new Error('Jikan request failed')
  })
  chain = run.catch(() => {}) // keep the chain alive even on error
  return run
}

export async function get(path) {
  if (cache.has(path)) return cache.get(path)
  // If the circuit is open, fail fast so callers fall back instantly.
  if (circuitOpen()) return Promise.reject(new Error('circuit-open'))
  if (inflight.has(path)) return inflight.get(path)

  const p = raw(path)
    .then((data) => {
      noteSuccess()
      cache.set(path, data)
      inflight.delete(path)
      return data
    })
    .catch((err) => {
      noteFailure()
      inflight.delete(path)
      throw err
    })

  inflight.set(path, p)
  return p
}

// ---- Normalizers -----------------------------------------------------------

// Jikan sometimes leaves trailer.youtube_id null while embed_url still carries
// the id — pull it out of whichever field has it.
function youtubeId(trailer) {
  if (!trailer) return null
  if (trailer.youtube_id) return trailer.youtube_id
  const src = trailer.embed_url || trailer.url || ''
  const m = src.match(/(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export function normAnime(a) {
  if (!a) return null
  return {
    id: a.mal_id,
    title: a.title_english || a.title || a.title_japanese,
    titleJp: a.title_japanese,
    synopsis: a.synopsis,
    image:
      a.images?.webp?.large_image_url ||
      a.images?.jpg?.large_image_url ||
      a.images?.jpg?.image_url,
    imageSmall: a.images?.webp?.image_url || a.images?.jpg?.image_url,
    trailer: youtubeId(a.trailer),
    trailerImage: a.trailer?.images?.maximum_image_url || null,
    score: a.score,
    rank: a.rank,
    popularity: a.popularity,
    members: a.members,
    episodes: a.episodes,
    status: a.status,
    airing: a.airing,
    year: a.year || a.aired?.prop?.from?.year,
    season: a.season,
    rating: a.rating,
    duration: a.duration,
    type: a.type,
    source: a.source,
    studios: (a.studios || []).map((s) => s.name),
    genres: (a.genres || []).map((g) => ({ id: g.mal_id, name: g.name })),
    url: a.url,
  }
}

const normList = (data) => (data?.data || []).map(normAnime).filter(Boolean)

// De-dupe by id (Jikan sometimes repeats entries across pages).
function uniq(list) {
  const seen = new Set()
  return list.filter((x) => {
    if (seen.has(x.id)) return false
    seen.add(x.id)
    return true
  })
}

// ---- Offline fallback ------------------------------------------------------
// A baked snapshot of real Jikan data (src/api/fallbackData.js) so every screen
// still shows real content when the live API is unreachable. Any endpoint that
// fails — or returns nothing — degrades to filtering this local catalog.

const CAT = FALLBACK_CATALOG
const byMembers = (a, b) => (b.members || 0) - (a.members || 0)
const byScore = (a, b) => (b.score || 0) - (a.score || 0)

// Run a live request; on error OR empty result, use the local fallback.
async function withFallback(run, fallback) {
  try {
    const res = await run()
    const arr = Array.isArray(res) ? res : res?.items
    if (arr && arr.length) return res
    return fallback()
  } catch {
    return fallback()
  }
}

const fb = {
  popular: () => [...CAT].sort(byMembers).slice(0, 24),
  airing: () => CAT.filter((a) => a.airing).sort(byMembers).slice(0, 20),
  favorites: () => [...CAT].sort(byScore).slice(0, 24),
  season: () => CAT.filter((a) => a.airing || a.season).sort(byMembers).slice(0, 24),
  movies: () => CAT.filter((a) => a.type === 'Movie').sort(byScore).slice(0, 24),
  upcoming: () => CAT.filter((a) => /Not yet aired/i.test(a.status || '')).slice(0, 20),
  byGenre: (gid) => CAT.filter((a) => a.genres.some((g) => String(g.id) === String(gid))).sort(byMembers).slice(0, 24),
  detail: (id) => CAT.find((a) => String(a.id) === String(id)) || null,
  recommendations: (id) => {
    const src = CAT.find((a) => String(a.id) === String(id))
    if (!src) return [...CAT].sort(byScore).slice(0, 12)
    const gset = new Set(src.genres.map((g) => g.id))
    return CAT.filter((a) => a.id !== src.id && a.genres.some((g) => gset.has(g.id)))
      .sort(byScore)
      .slice(0, 12)
  },
  search: (q) => {
    const s = (q || '').toLowerCase().trim()
    return CAT.filter(
      (a) => a.title?.toLowerCase().includes(s) || a.titleJp?.toLowerCase().includes(s),
    ).sort(byMembers)
  },
  explore: ({ q, genre, type, status, orderBy = 'members', minScore, page = 1 }) => {
    let list = [...CAT]
    if (q) list = fb.search(q)
    if (genre) list = list.filter((a) => a.genres.some((g) => String(g.id) === String(genre)))
    if (type) list = list.filter((a) => (a.type || '').toLowerCase() === type.toLowerCase())
    if (status === 'airing') list = list.filter((a) => a.airing)
    if (status === 'complete') list = list.filter((a) => /Finished/i.test(a.status || ''))
    if (status === 'upcoming') list = list.filter((a) => /Not yet aired/i.test(a.status || ''))
    if (minScore) list = list.filter((a) => (a.score || 0) >= Number(minScore))
    const sorters = {
      members: byMembers,
      score: byScore,
      start_date: (a, b) => (b.year || 0) - (a.year || 0),
      title: (a, b) => (a.title || '').localeCompare(b.title || ''),
    }
    list.sort(sorters[orderBy] || byMembers)
    const per = 24
    const start = (page - 1) * per
    return { items: list.slice(start, start + per), hasNext: list.length > start + per }
  },
}

// ---- Endpoints -------------------------------------------------------------

export const api = {
  topAiring: () => withFallback(() => get('/top/anime?filter=airing&limit=20').then(normList).then(uniq), fb.airing),
  topPopular: () => withFallback(() => get('/top/anime?filter=bypopularity&limit=24').then(normList).then(uniq), fb.popular),
  topFavorites: () => withFallback(() => get('/top/anime?filter=favorite&limit=24').then(normList).then(uniq), fb.favorites),
  upcoming: () => withFallback(() => get('/top/anime?filter=upcoming&limit=20').then(normList).then(uniq), fb.upcoming),
  seasonNow: () => withFallback(() => get('/seasons/now?limit=24').then(normList).then(uniq), fb.season),
  movies: () => withFallback(() => get('/top/anime?type=movie&limit=24').then(normList).then(uniq), fb.movies),
  byGenre: (genreId) =>
    withFallback(
      () => get(`/anime?genres=${genreId}&order_by=members&sort=desc&limit=24&sfw`).then(normList).then(uniq),
      () => fb.byGenre(genreId),
    ),
  search: (q, page = 1) =>
    withFallback(
      () =>
        get(`/anime?q=${encodeURIComponent(q)}&order_by=members&sort=desc&limit=24&page=${page}&sfw`).then((d) => ({
          items: uniq(normList(d)),
          pagination: d?.pagination,
        })),
      () => ({ items: fb.search(q), pagination: null }),
    ),
  explore: (opts = {}) => {
    const { q, genre, type, status, orderBy = 'members', sort = 'desc', minScore, page = 1 } = opts
    const p = new URLSearchParams({ limit: '24', page: String(page), order_by: orderBy, sort, sfw: 'true' })
    if (q) p.set('q', q)
    if (genre) p.set('genres', String(genre))
    if (type) p.set('type', type)
    if (status) p.set('status', status)
    if (minScore) p.set('min_score', String(minScore))
    return withFallback(
      () =>
        get(`/anime?${p.toString()}`).then((d) => ({
          items: uniq(normList(d)),
          hasNext: !!d?.pagination?.has_next_page,
        })),
      () => fb.explore(opts),
    )
  },
  detail: (id) =>
    withFallback(
      () => get(`/anime/${id}/full`).then((d) => normAnime(d?.data)).then((a) => (a ? [a] : [])),
      () => {
        const a = fb.detail(id)
        return a ? [a] : []
      },
    ).then((arr) => arr[0] || null),
  characters: (id) =>
    get(`/anime/${id}/characters`)
      .then((d) =>
        (d?.data || []).slice(0, 12).map((c) => ({
          id: c.character?.mal_id,
          name: c.character?.name,
          image: c.character?.images?.webp?.image_url || c.character?.images?.jpg?.image_url,
          role: c.role,
          va: c.voice_actors?.find((v) => v.language === 'Japanese')?.person?.name,
        })),
      )
      .catch(() => []),
  recommendations: (id) =>
    withFallback(
      () =>
        get(`/anime/${id}/recommendations`).then((d) =>
          uniq((d?.data || []).slice(0, 12).map((r) => normAnime(r.entry)).filter(Boolean)),
        ),
      () => fb.recommendations(id),
    ),
}

// Curated genre shortcuts (MAL genre ids).
export const GENRES = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 14, name: 'Horror' },
  { id: 7, name: 'Mystery' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 30, name: 'Sports' },
  { id: 37, name: 'Supernatural' },
  { id: 41, name: 'Thriller' },
  { id: 40, name: 'Psychological' },
]

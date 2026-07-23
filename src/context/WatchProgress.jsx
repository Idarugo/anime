import { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext(null)
const KEY = 'anibox:progress'

export function WatchProgressProvider({ children }) {
  const [map, setMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(map))
  }, [map])

  // Save/update progress for an anime. `progress` is 0..1.
  const save = (anime, { ep = 1, progress = 0, position = 0, duration = 0 }) => {
    setMap((prev) => ({
      ...prev,
      [anime.id]: {
        id: anime.id,
        title: anime.title,
        image: anime.image,
        imageSmall: anime.imageSmall,
        episodes: anime.episodes,
        type: anime.type,
        ep,
        progress: Math.max(prev[anime.id]?.progress || 0, progress),
        position,
        duration,
        updatedAt: Date.now(),
      },
    }))
  }

  const get = (id) => map[id] || null

  const remove = (id) =>
    setMap((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })

  // Most recently watched first, and not yet finished.
  const continueList = Object.values(map)
    .filter((x) => x.progress < 0.97)
    .sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <Ctx.Provider value={{ map, save, get, remove, continueList }}>
      {children}
    </Ctx.Provider>
  )
}

export const useWatchProgress = () => useContext(Ctx)

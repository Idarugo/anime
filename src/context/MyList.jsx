import { createContext, useContext, useEffect, useState } from 'react'

const MyListContext = createContext(null)
const KEY = 'anibox:mylist'

export function MyListProvider({ children }) {
  const [list, setList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(list))
  }, [list])

  const toggle = (anime) => {
    setList((prev) => {
      if (prev.some((x) => x.id === anime.id)) {
        return prev.filter((x) => x.id !== anime.id)
      }
      return [
        {
          id: anime.id,
          title: anime.title,
          image: anime.image,
          imageSmall: anime.imageSmall,
          score: anime.score,
          year: anime.year,
          episodes: anime.episodes,
          type: anime.type,
          genres: anime.genres || [],
        },
        ...prev,
      ]
    })
  }

  const has = (id) => list.some((x) => x.id === id)

  return (
    <MyListContext.Provider value={{ list, toggle, has }}>
      {children}
    </MyListContext.Provider>
  )
}

export const useMyList = () => useContext(MyListContext)

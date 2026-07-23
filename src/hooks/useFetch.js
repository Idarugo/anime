import { useEffect, useRef, useState } from 'react'

// Generic async hook. `fn` should return a promise. `deps` re-triggers it.
export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    Promise.resolve()
      .then(() => fnRef.current())
      .then((res) => {
        if (alive) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (alive) {
          setError(err)
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}

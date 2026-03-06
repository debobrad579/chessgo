import { useCallback, useState } from "react"

const cache = new Map<string, unknown>()
const pending = new Map<string, Promise<void>>()

export function useFetch<T = unknown>(
  url: string,
): { data: T; refetch: () => void } {
  const [, rerender] = useState(0)

  const load = useCallback(() => {
    cache.delete(url)
    pending.delete(url)
    rerender((n) => n + 1)
  }, [url])

  if (cache.has(url)) {
    return { data: cache.get(url) as T, refetch: load }
  }

  if (!pending.has(url)) {
    pending.set(
      url,
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          return res.json()
        })
        .then((data) => {
          cache.set(url, data)
          pending.delete(url)
        }),
    )
  }

  throw pending.get(url)
}

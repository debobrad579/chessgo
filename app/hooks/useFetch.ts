import { useCallback, useState } from "react"

const cache = new Map<string, unknown>()
const pending = new Map<string, Promise<void>>()
const errors = new Map<string, unknown>()

export function useFetch<T = unknown>(
  url: string,
): { data: T; refetch: () => void } {
  const [, rerender] = useState(0)

  const load = useCallback(() => {
    cache.delete(url)
    pending.delete(url)
    errors.delete(url)
    rerender((n) => n + 1)
  }, [url])

  if (errors.has(url)) {
    throw errors.get(url)
  }

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
        })
        .catch((err) => {
          errors.set(url, err)
        })
        .finally(() => {
          pending.delete(url)
        }),
    )
  }

  throw pending.get(url)
}

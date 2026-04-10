import { useEffect, useState } from "react"

export function useEventSource<T>(
  url: string,
  assert?: (data: unknown) => asserts data is T,
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const source = new EventSource(url)
    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        assert?.(parsed)
        setData(parsed)
        setError(null)
      } catch (e) {
        setError(
          e instanceof Error ? e : new Error("failed to parse event data"),
        )
      }
    }

    source.onerror = () => {
      setError(new Error("connection lost, reconnecting..."))
    }

    return () => source.close()
  }, [url])

  return { data, error }
}

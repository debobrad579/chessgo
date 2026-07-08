import { useEffect, useRef, useState } from "react"

export function useEventStream(
  url: string,
  options: RequestInit = {},
  onMessage: (data: unknown) => void,
) {
  const [connected, setConnected] = useState(false)
  const onMessageRef = useRef(onMessage)
  const optionsRef = useRef(options)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    const controller = new AbortController()

    async function connect() {
      try {
        const response = await fetch(url, {
          ...optionsRef.current,
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`Stream error: ${response.status}`)
        }

        setConnected(true)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            try {
              onMessageRef.current(JSON.parse(trimmed))
            } catch {}
          }
        }

        setConnected(false)
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setConnected(false)
        }
      }
    }

    connect()

    return () => {
      controller.abort()
    }
  }, [url])

  return connected
}

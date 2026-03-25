import { useCallback, useEffect, useRef, useState } from "react"

type ReadyState = "Connecting" | "Open" | "Closing" | "Closed"

export function useWebSocket(
  endpoint: string,
  onMessage: (event: MessageEvent) => void,
) {
  const [readyState, setReadyState] = useState<ReadyState>("Connecting")
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    let isMounted = true

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const ws = new WebSocket(`${protocol}//${window.location.host}${endpoint}`)
    wsRef.current = ws

    setReadyState("Connecting")

    ws.onopen = () => {
      if (isMounted) setReadyState("Open")
    }
    ws.onclose = () => {
      if (isMounted) setReadyState("Closed")
    }
    ws.onerror = () => {
      if (isMounted) setReadyState("Closed")
    }
    ws.onmessage = (event) => onMessageRef.current(event)

    return () => {
      isMounted = false
      setReadyState("Closing")
      ws.close()
    }
  }, [endpoint])

  const sendJsonMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  return { readyState, sendJsonMessage }
}

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
  })

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const ws = new WebSocket(`${protocol}//${window.location.host}${endpoint}`)
    wsRef.current = ws
    setReadyState("Connecting")
    ws.onopen = () => setReadyState("Open")
    ws.onclose = ws.onerror = () => setReadyState("Closed")
    ws.onmessage = (event) => onMessageRef.current(event)

    return () => {
      ws.onopen = ws.onclose = ws.onerror = ws.onmessage = null
      setReadyState("Closing")
      if (ws.readyState !== WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [endpoint])

  const sendJsonMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  return { readyState, sendJsonMessage }
}

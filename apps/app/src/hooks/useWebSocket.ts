import { API_BASE } from "@/lib/api"
import { useCallback, useEffect, useRef, useState } from "react"

type ReadyState = "Connecting" | "Open" | "Closing" | "Closed"

export function useWebSocket(
  endpoint: string,
  onMessage: (event: MessageEvent) => void,
) {
  const [readyState, setReadyState] = useState<ReadyState>("Connecting")
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountedRef = useRef(false)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    unmountedRef.current = false

    function connect() {
      const ws = new WebSocket(`${API_BASE.replace(/^http/, "ws")}${endpoint}`)
      wsRef.current = ws
      setReadyState("Connecting")

      ws.onopen = () => {
        retryCountRef.current = 0
        setReadyState("Open")
      }

      ws.onclose = ws.onerror = () => {
        if (unmountedRef.current) return
        setReadyState("Closed")
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 32_000)
        retryCountRef.current++
        retryTimeoutRef.current = setTimeout(connect, delay)
      }

      ws.onmessage = (event) => onMessageRef.current(event)
    }

    connect()

    return () => {
      unmountedRef.current = true
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      const ws = wsRef.current
      if (ws) {
        ws.onopen = ws.onclose = ws.onerror = ws.onmessage = null
        setReadyState("Closing")
        if (ws.readyState !== WebSocket.CONNECTING) ws.close()
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

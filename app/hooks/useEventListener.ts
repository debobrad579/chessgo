import { useEffect, useRef } from "react"

export function useEventListener<T extends Event>(
  eventType: string,
  callback: (e: T) => void,
  element?: EventTarget
) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const handler = (e: Event) => callbackRef.current(e as T)
    if (element != null) element.addEventListener(eventType, handler)
    else window.addEventListener(eventType, handler)
    return () => {
      if (element != null) element.removeEventListener(eventType, handler)
      else window.removeEventListener(eventType, handler)
    }
  }, [eventType, element])
}

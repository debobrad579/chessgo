import { useEventListener } from "@/hooks/useEventListener"
import { useEffect, useRef, useState } from "react"

export function useBoardWidth() {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEventListener("resize", () => {
    if (!ref.current) return
    setWidth(ref.current?.clientWidth)
  })

  useEffect(() => {
    if (!ref.current) return
    setWidth(ref.current?.clientWidth)
  }, [])

  return { width, ref }
}

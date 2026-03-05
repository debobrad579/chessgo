import { useState } from "react"
import { useEventListener } from "./useEventListener"

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEventListener("resize", () => {
    setSize({ width: window.innerWidth, height: window.innerHeight })
  })

  return size
}

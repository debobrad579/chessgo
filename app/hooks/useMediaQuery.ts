import { useEffect, useState } from "react"
import { useEventListener } from "./useEventListener"

export function useMediaQuery(mediaQuery: string) {
  const [isMatch, setIsMatch] = useState(false)
  const [mediaQueryList, setMediaQueryList] = useState<MediaQueryList>()

  useEffect(() => {
    const list = window.matchMedia(mediaQuery)
    setMediaQueryList(list)
    setIsMatch(list.matches)
  }, [mediaQuery])

  useEffect(() => {
    function handleChange(e: MediaQueryListEvent) {
      setIsMatch(e.matches)
    }

    if (mediaQueryList != null) {
      mediaQueryList.addEventListener("change", handleChange)
    }

    return () => {
      if (mediaQueryList != null) {
        mediaQueryList.removeEventListener("change", handleChange)
      }
    }
  }, [mediaQueryList])

  useEventListener(
    "change",
    (e: MediaQueryListEvent) => setIsMatch(e.matches),
    mediaQueryList,
  )

  return isMatch
}

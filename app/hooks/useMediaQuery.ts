import { useMemo, useSyncExternalStore } from "react"

export function useMediaQuery(query: string) {
  const mediaQueryList = useMemo(() => window.matchMedia(query), [query])

  return useSyncExternalStore(
    (callback: () => void) => {
      mediaQueryList.addEventListener("change", callback)
      return () => mediaQueryList.removeEventListener("change", callback)
    },
    () => mediaQueryList.matches,
  )
}

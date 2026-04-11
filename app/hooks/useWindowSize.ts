import { useSyncExternalStore } from "react"

function getSnapshot() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback)
  return () => window.removeEventListener("resize", callback)
}

export function useWindowSize() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

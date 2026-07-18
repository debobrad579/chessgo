import type { TimeControl } from "@/types/chess"

export function formatMilliseconds(ms: number) {
  if (ms <= 0) return "00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export function formatTimeControl(tc: TimeControl): string {
  const baseMinutes = Math.floor(tc.base / 60000)
  const incrementSeconds = Math.floor(tc.increment / 1000)

  return `${baseMinutes}+${incrementSeconds}`
}

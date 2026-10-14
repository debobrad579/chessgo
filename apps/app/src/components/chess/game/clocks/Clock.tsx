import { useSettings } from "@/context/SettingsContext"
import { useChessGameContext } from "../ChessGameContext"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { formatMilliseconds } from "@/lib/formatters"

export function Clock({
  name,
  playerClock = false,
  connected,
  rating,
  timestamp,
  result,
  materialScore,
  className,
}: {
  name: string
  playerClock: boolean
  timestamp?: number
  connected?: boolean
  rating?: number
  result?: "win" | "loss" | "draw"
  materialScore?: number
  className?: string
}) {
  const { playLowTimeSound, lowTimeSoundThreshold } = useSettings()
  const { result: globalResult } = useChessGameContext()
  const audioRef = useRef<HTMLAudioElement>(null)
  const soundPlayed = useRef(false)

  useEffect(() => {
    if (
      !playerClock ||
      !playLowTimeSound ||
      globalResult !== "*" ||
      timestamp == null ||
      audioRef.current == null
    )
      return

    if (timestamp > (lowTimeSoundThreshold + 1) * 1000) {
      soundPlayed.current = false
    } else if (!soundPlayed.current) {
      void audioRef.current.play()
      soundPlayed.current = true
    }
  }, [
    timestamp,
    playerClock,
    playLowTimeSound,
    lowTimeSoundThreshold,
    globalResult,
  ])

  return (
    <div
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border px-4 py-1 font-semibold transition-colors",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        {result === "win" ? (
          <div className="text-green-500">1</div>
        ) : result === "loss" ? (
          <div className="text-red-500">0</div>
        ) : result === "draw" ? (
          <div>1/2</div>
        ) : (
          timestamp != null && <div>{formatMilliseconds(timestamp)}</div>
        )}
        <div className="w-[3ch] text-sm">
          {materialScore != null && `+${materialScore}`}
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {connected != null && (
          <span
            className={cn(
              "h-2.5 w-2.5 shrink-0 rounded-full",
              connected ? "bg-green-500" : "bg-red-500",
            )}
          />
        )}
        <div className="truncate font-bold">{name}</div>
        {rating != null && <div className="shrink-0 text-sm">({rating})</div>}
      </div>
      <audio src="/sounds/lowtime.mp3" ref={audioRef} />
    </div>
  )
}

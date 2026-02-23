import { formatSeconds } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { Player } from "../types"

export function Clock({
  player,
  timestamp,
  undoCount,
  result,
  turn,
  thinkTime,
  className,
}: {
  player: Player
  timestamp: number
  undoCount: number
  result: "win" | "loss" | "draw" | "*"
  turn: boolean
  thinkTime: number
  className?: string
}) {
  let currentTimestamp = timestamp

  if (undoCount === 0 && result === "*" && turn) currentTimestamp -= thinkTime

  return (
    <div
      className={cn(
        "flex justify-between gap-2 w-full px-2 py-1 font-bold",
        className,
      )}
    >
      <div className="flex gap-2">
        <div className="font-bold">{player.name}</div>
        <div>{player.elo}</div>
      </div>
      <div
        className={
          undoCount !== 0
            ? undefined
            : result === "win"
              ? "text-green-500"
              : result === "loss"
                ? "text-red-500"
                : result === "*" && turn
                  ? "text-orange-500"
                  : undefined
        }
      >
        {undoCount !== 0 || result === "*"
          ? formatSeconds(currentTimestamp)
          : result === "win"
            ? 1
            : result === "loss"
              ? 0
              : "1/2"}
      </div>
    </div>
  )
}

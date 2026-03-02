import { formatMilliseconds } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { getPlayerTimestamp } from "./utils"
import { Player, Move } from "@/types/chess"
import { Color } from "chess.js"

type ClockProps = {
  player: Player
  moves: Move[]
  undoCount: number
  playerColor: Color
  thinkTime: number
  initialTime: number
  result: "win" | "loss" | "draw" | "*"
  className?: string
}

export function Clock({
  player,
  moves,
  undoCount,
  playerColor,
  thinkTime,
  initialTime,
  result,
}: ClockProps) {
  return (
    <div
      className={cn(
        "h-9 px-4 py-2 rounded-md text-xs font-semibold transition-colors flex justify-between items-center gap-2 w-full px-2 py-1 font-bold",
        playerColor === "w"
          ? "bg-gray-200 hover:bg-gray-300 text-black"
          : "bg-gray-800 hover:bg-gray-700 text-white",
      )}
    >
      <div className="font-bold">{player.name}</div>
      <div
        className={
          undoCount === 0 && result === "win"
            ? "text-green-500"
            : undoCount === 0 && result === "loss"
              ? "text-red-500"
              : undefined
        }
      >
        {undoCount !== 0 || result === "*"
          ? formatMilliseconds(
              getPlayerTimestamp({
                moves,
                undoCount,
                playerColor,
                thinkTime,
                initialTime,
              }),
            )
          : result === "win"
            ? 1
            : result === "loss"
              ? 0
              : "1/2"}
      </div>
    </div>
  )
}

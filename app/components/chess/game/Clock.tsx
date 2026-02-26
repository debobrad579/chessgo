import { formatMilliseconds } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { User } from "@/types/user"
import { getPlayerTimestamp } from "./utils"
import { Move } from "../types"
import { Color } from "chess.js"

type ClockProps = {
  player: User | null
  moves: Move[]
  undoCount: number
  gameTurn: Color
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
  gameTurn,
  playerColor,
  thinkTime,
  initialTime,
  result,
  className,
}: ClockProps) {
  return (
    <div
      className={cn(
        "flex justify-between gap-2 w-full px-2 py-1 font-bold",
        className,
      )}
    >
      <div className="font-bold">{player?.name ?? "Player"}</div>
      <div
        className={
          result === "win"
            ? "text-green-500"
            : result === "loss"
              ? "text-red-500"
              : undefined
        }
      >
        {result === "*"
          ? formatMilliseconds(
              getPlayerTimestamp({
                moves,
                undoCount,
                gameTurn,
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
